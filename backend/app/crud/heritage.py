# backend/crud/heritage.py
from sqlalchemy.orm import Session
from app.models.heritage import WorldHeritage

def get_all(db: Session):
    return db.query(WorldHeritage).all()

def get_by_id(db: Session, heritage_id: int):
    return (
        db.query(WorldHeritage)
        .filter(WorldHeritage.id == heritage_id)
        .first()
    )
