from datetime import date, datetime
from pydantic import BaseModel


class DiaryBase(BaseModel):
    world_heritage_id: int
    visit_id: int | None = None
    visit_day: date | None = None
    title: str
    text: str
    image_url: str | None = None


class DiaryCreate(DiaryBase):
    pass


class DiaryUpdate(BaseModel):
    world_heritage_id: int | None = None
    visit_id: int | None = None
    visit_day: date | None = None
    title: str | None = None
    text: str | None = None
    image_url: str | None = None


class DiaryOut(DiaryBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None

    class Config:
        from_attributes = True  # pydantic v2

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
