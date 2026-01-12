from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.firebase_dependency import get_current_user
from app.models.user import User as DBUser
from app.schemas.diary import DiaryListItem2, DiaryDetail, DiaryCreate,DiaryDeleteResponse, DiaryLikeOut, DiaryUpdate
from app.crud.diary import get_list_item, get_detail_item, create_diary,get_by_id, delete, increment_like_count, update_diary, update_image_url
from app.services.supabase_storage import upload_diary_cover_image

router = APIRouter()

@router.get("/diaries", response_model=list[DiaryListItem2], tags=["Diary"])
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

@router.delete("/diaries/{diary_id}", status_code=204)
def delete_diary(
    diary_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    diary = get_by_id(db, diary_id)
    if diary is None:
        raise HTTPException(status_code=404, detail="Diary not found")

    if diary.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    delete(db, diary)

@router.post("/diaries/{diary_id}/like", response_model=DiaryLikeOut)
def like_diary(diary_id: int, db: Session = Depends(get_db)):
    new_count = increment_like_count(db, diary_id)
    if new_count is None:
        raise HTTPException(status_code=404, detail="Diary not found")
    return {"diary_id": diary_id, "like_count": new_count}

@router.patch("/diaries/{diary_id}", response_model=DiaryDetail, tags=["Diary"])
def update_diary_api(
    diary_id: int,
    payload: DiaryUpdate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = update_diary(db, diary_id, current_user.id, payload)

    # ★本人判定（編集後は常に true だけど統一）
    data["is_owner"] = (data["user_id"] == current_user.id)
    return data

@router.patch("/diaries/{diary_id}/image", response_model=DiaryDetail, tags=["Diary"])
async def update_diary_image(
    diary_id: int,
    image: UploadFile = File(...),
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 対象日記チェック（存在＆所有者）
    diary = get_by_id(db, diary_id)
    if diary is None or diary.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Diary not found")

    if diary.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # 画像読み込み
    content = await image.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    # ✅ Supabase Storageに「同一パスへ上書き」で差し替え
    public_url = upload_diary_cover_image(
        user_id=current_user.id,
        diary_id=diary_id,
        filename=image.filename or "cover.jpg",
        content=content,
    )

    # ✅ キャッシュ対策（差し替えで反映されないことがあるので v を付けて保存）
    image_url = f"{public_url}?v={int(__import__('time').time())}"

    update_image_url(db, diary_id, current_user.id, image_url)

    # 返却は既存詳細と同じ形（JOINで名前等が取れる）
    data = get_detail_item(db, diary_id)
    if not data:
        raise HTTPException(status_code=500, detail="Failed to load updated diary")

    data["is_owner"] = True
    return data
