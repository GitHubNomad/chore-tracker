"""
CCPA / GDPR opt-out email templates.
Each template function returns {"subject": str, "body": str}.
"""
from datetime import datetime


def _today():
    return datetime.now().strftime("%B %d, %Y")


TEMPLATES = [
    {
        "id": "deletion",
        "name": "Data Deletion Request",
        "description": "General request to delete all personal data. Works for any broker.",
        "law": "General",
        "icon": "🗑️",
    },
    {
        "id": "ccpa_delete",
        "name": "CCPA Right to Delete",
        "description": "Formally invokes California Consumer Privacy Act deletion rights.",
        "law": "CCPA (California)",
        "icon": "⚖️",
    },
    {
        "id": "ccpa_know",
        "name": "CCPA Right to Know",
        "description": "Requests disclosure of what personal data the company holds about you.",
        "law": "CCPA (California)",
        "icon": "🔍",
    },
    {
        "id": "ccpa_optout",
        "name": "CCPA Opt-out of Sale",
        "description": "Directs the company to stop selling or sharing your personal information.",
        "law": "CCPA (California)",
        "icon": "🚫",
    },
    {
        "id": "gdpr_erasure",
        "name": "GDPR Right to Erasure",
        "description": "Invokes Article 17 GDPR right to erasure ('right to be forgotten').",
        "law": "GDPR (EU/UK)",
        "icon": "🇪🇺",
    },
]


def render(template_id: str, profile: dict, broker: dict = None) -> dict:
    name = profile.get("full_name", "[Your Full Name]")
    aliases = profile.get("aliases", "")
    dob = profile.get("dob", "")
    phones = profile.get("phones", "")
    emails = profile.get("emails", "")
    addresses = profile.get("addresses", "")
    broker_name = broker["name"] if broker else "[Company Name]"
    contact_email = broker.get("optout_email", "") if broker else ""
    today = _today()

    identity_block = _identity_block(name, aliases, dob, phones, emails, addresses)

    if template_id == "deletion":
        return _deletion(name, broker_name, identity_block, today, contact_email)
    if template_id == "ccpa_delete":
        return _ccpa_delete(name, broker_name, identity_block, today, contact_email)
    if template_id == "ccpa_know":
        return _ccpa_know(name, broker_name, identity_block, today, contact_email)
    if template_id == "ccpa_optout":
        return _ccpa_optout(name, broker_name, identity_block, today, contact_email)
    if template_id == "gdpr_erasure":
        return _gdpr_erasure(name, broker_name, identity_block, today, contact_email)
    return {"subject": "", "body": "", "error": "Unknown template"}


def _identity_block(name, aliases, dob, phones, emails, addresses) -> str:
    lines = [f"Full Name: {name}"]
    if aliases:
        lines.append(f"Also known as: {aliases}")
    if dob:
        lines.append(f"Date of Birth: {dob}")
    if phones:
        lines.append(f"Phone Number(s): {phones}")
    if emails:
        lines.append(f"Email Address(es): {emails}")
    if addresses:
        for addr in addresses.splitlines():
            if addr.strip():
                lines.append(f"Address: {addr.strip()}")
    return "\n".join(lines)


def _deletion(name, broker, identity, today, contact_email):
    to = contact_email or f"privacy@{broker.lower().replace(' ', '')}.com"
    return {
        "subject": f"Personal Data Deletion Request — {name}",
        "to": to,
        "body": f"""{today}

Privacy Team
{broker}

Re: Request to Delete My Personal Information

To Whom It May Concern,

I am writing to formally request the deletion of all personal information that {broker} holds about me.

My identifying information is as follows:

{identity}

I request that you:
1. Delete all personal information you hold about me from your databases and systems.
2. Delete all records derived from my personal information.
3. Instruct any third parties to whom you have disclosed my information to also delete it.
4. Confirm in writing when the deletion has been completed.

Please treat this request as urgent. I expect a response within 30 days.

If you require additional verification, please contact me at the email address or phone number listed above.

Sincerely,
{name}
""",
    }


