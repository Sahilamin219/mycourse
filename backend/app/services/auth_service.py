from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.utils.security import verify_password, get_password_hash, create_access_token


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def register(self, user_data: UserCreate) -> TokenResponse:
        existing_user = self.user_repo.get_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        password_hash = get_password_hash(user_data.password)
        user = self.user_repo.create(user_data, password_hash)

        access_token = create_access_token(data={"sub": user.id})

        return TokenResponse(
            access_token=access_token,
            user=UserResponse.from_orm(user)
        )

    def login(self, login_data: UserLogin) -> TokenResponse:
        user = self.user_repo.get_by_email(login_data.email)

        if not user or not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive"
            )

        access_token = create_access_token(data={"sub": user.id})

        return TokenResponse(
            access_token=access_token,
            user=UserResponse.from_orm(user)
        )
