from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    CheckConstraint,
    func,
)
from app.core.database import Base

class Visit(Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, nullable=False, index=True)
    world_heritage_id = Column(Integer, ForeignKey("world_heritages.id", ondelete="CASCADE"), nullable=False, index=True)
    visited_from = Column(Date, nullable=True)
    visited_to = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

# テーブル制約（DBがルールを保証）
    __table_args__ = (
        # 同一ユーザーが同一遺産バッジを獲得するのは1回のみ
        UniqueConstraint("firebase_uid", "world_heritage_id", name="uq_visits_user_heritage"),
        # 期間の整合性
        CheckConstraint(
            "(visited_from IS NULL OR visited_to IS NULL) OR (visited_from <= visited_to)",
            name="ck_visits_date_range",
        ),
    )