def _ccpa_delete(name, broker, identity, today, contact_email):
    to = contact_email or f"privacy@{broker.lower().replace(' ', '')}.com"
    return {
        "subject": f"CCPA Deletion Request — {name}",
        "to": to,
        "body": f"""{today}

Privacy Team / Data Protection Officer
{broker}

Re: California Consumer Privacy Act (CCPA) — Request to Delete Personal Information

To Whom It May Concern,

Pursuant to the California Consumer Privacy Act (CCPA), Cal. Civ. Code § 1798.100 et seq., I hereby request that you delete all personal information you have collected about me, and direct any service providers or third parties to do the same.

My identifying information is as follows:

{identity}

Under CCPA § 1798.105, I have the right to request that a business delete personal information it has collected about me. I am exercising this right.

Please:
1. Delete all personal information you hold about me.
2. Direct all service providers who received my data to delete it as well.
3. Confirm in writing that deletion has been completed within 45 days, as required by CCPA.

If you believe an exemption applies that allows you to retain any of my information, please specify the applicable exemption and the categories of information being retained.

Failure to comply with this request may constitute a violation of the CCPA, for which statutory damages of $100–$750 per incident may apply.

Sincerely,
{name}
""",
    }


def _ccpa_know(name, broker, identity, today, contact_email):
    to = contact_email or f"privacy@{broker.lower().replace(' ', '')}.com"
    return {
        "subject": f"CCPA Right to Know Request — {name}",
        "to": to,
        "body": f"""{today}

Privacy Team / Data Protection Officer
{broker}

Re: California Consumer Privacy Act (CCPA) — Right to Know Request

To Whom It May Concern,

Pursuant to the California Consumer Privacy Act (CCPA), Cal. Civ. Code § 1798.110, I am submitting a verified consumer request to know what personal information {broker} has collected, used, disclosed, or sold about me.

My identifying information is as follows:

{identity}

Specifically, I request disclosure of:
1. The categories of personal information you have collected about me.
2. The categories of sources from which the personal information was collected.
3. The business or commercial purpose for collecting or selling my personal information.
4. The categories of third parties with whom you share my personal information.
5. The specific pieces of personal information you have collected about me.

Please provide this information within 45 days as required by CCPA. If needed, you may extend this period by an additional 45 days with written notice.

Sincerely,
{name}
""",
    }


def _ccpa_optout(name, broker, identity, today, contact_email):
    to = contact_email or f"privacy@{broker.lower().replace(' ', '')}.com"
    return {
        "subject": f"CCPA Opt-Out of Sale/Sharing of Personal Information — {name}",
        "to": to,
        "body": f"""{today}

Privacy Team / Data Protection Officer
{broker}

Re: California Consumer Privacy Act (CCPA) — Opt-Out of Sale and Sharing of Personal Information

To Whom It May Concern,

Pursuant to the California Consumer Privacy Act (CCPA), Cal. Civ. Code § 1798.120, and as amended by the California Privacy Rights Act (CPRA), I am formally directing {broker} to stop selling and/or sharing my personal information with third parties.

My identifying information is as follows:

{identity}

I hereby opt out of:
1. The sale of my personal information to any third parties.
2. The sharing of my personal information for cross-context behavioral advertising.
3. Any disclosure of my personal information for commercial purposes not strictly necessary for the service.

This opt-out is effective immediately upon receipt. Please confirm compliance in writing.

Sincerely,
{name}
""",
    }


def _gdpr_erasure(name, broker, identity, today, contact_email):
    to = contact_email or f"dpo@{broker.lower().replace(' ', '')}.com"
    return {
        "subject": f"GDPR Right to Erasure Request — {name}",
        "to": to,
        "body": f"""{today}

Data Protection Officer
{broker}

Re: Right to Erasure Under GDPR — Article 17 Request

To Whom It May Concern,

I am writing to exercise my right to erasure ('right to be forgotten') under Article 17 of the General Data Protection Regulation (GDPR) (EU) 2016/679.

My identifying information is as follows:

{identity}

Grounds for erasure (Article 17(1)):
• My personal data is no longer necessary for the purposes for which it was collected.
• I withdraw any consent on which the processing was based.
• I object to the processing under Article 21 GDPR and there are no overriding legitimate grounds.
• The personal data has been unlawfully processed.

I request that you:
1. Erase all personal data you hold about me without undue delay.
2. Inform any third parties to whom you have disclosed my data of the erasure request.
3. Confirm in writing when erasure has been completed within 30 days (as required by Article 12(3) GDPR).

If you intend to refuse this request, please provide your specific legal basis for continued processing.

Sincerely,
{name}
""",
    }
