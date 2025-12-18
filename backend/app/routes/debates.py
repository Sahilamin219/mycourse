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
from app.utils.logger import api_logger

router = APIRouter(prefix="/debates", tags=["Debates"])


@router.post("/sessions", response_model=DebateSessionResponse, status_code=201)
def create_debate_session(
    session_data: DebateSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    api_logger.info("Creating debate session", {
        "user_id": current_user.id,
        "topic": session_data.topic,
        "stance": session_data.stance
    })
    try:
        debate_service = DebateService(db)
        result = debate_service.create_session(current_user.id, session_data)
        api_logger.info("Debate session created successfully", {"session_id": result.id})
        return result
    except Exception as e:
        api_logger.error("Failed to create debate session", {"error": str(e)}, exc_info=True)
        raise


@router.get("/sessions", response_model=List[DebateSessionResponse])
def get_debate_sessions(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    api_logger.debug("Fetching debate sessions", {
        "user_id": current_user.id,
        "skip": skip,
        "limit": limit
    })
    try:
        debate_service = DebateService(db)
        sessions = debate_service.get_user_sessions(current_user.id, skip, limit)
        api_logger.info(f"Retrieved {len(sessions)} debate sessions", {"user_id": current_user.id})
        return sessions
    except Exception as e:
        api_logger.error("Failed to fetch debate sessions", {"error": str(e)}, exc_info=True)
        raise


@router.get("/sessions/{session_id}", response_model=DebateSessionResponse)
def get_debate_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    api_logger.debug("Fetching debate session", {"session_id": session_id, "user_id": current_user.id})
    try:
        debate_service = DebateService(db)
        session = debate_service.get_session(session_id, current_user.id)
        api_logger.info("Debate session retrieved successfully", {"session_id": session_id})
        return session
    except Exception as e:
        api_logger.error("Failed to fetch debate session", {
            "session_id": session_id,
            "error": str(e)
        }, exc_info=True)
        raise


@router.post("/transcripts", response_model=TranscriptResponse, status_code=201)
def create_transcript(
    transcript_data: TranscriptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    api_logger.debug("Creating transcript", {
        "session_id": transcript_data.session_id,
        "speaker": transcript_data.speaker
    })
    try:
        debate_service = DebateService(db)
        result = debate_service.create_transcript(current_user.id, transcript_data)
        api_logger.info("Transcript created successfully", {"transcript_id": result.id})
        return result
    except Exception as e:
        api_logger.error("Failed to create transcript", {"error": str(e)}, exc_info=True)
        raise


@router.get("/sessions/{session_id}/transcripts", response_model=List[TranscriptResponse])
def get_transcripts(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    api_logger.debug("Fetching transcripts", {"session_id": session_id})
    try:
        debate_service = DebateService(db)
        transcripts = debate_service.get_transcripts(session_id, current_user.id)
        api_logger.info(f"Retrieved {len(transcripts)} transcripts", {"session_id": session_id})
        return transcripts
    except Exception as e:
        api_logger.error("Failed to fetch transcripts", {"error": str(e)}, exc_info=True)
        raise


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_debate(
    request: AnalyzeDebateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    api_logger.info("Analyzing debate", {
        "session_id": request.session_id,
        "user_id": current_user.id,
        "transcript_count": len(request.transcripts)
    })
    try:
        debate_service = DebateService(db)
        result = await debate_service.analyze_debate(current_user.id, request)
        api_logger.info("Debate analysis completed successfully", {"session_id": request.session_id})
        return result
    except Exception as e:
        api_logger.error("Failed to analyze debate", {
            "session_id": request.session_id,
            "error": str(e)
        }, exc_info=True)
        raise
