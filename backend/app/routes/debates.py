from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
from app.schemas.debate import (
    DebateSessionCreate,
    DebateSessionResponse,
    TranscriptCreate,
    TranscriptResponse,
    AnalyzeDebateRequest,
    AnalysisResponse
)
from app.services.debate_service import DebateService
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/debates", tags=["Debates"])


@router.post("/sessions", response_model=DebateSessionResponse, status_code=201)
def create_debate_session(
    session_data: DebateSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    debate_service = DebateService(db)
    return debate_service.create_session(current_user.id, session_data)


@router.get("/sessions", response_model=List[DebateSessionResponse])
def get_debate_sessions(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    debate_service = DebateService(db)
    return debate_service.get_user_sessions(current_user.id, skip, limit)


@router.get("/sessions/{session_id}", response_model=DebateSessionResponse)
def get_debate_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    debate_service = DebateService(db)
    return debate_service.get_session(session_id, current_user.id)


@router.post("/transcripts", response_model=TranscriptResponse, status_code=201)
def create_transcript(
    transcript_data: TranscriptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    debate_service = DebateService(db)
    return debate_service.create_transcript(current_user.id, transcript_data)


@router.get("/sessions/{session_id}/transcripts", response_model=List[TranscriptResponse])
def get_transcripts(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    debate_service = DebateService(db)
    return debate_service.get_transcripts(session_id, current_user.id)


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_debate(
    request: AnalyzeDebateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    debate_service = DebateService(db)
    return await debate_service.analyze_debate(current_user.id, request)
