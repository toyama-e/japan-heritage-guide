# backend/app/api/v1/ai.py
import json
import os
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.heritage import WorldHeritage
from app.schemas.ai_recommend import RecommendIn, RecommendOut

router = APIRouter()


def get_openai_client() -> OpenAI:
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY is not set",
        )
    return OpenAI(api_key=key)


def build_candidates(rows: list[WorldHeritage]) -> list[dict[str, Any]]:
    return [
        {
            "id": r.id,
            "name": r.name,
            "type": getattr(r, "type", None),
            "address": getattr(r, "address", None),
            "year": getattr(r, "year", None),
            "summary": getattr(r, "summary", None),
        }
        for r in rows
    ]


def get_output_schema() -> dict[str, Any]:
    return {
        "type": "object",
        "properties": {
            "recommendations": {
                "type": "array",
                "minItems": 3,
                "maxItems": 3,
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "reason": {"type": "string"},
                        "access": {"type": "string"},
                        "stay_area": {"type": "string"},
                        "nearby": {
                            "type": "array",
                            "items": {"type": "string"},
                            "minItems": 2,
                        },
                    },
                    "required": [
                        "name",
                        "reason",
                        "access",
                        "stay_area",
                        "nearby",
                    ],
                    "additionalProperties": False,
                },
            },
            "note": {"type": "string"},
        },
        "required": ["recommendations", "note"],
        "additionalProperties": False,
    }


def build_user_payload(
    payload: RecommendIn,
    candidates: list[dict[str, Any]],
) -> dict[str, Any]:
    return {
        "season": payload.season,
        "preferences": payload.preferences,
        "from_city": getattr(payload, "from_city", None),
        "budget": getattr(payload, "budget", None),
        "days": getattr(payload, "days", None),
        "candidates": candidates,
    }


def extract_output_text(resp: Any) -> str | None:
    # OpenAI SDKの Responses API では output_text が取れる場合がある
    text = getattr(resp, "output_text", None)
    if isinstance(text, str) and text.strip():
        return text
    return None


@router.post("/ai/recommend", response_model=RecommendOut)
def recommend(payload: RecommendIn, db: Session = Depends(get_db)):
    rows = (
        db.query(WorldHeritage)
        .order_by(WorldHeritage.id.asc())
        .limit(20)
        .all()
    )
    candidates = build_candidates(rows)

    if not candidates:
        raise HTTPException(
            status_code=404,
            detail="No world heritage data found",
        )

    client = get_openai_client()
    schema = get_output_schema()
    user_payload = build_user_payload(payload, candidates)

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    system_prompt = (
        "あなたは日本の旅行プランナーです。"
        "候補から最適な3件を選び、指定JSONスキーマで出力してください。"
    )

    try:
        resp = client.responses.create(
            model=model,
            input=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": json.dumps(
                                user_payload,
                                ensure_ascii=False,
                            ),
                        }
                    ],
                },
            ],
            text={
                "format": {
                    "type": "json_schema",
                    "name": "heritage_recommendation",
                    "schema": schema,
                    "strict": True,
                }
            },
        )

        text = extract_output_text(resp)
        if not text:
            raise HTTPException(
                status_code=500,
                detail="OpenAI response has no output_text",
            )

        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=500,
                detail=f"OpenAI returned non-JSON output: {e}",
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )
