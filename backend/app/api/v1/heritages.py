# backend/api/v1/heritages.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.crud.heritage import get_all, get_by_id

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/heritages")
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
