from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)

from app.core.database import Base


class Diary(Base):
    __tablename__ = "diaries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    world_heritage_id = Column(
        Integer,
        ForeignKey("world_heritages.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    visit_id = Column(
        Integer,
        ForeignKey("visits.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    visit_day = Column(Date, nullable=True)
    title = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    like_count = Column(Integer, nullable=False, server_default="0")
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    deleted_at = Column(DateTime(timezone=True), nullable=True)
