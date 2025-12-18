from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.services.auth_service import AuthService
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.utils.logger import api_logger

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse, status_code=201)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    api_logger.info("Signup request received", {"email": user_data.email})
    try:
        auth_service = AuthService(db)
        result = auth_service.register(user_data)
        api_logger.info("User registered successfully", {"email": user_data.email})
        return result
    except Exception as e:
        api_logger.error(f"Signup failed for {user_data.email}", {"error": str(e)}, exc_info=True)
        raise


@router.post("/signin", response_model=TokenResponse)
def signin(login_data: UserLogin, db: Session = Depends(get_db)):
    api_logger.info("Signin request received", {"email": login_data.email})
    try:
        auth_service = AuthService(db)
        result = auth_service.login(login_data)
        api_logger.info("User signed in successfully", {"email": login_data.email})
        return result
    except Exception as e:
        api_logger.error(f"Signin failed for {login_data.email}", {"error": str(e)}, exc_info=True)
        raise


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    api_logger.debug("Fetching current user info", {"user_id": current_user.id})
    return UserResponse.from_orm(current_user)
