# backend/app/schemas/ai_recommend.py
from typing import List, Optional

from pydantic import BaseModel, Field


class RecommendIn(BaseModel):
    season: str = Field(..., examples=["春", "夏", "秋", "冬"])
    preferences: str = Field(..., examples=["自然が好き、温泉も行きたい、混雑は苦手"])
    from_city: Optional[str] = Field(None, examples=["東京"])
    budget: Optional[str] = Field(None, examples=["中くらい"])
    days: Optional[int] = Field(2, examples=[2])


class SpotSuggestion(BaseModel):
    name: str
    reason: str
    access: str
    stay_area: str
    nearby: List[str]


class RecommendOut(BaseModel):
    recommendations: List[SpotSuggestion]
    note: str
