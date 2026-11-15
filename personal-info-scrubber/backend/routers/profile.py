from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from database import get_db, Profile

router = APIRouter(prefix="/api/profile", tags=["profile"])


class ProfileCreate(BaseModel):
    full_name: str
    aliases: Optional[str] = ""
    addresses: Optional[str] = ""
    phones: Optional[str] = ""
    emails: Optional[str] = ""
    dob: Optional[str] = ""
    ssn_last4: Optional[str] = ""


class ProfileUpdate(ProfileCreate):
    pass


@router.get("")
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(Profile).first()
    if not profile:
        return None
    return _to_dict(profile)


@router.post("")
def create_profile(data: ProfileCreate, db: Session = Depends(get_db)):
    existing = db.query(Profile).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists. Use PUT to update.")
    profile = Profile(**data.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return _to_dict(profile)


@router.put("")
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db)):
    profile = db.query(Profile).first()
    if not profile:
        profile = Profile(**data.model_dump())
        db.add(profile)
    else:
        for k, v in data.model_dump().items():
            setattr(profile, k, v)
        profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(profile)
    return _to_dict(profile)


@router.delete("")
def delete_profile(db: Session = Depends(get_db)):
    profile = db.query(Profile).first()
    if profile:
        db.delete(profile)
        db.commit()
    return {"ok": True}


def _to_dict(p: Profile) -> dict:
    return {
        "id": p.id,
        "full_name": p.full_name,
        "aliases": p.aliases,
        "addresses": p.addresses,
        "phones": p.phones,
        "emails": p.emails,
        "dob": p.dob,
        "ssn_last4": p.ssn_last4,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }
