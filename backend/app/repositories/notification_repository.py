from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate


class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, notification_data: NotificationCreate) -> Notification:
        notification = Notification(**notification_data.dict())
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def get_by_id(self, notification_id: str) -> Optional[Notification]:
        return self.db.query(Notification).filter(Notification.id == notification_id).first()

    def get_user_notifications(self, user_id: str, skip: int = 0, limit: int = 100) -> List[Notification]:
        return (
            self.db.query(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def mark_as_read(self, notification_id: str) -> Optional[Notification]:
        notification = self.get_by_id(notification_id)
        if not notification:
            return None

        notification.read = True
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def delete(self, notification_id: str) -> bool:
        notification = self.get_by_id(notification_id)
        if not notification:
            return False

        self.db.delete(notification)
        self.db.commit()
        return True
