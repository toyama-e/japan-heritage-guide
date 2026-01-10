from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.firebase_dependency import get_current_user
from app.models.user import User as DBUser
from app.schemas.diary import DiaryListItem, DiaryDetail, DiaryCreate
from app.crud.diary import get_list_item, get_detail_item, create_diary

router = APIRouter()

@router.get("/diaries", response_model=list[DiaryListItem], tags=["Diary"])
def list_diaries(
    scope: str = "all",
    skip: int = 0,
    limit: int = 20,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    scope = scope.lower()
    if scope not in ("all", "mine"):
        raise HTTPException(status_code=400, detail="scope must be 'all' or 'mine'")

    return get_list_item(
        db,
        scope=scope,
        current_user_id=current_user.id,
        skip=skip,
        limit=limit,
    )

@router.get("/diaries/{diary_id}", response_model=DiaryDetail, tags=["Diary"])
def read_diary_detail(
    diary_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = get_detail_item(db, diary_id)
    if not data:
        raise HTTPException(status_code=404, detail="Diary not found")

    # ★本人判定（これでフロントはボタン出し分けできる）
    data["is_owner"] = (data["user_id"] == current_user.id)

    return data

@router.post(
    "/diaries",
    response_model=DiaryDetail,
    status_code=status.HTTP_201_CREATED,
    tags=["Diary"],
)
def create_diary_api(
    payload: DiaryCreate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 1) 作成
    created = create_diary(db, user_id=current_user.id, payload=payload)

    # 2) 返却用に JOIN で取り直す（nickname/遺産名を付けるため）
    data = get_detail_item(db, created.id)
    if not data:
        # 通常ここには来ないが、安全のため
        raise HTTPException(status_code=500, detail="Failed to load created diary")

    data["is_owner"] = True  # 作成者本人なので常に true
    return data
