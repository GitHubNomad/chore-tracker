from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from database import get_db, BrokerStatus
from services.broker_list import get_all_brokers, get_broker_by_id, CATEGORIES

router = APIRouter(prefix="/api/brokers", tags=["brokers"])

VALID_STATUSES = {"not_started", "submitted", "confirmed", "failed", "monitoring"}


class StatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = ""


@router.get("")
def list_brokers(db: Session = Depends(get_db)):
    brokers = get_all_brokers()
    statuses = {s.broker_id: s for s in db.query(BrokerStatus).all()}

    result = []
    for b in brokers:
        status_obj = statuses.get(b["id"])
        result.append({
            **b,
            "status": status_obj.status if status_obj else "not_started",
            "submitted_at": status_obj.submitted_at.isoformat() if status_obj and status_obj.submitted_at else None,
            "confirmed_at": status_obj.confirmed_at.isoformat() if status_obj and status_obj.confirmed_at else None,
            "notes": status_obj.notes if status_obj else "",
        })

    return {
        "brokers": result,
        "categories": CATEGORIES,
        "stats": _build_stats(result),
    }


@router.get("/{broker_id}")
def get_broker(broker_id: str, db: Session = Depends(get_db)):
    broker = get_broker_by_id(broker_id)
    if not broker:
        raise HTTPException(status_code=404, detail="Broker not found")
    status_obj = db.query(BrokerStatus).filter(BrokerStatus.broker_id == broker_id).first()
    return {
        **broker,
        "status": status_obj.status if status_obj else "not_started",
        "submitted_at": status_obj.submitted_at.isoformat() if status_obj and status_obj.submitted_at else None,
        "confirmed_at": status_obj.confirmed_at.isoformat() if status_obj and status_obj.confirmed_at else None,
        "notes": status_obj.notes if status_obj else "",
    }


@router.put("/{broker_id}/status")
def update_broker_status(broker_id: str, data: StatusUpdate, db: Session = Depends(get_db)):
    if data.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {VALID_STATUSES}")

    broker = get_broker_by_id(broker_id)
    if not broker:
        raise HTTPException(status_code=404, detail="Broker not found")

    status_obj = db.query(BrokerStatus).filter(BrokerStatus.broker_id == broker_id).first()
    if not status_obj:
        status_obj = BrokerStatus(broker_id=broker_id, profile_id=1)
        db.add(status_obj)

    prev_status = status_obj.status
    status_obj.status = data.status
    status_obj.notes = data.notes or ""

    if data.status == "submitted" and prev_status == "not_started":
        status_obj.submitted_at = datetime.utcnow()
    if data.status == "confirmed":
        status_obj.confirmed_at = datetime.utcnow()

    db.commit()
    db.refresh(status_obj)
    return {"ok": True, "status": status_obj.status}


@router.post("/reset-all")
def reset_all_statuses(db: Session = Depends(get_db)):
    db.query(BrokerStatus).delete()
    db.commit()
    return {"ok": True}


def _build_stats(brokers: list) -> dict:
    counts = {"not_started": 0, "submitted": 0, "confirmed": 0, "failed": 0, "monitoring": 0}
    for b in brokers:
        s = b.get("status", "not_started")
        counts[s] = counts.get(s, 0) + 1
    return {"total": len(brokers), **counts}
