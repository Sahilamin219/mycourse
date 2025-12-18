from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.resource import Resource
from app.schemas.resource import ResourceCreate, ResourceUpdate


class ResourceRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, resource_data: ResourceCreate) -> Resource:
        resource = Resource(**resource_data.dict())
        self.db.add(resource)
        self.db.commit()
        self.db.refresh(resource)
        return resource

    def get_by_id(self, resource_id: str) -> Optional[Resource]:
        return self.db.query(Resource).filter(Resource.id == resource_id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Resource]:
        return self.db.query(Resource).offset(skip).limit(limit).all()

    def get_by_category(self, category: str, skip: int = 0, limit: int = 100) -> List[Resource]:
        return (
            self.db.query(Resource)
            .filter(Resource.category == category)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update(self, resource_id: str, resource_data: ResourceUpdate) -> Optional[Resource]:
        resource = self.get_by_id(resource_id)
        if not resource:
            return None

        update_data = resource_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(resource, field, value)

        self.db.commit()
        self.db.refresh(resource)
        return resource

    def delete(self, resource_id: str) -> bool:
        resource = self.get_by_id(resource_id)
        if not resource:
            return False

        self.db.delete(resource)
        self.db.commit()
        return True
