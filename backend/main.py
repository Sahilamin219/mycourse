from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from supabase import create_client, Client
from ai_analysis import generate_ai_analysis

app = FastAPI(title="DebateHub API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase_url = os.getenv("VITE_SUPABASE_URL")
supabase_key = os.getenv("VITE_SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)


class Category(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    course_count: int
    gradient: str


class Instructor(BaseModel):
    id: str
    name: str
    title: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


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


class Testimonial(BaseModel):
    id: str
    student_name: str
    student_title: str
    student_avatar: str
    rating: int
    comment: str


@app.get("/")
async def root():
    return {"message": "Welcome to DebateHub API"}


@app.get("/api/categories", response_model=List[Category])
async def get_categories():
    try:
        response = supabase.table("categories").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/courses", response_model=List[Course])
async def get_courses():
    try:
        response = supabase.table("courses").select("""
            *,
            instructors (name),
            categories (name)
        """).execute()

        courses = []
        for course in response.data:
            course_data = {
                **course,
                "instructor_name": course.get("instructors", {}).get("name"),
                "category_name": course.get("categories", {}).get("name")
            }
            courses.append(course_data)

        return courses
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/courses/{course_id}", response_model=Course)
async def get_course(course_id: str):
    try:
        response = supabase.table("courses").select("""
            *,
            instructors (name),
            categories (name)
        """).eq("id", course_id).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Course not found")

        course = response.data[0]
        course_data = {
            **course,
            "instructor_name": course.get("instructors", {}).get("name"),
            "category_name": course.get("categories", {}).get("name")
        }

        return course_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/instructors", response_model=List[Instructor])
async def get_instructors():
    try:
        response = supabase.table("instructors").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/testimonials", response_model=List[Testimonial])
async def get_testimonials():
    try:
        response = supabase.table("testimonials").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stats")
async def get_stats():
    try:
        courses_response = supabase.table("courses").select("id", count="exact").execute()
        instructors_response = supabase.table("instructors").select("id", count="exact").execute()

        courses_count = courses_response.count or 0
        instructors_count = instructors_response.count or 0

        students_response = supabase.table("courses").select("student_count").execute()
        total_students = sum(course.get("student_count", 0) for course in students_response.data)

        return {
            "courses_available": courses_count,
            "happy_students": total_students,
            "expert_instructors": instructors_count,
            "support_available": "24/7"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/debate-sessions")
async def create_debate_session(data: dict):
    try:
        response = supabase.table("debate_sessions").insert({
            "user_id": data.get("user_id"),
            "partner_id": data.get("partner_id"),
            "topic": data.get("topic"),
        }).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/debate-sessions/{session_id}")
async def end_debate_session(session_id: str, data: dict):
    try:
        response = supabase.table("debate_sessions").update({
            "ended_at": data.get("ended_at"),
            "duration_seconds": data.get("duration_seconds"),
        }).eq("id", session_id).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/debate-analysis/{session_id}")
async def create_debate_analysis(session_id: str, user_id: str):
    try:
        transcripts_response = supabase.table("debate_transcripts")\
            .select("*")\
            .eq("session_id", session_id)\
            .execute()

        transcripts = transcripts_response.data

        analysis = await generate_ai_analysis(session_id, user_id, transcripts)

        response = supabase.table("debate_analysis").insert(analysis).execute()

        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/debate-history/{user_id}")
async def get_debate_history(user_id: str):
    try:
        response = supabase.table("debate_sessions")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(20)\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/debate-analysis/session/{session_id}")
async def get_session_analysis(session_id: str):
    try:
        response = supabase.table("debate_analysis")\
            .select("*")\
            .eq("session_id", session_id)\
            .execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Analysis not found")

        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
