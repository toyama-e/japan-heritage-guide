from sqlalchemy import Column, Integer, String, Float
from app.core.database import Base

class WorldHeritage(Base):
    __tablename__ = "world_heritages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    address = Column(String)
    year = Column(Integer)
    spot1_title = Column(String)
    spot1_detail = Column(String)
    spot2_title = Column(String)
    spot2_detail = Column(String)
    spot3_title = Column(String)
    spot3_detail = Column(String)
    sites = Column(String)
    summary = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    image_url = Column(String)
    badge_image_url = Column(String)
