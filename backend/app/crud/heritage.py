# backend/crud/heritage.py
from sqlalchemy.orm import Session
from app.models.heritage import WorldHeritage

def get_all(db: Session):
    return db.query(WorldHeritage).all()
