# backend/api/v1/visits.py
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.visits import VisitCreateRequest, VisitOut, VisitsMeResponse
from app.models.visit import Visit
from sqlalchemy.exc import IntegrityError


router = APIRouter(prefix="/visits", tags=["visits"])

# TODO: Firebase認証導入後は get_current_user に差し替える
def get_dev_user_id(
    x_user_id: int | None = Header(default=None, alias="X-User-Id"),
) -> int:
    """
    開発用の仮認証:
    - リクエストヘッダー `X-User-Id: <int>` を受け取り、ログインユーザーIDとして扱う
    - ない場合は 401（ログイン必須の挙動を再現）
    """
    if x_user_id is None:
        raise HTTPException(status_code=401, detail="X-User-Id header required (dev auth)")
    return x_user_id

# 訪問記録新規作成
@router.post("", response_model=VisitOut, status_code=201)
def create_visit(
    payload: VisitCreateRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_dev_user_id),
):
    visit = Visit(
        user_id=user_id,
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
    user_id: int = Depends(get_dev_user_id),
):

    rows = (
        db.query(Visit)
        .filter(Visit.user_id == user_id)
        .filter(Visit.deleted_at.is_(None))
        .all()
    )

    visited_ids = sorted({visit.world_heritage_id for visit in rows})

    return VisitsMeResponse(
        visited_heritage_ids=visited_ids,
        count=len(visited_ids),
    )