import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def send_email(
    to: str,
    subject: str,
    body_text: str,
    smtp_host: str,
    smtp_port: int,
    smtp_user: str,
    smtp_pass: str,
    body_html: Optional[str] = None,
) -> dict:
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = smtp_user
        msg["To"] = to

        msg.attach(MIMEText(body_text, "plain"))
        if body_html:
            msg.attach(MIMEText(body_html, "html"))

        ctx = ssl.create_default_context()

        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, context=ctx, timeout=15) as server:
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_user, to, msg.as_string())
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                server.ehlo()
                server.starttls(context=ctx)
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_user, to, msg.as_string())

        return {"ok": True}
    except Exception as e:
        logger.error(f"Email send failed: {e}")
        return {"ok": False, "error": str(e)}


def send_reminder_email(
    settings: dict,
    due_brokers: list,
    recheck_brokers: list,
) -> dict:
    if not settings.get("smtp_host") or not settings.get("reminder_email"):
        return {"ok": False, "error": "SMTP not configured"}

    follow_up_section = ""
    recheck_section = ""

    if due_brokers:
        items = "\n".join(f"  - {b['name']} (submitted {b.get('days_ago', '?')} days ago)" for b in due_brokers)
        follow_up_section = f"\nFOLLOW-UP NEEDED ({len(due_brokers)} brokers):\n{items}\n"

    if recheck_brokers:
        items = "\n".join(f"  - {b['name']} (confirmed {b.get('days_ago', '?')} days ago)" for b in recheck_brokers)
        recheck_section = f"\nTIME TO RECHECK ({len(recheck_brokers)} brokers):\n{items}\n"

    total = len(due_brokers) + len(recheck_brokers)
    body = f"""Personal Info Scrubber — Privacy Reminder

{total} broker(s) need your attention today.
{follow_up_section}{recheck_section}
Open the app at http://localhost:8765 to review and update.

---
This reminder was sent automatically by Personal Info Scrubber.
To disable, turn off reminders in Settings.
"""

    return send_email(
        to=settings["reminder_email"],
        subject=f"[PII Scrubber] {total} broker(s) need attention",
        body_text=body,
        smtp_host=settings["smtp_host"],
        smtp_port=int(settings.get("smtp_port", 587)),
        smtp_user=settings["smtp_user"],
        smtp_pass=settings["smtp_pass"],
    )
