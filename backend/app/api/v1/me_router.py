from fastapi import APIRouter, Depends
from app.models.user import User as DBUser
from app.schemas.user import UserRead
from app.core.firebase_dependency import get_current_user

router = APIRouter()

@router.get("/me", response_model=UserRead, tags=["User"])
def read_me(current_user: DBUser = Depends(get_current_user)):
    print("🌳 /me API: current_user =", current_user)
    return UserRead.from_orm(current_user)