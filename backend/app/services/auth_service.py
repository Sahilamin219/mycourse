from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.utils.security import verify_password, get_password_hash, create_access_token
from app.utils.logger import auth_logger


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def register(self, user_data: UserCreate) -> TokenResponse:
        auth_logger.info("Attempting user registration", {"email": user_data.email})

        existing_user = self.user_repo.get_by_email(user_data.email)
        if existing_user:
            auth_logger.warning("Registration failed - email already exists", {"email": user_data.email})
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        auth_logger.debug("Hashing password and creating user", {"email": user_data.email})
        password_hash = get_password_hash(user_data.password)
        user = self.user_repo.create(user_data, password_hash)

        auth_logger.debug("Creating access token", {"user_id": user.id})
        access_token = create_access_token(data={"sub": user.id})

        auth_logger.info("User registered successfully", {"user_id": user.id, "email": user.email})
        return TokenResponse(
            access_token=access_token,
            user=UserResponse.from_orm(user)
        )

    def login(self, login_data: UserLogin) -> TokenResponse:
        auth_logger.info("Login attempt", {"email": login_data.email})

        user = self.user_repo.get_by_email(login_data.email)

        if not user or not verify_password(login_data.password, user.password_hash):
            auth_logger.warning("Login failed - invalid credentials", {"email": login_data.email})
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if not user.is_active:
            auth_logger.warning("Login failed - account inactive", {
                "email": login_data.email,
                "user_id": user.id
            })
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive"
            )

        auth_logger.debug("Creating access token for user", {"user_id": user.id})
        access_token = create_access_token(data={"sub": user.id})

        auth_logger.info("User logged in successfully", {"user_id": user.id, "email": user.email})
        return TokenResponse(
            access_token=access_token,
            user=UserResponse.from_orm(user)
        )
