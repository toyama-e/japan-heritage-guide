# backend/api/v1/visits.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.core.firebase_dependency import get_current_user  # ← ★これ！
from app.models.user import User
from app.schemas.visits import VisitCreateRequest, VisitOut, VisitsMeResponse
from app.models.visit import Visit

import logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/visits", tags=["visits"])

# 訪問記録 新規作成
@router.post("", response_model=VisitOut, status_code=201)
def create_visit(
    payload: VisitCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    print(
        "[visits/create] user_id=%s email=%s",
        current_user.id,
        current_user.email,
    )

    visit = Visit(
        user_id=current_user.id,
        world_heritage_id=payload.world_heritage_id,
        visited_from=payload.visited_from,
        visited_to=payload.visited_to,
    )

    db.add(visit)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="すでに訪問登録されています")

    db.refresh(visit)
    return visit


# 自分の訪問一覧取得
@router.get("/me", response_model=VisitsMeResponse)
def get_my_visits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    logger.info(
        "[visits/me] user_id=%s email=%s",
        current_user.id,
        current_user.email,
    )

    rows = (
        db.query(Visit)
        .filter(Visit.user_id == current_user.id)
        .filter(Visit.deleted_at.is_(None))
        .all()
    )

    visited_ids = sorted({v.world_heritage_id for v in rows})

    return VisitsMeResponse(
        visited_heritage_ids=visited_ids,
        count=len(visited_ids),
    )
