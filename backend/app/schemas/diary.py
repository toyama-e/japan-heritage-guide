from datetime import date, datetime
from pydantic import BaseModel, ConfigDict

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
    user_nickname: str | None

    world_heritage_id: int
    world_heritage_name: str | None

    visit_id: int | None
    visit_day: date | None
    title: str
    text: str
    image_url: str | None

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

    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None

    is_owner: bool

    model_config = ConfigDict(from_attributes=True)
class DiaryCreate(DiaryBase):
    pass
