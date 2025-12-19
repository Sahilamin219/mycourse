from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.utils.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.debate import (
    CountryDebateCreate,
    CountryDebateResponse,
    CountryDebateJoin,
    CountryDebateMessageCreate,
    CountryDebateMessageResponse
)
from app.utils.logger import api_logger
from sqlalchemy import text
from datetime import datetime

router = APIRouter(prefix="/country-debates", tags=["country-debates"])


@router.post("", response_model=CountryDebateResponse, status_code=status.HTTP_201_CREATED)
async def create_country_debate(
    debate: CountryDebateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        query = text("""
            INSERT INTO country_debates (
                topic, description, debate_type, max_participants,
                created_by, status
            ) VALUES (
                :topic, :description, :debate_type, :max_participants,
                :created_by, 'waiting'
            ) RETURNING id, topic, description, debate_type, max_participants,
                        created_by, status, created_at
        """)

        result = db.execute(query, {
            "topic": debate.topic,
            "description": debate.description,
            "debate_type": debate.debate_type,
            "max_participants": debate.max_participants,
            "created_by": current_user.id
        })

        row = result.fetchone()
        db.commit()

        api_logger.info(f"Country debate created: {row.id} by user {current_user.id}")

        return {
            "id": row.id,
            "topic": row.topic,
            "description": row.description,
            "debate_type": row.debate_type,
            "max_participants": row.max_participants,
            "created_by": row.created_by,
            "status": row.status,
            "created_at": row.created_at
        }
    except Exception as e:
        db.rollback()
        api_logger.error(f"Error creating country debate: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create debate"
        )


@router.get("", response_model=List[CountryDebateResponse])
async def list_country_debates(
    status_filter: str = "waiting",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        query = text("""
            SELECT id, topic, description, debate_type, max_participants,
                   created_by, status, created_at, started_at, ended_at
            FROM country_debates
            WHERE status = :status
            ORDER BY created_at DESC
            LIMIT 50
        """)

        result = db.execute(query, {"status": status_filter})
        debates = result.fetchall()

        return [
            {
                "id": row.id,
                "topic": row.topic,
                "description": row.description,
                "debate_type": row.debate_type,
                "max_participants": row.max_participants,
                "created_by": row.created_by,
                "status": row.status,
                "created_at": row.created_at,
                "started_at": row.started_at,
                "ended_at": row.ended_at
            }
            for row in debates
        ]
    except Exception as e:
        api_logger.error(f"Error listing country debates: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch debates"
        )


@router.post("/join", status_code=status.HTTP_200_OK)
async def join_country_debate(
    join_data: CountryDebateJoin,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        check_query = text("""
            SELECT COUNT(*) as count
            FROM country_debate_participants
            WHERE debate_id = :debate_id AND user_id = :user_id
        """)

        existing = db.execute(check_query, {
            "debate_id": join_data.debate_id,
            "user_id": current_user.id
        }).fetchone()

        if existing.count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already joined this debate"
            )

        insert_query = text("""
            INSERT INTO country_debate_participants (
                debate_id, user_id, country_code, country_name
            ) VALUES (
                :debate_id, :user_id, :country_code, :country_name
            )
        """)

        db.execute(insert_query, {
            "debate_id": join_data.debate_id,
            "user_id": current_user.id,
            "country_code": join_data.country_code,
            "country_name": join_data.country_name
        })

        db.commit()

        api_logger.info(f"User {current_user.id} joined debate {join_data.debate_id} as {join_data.country_name}")

        return {"message": "Successfully joined debate"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        api_logger.error(f"Error joining debate: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to join debate"
        )


@router.post("/messages", response_model=CountryDebateMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    message_data: CountryDebateMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        query = text("""
            INSERT INTO country_debate_messages (
                debate_id, user_id, message, message_type,
                voice_url, voice_duration_seconds
            ) VALUES (
                :debate_id, :user_id, :message, :message_type,
                :voice_url, :voice_duration_seconds
            ) RETURNING id, debate_id, user_id, message, message_type,
                        voice_url, voice_duration_seconds, created_at
        """)

        result = db.execute(query, {
            "debate_id": message_data.debate_id,
            "user_id": current_user.id,
            "message": message_data.message,
            "message_type": message_data.message_type,
            "voice_url": message_data.voice_url,
            "voice_duration_seconds": message_data.voice_duration_seconds
        })

        row = result.fetchone()
        db.commit()

        return {
            "id": row.id,
            "debate_id": row.debate_id,
            "user_id": row.user_id,
            "message": row.message,
            "message_type": row.message_type,
            "voice_url": row.voice_url,
            "voice_duration_seconds": row.voice_duration_seconds,
            "created_at": row.created_at
        }
    except Exception as e:
        db.rollback()
        api_logger.error(f"Error sending message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send message"
        )


@router.get("/{debate_id}/messages", response_model=List[CountryDebateMessageResponse])
async def get_messages(
    debate_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        query = text("""
            SELECT m.id, m.debate_id, m.user_id, m.message, m.message_type,
                   m.voice_url, m.voice_duration_seconds, m.created_at,
                   u.username, p.country_name, p.country_code
            FROM country_debate_messages m
            JOIN users u ON m.user_id = u.id
            LEFT JOIN country_debate_participants p
                ON m.debate_id = p.debate_id AND m.user_id = p.user_id
            WHERE m.debate_id = :debate_id
            ORDER BY m.created_at ASC
        """)

        result = db.execute(query, {"debate_id": debate_id})
        messages = result.fetchall()

        return [
            {
                "id": row.id,
                "debate_id": row.debate_id,
                "user_id": row.user_id,
                "message": row.message,
                "message_type": row.message_type,
                "voice_url": row.voice_url,
                "voice_duration_seconds": row.voice_duration_seconds,
                "created_at": row.created_at,
                "username": row.username,
                "country_name": row.country_name,
                "country_code": row.country_code
            }
            for row in messages
        ]
    except Exception as e:
        api_logger.error(f"Error fetching messages: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch messages"
        )
