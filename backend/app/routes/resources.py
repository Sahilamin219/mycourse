from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
from app.schemas.resource import ResourceResponse
from app.services.resource_service import ResourceService
from app.utils.logger import api_logger

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("", response_model=List[ResourceResponse])
def get_resources(
    skip: int = 0,
    limit: int = 100,
    category: str = None,
    db: Session = Depends(get_db)
):
    api_logger.debug("Fetching resources", {"category": category, "skip": skip, "limit": limit})
    try:
        resource_service = ResourceService(db)

        if category:
            resources = resource_service.get_resources_by_category(category, skip, limit)
            api_logger.info(f"Retrieved {len(resources)} resources for category '{category}'")
            return resources

        resources = resource_service.get_all_resources(skip, limit)
        api_logger.info(f"Retrieved {len(resources)} resources")
        return resources
    except Exception as e:
        api_logger.error("Failed to fetch resources", {"error": str(e)}, exc_info=True)
        raise
