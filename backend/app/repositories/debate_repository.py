from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.debate import DebateSession, DebateTranscript
from app.schemas.debate import DebateSessionCreate, DebateSessionUpdate, TranscriptCreate


class DebateRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_session(self, user_id: str, session_data: DebateSessionCreate) -> DebateSession:
        session = DebateSession(
            user_id=user_id,
            topic=session_data.topic,
            stance=session_data.stance
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def get_session(self, session_id: str) -> Optional[DebateSession]:
        return self.db.query(DebateSession).filter(DebateSession.id == session_id).first()

    def get_user_sessions(self, user_id: str, skip: int = 0, limit: int = 100) -> List[DebateSession]:
        return (
            self.db.query(DebateSession)
            .filter(DebateSession.user_id == user_id)
            .order_by(DebateSession.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_session(self, session_id: str, session_data: DebateSessionUpdate) -> Optional[DebateSession]:
        session = self.get_session(session_id)
        if not session:
            return None

        update_data = session_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(session, field, value)

        self.db.commit()
        self.db.refresh(session)
        return session

    def delete_session(self, session_id: str) -> bool:
        session = self.get_session(session_id)
        if not session:
            return False

        self.db.delete(session)
        self.db.commit()
        return True

    def create_transcript(self, transcript_data: TranscriptCreate) -> DebateTranscript:
        transcript = DebateTranscript(
            session_id=transcript_data.session_id,
            speaker=transcript_data.speaker,
            text=transcript_data.text
        )
        self.db.add(transcript)
        self.db.commit()
        self.db.refresh(transcript)
        return transcript

    def get_session_transcripts(self, session_id: str) -> List[DebateTranscript]:
        return (
            self.db.query(DebateTranscript)
            .filter(DebateTranscript.session_id == session_id)
            .order_by(DebateTranscript.timestamp)
            .all()
        )
