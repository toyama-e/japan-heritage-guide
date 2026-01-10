from sqlalchemy.orm import Session
from app.models.diary import Diary
from app.models.user import User
from app.models.heritage import WorldHeritage

def get_list_item(
    db: Session,
    scope: str,
    current_user_id: int,
    skip: int = 0,
    limit: int = 20,
):
    q = (
        db.query(
            Diary.id,
            Diary.user_id,
            User.nickname.label("user_nickname"),
            Diary.world_heritage_id,
            WorldHeritage.name.label("world_heritage_name"),
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
        .join(WorldHeritage, WorldHeritage.id == Diary.world_heritage_id)
        .filter(Diary.deleted_at.is_(None))
    )

    if scope == "mine":
        q = q.filter(Diary.user_id == current_user_id)

    rows = (
        q.order_by(Diary.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [dict(r._mapping) for r in rows]

def get_detail_item(db: Session, diary_id: int):
    row = (
        db.query(
            Diary.id,
            Diary.user_id,
            User.nickname.label("user_nickname"),
            Diary.world_heritage_id,
            WorldHeritage.name.label("world_heritage_name"),
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
        .join(WorldHeritage, WorldHeritage.id == Diary.world_heritage_id)
        .filter(Diary.id == diary_id, Diary.deleted_at.is_(None))
        .first()
    )
    return dict(row._mapping) if row else None
