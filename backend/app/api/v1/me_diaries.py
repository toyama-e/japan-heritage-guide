from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import literal
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.firebase_dependency import get_current_user
from app.models.diary import Diary
from app.models.heritage import WorldHeritage
from app.schemas.diary import DiaryListItem

router = APIRouter()


# ---------------------------
# API: カレントユーザーの訪問日記を取得
# ---------------------------
@router.get("/", response_model=List[DiaryListItem], tags=["me_diarise"])
def read_my_diaries(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    diaries = (
        db.query(
            Diary.id,
            Diary.user_id,
            Diary.world_heritage_id,
            Diary.visit_day,
            Diary.title,
            Diary.text,
            Diary.image_url,
            WorldHeritage.name.label("world_heritage_name"),
            literal(current_user.nickname).label(
                "user_nickname"
            ),  # スキーマと合わせる為
        )
        .join(WorldHeritage, Diary.world_heritage_id == WorldHeritage.id)
        .filter(Diary.user_id == current_user.id)
        .order_by(Diary.visit_day.desc())
        .all()
    )

    # Pydantic v2 の from_attributes=True により自動変換
    return diaries
