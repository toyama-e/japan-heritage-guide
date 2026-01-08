from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.diary import DiaryCreate, DiaryOut, DiaryUpdate
from app.crud import diary as diary_crud

router = APIRouter()

# MVP用：一旦ユーザーIDを固定（認証導入後に差し替え）
def get_current_user_id():
    return 1


@router.get("/diaries", response_model=list[DiaryOut])
def list_diaries(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 20,
):
    return diary_crud.get_list(db, skip=skip, limit=limit)


@router.get("/diaries/{diary_id}", response_model=DiaryOut)
def get_diary(diary_id: int, db: Session = Depends(get_db)):
    diary = diary_crud.get_by_id(db, diary_id)
    if not diary:
        raise HTTPException(status_code=404, detail="Diary not found")
    return diary


@router.post("/diaries", response_model=DiaryOut)
def create_diary(payload: DiaryCreate, db: Session = Depends(get_db)):
    user_id = get_current_user_id()
    return diary_crud.create(db, user_id=user_id, payload=payload)


@router.patch("/diaries/{diary_id}", response_model=DiaryOut)
def update_diary(diary_id: int, payload: DiaryUpdate, db: Session = Depends(get_db)):
    diary = diary_crud.get_by_id(db, diary_id)
    if not diary:
        raise HTTPException(status_code=404, detail="Diary not found")
    return diary_crud.update(db, diary, payload)


@router.delete("/diaries/{diary_id}")
def delete_diary(diary_id: int, db: Session = Depends(get_db)):
    diary = diary_crud.get_by_id(db, diary_id)
    if not diary:
        raise HTTPException(status_code=404, detail="Diary not found")
    diary_crud.soft_delete(db, diary)
    return {"ok": True}
