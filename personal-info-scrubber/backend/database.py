from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DB_PATH = os.environ.get("DB_PATH", "scrubber.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    aliases = Column(Text, default="")  # comma-separated
    addresses = Column(Text, default="")  # JSON
    phones = Column(Text, default="")  # comma-separated
    emails = Column(Text, default="")  # comma-separated
    dob = Column(String, default="")
    ssn_last4 = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class BrokerStatus(Base):
    __tablename__ = "broker_statuses"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, nullable=False)
    broker_id = Column(String, nullable=False)
    status = Column(String, default="not_started")  # not_started, submitted, confirmed, failed, monitoring
    submitted_at = Column(DateTime, nullable=True)
    confirmed_at = Column(DateTime, nullable=True)
    notes = Column(Text, default="")
    next_check = Column(DateTime, nullable=True)


class RedactionJob(Base):
    __tablename__ = "redaction_jobs"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_path = Column(String, nullable=False)
    redacted_path = Column(String, nullable=True)
    pdf_path = Column(String, nullable=True)
    pii_count = Column(Integer, default=0)
    pii_summary = Column(Text, default="")  # JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    completed = Column(Boolean, default=False)


class AppSetting(Base):
    __tablename__ = "app_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False)
    value = Column(Text, default="")


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
