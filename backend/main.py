from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from database import get_db, engine, Base
from models import User, DebateSession, DebateTranscript, Payment, Notification, Resource
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from ai_analysis import generate_ai_analysis

Base.metadata.create_all(bind=engine)

app = FastAPI(title="DebateHub API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

class DebateSessionCreate(BaseModel):
    topic: str
    stance: str

class TranscriptCreate(BaseModel):
    session_id: str
    speaker: str
    text: str

class AnalyzeDebateRequest(BaseModel):
    session_id: str
    transcripts: List[dict]

@app.get("/")
async def root():
    return {"message": "Welcome to DebateHub API - PostgreSQL Edition"}

@app.post("/auth/signup")
async def sign_up(request: SignUpRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(request.password)
    new_user = User(
        email=request.email,
        password_hash=hashed_password,
        full_name=request.full_name,
        subscription_tier="free",
        subscription_status="active"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.id})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "subscription_tier": new_user.subscription_tier,
            "subscription_status": new_user.subscription_status,
            "points": new_user.points,
            "level": new_user.level,
            "badges": new_user.badges,
            "streak_days": new_user.streak_days,
            "debates_completed": new_user.debates_completed,
            "created_at": new_user.created_at
        }
    }

@app.post("/auth/signin")
async def sign_in(request: SignInRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": user.id})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "subscription_tier": user.subscription_tier,
            "subscription_status": user.subscription_status,
            "points": user.points,
            "level": user.level,
            "badges": user.badges,
            "streak_days": user.streak_days,
            "debates_completed": user.debates_completed,
            "created_at": user.created_at
        }
    }

@app.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "subscription_tier": current_user.subscription_tier,
        "subscription_status": current_user.subscription_status,
        "points": current_user.points,
        "level": current_user.level,
        "badges": current_user.badges,
        "streak_days": current_user.streak_days,
        "debates_completed": current_user.debates_completed,
        "created_at": current_user.created_at
    }

@app.post("/debates/sessions")
async def create_debate_session(
    request: DebateSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = DebateSession(
        user_id=current_user.id,
        topic=request.topic,
        stance=request.stance,
        status="active"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@app.get("/debates/sessions")
async def get_debate_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(DebateSession).filter(
        DebateSession.user_id == current_user.id
    ).order_by(DebateSession.created_at.desc()).all()
    return sessions

@app.get("/debates/sessions/{session_id}")
async def get_debate_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(DebateSession).filter(
        DebateSession.id == session_id,
        DebateSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@app.post("/debates/transcripts")
async def create_transcript(
    request: TranscriptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(DebateSession).filter(
        DebateSession.id == request.session_id,
        DebateSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    transcript = DebateTranscript(
        session_id=request.session_id,
        speaker=request.speaker,
        text=request.text
    )
    db.add(transcript)
    db.commit()
    db.refresh(transcript)
    return {"id": transcript.id, "message": "Transcript created successfully"}

@app.get("/debates/sessions/{session_id}/transcripts")
async def get_transcripts(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(DebateSession).filter(
        DebateSession.id == session_id,
        DebateSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    transcripts = db.query(DebateTranscript).filter(
        DebateTranscript.session_id == session_id
    ).order_by(DebateTranscript.timestamp).all()

    return [
        {
            "id": t.id,
            "speaker": t.speaker,
            "text": t.text,
            "timestamp": t.timestamp
        }
        for t in transcripts
    ]

@app.post("/debates/analyze")
async def analyze_debate(
    request: AnalyzeDebateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(DebateSession).filter(
        DebateSession.id == request.session_id,
        DebateSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    analysis = await generate_ai_analysis(request.transcripts, session.topic, session.stance)

    session.overall_score = analysis.get("overall_score")
    session.clarity_score = analysis.get("clarity_score")
    session.logic_score = analysis.get("logic_score")
    session.evidence_score = analysis.get("evidence_score")
    session.rebuttal_score = analysis.get("rebuttal_score")
    session.persuasiveness_score = analysis.get("persuasiveness_score")
    session.strengths = analysis.get("strengths", [])
    session.weaknesses = analysis.get("weaknesses", [])
    session.recommendations = analysis.get("recommendations", [])
    session.weak_portions = analysis.get("weak_portions", [])
    session.status = "completed"
    session.completed_at = datetime.utcnow()

    current_user.debates_completed += 1
    current_user.points += int(analysis.get("overall_score", 0) * 10)

    db.commit()

    return {"analysis": analysis, "message": "Debate analyzed successfully"}

@app.get("/resources")
async def get_resources(db: Session = Depends(get_db)):
    resources = db.query(Resource).all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "content": r.content,
            "category": r.category,
            "difficulty": r.difficulty,
            "estimated_time": r.estimated_time,
            "icon": r.icon,
            "gradient": r.gradient,
            "created_at": r.created_at
        }
        for r in resources
    ]

@app.get("/notifications")
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()

    return [
        {
            "id": n.id,
            "type": n.type,
            "title": n.title,
            "message": n.message,
            "read": n.read,
            "created_at": n.created_at
        }
        for n in notifications
    ]

@app.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.read = True
    db.commit()
    return {"message": "Notification marked as read"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "PostgreSQL"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
