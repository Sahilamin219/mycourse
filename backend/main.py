from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional
import os
from sqlalchemy.orm import Session
import uuid
from datetime import timedelta

from .database import engine, get_db, Base
from . import models, auth
from .ai_analysis import generate_ai_analysis

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="DebateHub API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# --- Pydantic Models ---

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class Category(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    course_count: int
    gradient: str
    
    class Config:
        from_attributes = True

class Instructor(BaseModel):
    id: str
    name: str
    title: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class Course(BaseModel):
    id: str
    title: str
    description: str
    instructor_id: str
    instructor_name: Optional[str] = None
    category_id: str
    category_name: Optional[str] = None
    price: float
    original_price: float
    rating: float
    student_count: int
    duration: str
    image_url: str
    badge: Optional[str] = None
    badge_color: Optional[str] = None
    updated_date: Optional[str] = None
    is_featured: Optional[bool] = False
    
    class Config:
        from_attributes = True

class Testimonial(BaseModel):
    id: str
    student_name: str
    student_title: str
    student_avatar: str
    rating: int
    comment: str
    
    class Config:
        from_attributes = True

class DebateSessionCreate(BaseModel):
    user_id: str
    partner_id: Optional[str] = None
    topic: str

class DebateTranscriptCreate(BaseModel):
    session_id: str
    speaker: str
    text: str
    timestamp: str

class Subscription(BaseModel):
    id: str
    user_id: str
    plan_type: str
    status: str
    start_date: str
    end_date: Optional[str] = None
    auto_renew: bool
    
    class Config:
        from_attributes = True

# --- Dependency ---
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = auth.decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

# --- Auth Endpoints ---

@app.post("/api/auth/signup", response_model=Token)
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        id=str(uuid.uuid4()),
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# --- API Endpoints ---

@app.get("/")
async def root():
    return {"message": "Welcome to DebateHub API (MySQL Edition)"}

@app.get("/api/categories", response_model=List[Category])
async def get_categories(db: Session = Depends(get_db)):
    categories = db.query(models.Category).all()
    return categories

@app.get("/api/courses", response_model=List[Course])
async def get_courses(db: Session = Depends(get_db)):
    courses = db.query(models.Course).all()
    # Manually populate instructor_name and category_name for frontend compatibility
    # Or update frontend to use nested objects. For now, let's stick to the model.
    result = []
    for course in courses:
        course_data = Course.from_orm(course)
        if course.instructor:
            course_data.instructor_name = course.instructor.name
        if course.category:
            course_data.category_name = course.category.name
        result.append(course_data)
    return result

@app.get("/api/courses/{course_id}", response_model=Course)
async def get_course(course_id: str, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    course_data = Course.from_orm(course)
    if course.instructor:
        course_data.instructor_name = course.instructor.name
    if course.category:
        course_data.category_name = course.category.name
    return course_data

@app.get("/api/instructors", response_model=List[Instructor])
async def get_instructors(db: Session = Depends(get_db)):
    instructors = db.query(models.Instructor).all()
    return instructors

@app.get("/api/testimonials", response_model=List[Testimonial])
async def get_testimonials(db: Session = Depends(get_db)):
    testimonials = db.query(models.Testimonial).all()
    return testimonials

@app.get("/api/stats")
async def get_stats(db: Session = Depends(get_db)):
    courses_count = db.query(models.Course).count()
    instructors_count = db.query(models.Instructor).count()
    
    # Calculate total students
    total_students = db.query(func.sum(models.Course.student_count)).scalar() or 0
    
    return {
        "courses_available": courses_count,
        "happy_students": total_students,
        "expert_instructors": instructors_count,
        "support_available": "24/7"
    }

@app.post("/api/debate-sessions")
async def create_debate_session(data: DebateSessionCreate, db: Session = Depends(get_db)):
    new_session = models.DebateSession(
        id=str(uuid.uuid4()),
        user_id=data.user_id,
        partner_id=data.partner_id,
        topic=data.topic
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@app.put("/api/debate-sessions/{session_id}")
async def end_debate_session(session_id: str, data: dict, db: Session = Depends(get_db)):
    session = db.query(models.DebateSession).filter(models.DebateSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.ended_at = data.get("ended_at")
    session.duration_seconds = data.get("duration_seconds")
    db.commit()
    db.refresh(session)
    return session

@app.post("/api/debate-transcripts")
async def create_debate_transcripts(transcripts: List[DebateTranscriptCreate], db: Session = Depends(get_db)):
    try:
        new_transcripts = []
        for t in transcripts:
            new_t = models.DebateTranscript(
                session_id=t.session_id,
                speaker=t.speaker,
                text=t.text,
                timestamp=t.timestamp
            )
            db.add(new_t)
            new_transcripts.append(new_t)
        db.commit()
        return {"message": "Transcripts saved", "count": len(new_transcripts)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/debate-analysis/{session_id}")
async def create_debate_analysis(session_id: str, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Fetch transcripts
    transcripts = db.query(models.DebateTranscript).filter(models.DebateTranscript.session_id == session_id).all()
    transcript_data = [{"speaker": t.speaker, "text": t.text} for t in transcripts]
    
    # Generate analysis
    analysis_result = await generate_ai_analysis(session_id, current_user.id, transcript_data)
    
    # Save analysis
    new_analysis = models.DebateAnalysis(
        id=str(uuid.uuid4()),
        session_id=session_id,
        user_id=current_user.id,
        scores=analysis_result.get("scores"),
        feedback=analysis_result.get("feedback"),
        improvements=analysis_result.get("improvements")
    )
    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)
    
    return new_analysis

@app.get("/api/debate-history/{user_id}")
async def get_debate_history(user_id: str, db: Session = Depends(get_db)):
    sessions = db.query(models.DebateSession)\
        .filter(models.DebateSession.user_id == user_id)\
        .order_by(models.DebateSession.created_at.desc())\
        .limit(20)\
        .all()
    return sessions

@app.get("/api/debate-analysis/session/{session_id}")
async def get_session_analysis(session_id: str, db: Session = Depends(get_db)):
    analysis = db.query(models.DebateAnalysis).filter(models.DebateAnalysis.session_id == session_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis

@app.get("/api/subscriptions", response_model=Subscription)
async def get_subscription(user_id: str, db: Session = Depends(get_db)):
    subscription = db.query(models.Subscription)\
        .filter(models.Subscription.user_id == user_id, models.Subscription.status == 'active')\
        .order_by(models.Subscription.created_at.desc())\
        .first()
    
    if not subscription:
        # Return empty or 404 depending on frontend expectation. 
        # Returning None might be safer if frontend handles it.
        return None 
        
    return subscription

@app.post("/api/subscriptions/track-session")
async def track_session(data: DebateSessionCreate, db: Session = Depends(get_db)):
    new_tracking = models.DebateSessionTracking(
        id=str(uuid.uuid4()),
        user_id=data.user_id,
        partner_id=data.partner_id,
        topic=data.topic,
        session_date=datetime.now().strftime("%Y-%m-%d")
    )
    db.add(new_tracking)
    db.commit()
    db.refresh(new_tracking)
    return new_tracking

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
