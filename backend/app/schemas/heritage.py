from pydantic import BaseModel, ConfigDict
from typing import Optional

class HeritageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    type: str
    address: Optional[str] = None
    year: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    summary: Optional[str] = None
    badge_image_url: str
