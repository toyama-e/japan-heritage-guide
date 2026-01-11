from sqlalchemy.orm import Session
from sqlalchemy import update, select
from app.models.diary import Diary
from app.models.user import User
from app.models.heritage import WorldHeritage
from app.schemas.diary import DiaryCreate

def get_list_item(
    db: Session,
    scope: str,
    current_user_id: int,
    skip: int = 0,
    limit: int = 20,
):
    q = (
        db.query(
            Diary.id.label("id"),
            Diary.user_id.label("user_id"),
            User.nickname.label("user_nickname"),
            Diary.world_heritage_id.label("world_heritage_id"),
            WorldHeritage.name.label("world_heritage_name"),
            Diary.visit_id.label("visit_id"),
            Diary.visit_day.label("visit_day"),
            Diary.title.label("title"),
            Diary.text.label("text"),
            Diary.image_url.label("image_url"),
            Diary.like_count.label("like_count"),
            Diary.created_at.label("created_at"),
            Diary.updated_at.label("updated_at"),
            Diary.deleted_at.label("deleted_at"),
        )
        .join(User, User.id == Diary.user_id)
        .join(WorldHeritage, WorldHeritage.id == Diary.world_heritage_id)
    )

    if scope == "mine":
        q = q.filter(Diary.user_id == current_user_id)

    q = (
        q.filter(Diary.deleted_at.is_(None))
        .order_by(Diary.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    rows = q.all()

    # ★ここが超重要：Row→dictにして返す（Pydanticが検証できる形になる）
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

            Diary.like_count,          # ★追加

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

def create_diary(db: Session, user_id: int, payload: DiaryCreate) -> Diary:
    diary = Diary(user_id=user_id, **payload.model_dump())
    db.add(diary)
    db.commit()
    db.refresh(diary)
    return diary

def get_by_id(db: Session, diary_id: int) -> Diary | None:
    return db.query(Diary).filter(Diary.id == diary_id).first()


def delete(db: Session, diary: Diary) -> None:
    db.delete(diary)
    db.commit()

def increment_like_count(db: Session, diary_id: int) -> int | None:
    """
    like_count をDB側で +1 して、更新後の like_count を返す。
    該当日記がなければ None
    """
    stmt = (
        update(Diary)
        .where(Diary.id == diary_id, Diary.deleted_at.is_(None))
        .values(like_count=Diary.like_count + 1)
        .returning(Diary.like_count)
    )
    result = db.execute(stmt).scalar_one_or_none()
    if result is None:
        db.rollback()
        return None

    db.commit()
    return int(result)
