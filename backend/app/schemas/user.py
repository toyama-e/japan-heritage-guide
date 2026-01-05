# app/schemas/user.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ---------------------------
# 作成用スキーマ
# ---------------------------
class UserCreate(BaseModel):
    firebase_uid: str
    email: Optional[str] = None
    nickname: Optional[str] = None
    is_public: Optional[bool] = True

# ---------------------------
# 更新用スキーマ
# ---------------------------
class UserUpdate(BaseModel):
    email: Optional[str]
    nickname: Optional[str]
    is_public: Optional[bool]

# ---------------------------
# 取得用スキーマ
# ---------------------------
class UserRead(BaseModel):
    id: int
    firebase_uid: str
    email: Optional[str]
    nickname: Optional[str]
    is_public: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]

    class Config:
        orm_mode = True  # SQLAlchemy モデルから直接変換できるようにする
