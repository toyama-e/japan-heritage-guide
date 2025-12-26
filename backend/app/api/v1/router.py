from fastapi import APIRouter
from app.api.v1 import heritages

router = APIRouter()
router.include_router(heritages.router)
