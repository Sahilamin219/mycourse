from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
from app.schemas.resource import ResourceResponse
from app.services.resource_service import ResourceService

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("", response_model=List[ResourceResponse])
def get_resources(
    skip: int = 0,
    limit: int = 100,
    category: str = None,
    db: Session = Depends(get_db)
):
    resource_service = ResourceService(db)

    if category:
        return resource_service.get_resources_by_category(category, skip, limit)

    return resource_service.get_all_resources(skip, limit)
