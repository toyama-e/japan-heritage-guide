from typing import Optional

from pydantic import BaseModel, ConfigDict


class HeritageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    type: str
    address: Optional[str] = None
    year: Optional[int] = None
    spot1_title: Optional[str] = None
    spot1_detail: Optional[str] = None
    spot2_title: Optional[str] = None
    spot2_detail: Optional[str] = None
    spot3_title: Optional[str] = None
    spot3_detail: Optional[str] = None
    sites: Optional[str] = None
    summary: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    badge_image_url: Optional[str] = None
