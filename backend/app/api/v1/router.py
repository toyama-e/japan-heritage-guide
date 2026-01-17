# backend/app/api/v1/router.py
from fastapi import APIRouter

from app.api.v1 import ai, diaries, heritages, me_diaries, visits

router = APIRouter()

router.include_router(
    heritages.router,
    tags=["Heritage"],
)

router.include_router(
    visits.router,
    tags=["Visit"],
)

router.include_router(
    diaries.router,
    tags=["Diary"],
)

router.include_router(
    me_diaries.router,
    prefix="/me_diaries",
    tags=["MeDiary"],
)

router.include_router(
    ai.router,
    tags=["AI"],
)
