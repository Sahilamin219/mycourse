from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.config.database import Base
import uuid


def generate_uuid():
    return str(uuid.uuid4())


class DebateSession(Base):
    __tablename__ = "debate_sessions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    topic = Column(String, nullable=False)
    stance = Column(String, nullable=False)
    duration = Column(Integer, default=0)
    status = Column(String, default="active", index=True)

    overall_score = Column(Float)
    clarity_score = Column(Float)
    logic_score = Column(Float)
    evidence_score = Column(Float)
    rebuttal_score = Column(Float)
    persuasiveness_score = Column(Float)

    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    weak_portions = Column(JSON, default=list)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    completed_at = Column(DateTime(timezone=True))

    user = relationship("User", back_populates="debate_sessions")
    transcripts = relationship("DebateTranscript", back_populates="session", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<DebateSession {self.id} - {self.topic}>"


class DebateTranscript(Base):
    __tablename__ = "debate_transcripts"

    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("debate_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    speaker = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("DebateSession", back_populates="transcripts")

    def __repr__(self):
        return f"<DebateTranscript {self.id} - {self.speaker}>"
