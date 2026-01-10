from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class MeDiary(Base):
    __tablename__ = "diaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))  # ユーザーテーブルの外部キー
    world_heritage_id = Column(Integer, ForeignKey("world_heritages.id"))
    visit_day = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    title = Column(String, nullable=True)
    text = Column(String, nullable=True)
    image_url = Column(String, nullable=True)

    # optional: Userとのリレーション
    # user = relationship("User", back_populates="diaries")
