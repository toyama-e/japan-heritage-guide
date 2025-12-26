# backend/api/v1/heritages.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.crud.heritage import get_all

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
