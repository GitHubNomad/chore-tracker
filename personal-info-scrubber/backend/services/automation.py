"""
Assisted Playwright automation for data broker opt-outs.
Opens a visible browser, fills in forms from profile data,
then waits for the user to complete any CAPTCHA/email steps.
"""
import asyncio
import sys
import os
import logging
import uuid
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

# In-memory task store keyed by task_id
_tasks: dict[str, dict] = {}

SUPPORTED_BROKERS = {
    "fastpeoplesearch",
    "truepeoplesearch",
    "familytreenow",
    "spokeo",
    "beenverified",
}


def is_supported(broker_id: str) -> bool:
    return broker_id in SUPPORTED_BROKERS


def get_task(task_id: str) -> Optional[dict]:
    return _tasks.get(task_id)


def list_tasks() -> list:
    return list(_tasks.values())


def cancel_task(task_id: str) -> bool:
    task = _tasks.get(task_id)
    if task and task["status"] in ("pending", "running", "waiting"):
        task["status"] = "cancelled"
        task["updated_at"] = _now()
        return True
    return False


def start_automation(broker_id: str, profile: dict) -> str:
    task_id = str(uuid.uuid4())[:8]
    _tasks[task_id] = {
        "task_id": task_id,
        "broker_id": broker_id,
        "status": "pending",
        "messages": [],
        "started_at": _now(),
        "updated_at": _now(),
    }
    asyncio.create_task(_run(task_id, broker_id, profile))
    return task_id


async def _run(task_id: str, broker_id: str, profile: dict):
    task = _tasks[task_id]
    try:
        from playwright.async_api import async_playwright, TimeoutError as PWTimeout

        _log(task, "Starting browser...")
        task["status"] = "running"

        headless = os.environ.get("HEADLESS", "").lower() == "true"
        # On Linux without a display, force headless
        if sys.platform == "linux" and not os.environ.get("DISPLAY") and not headless:
            headless = True
            _log(task, "No display detected — running headless (CAPTCHA steps require headed mode)")

        async with async_playwright() as pw:
            browser = await pw.chromium.launch(
                headless=headless,
                args=["--no-sandbox", "--disable-dev-shm-usage"],
            )
            context = await browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                ),
                viewport={"width": 1280, "height": 800},
            )
            page = await context.new_page()

            try:
                if broker_id == "fastpeoplesearch":
                    await _fastpeoplesearch(page, task, profile)
                elif broker_id == "truepeoplesearch":
                    await _truepeoplesearch(page, task, profile)
                elif broker_id == "familytreenow":
                    await _familytreenow(page, task, profile)
                elif broker_id == "spokeo":
                    await _spokeo(page, task, profile)
                elif broker_id == "beenverified":
                    await _beenverified(page, task, profile)
            finally:
                if task["status"] not in ("cancelled",):
                    _log(task, "Automation complete. You can close the browser.")
                await asyncio.sleep(10)
                await browser.close()

        if task["status"] == "running":
            task["status"] = "submitted"
        task["updated_at"] = _now()

    except Exception as e:
        _log(task, f"Error: {e}")
        task["status"] = "error"
        task["updated_at"] = _now()
        logger.exception(f"Automation error for {broker_id}")


# ---- Per-broker automation ----

async def _fastpeoplesearch(page, task, profile):
    _log(task, "Navigating to FastPeopleSearch removal page...")
    await page.goto("https://www.fastpeoplesearch.com/removal", wait_until="domcontentloaded", timeout=30000)
    await asyncio.sleep(2)

    name_parts = _split_name(profile)
    await _try_fill(page, task, ["input[name='first_name']", "input[placeholder*='First']", "#first_name"], name_parts[0])
    await _try_fill(page, task, ["input[name='last_name']", "input[placeholder*='Last']", "#last_name"], name_parts[1])

    state = _first_state(profile)
    if state:
        await _try_select(page, task, ["select[name='state']", "#state", "select"], state)

    _log(task, "Form filled. Complete the CAPTCHA in the browser, then submit the form.")
    _log(task, "Waiting up to 10 minutes for you to complete the CAPTCHA and submit...")
    task["status"] = "waiting"
    task["updated_at"] = _now()

    # Wait for URL change or success message (up to 10 min)
    try:
        await page.wait_for_url("**/removal*", timeout=600000)
    except Exception:
        pass

    _log(task, "Removal form submitted (or timed out). Marking as submitted.")
    task["status"] = "submitted"


async def _truepeoplesearch(page, task, profile):
    _log(task, "Navigating to TruePeopleSearch removal page...")
    await page.goto("https://www.truepeoplesearch.com/removal", wait_until="domcontentloaded", timeout=30000)
    await asyncio.sleep(2)

    name_parts = _split_name(profile)
    await _try_fill(page, task, ["input[name='firstName']", "input[placeholder*='First']", "#firstName"], name_parts[0])
    await _try_fill(page, task, ["input[name='lastName']", "input[placeholder*='Last']", "#lastName"], name_parts[1])

    state = _first_state(profile)
    if state:
        await _try_select(page, task, ["select[name='state']", "#state", "select"], state)
        await _try_fill(page, task, ["input[name='state']", "input[placeholder*='State']"], state)

    _log(task, "Form pre-filled. Complete the CAPTCHA and submit the form in the browser.")
    task["status"] = "waiting"
    task["updated_at"] = _now()

    try:
        await page.wait_for_function("document.body.innerText.includes('successful') || document.body.innerText.includes('request has been')", timeout=600000)
    except Exception:
        pass

    _log(task, "Submitted (or timed out). Marking as submitted.")
    task["status"] = "submitted"


