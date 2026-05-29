import logging
from datetime import datetime, timedelta

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from .email_service import send_reminder_email

logger = logging.getLogger(__name__)
_scheduler = BackgroundScheduler(timezone="UTC")


def start_scheduler():
    if not _scheduler.running:
        _scheduler.add_job(
            _daily_reminder_job,
            CronTrigger(hour=14, minute=0),  # 14:00 UTC ≈ 9 AM ET
            id="daily_reminder",
            replace_existing=True,
        )
        _scheduler.start()
        logger.info("Scheduler started")


def stop_scheduler():
    if _scheduler.running:
        _scheduler.shutdown(wait=False)


def _daily_reminder_job():
    # Import here to avoid circular deps at module load time
    from database import SessionLocal, BrokerStatus, Profile
    from .broker_list import get_broker_by_id

    db = SessionLocal()
    try:
        settings = _load_settings(db)
        if not settings.get("reminders_enabled", "false") == "true":
            return
        if not settings.get("smtp_host"):
            return

        recheck_days = int(settings.get("recheck_interval_days", 90))
        now = datetime.utcnow()

        statuses = db.query(BrokerStatus).all()
        due_brokers = []
        recheck_brokers = []

        for s in statuses:
            broker = get_broker_by_id(s.broker_id)
            if not broker:
                continue
            name = broker["name"]
            turnaround = broker.get("turnaround_days", 14)

            if s.status == "submitted" and s.submitted_at:
                days_ago = (now - s.submitted_at).days
                if days_ago >= turnaround:
                    due_brokers.append({"name": name, "days_ago": days_ago})

            elif s.status in ("confirmed", "monitoring") and s.confirmed_at:
                days_ago = (now - s.confirmed_at).days
                if days_ago >= recheck_days:
                    recheck_brokers.append({"name": name, "days_ago": days_ago})

        if due_brokers or recheck_brokers:
            result = send_reminder_email(settings, due_brokers, recheck_brokers)
            if result["ok"]:
                logger.info(f"Reminder sent: {len(due_brokers)} follow-ups, {len(recheck_brokers)} rechecks")
            else:
                logger.warning(f"Reminder email failed: {result.get('error')}")
    except Exception as e:
        logger.error(f"Scheduler job error: {e}")
    finally:
        db.close()


def get_pending_reminders() -> dict:
    from database import SessionLocal, BrokerStatus
    from .broker_list import get_broker_by_id

    db = SessionLocal()
    try:
        settings = _load_settings(db)
        recheck_days = int(settings.get("recheck_interval_days", 90))
        now = datetime.utcnow()
        statuses = db.query(BrokerStatus).all()
        due = []
        recheck = []
        for s in statuses:
            broker = get_broker_by_id(s.broker_id)
            if not broker:
                continue
            turnaround = broker.get("turnaround_days", 14)
            if s.status == "submitted" and s.submitted_at:
                days_ago = (now - s.submitted_at).days
                if days_ago >= turnaround:
                    due.append({"id": s.broker_id, "name": broker["name"], "days_ago": days_ago})
            elif s.status in ("confirmed", "monitoring") and s.confirmed_at:
                days_ago = (now - s.confirmed_at).days
                if days_ago >= recheck_days:
                    recheck.append({"id": s.broker_id, "name": broker["name"], "days_ago": days_ago})
        return {"due": due, "recheck": recheck}
    finally:
        db.close()


def _load_settings(db) -> dict:
    from database import AppSetting
    rows = db.query(AppSetting).all()
    return {r.key: r.value for r in rows}
