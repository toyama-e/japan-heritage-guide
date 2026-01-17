# backend/app/models/visit.py
from sqlalchemy import (
    CheckConstraint,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    UniqueConstraint,
    func,
)

from app.core.database import Base


class Visit(Base):
    __tablename__ = "visits"

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

    visited_from = Column(Date, nullable=True)
    visited_to = Column(Date, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "world_heritage_id",
            name="uq_visits_user_heritage",
        ),
        CheckConstraint(
            (
                "(visited_from IS NULL OR visited_to IS NULL) "
                "OR (visited_from <= visited_to)"
            ),
            name="ck_visits_date_range",
        ),
    )
