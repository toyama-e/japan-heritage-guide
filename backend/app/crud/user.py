from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from datetime import datetime

# ---------------------------
# 作成
# ---------------------------
def create_user(db: Session, user_create: UserCreate) -> User:
    user = User(
        firebase_uid=user_create.firebase_uid,
        email=user_create.email,
        nickname=user_create.nickname,
        is_public=user_create.is_public
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# ---------------------------
# 取得（ID指定）
# ---------------------------
def get_user(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()

# ---------------------------
# 取得（全件）
# ---------------------------
def get_users(db: Session) -> list[User]:
    return db.query(User).filter(User.deleted_at.is_(None)).all()

# ---------------------------
# 更新
# ---------------------------
def update_user(db: Session, user: User, user_update: UserUpdate) -> User:
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(user, field, value)
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user

# ---------------------------
# 論理削除
# ---------------------------
def soft_delete_user(db: Session, user: User) -> User:
    user.deleted_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user
