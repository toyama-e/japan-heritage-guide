from sqlalchemy import Column, Integer, String, Float
from app.core.database import Base

class WorldHeritage(Base):
    __tablename__ = "world_heritages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    address = Column(String)
    year = Column(Integer)
    latitude = Column(Float)
    longitude = Column(Float)
    summary = Column(String)

# 獲得バッジ画像URL（仮：/static/badges/1.png）
    badge_image_url = Column(String)