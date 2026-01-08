# backend/api/v1/heritages.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud.heritage import get_all, get_by_id
from typing import List
from app.schemas.heritage import HeritageOut

router = APIRouter()

@router.get("/heritages", response_model=List[HeritageOut])
def list_heritages(db: Session = Depends(get_db)):
    return get_all(db)

@router.get("/heritages/{heritage_id}")
def get_heritage(
    heritage_id: int,
    db: Session = Depends(get_db)
):
    heritage = get_by_id(db, heritage_id)

    if heritage is None:
        raise HTTPException(
            status_code=404,
            detail="Heritage not found"
        )

    return heritage
