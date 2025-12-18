from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
from app.schemas.notification import NotificationResponse
from app.repositories.notification_repository import NotificationRepository
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notification_repo = NotificationRepository(db)
    notifications = notification_repo.get_user_notifications(current_user.id, skip, limit)
    return [NotificationResponse.from_orm(notif) for notif in notifications]


@router.put("/{notification_id}/read", response_model=dict)
def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notification_repo = NotificationRepository(db)
    notification = notification_repo.get_by_id(notification_id)

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this notification"
        )

    notification_repo.mark_as_read(notification_id)
    return {"message": "Notification marked as read"}
