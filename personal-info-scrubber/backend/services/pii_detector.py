import re
from dataclasses import dataclass, field
from typing import List, Tuple
import json

try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
    SPACY_AVAILABLE = True
except Exception:
    SPACY_AVAILABLE = False
    nlp = None


@dataclass
class PIIMatch:
    start: int
    end: int
    label: str
    text: str
    replacement: str = ""


PATTERNS = {
    "SSN": re.compile(r"\b(?!000|666|9\d{2})\d{3}[-\s]?(?!00)\d{2}[-\s]?(?!0000)\d{4}\b"),
    "CREDIT_CARD": re.compile(r"\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})\b"),
    "PHONE": re.compile(r"\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"),
    "EMAIL": re.compile(r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b"),
    "IP_ADDRESS": re.compile(r"\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b"),
    "DOB": re.compile(
        r"\b(?:0?[1-9]|1[0-2])[-/.](?:0?[1-9]|[12]\d|3[01])[-/.](?:19|20)\d{2}\b"
        r"|\b(?:19|20)\d{2}[-/.](?:0?[1-9]|1[0-2])[-/.](?:0?[1-9]|[12]\d|3[01])\b"
    ),
    "ZIP_CODE": re.compile(r"\b\d{5}(?:-\d{4})?\b"),
    "PASSPORT": re.compile(r"\b[A-Z]{1,2}\d{6,9}\b"),
    "DRIVERS_LICENSE": re.compile(r"\b[A-Z]\d{7}\b|\b[A-Z]{2}\d{6}\b"),
    "IBAN": re.compile(r"\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}(?:[A-Z0-9]?){0,16}\b"),
    "ROUTING_NUMBER": re.compile(r"\b0[1-9]\d{7}|1[0-2]\d{7}|2[1-9]\d{7}|3[1-2]\d{7}|6[1-9]\d{7}|7[1-2]\d{7}\b"),
}

REPLACEMENTS = {
    "SSN": "[SSN REDACTED]",
    "CREDIT_CARD": "[CREDIT CARD REDACTED]",
    "PHONE": "[PHONE REDACTED]",
    "EMAIL": "[EMAIL REDACTED]",
    "IP_ADDRESS": "[IP REDACTED]",
    "DOB": "[DOB REDACTED]",
    "ZIP_CODE": "[ZIP REDACTED]",
    "PASSPORT": "[PASSPORT REDACTED]",
    "DRIVERS_LICENSE": "[DL REDACTED]",
    "IBAN": "[IBAN REDACTED]",
    "ROUTING_NUMBER": "[ROUTING# REDACTED]",
    "PERSON": "[NAME REDACTED]",
    "GPE": "[LOCATION REDACTED]",
    "LOC": "[LOCATION REDACTED]",
    "ORG": "[ORG REDACTED]",
    "FAC": "[LOCATION REDACTED]",
}


def detect_pii(text: str, custom_terms: List[str] = None) -> Tuple[List[PIIMatch], dict]:
    matches: List[PIIMatch] = []

    # Regex-based detection
    for label, pattern in PATTERNS.items():
        for m in pattern.finditer(text):
            matches.append(PIIMatch(
                start=m.start(),
                end=m.end(),
                label=label,
                text=m.group(),
                replacement=REPLACEMENTS.get(label, "[REDACTED]"),
            ))

    # spaCy NER
    if SPACY_AVAILABLE and nlp:
        doc = nlp(text[:1_000_000])  # cap for safety
        for ent in doc.ents:
            if ent.label_ in ("PERSON", "GPE", "LOC", "FAC"):
                matches.append(PIIMatch(
                    start=ent.start_char,
                    end=ent.end_char,
                    label=ent.label_,
                    text=ent.text,
                    replacement=REPLACEMENTS.get(ent.label_, "[REDACTED]"),
                ))

    # Custom terms from user profile
    if custom_terms:
        for term in custom_terms:
            if not term:
                continue
            escaped = re.escape(term)
            for m in re.finditer(escaped, text, re.IGNORECASE):
                matches.append(PIIMatch(
                    start=m.start(),
                    end=m.end(),
                    label="PROFILE_TERM",
                    text=m.group(),
                    replacement="[PERSONAL INFO REDACTED]",
                ))

    # Deduplicate overlapping matches (prefer longer)
    matches = _deduplicate(matches)

    summary = {}
    for m in matches:
        summary[m.label] = summary.get(m.label, 0) + 1

    return matches, summary


def redact_text(text: str, matches: List[PIIMatch]) -> str:
    sorted_matches = sorted(matches, key=lambda m: m.start, reverse=True)
    result = text
    for m in sorted_matches:
        result = result[:m.start] + m.replacement + result[m.end:]
    return result


def _deduplicate(matches: List[PIIMatch]) -> List[PIIMatch]:
    if not matches:
        return []
    matches.sort(key=lambda m: (m.start, -(m.end - m.start)))
    result = []
    last_end = -1
    for m in matches:
        if m.start >= last_end:
            result.append(m)
            last_end = m.end
    return result


def get_profile_terms(profile_data: dict) -> List[str]:
    terms = []
    if profile_data.get("full_name"):
        terms.append(profile_data["full_name"])
        parts = profile_data["full_name"].split()
        terms.extend(parts)
    if profile_data.get("aliases"):
        for alias in profile_data["aliases"].split(","):
            a = alias.strip()
            if a:
                terms.append(a)
    if profile_data.get("phones"):
        for p in profile_data["phones"].split(","):
            terms.append(p.strip())
    if profile_data.get("emails"):
        for e in profile_data["emails"].split(","):
            terms.append(e.strip())
    if profile_data.get("dob"):
        terms.append(profile_data["dob"])
    return [t for t in terms if t]
