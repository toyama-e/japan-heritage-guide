from datetime import datetime
from pydantic import BaseModel
from typing import Optional


# 共通項目
class DiaryBase(BaseModel):
    world_heritage_id: int
    visit_id: int
    text: str


# 作成時（POST）
class DiaryCreate(DiaryBase):
    pass


# 更新時（PATCH / PUT）
class DiaryUpdate(BaseModel):
    world_heritage_id: Optional[int] = None
    visit_id: Optional[int] = None
    text: Optional[str] = None


# レスポンス用
class DiaryResponse(DiaryBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
