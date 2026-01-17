from datetime import datetime
from typing import Optional

from pydantic import BaseModel


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
    email: Optional[str] = None
    nickname: Optional[str] = None
    is_public: Optional[bool] = None


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

    # Pydantic v2 用設定
    model_config = {"from_attributes": True}
