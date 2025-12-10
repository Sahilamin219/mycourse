from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True) # UUID
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    avatar_url = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    subscriptions = relationship("Subscription", back_populates="user")
    debate_sessions = relationship("DebateSession", foreign_keys="[DebateSession.user_id]", back_populates="user")
    debate_tracking = relationship("DebateSessionTracking", back_populates="user")

class Category(Base):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    icon = Column(String(50))
    course_count = Column(Integer, default=0)
    gradient = Column(String(100))
    
    courses = relationship("Course", back_populates="category")

class Instructor(Base):
    __tablename__ = "instructors"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    title = Column(String(100))
    bio = Column(Text)
    avatar_url = Column(String(255))
    
    courses = relationship("Course", back_populates="instructor")

class Course(Base):
    __tablename__ = "courses"

    id = Column(String(36), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    instructor_id = Column(String(36), ForeignKey("instructors.id"))
    category_id = Column(String(36), ForeignKey("categories.id"))
    price = Column(Float)
    original_price = Column(Float)
    rating = Column(Float)
    student_count = Column(Integer, default=0)
    duration = Column(String(50))
    image_url = Column(String(255))
    badge = Column(String(50))
    badge_color = Column(String(50))
    updated_date = Column(String(50)) # Keeping as string to match existing, could be Date
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    instructor = relationship("Instructor", back_populates="courses")
    category = relationship("Category", back_populates="courses")

class Testimonial(Base):
    __tablename__ = "testimonials"

    id = Column(String(36), primary_key=True, index=True)
    student_name = Column(String(100))
    student_title = Column(String(100))
    student_avatar = Column(String(255))
    rating = Column(Integer)
    comment = Column(Text)

class DebateSession(Base):
    __tablename__ = "debate_sessions"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"))
    partner_id = Column(String(36), nullable=True) # Could be another user or external ID
    topic = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True))
    duration_seconds = Column(Integer)
    
    user = relationship("User", foreign_keys=[user_id], back_populates="debate_sessions")
    transcripts = relationship("DebateTranscript", back_populates="session")
    analysis = relationship("DebateAnalysis", back_populates="session", uselist=False)

class DebateTranscript(Base):
    __tablename__ = "debate_transcripts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("debate_sessions.id"))
    speaker = Column(String(50)) # 'user' or 'opponent'
    text = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    session = relationship("DebateSession", back_populates="transcripts")

class DebateAnalysis(Base):
    __tablename__ = "debate_analysis"

    id = Column(String(36), primary_key=True, index=True)
    session_id = Column(String(36), ForeignKey("debate_sessions.id"))
    user_id = Column(String(36), ForeignKey("users.id"))
    
    # Storing complex analysis data as JSON
    scores = Column(JSON)
    feedback = Column(JSON)
    improvements = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    session = relationship("DebateSession", back_populates="analysis")

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"))
    plan_type = Column(String(50)) # 'free', 'premium'
    status = Column(String(50)) # 'active', 'cancelled', 'expired'
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    auto_renew = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="subscriptions")

class DebateSessionTracking(Base):
    __tablename__ = "debate_sessions_tracking"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"))
    partner_id = Column(String(36), nullable=True)
    topic = Column(String(100))
    session_date = Column(String(10)) # YYYY-MM-DD
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True))
    duration_seconds = Column(Integer)
    
    user = relationship("User", back_populates="debate_tracking")
