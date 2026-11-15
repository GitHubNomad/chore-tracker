from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db, Profile, BrokerStatus
from services.automation import (
    start_automation, get_task, list_tasks, cancel_task, is_supported, SUPPORTED_BROKERS
)
from services.broker_list import get_broker_by_id
from datetime import datetime

router = APIRouter(prefix="/api/automation", tags=["automation"])


@router.post("/start/{broker_id}")
async def start(broker_id: str, db: Session = Depends(get_db)):
    if not is_supported(broker_id):
        raise HTTPException(status_code=400, detail=f"Automation not supported for '{broker_id}'. Supported: {list(SUPPORTED_BROKERS)}")

    broker = get_broker_by_id(broker_id)
    if not broker:
        raise HTTPException(status_code=404, detail="Broker not found")

    profile = db.query(Profile).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Set up your profile first (My Profile tab) before running automation")

    profile_data = {
        "full_name": profile.full_name,
        "aliases": profile.aliases,
        "addresses": profile.addresses,
        "phones": profile.phones,
        "emails": profile.emails,
        "dob": profile.dob,
    }

    task_id = start_automation(broker_id, profile_data)
    return {
        "task_id": task_id,
        "broker_id": broker_id,
        "broker_name": broker["name"],
        "status": "pending",
        "message": "Browser launching. Watch the window that opens on your screen.",
    }


@router.get("/task/{task_id}")
def get_task_status(task_id: str):
    task = get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.delete("/task/{task_id}")
def cancel(task_id: str, db: Session = Depends(get_db)):
    ok = cancel_task(task_id)
    if not ok:
        raise HTTPException(status_code=400, detail="Task not found or already finished")
    return {"ok": True}


@router.get("/tasks")
def get_all_tasks():
    return list_tasks()


@router.post("/confirm/{broker_id}")
def mark_confirmed_after_automation(task_id: str, broker_id: str, db: Session = Depends(get_db)):
    status_obj = db.query(BrokerStatus).filter(BrokerStatus.broker_id == broker_id).first()
    if not status_obj:
        status_obj = BrokerStatus(broker_id=broker_id, profile_id=1, status="submitted", submitted_at=datetime.utcnow())
        db.add(status_obj)
    else:
        status_obj.status = "submitted"
        status_obj.submitted_at = datetime.utcnow()
    db.commit()
    return {"ok": True}
