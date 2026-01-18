import time

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.firebase_dependency import get_current_user
from app.crud.diary import (
    create_diary,
    delete as delete_diary_crud,
    get_by_id,
    get_detail_item,
    get_list_item,
    increment_like_count,
    update_diary,
    update_image_url,
)
from app.models.user import User as DBUser
from app.schemas.diary import (
    DiaryCreate,
    DiaryDetail,
    DiaryLikeOut,
    DiaryListItem2,
    DiaryUpdate,
)
from app.services.supabase_storage import upload_diary_cover_image

router = APIRouter()


def ensure_scope(scope: str) -> str:
    normalized = scope.lower()
    if normalized not in ("all", "mine"):
        raise HTTPException(
            status_code=400,
            detail="scope must be 'all' or 'mine'",
        )
    return normalized


def ensure_diary_exists_and_owned(
    db: Session,
    diary_id: int,
    current_user_id: str,
):
    diary = get_by_id(db, diary_id)
    if diary is None or getattr(diary, "deleted_at", None) is not None:
        raise HTTPException(
            status_code=404,
            detail="Diary not found",
        )
    if diary.user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="Forbidden",
        )
    return diary


def attach_is_owner(data: dict, current_user_id: str) -> dict:
    data["is_owner"] = data.get("user_id") == current_user_id
    return data


@router.get("/diaries", response_model=list[DiaryListItem2], tags=["Diary"])
def list_diaries(
    scope: str = "all",
    skip: int = 0,
    limit: int = 20,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    normalized_scope = ensure_scope(scope)
    return get_list_item(
        db,
        scope=normalized_scope,
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
        raise HTTPException(
            status_code=404,
            detail="Diary not found",
        )
    return attach_is_owner(data, current_user.id)


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
    created = create_diary(db, user_id=current_user.id, payload=payload)

    data = get_detail_item(db, created.id)
    if not data:
        raise HTTPException(
            status_code=500,
            detail="Failed to load created diary",
        )

    data["is_owner"] = True
    return data


@router.delete("/diaries/{diary_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_diary(
    diary_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    diary = ensure_diary_exists_and_owned(db, diary_id, current_user.id)
    delete_diary_crud(db, diary)
    return None


@router.post(
    "/diaries/{diary_id}/like",
    response_model=DiaryLikeOut,
    tags=["Diary"],
)
def like_diary(diary_id: int, db: Session = Depends(get_db)):
    new_count = increment_like_count(db, diary_id)
    if new_count is None:
        raise HTTPException(
            status_code=404,
            detail="Diary not found",
        )
    return {"diary_id": diary_id, "like_count": new_count}


@router.patch("/diaries/{diary_id}", response_model=DiaryDetail, tags=["Diary"])
def update_diary_api(
    diary_id: int,
    payload: DiaryUpdate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = update_diary(db, diary_id, current_user.id, payload)
    return attach_is_owner(data, current_user.id)


@router.patch(
    "/diaries/{diary_id}/image",
    response_model=DiaryDetail,
    tags=["Diary"],
)
async def update_diary_image(
    diary_id: int,
    image: UploadFile = File(...),
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_diary_exists_and_owned(db, diary_id, current_user.id)

    content = await image.read()
    if not content:
        raise HTTPException(
            status_code=400,
            detail="Empty file",
        )

    public_url = upload_diary_cover_image(
        user_id=current_user.id,
        diary_id=diary_id,
        filename=image.filename or "cover.jpg",
        content=content,
    )

    # キャッシュ対策（差し替えが即時反映されないことがある）
    image_url = f"{public_url}?v={int(time.time())}"

    update_image_url(db, diary_id, current_user.id, image_url)

    data = get_detail_item(db, diary_id)
    if not data:
        raise HTTPException(
            status_code=500,
            detail="Failed to load updated diary",
        )

    data["is_owner"] = True
    return data
