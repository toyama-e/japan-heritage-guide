# backend/app/api/v1/ai.py
import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from openai import OpenAI

from app.core.database import get_db  # 既存のget_dbに合わせてください
from app.schemas.ai_recommend import RecommendIn, RecommendOut

router = APIRouter()
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

@router.post("/ai/recommend", response_model=RecommendOut)
def recommend(payload: RecommendIn, db: Session = Depends(get_db)):

    # ① DBから候補を絞る（例：WorldHeritageテーブルから数件）
    # ※あなたの実テーブル/CRUDに合わせて差し替え
    candidates = [
        {"name": "法隆寺地域の仏教建造物", "area": "奈良", "type": "文化遺産"},
        {"name": "富士山―信仰の対象と芸術の源泉", "area": "山梨/静岡", "type": "文化遺産"},
        {"name": "屋久島", "area": "鹿児島", "type": "自然遺産"},
        {"name": "白神山地", "area": "青森/秋田", "type": "自然遺産"},
    ]

    # ② OpenAIへ：候補の中から3つ選び、JSONで返すよう指示
    # Structured Outputs（JSON Schema固定）を使うと壊れにくいです。 :contentReference[oaicite:4]{index=4}
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
                        "nearby": {"type": "array", "items": {"type": "string"}, "minItems": 2}
                    },
                    "required": ["name", "reason", "access", "stay_area", "nearby"],
                    "additionalProperties": False
                }
            },
            "note": {"type": "string"}
        },
        "required": ["recommendations", "note"],
        "additionalProperties": False
    }

    resp = client.responses.create(
        model="gpt-5.2",
        input=[
            {"role": "system", "content": "あなたは日本の旅行プランナーです。与えられた候補から最適な3件を選び、指定JSONスキーマで出力してください。"},
            {"role": "user", "content": {
                "season": payload.season,
                "preferences": payload.preferences,
                "from_city": payload.from_city,
                "budget": payload.budget,
                "days": payload.days,
                "candidates": candidates
            }}
        ],
        # Structured Outputs（“JSON Schemaに必ず従う”） :contentReference[oaicite:5]{index=5}
        text={
            "format": {
                "type": "json_schema",
                "name": "heritage_recommendation",
                "schema": schema,
                "strict": True
            }
        },
    )

    # ③ JSON取り出し（SDKの返り形はアップデートされ得るので、まずは text をJSONとして読む方針）
    # ここはプロジェクトのSDKバージョンに合わせて微調整してください。
    import json
    data = json.loads(resp.output_text)
    return data
