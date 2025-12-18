from sqlalchemy.orm import Session
from typing import List
from app.repositories.resource_repository import ResourceRepository
from app.schemas.resource import ResourceResponse


class ResourceService:
    def __init__(self, db: Session):
        self.db = db
        self.resource_repo = ResourceRepository(db)

    def get_all_resources(self, skip: int = 0, limit: int = 100) -> List[ResourceResponse]:
        resources = self.resource_repo.get_all(skip, limit)
        return [ResourceResponse.from_orm(resource) for resource in resources]

    def get_resources_by_category(
        self,
        category: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[ResourceResponse]:
        resources = self.resource_repo.get_by_category(category, skip, limit)
        return [ResourceResponse.from_orm(resource) for resource in resources]
