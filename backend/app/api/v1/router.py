from fastapi import APIRouter
from app.api.v1 import heritages, visits, diaries, me_diaries
from app.api.v1.firebase_router import router as firebase_router
from app.api.v1.me_router import router as me_router

router = APIRouter()
router.include_router(heritages.router)
router.include_router(visits.router)
router.include_router(me_diaries.router, prefix="/me_diaries", tags=["me_diaries"])
router.include_router(diaries.router)
router.include_router(firebase_router, prefix="/api/v1", tags=["firebase"])
router.include_router(me_router, prefix="/api/v1", tags=["me"])

