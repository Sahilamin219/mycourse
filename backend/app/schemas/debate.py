from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


class DebateSessionBase(BaseModel):
    topic: str = Field(..., min_length=1)
    stance: str = Field(..., min_length=1)


class DebateSessionCreate(DebateSessionBase):
    pass


class DebateSessionUpdate(BaseModel):
    status: Optional[str] = None
    duration: Optional[int] = None
    overall_score: Optional[float] = None
    clarity_score: Optional[float] = None
    logic_score: Optional[float] = None
    evidence_score: Optional[float] = None
    rebuttal_score: Optional[float] = None
    persuasiveness_score: Optional[float] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    weak_portions: Optional[List[Any]] = None


class DebateSessionResponse(DebateSessionBase):
    id: str
    user_id: str
    duration: int
    status: str
    overall_score: Optional[float] = None
    clarity_score: Optional[float] = None
    logic_score: Optional[float] = None
    evidence_score: Optional[float] = None
    rebuttal_score: Optional[float] = None
    persuasiveness_score: Optional[float] = None
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    weak_portions: List[Any]
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TranscriptCreate(BaseModel):
    session_id: str
    speaker: str
    text: str


class TranscriptResponse(BaseModel):
    id: str
    session_id: str
    speaker: str
    text: str
    timestamp: datetime

    class Config:
        from_attributes = True


class AnalyzeDebateRequest(BaseModel):
    session_id: str
    transcripts: List[dict]


class AnalysisResponse(BaseModel):
    analysis: dict
    message: str


class CountryDebateCreate(BaseModel):
    topic: str = Field(..., min_length=1)
    description: Optional[str] = None
    debate_type: str = Field(..., pattern="^(one_on_one|group)$")
    max_participants: int = Field(default=2, ge=2, le=10)


class CountryDebateResponse(BaseModel):
    id: str
    topic: str
    description: Optional[str] = None
    debate_type: str
    max_participants: int
    created_by: str
    status: str
    created_at: datetime
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CountryDebateJoin(BaseModel):
    debate_id: str
    country_code: str = Field(..., min_length=2, max_length=3)
    country_name: str = Field(..., min_length=1)


class CountryDebateMessageCreate(BaseModel):
    debate_id: str
    message: str = Field(..., min_length=1)
    message_type: str = Field(default="text", pattern="^(text|voice)$")
    voice_url: Optional[str] = None
    voice_duration_seconds: Optional[int] = None


class CountryDebateMessageResponse(BaseModel):
    id: str
    debate_id: str
    user_id: str
    message: str
    message_type: str
    voice_url: Optional[str] = None
    voice_duration_seconds: Optional[int] = None
    created_at: datetime
    username: Optional[str] = None
    country_name: Optional[str] = None
    country_code: Optional[str] = None

    class Config:
        from_attributes = True
