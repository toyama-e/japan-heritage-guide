from sqlalchemy.orm import Session
from app.models.diary import Diary
from app.schemas.diary import DiaryCreate, DiaryUpdate


def get_list(db: Session, skip: int = 0, limit: int = 20):
    return (
        db.query(Diary)
        .filter(Diary.deleted_at.is_(None))
        .order_by(Diary.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_by_id(db: Session, diary_id: int):
    return (
        db.query(Diary)
        .filter(Diary.id == diary_id, Diary.deleted_at.is_(None))
        .first()
    )


def create(db: Session, user_id: int, payload: DiaryCreate):
    diary = Diary(user_id=user_id, **payload.model_dump())
    db.add(diary)
    db.commit()
    db.refresh(diary)
    return diary


def update(db: Session, diary: Diary, payload: DiaryUpdate):
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(diary, k, v)

    db.commit()
    db.refresh(diary)
    return diary


def soft_delete(db: Session, diary: Diary):
    diary.deleted_at = __import__("datetime").datetime.utcnow()
    db.commit()
    return diary
