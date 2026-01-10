from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.me_diary import MeDiary
from app.models.heritage import WorldHeritage
from app.core.firebase_dependency import get_current_user
from pydantic import BaseModel
from datetime import date, datetime
from typing import List

router = APIRouter()

# ---------------------------
# レスポンススキーマ（Pydantic V2）
# ---------------------------
class DiaryResponse(BaseModel):
    id: int
    worldheritage_name: str
    visit_day: date
    created_at: datetime
    title: str | None
    text: str | None
    image_url:str | None 

    model_config = {
        "from_attributes": True  # V2では orm_mode の代わり
    }

# ---------------------------
# API: カレントユーザーの訪問日記を取得
# ---------------------------
@router.get("/", response_model=List[DiaryResponse], tags=["me_diarise"])
def read_my_diaries(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    カレントユーザーの訪問日記を取得
    WorldHeritage.name と visit_day を JOIN して返す
    """
    print(f"[Diary API] Current user ID: {current_user.id}")

    diaries = (
        db.query(
            WorldHeritage.name.label("worldheritage_name"),
            MeDiary.id,
            MeDiary.visit_day,
            MeDiary.created_at,
            MeDiary.title,
            MeDiary.text,
            MeDiary.image_url
        )
        .join(WorldHeritage, WorldHeritage.id == MeDiary.world_heritage_id)
        .filter(
            MeDiary.user_id == current_user.id,
        )
        .order_by(MeDiary.visit_day.desc())
        .all()
    )

    # ログ用に内容を確認
    for row in diaries:
        print(f"[me_Diary API] Diary: {row.worldheritage_name}, {row.visit_day}")

    # Pydantic V2対応
    response = [
        DiaryResponse(
            id=row.id,
            worldheritage_name=row.worldheritage_name,
            visit_day=row.visit_day,
            created_at=row.created_at,
            title=row.title,
            text=row.text,
            image_url=row.image_url,
        )
        for row in diaries
    ]

    print(f"[me_Diary API] Returning {len(response)} diaries")
    return response
