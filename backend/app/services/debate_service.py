from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
from datetime import datetime
from app.repositories.debate_repository import DebateRepository
from app.repositories.user_repository import UserRepository
from app.schemas.debate import (
    DebateSessionCreate,
    DebateSessionResponse,
    TranscriptCreate,
    TranscriptResponse,
    AnalyzeDebateRequest,
    AnalysisResponse
)
from app.services.ai_service import AIService
from app.utils.logger import service_logger


class DebateService:
    def __init__(self, db: Session):
        self.db = db
        self.debate_repo = DebateRepository(db)
        self.user_repo = UserRepository(db)
        self.ai_service = AIService()

    def create_session(self, user_id: str, session_data: DebateSessionCreate) -> DebateSessionResponse:
        service_logger.info("Creating debate session in service", {
            "user_id": user_id,
            "topic": session_data.topic
        })
        session = self.debate_repo.create_session(user_id, session_data)
        service_logger.debug("Debate session created", {"session_id": session.id})
        return DebateSessionResponse.from_orm(session)

    def get_session(self, session_id: str, user_id: str) -> DebateSessionResponse:
        session = self.debate_repo.get_session(session_id)

        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )

        if session.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this session"
            )

        return DebateSessionResponse.from_orm(session)

    def get_user_sessions(self, user_id: str, skip: int = 0, limit: int = 100) -> List[DebateSessionResponse]:
        sessions = self.debate_repo.get_user_sessions(user_id, skip, limit)
        return [DebateSessionResponse.from_orm(session) for session in sessions]

    def create_transcript(self, user_id: str, transcript_data: TranscriptCreate) -> TranscriptResponse:
        session = self.debate_repo.get_session(transcript_data.session_id)

        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )

        if session.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this session"
            )

        transcript = self.debate_repo.create_transcript(transcript_data)
        return TranscriptResponse.from_orm(transcript)

    def get_transcripts(self, session_id: str, user_id: str) -> List[TranscriptResponse]:
        session = self.debate_repo.get_session(session_id)

        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )

        if session.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this session"
            )

        transcripts = self.debate_repo.get_session_transcripts(session_id)
        return [TranscriptResponse.from_orm(transcript) for transcript in transcripts]

    async def analyze_debate(self, user_id: str, request: AnalyzeDebateRequest) -> AnalysisResponse:
        service_logger.info("Starting debate analysis", {
            "session_id": request.session_id,
            "user_id": user_id,
            "transcript_count": len(request.transcripts)
        })

        session = self.debate_repo.get_session(request.session_id)

        if not session:
            service_logger.warning("Session not found for analysis", {"session_id": request.session_id})
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )

        if session.user_id != user_id:
            service_logger.warning("Unauthorized analysis attempt", {
                "session_id": request.session_id,
                "user_id": user_id
            })
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this session"
            )

        service_logger.debug("Generating AI analysis", {"session_id": request.session_id})
        analysis = await self.ai_service.generate_analysis(
            request.transcripts,
            session.topic,
            session.stance
        )

        service_logger.debug("Updating session with analysis results", {"session_id": request.session_id})
        from app.schemas.debate import DebateSessionUpdate
        update_data = DebateSessionUpdate(
            status="completed",
            overall_score=analysis.get("overall_score"),
            clarity_score=analysis.get("clarity_score"),
            logic_score=analysis.get("logic_score"),
            evidence_score=analysis.get("evidence_score"),
            rebuttal_score=analysis.get("rebuttal_score"),
            persuasiveness_score=analysis.get("persuasiveness_score"),
            strengths=analysis.get("strengths", []),
            weaknesses=analysis.get("weaknesses", []),
            recommendations=analysis.get("recommendations", []),
            weak_portions=analysis.get("weak_portions", [])
        )

        self.debate_repo.update_session(request.session_id, update_data)

        points = int(analysis.get("overall_score", 0) * 10)
        service_logger.info("Updating user points and stats", {
            "user_id": user_id,
            "points_earned": points,
            "overall_score": analysis.get("overall_score")
        })
        self.user_repo.increment_points(user_id, points)
        self.user_repo.increment_debates_completed(user_id)

        service_logger.info("Debate analysis completed successfully", {"session_id": request.session_id})
        return AnalysisResponse(
            analysis=analysis,
            message="Debate analyzed successfully"
        )
