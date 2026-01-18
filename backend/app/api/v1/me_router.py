from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.firebase_dependency import get_current_user
from app.models.user import User as DBUser
from app.schemas.user import UserCreate, UserRead, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserRead, tags=["User"])
def read_me(current_user: DBUser = Depends(get_current_user)):
    print("🌳 /me GET API: current_user =", current_user)
    return UserRead.from_orm(current_user)


# PATCH /me（更新用）
@router.patch("/me", response_model=UserRead, tags=["User"])
def update_me(
    user_update: UserUpdate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    print("🌳 /me PATCH API: 更新前 current_user =", current_user)

    if user_update.nickname is not None:
        current_user.nickname = user_update.nickname
    if user_update.email is not None:
        current_user.email = user_update.email

    db.commit()
    db.refresh(current_user)
    print("🌳 /me PATCH API: 更新後 current_user =", current_user)

    return UserRead.from_orm(current_user)
