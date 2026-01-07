from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
# from app.db.base import Base
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    firebase_uid = Column(String, unique=True, nullable=False, index=True)
    email = Column(String)
    nickname = Column(String)
    is_public = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True))
