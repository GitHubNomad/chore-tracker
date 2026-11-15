from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db, Profile, AppSetting
from services.ccpa_templates import TEMPLATES, render
from services.broker_list import get_broker_by_id
from services.email_service import send_email

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("")
def list_templates():
    return TEMPLATES


@router.post("/render")
def render_template(body: dict, db: Session = Depends(get_db)):
    template_id = body.get("template_id")
    broker_id = body.get("broker_id")

    if not template_id:
        raise HTTPException(status_code=400, detail="template_id required")

    profile = db.query(Profile).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Set up your profile first")

    profile_data = {
        "full_name": profile.full_name,
        "aliases": profile.aliases,
        "addresses": profile.addresses,
        "phones": profile.phones,
        "emails": profile.emails,
        "dob": profile.dob,
    }

    broker = get_broker_by_id(broker_id) if broker_id else None
    result = render(template_id, profile_data, broker)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/send")
def send_template(body: dict, db: Session = Depends(get_db)):
    to = body.get("to")
    subject = body.get("subject")
    email_body = body.get("body")

    if not all([to, subject, email_body]):
        raise HTTPException(status_code=400, detail="to, subject, and body are required")

    rows = db.query(AppSetting).all()
    s = {r.key: r.value for r in rows}

    if not s.get("smtp_host") or not s.get("smtp_user") or not s.get("smtp_pass"):
        raise HTTPException(
            status_code=400,
            detail="SMTP not configured. Add email settings in Settings → Email first, or copy-paste the template manually.",
        )

    result = send_email(
        to=to,
        subject=subject,
        body_text=email_body,
        smtp_host=s["smtp_host"],
        smtp_port=int(s.get("smtp_port", 587)),
        smtp_user=s["smtp_user"],
        smtp_pass=s["smtp_pass"],
    )
    if not result["ok"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Send failed"))
    return {"ok": True, "sent_to": to}
