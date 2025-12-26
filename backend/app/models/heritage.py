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
