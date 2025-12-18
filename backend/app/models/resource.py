from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.sql import func
from app.config.database import Base
import uuid


def generate_uuid():
    return str(uuid.uuid4())


class Resource(Base):
    __tablename__ = "improve_yourself_resources"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String, nullable=False, index=True)
    difficulty = Column(String, nullable=False, index=True)
    estimated_time = Column(String, nullable=False)
    icon = Column(String, nullable=False)
    gradient = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Resource {self.title}>"