async def _familytreenow(page, task, profile):
    _log(task, "Navigating to FamilyTreeNow opt-out page...")
    await page.goto("https://www.familytreenow.com/optout", wait_until="domcontentloaded", timeout=30000)
    await asyncio.sleep(2)

    name_parts = _split_name(profile)
    await _try_fill(page, task, ["input[name='firstName']", "input[placeholder*='First']", "#firstName", "input[type='text']:first-of-type"], name_parts[0])
    await _try_fill(page, task, ["input[name='lastName']", "input[placeholder*='Last']", "#lastName"], name_parts[1])

    state = _first_state(profile)
    if state:
        await _try_select(page, task, ["select[name='state']", "#state"], state)

    _log(task, "Form pre-filled. Complete the CAPTCHA and click the opt-out button in the browser.")
    task["status"] = "waiting"
    task["updated_at"] = _now()

    try:
        await page.wait_for_function("document.body.innerText.includes('opt out') || document.body.innerText.includes('removed') || document.body.innerText.includes('success')", timeout=600000)
    except Exception:
        pass

    _log(task, "Submitted (or timed out). Marking as submitted.")
    task["status"] = "submitted"


async def _spokeo(page, task, profile):
    _log(task, "Navigating to Spokeo opt-out page...")
    await page.goto("https://www.spokeo.com/optout", wait_until="domcontentloaded", timeout=30000)
    await asyncio.sleep(2)

    name_parts = _split_name(profile)
    await _try_fill(page, task, ["input[name='first_name']", "input[placeholder*='First']", "#first_name"], name_parts[0])
    await _try_fill(page, task, ["input[name='last_name']", "input[placeholder*='Last']", "#last_name"], name_parts[1])

    state = _first_state(profile)
    if state:
        await _try_select(page, task, ["select[name='state']", "#state"], state)

    city = _first_city(profile)
    if city:
        await _try_fill(page, task, ["input[name='city']", "input[placeholder*='City']", "#city"], city)

    _log(task, "Form pre-filled. Search for your listing, then paste the listing URL into the opt-out form.")
    _log(task, "After submitting, verify via the email Spokeo sends you.")
    task["status"] = "waiting"
    task["updated_at"] = _now()

    try:
        await page.wait_for_function("document.body.innerText.includes('email') && document.body.innerText.includes('sent')", timeout=600000)
    except Exception:
        pass

    _log(task, "Spokeo opt-out submitted (or timed out).")
    task["status"] = "submitted"


async def _beenverified(page, task, profile):
    _log(task, "Navigating to BeenVerified opt-out page...")
    await page.goto("https://www.beenverified.com/app/optout/search", wait_until="domcontentloaded", timeout=30000)
    await asyncio.sleep(2)

    name_parts = _split_name(profile)
    await _try_fill(page, task, ["input[name='firstName']", "input[placeholder*='First']", "#firstName"], name_parts[0])
    await _try_fill(page, task, ["input[name='lastName']", "input[placeholder*='Last']", "#lastName"], name_parts[1])

    state = _first_state(profile)
    if state:
        await _try_select(page, task, ["select[name='state']", "#state"], state)

    _log(task, "Form pre-filled. Select your listing from the results, submit the opt-out, and verify via email.")
    task["status"] = "waiting"
    task["updated_at"] = _now()

    try:
        await page.wait_for_function("document.body.innerText.includes('email') && document.body.innerText.includes('sent')", timeout=600000)
    except Exception:
        pass

    _log(task, "BeenVerified opt-out submitted (or timed out).")
    task["status"] = "submitted"


# ---- Helpers ----

def _split_name(profile: dict):
    full = profile.get("full_name", "")
    parts = full.split(" ", 1)
    first = parts[0] if parts else ""
    last = parts[1] if len(parts) > 1 else ""
    return first, last


def _first_state(profile: dict) -> str:
    addresses = profile.get("addresses", "")
    for line in addresses.splitlines():
        parts = line.strip().split(",")
        if len(parts) >= 2:
            state_zip = parts[-1].strip().split()
            if state_zip:
                state = state_zip[0].upper()
                if len(state) == 2:
                    return state
    return ""


def _first_city(profile: dict) -> str:
    addresses = profile.get("addresses", "")
    for line in addresses.splitlines():
        parts = line.strip().split(",")
        if len(parts) >= 2:
            return parts[-2].strip()
    return ""


async def _try_fill(page, task, selectors: list, value: str):
    if not value:
        return
    for sel in selectors:
        try:
            el = await page.query_selector(sel)
            if el and await el.is_visible():
                await el.fill(value)
                _log(task, f"Filled '{sel}' with value")
                return
        except Exception:
            continue
    _log(task, f"Could not find field for selectors: {selectors}")


async def _try_select(page, task, selectors: list, value: str):
    if not value:
        return
    for sel in selectors:
        try:
            el = await page.query_selector(sel)
            if el and await el.is_visible():
                await el.select_option(label=value)
                _log(task, f"Selected '{value}' in '{sel}'")
                return
        except Exception:
            try:
                el2 = await page.query_selector(sel)
                if el2:
                    await el2.select_option(value=value.upper())
                    _log(task, f"Selected by value '{value}' in '{sel}'")
                    return
            except Exception:
                continue


def _log(task: dict, msg: str):
    task["messages"].append({"time": _now(), "msg": msg})
    task["updated_at"] = _now()
    logger.info(f"[automation:{task['broker_id']}] {msg}")


def _now() -> str:
    return datetime.utcnow().isoformat()
