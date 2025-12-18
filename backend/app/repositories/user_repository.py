from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_data: UserCreate, password_hash: str) -> User:
        user = User(
            email=user_data.email,
            password_hash=password_hash,
            full_name=user_data.full_name
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[User]:
        return self.db.query(User).offset(skip).limit(limit).all()

    def update(self, user_id: str, user_data: UserUpdate) -> Optional[User]:
        user = self.get_by_id(user_id)
        if not user:
            return None

        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)

        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user_id: str) -> bool:
        user = self.get_by_id(user_id)
        if not user:
            return False

        self.db.delete(user)
        self.db.commit()
        return True

    def increment_points(self, user_id: str, points: int) -> Optional[User]:
        user = self.get_by_id(user_id)
        if not user:
            return None

        user.points += points
        self.db.commit()
        self.db.refresh(user)
        return user

    def increment_debates_completed(self, user_id: str) -> Optional[User]:
        user = self.get_by_id(user_id)
        if not user:
            return None

        user.debates_completed += 1
        self.db.commit()
        self.db.refresh(user)
        return user
