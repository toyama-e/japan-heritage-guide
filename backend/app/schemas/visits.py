from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class VisitCreateRequest(BaseModel):
    """POST /api/v1/visits の入力Schema"""

    world_heritage_id: int = Field(
        ..., ge=1, description="世界遺産ID（world_heritages.id）"
    )
    visited_from: Optional[date] = Field(None, description="訪問開始日（未入力可）")
    visited_to: Optional[date] = Field(None, description="訪問終了日（未入力可）")

    @model_validator(mode="after")
    def validate_date_range(self) -> "VisitCreateRequest":
        """両方あるときだけ visited_from <= visited_to をチェックする"""
        if (
            self.visited_from
            and self.visited_to
            and self.visited_from > self.visited_to
        ):
            raise ValueError("訪問開始日は訪問終了日以前の日付を指定してください")
        return self


class VisitOut(BaseModel):
    """visits の1レコードを返すレスポンス用Schema"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="訪問記録ID")
    user_id: int = Field(..., description="ユーザーID")
    world_heritage_id: int = Field(..., description="世界遺産ID")
    visited_from: Optional[date] = Field(None, description="訪問開始日（未入力可）")
    visited_to: Optional[date] = Field(None, description="訪問終了日（未入力可）")
    created_at: datetime = Field(..., description="登録日時")
    deleted_at: Optional[datetime] = Field(None, description="論理削除日時（未入力可）")


class VisitsMeResponse(BaseModel):
    """GET /api/v1/visits/me の出力Schema"""

    visited_heritage_ids: List[int] = Field(
        default_factory=list, description="ログインユーザーが訪問済みの世界遺産ID一覧"
    )
    count: int = Field(0, description="訪問済み世界遺産の件数")
