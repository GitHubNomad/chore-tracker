import os
import json
import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db, RedactionJob, Profile
from services.document_processor import process_document
from services.pii_detector import detect_pii, redact_text, get_profile_terms

router = APIRouter(prefix="/api/documents", tags=["documents"])

UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".txt", ".pdf", ".docx", ".doc", ".xlsx", ".xls", ".csv"}
MAX_SIZE_MB = 20


@router.post("/upload")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {ALLOWED_EXTENSIONS}")

    content = await file.read()
    if len(content) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large. Max {MAX_SIZE_MB}MB.")

    job_id = str(uuid.uuid4())
    original_path = os.path.join(UPLOAD_DIR, f"{job_id}{ext}")
    with open(original_path, "wb") as f:
        f.write(content)

    # Get profile terms for custom redaction
    profile = db.query(Profile).first()
    custom_terms = get_profile_terms(profile.__dict__) if profile else []

    result = process_document(original_path, UPLOAD_DIR, custom_terms)

    job = RedactionJob(
        filename=file.filename,
        original_path=original_path,
        redacted_path=result.get("redacted_path"),
        pdf_path=result.get("pdf_path"),
        pii_count=result.get("pii_count", 0),
        pii_summary=json.dumps(result.get("summary", {})),
        completed=True,
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    return {
        "job_id": job.id,
        "filename": file.filename,
        "pii_count": result.get("pii_count", 0),
        "summary": result.get("summary", {}),
        "file_type": result.get("file_type"),
        "highlight_path": result.get("highlight_path"),
        "has_pdf": result.get("pdf_path") is not None,
        "error": result.get("error"),
    }


@router.post("/scan-text")
async def scan_text(db: Session = Depends(get_db), body: dict = None):
    if not body or "text" not in body:
        raise HTTPException(status_code=400, detail="Provide {'text': '...'} in request body")
    text = body["text"]
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text is empty")

    profile = db.query(Profile).first()
    custom_terms = get_profile_terms(profile.__dict__) if profile else []

    matches, summary = detect_pii(text, custom_terms)
    redacted = redact_text(text, matches)

    return {
        "original": text,
        "redacted": redacted,
        "pii_count": len(matches),
        "summary": summary,
        "matches": [
            {"start": m.start, "end": m.end, "label": m.label, "text": m.text, "replacement": m.replacement}
            for m in matches
        ],
    }


@router.get("/{job_id}/download")
def download_redacted(job_id: int, db: Session = Depends(get_db)):
    job = db.query(RedactionJob).filter(RedactionJob.id == job_id).first()
    if not job or not job.redacted_path:
        raise HTTPException(status_code=404, detail="Job not found")
    if not os.path.exists(job.redacted_path):
        raise HTTPException(status_code=404, detail="Redacted file not found on disk")
    stem = Path(job.filename).stem
    return FileResponse(
        path=job.redacted_path,
        media_type="text/plain",
        filename=f"{stem}_redacted.txt",
    )


@router.get("/{job_id}/download-pdf")
def download_redacted_pdf(job_id: int, db: Session = Depends(get_db)):
    job = db.query(RedactionJob).filter(RedactionJob.id == job_id).first()
    if not job or not job.pdf_path:
        raise HTTPException(status_code=404, detail="PDF not available for this job")
    if not os.path.exists(job.pdf_path):
        raise HTTPException(status_code=404, detail="PDF file not found on disk")
    stem = Path(job.filename).stem
    return FileResponse(
        path=job.pdf_path,
        media_type="application/pdf",
        filename=f"{stem}_redacted.pdf",
    )


@router.get("/{job_id}/highlights")
def get_highlights(job_id: int, db: Session = Depends(get_db)):
    job = db.query(RedactionJob).filter(RedactionJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    highlight_path = job.original_path.replace(Path(job.original_path).suffix, "_highlighted.json")
    if not os.path.exists(highlight_path):
        raise HTTPException(status_code=404, detail="Highlights not available")
    with open(highlight_path) as f:
        return json.load(f)


@router.get("")
def list_jobs(db: Session = Depends(get_db)):
    jobs = db.query(RedactionJob).order_by(RedactionJob.created_at.desc()).limit(50).all()
    return [
        {
            "id": j.id,
            "filename": j.filename,
            "pii_count": j.pii_count,
            "summary": json.loads(j.pii_summary) if j.pii_summary else {},
            "created_at": j.created_at.isoformat() if j.created_at else None,
            "completed": j.completed,
            "has_pdf": bool(j.pdf_path and os.path.exists(j.pdf_path)),
        }
        for j in jobs
    ]


@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(RedactionJob).filter(RedactionJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Not found")
    for path in [job.original_path, job.redacted_path, job.pdf_path]:
        if path and os.path.exists(path):
            os.remove(path)
    db.delete(job)
    db.commit()
    return {"ok": True}
