from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db, AppSetting
from services.email_service import send_email
from services.scheduler import get_pending_reminders

router = APIRouter(prefix="/api/settings", tags=["settings"])

SAFE_KEYS = {
    "smtp_host", "smtp_port", "smtp_user", "smtp_pass",
    "reminder_email", "reminders_enabled", "recheck_interval_days",
}


@router.get("")
def get_settings(db: Session = Depends(get_db)):
    rows = db.query(AppSetting).all()
    data = {r.key: r.value for r in rows}
    # Mask password in response
    if "smtp_pass" in data and data["smtp_pass"]:
        data["smtp_pass"] = "••••••••"
    return data


@router.put("")
def save_settings(body: dict, db: Session = Depends(get_db)):
    for key, value in body.items():
        if key not in SAFE_KEYS:
            continue
        if key == "smtp_pass" and value == "••••••••":
            continue  # Don't overwrite masked password
        existing = db.query(AppSetting).filter(AppSetting.key == key).first()
        if existing:
            existing.value = str(value)
        else:
            db.add(AppSetting(key=key, value=str(value)))
    db.commit()
    return {"ok": True}


@router.post("/test-email")
def test_email(db: Session = Depends(get_db)):
    rows = db.query(AppSetting).all()
    s = {r.key: r.value for r in rows}

    if not s.get("smtp_host") or not s.get("smtp_user") or not s.get("smtp_pass"):
        raise HTTPException(status_code=400, detail="SMTP not fully configured")

    target = s.get("reminder_email") or s.get("smtp_user")
    result = send_email(
        to=target,
        subject="PII Scrubber — Test Email",
        body_text="This is a test email from Personal Info Scrubber. Your email settings are working correctly.",
        smtp_host=s["smtp_host"],
        smtp_port=int(s.get("smtp_port", 587)),
        smtp_user=s["smtp_user"],
        smtp_pass=s["smtp_pass"],
    )
    if not result["ok"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Send failed"))
    return {"ok": True, "sent_to": target}


@router.get("/reminders")
def get_reminders():
    return get_pending_reminders()
