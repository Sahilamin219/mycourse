from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ResourceBase(BaseModel):
    title: str
    description: str
    content: str
    category: str
    difficulty: str
    estimated_time: str
    icon: str
    gradient: str


class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    estimated_time: Optional[str] = None
    icon: Optional[str] = None
    gradient: Optional[str] = None


class ResourceResponse(ResourceBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
