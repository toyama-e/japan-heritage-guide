# backend/app/crud/heritage.py
from sqlalchemy.orm import Session

from app.models.heritage import WorldHeritage


def get_all(db: Session) -> list[WorldHeritage]:
    return (
        db.query(WorldHeritage)
        .order_by(WorldHeritage.id.asc())
        .all()
    )


def get_by_id(db: Session, heritage_id: int) -> WorldHeritage | None:
    return (
        db.query(WorldHeritage)
        .filter(WorldHeritage.id == heritage_id)
        .first()
    )
