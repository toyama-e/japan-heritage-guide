from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.diary import Diary
from app.models.heritage import WorldHeritage
from app.core.firebase_dependency import get_current_user
from pydantic import BaseModel
from typing import List

router = APIRouter()

# ---------------------------
# レスポンススキーマ（Pydantic V2）
# ---------------------------
class DiaryResponse(BaseModel):
    worldheritage_name: str
    visit_day: str  # ISO形式文字列

    model_config = {
        "from_attributes": True  # V2では orm_mode の代わり
    }

# ---------------------------
# API: カレントユーザーの訪問日記を取得
# ---------------------------
@router.get("/diaries", response_model=List[DiaryResponse], tags=["Diary"])
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
            Diary.visit_day
        )
        .join(WorldHeritage, WorldHeritage.id == Diary.world_heritage_id)
        .filter(
            Diary.user_id == current_user.id,
            Diary.deleted_at.is_(None)
        )
        .order_by(Diary.visit_day.desc())
        .all()
    )

    # ログ用に内容を確認
    for row in diaries:
        print(f"[Diary API] Diary: {row.worldheritage_name}, {row.visit_day}")

    # Pydantic V2対応、ISO文字列で返す
    response = [
        DiaryResponse(
            worldheritage_name=row.worldheritage_name,
            visit_day=row.visit_day.isoformat()
        )
        for row in diaries
    ]

    print(f"[Diary API] Returning {len(response)} diaries")
    return response
