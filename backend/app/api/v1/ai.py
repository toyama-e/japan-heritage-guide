# backend/app/api/v1/ai.py
import os
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from openai import OpenAI

from app.core.database import get_db
from app.schemas.ai_recommend import RecommendIn, RecommendOut

from app.models.heritage import WorldHeritage

router = APIRouter()


def get_openai_client() -> OpenAI:
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not set")
    return OpenAI(api_key=key)


@router.post("/ai/recommend", response_model=RecommendOut)
def recommend(payload: RecommendIn, db: Session = Depends(get_db)):
    # TODO: 本来はdbから候補抽出
    rows = (
        db.query(WorldHeritage)
        .order_by(WorldHeritage.id.asc())
        .limit(20)
        .all()
    )

    candidates = [
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

    if not candidates:
        raise HTTPException(status_code=404, detail="No world heritage data found")

    schema = {
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
                        "nearby": {"type": "array", "items": {"type": "string"}, "minItems": 2},
                    },
                    "required": ["name", "reason", "access", "stay_area", "nearby"],
                    "additionalProperties": False,
                },
            },
            "note": {"type": "string"},
        },
        "required": ["recommendations", "note"],
        "additionalProperties": False,
    }

    client = get_openai_client()

    # ✅ user content に dict を直渡ししない（JSON文字列にして input_text で渡す）
    user_payload = {
        "season": payload.season,
        "preferences": payload.preferences,
        "from_city": getattr(payload, "from_city", None),
        "budget": getattr(payload, "budget", None),
        "days": getattr(payload, "days", None),
        "candidates": candidates,
    }

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    try:
        resp = client.responses.create(
            model=model,
            input=[
                {
                    "role": "system",
                    "content": "あなたは日本の旅行プランナーです。候補から最適な3件を選び、指定JSONスキーマで出力してください。",
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": json.dumps(user_payload, ensure_ascii=False),
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

        text = getattr(resp, "output_text", None)
        if not text:
            raise HTTPException(status_code=500, detail="OpenAI response has no output_text")

        data = json.loads(text)
        return data

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="OpenAI returned non-JSON output")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
