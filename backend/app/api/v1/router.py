from fastapi import APIRouter
from app.api.v1 import heritages, visits

router = APIRouter()
router.include_router(heritages.router)
router.include_router(visits.router)