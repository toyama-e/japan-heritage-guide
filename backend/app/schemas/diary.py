from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

class DiaryBase(BaseModel):
    world_heritage_id: int
    visit_id: int | None = None
    visit_day: date | None = None
    title: str
    text: str
    image_url: str | None = None

class DiaryListItem(BaseModel):
    id: int
    user_id: int
    world_heritage_id: int
    world_heritage_name: str | None
    visit_day: date | None
    title: str
    text: str
    image_url: str | None
    user_nickname: str | None
    class Config:
        from_attributes = True

class DiaryListItem2(BaseModel):
    id: int
    user_id: int
    user_nickname: str | None

    world_heritage_id: int
    world_heritage_name: str | None

    visit_id: int | None
    visit_day: date | None
    title: str
    text: str
    image_url: str | None
    like_count: int

    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None

    model_config = ConfigDict(from_attributes=True)

# 詳細用（前回追加したもの）
class DiaryDetail(BaseModel):
    id: int
    user_id: int
    user_nickname: str | None

    world_heritage_id: int
    world_heritage_name: str | None

    visit_id: int | None
    visit_day: date | None
    title: str
    text: str
    image_url: str | None
    like_count: int

    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None

    is_owner: bool

    model_config = ConfigDict(from_attributes=True)

class DiaryCreate(DiaryBase):
    pass

class DiaryDeleteResponse(BaseModel):
    message: str = "deleted"

class DiaryLikeOut(BaseModel):
    diary_id: int
    like_count: int

class DiaryUpdate(BaseModel):
    # 送られてきた項目だけ更新したいので Optional
    world_heritage_id: Optional[int] = None
    visit_id: Optional[int] = None
    visit_day: Optional[date] = None

    title: Optional[str] = Field(default=None, max_length=200)
    text: Optional[str] = Field(default=None, max_length=10000)

    # ✅ 画像差し替え：フロントでアップしたURLを保存
    #    null を送れば画像削除もできる
    image_url: Optional[str] = None
