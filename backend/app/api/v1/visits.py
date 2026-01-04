# backend/api/v1/visits.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.visits import VisitCreateRequest, VisitOut, VisitsMeResponse
from app.models.visit import Visit
from sqlalchemy.exc import IntegrityError


router = APIRouter(prefix="/visits", tags=["visits"])

# 訪問記録新規作成
@router.post("", response_model=VisitOut, status_code=201)
def create_visit(
    payload: VisitCreateRequest,
    db: Session = Depends(get_db),
):
    # firebase_uid（仮）あとで差し替える
    firebase_uid = "test_uid"

    visit = Visit(
        firebase_uid=firebase_uid,
        world_heritage_id=payload.world_heritage_id,
        visited_from=payload.visited_from,
        visited_to=payload.visited_to,
    )

    db.add(visit)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="すでに訪問登録されています"
        )

    db.refresh(visit)

    return visit

# 自分の訪問一覧取得
@router.get("/me", response_model=VisitsMeResponse)
def get_my_visits(
    db: Session = Depends(get_db),
):
    # firebase_uid（仮）あとで差し替える
    firebase_uid = "test_uid"

    rows = (
        db.query(Visit)
        .filter(Visit.firebase_uid == firebase_uid)
        .filter(Visit.deleted_at.is_(None))
        .all()
    )

    visited_ids = [visit.world_heritage_id for visit in rows]
    visited_ids = sorted(set(visited_ids))

    return VisitsMeResponse(
        visited_heritage_ids=visited_ids,
        count=len(visited_ids),
    )