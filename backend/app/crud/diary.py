from sqlalchemy.orm import Session
from app.models.diary import Diary
from app.models.user import User
from app.models.heritage import WorldHeritage
from app.schemas.diary import DiaryCreate, DiaryUpdate

# def get_list(db: Session, skip: int = 0, limit: int = 20):
#     return (
#         db.query(Diary)
#         .filter(Diary.deleted_at.is_(None))
#         .order_by(Diary.id.desc())
#         .offset(skip)
#         .limit(limit)
#         .all()
#     )


# def get_by_id(db: Session, diary_id: int):
#     return (
#         db.query(Diary)
#         .filter(Diary.id == diary_id, Diary.deleted_at.is_(None))
#         .first()
#     )

def get_list_item(db: Session, skip: int = 0, limit: int = 20):
    rows = (
        db.query(
            Diary.id,
            Diary.user_id,
            User.nickname.label("user_nickname"),

            Diary.world_heritage_id,
            WorldHeritage.name.label("world_heritage_name"),

            Diary.visit_day,
            Diary.title,
            Diary.text,
            Diary.image_url,
        )
        .join(User, User.id == Diary.user_id)
        .join(WorldHeritage, WorldHeritage.id == Diary.world_heritage_id)
        .filter(Diary.deleted_at.is_(None))
        .order_by(Diary.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [dict(r._mapping) for r in rows]
    rows = (
        db.query(
            Diary.id,
            Diary.user_id,
            User.nickname.label("user_nickname"),
            Diary.world_heritage_id,
            Diary.visit_id,
            Diary.visit_day,
            Diary.title,
            Diary.text,
            Diary.image_url,
            Diary.created_at,
            Diary.updated_at,
            Diary.deleted_at,
        )
        .join(User, User.id == Diary.user_id)
        .filter(Diary.deleted_at.is_(None))
        .order_by(Diary.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    # Row を Pydantic が読める dict に変換して返す
    return [dict(r._mapping) for r in rows]


def get_by_id_with_nickname(db: Session, diary_id: int):
    row = (
        db.query(
            Diary.id,
            Diary.user_id,
            User.nickname.label("user_nickname"),
            Diary.world_heritage_id,
            Diary.visit_id,
            Diary.visit_day,
            Diary.title,
            Diary.text,
            Diary.image_url,
            Diary.created_at,
            Diary.updated_at,
            Diary.deleted_at,
        )
        .join(User, User.id == Diary.user_id)
        .filter(Diary.id == diary_id, Diary.deleted_at.is_(None))
        .first()
    )
    return dict(row._mapping) if row else None


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
