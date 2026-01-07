import csv
from pathlib import Path
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.heritage import WorldHeritage

BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR / "data" / "20260107_world_heritage.csv"


def to_none(value: str | None):
    return value if value not in ("", None) else None


def run():
    db: Session = SessionLocal()
    try:
        with open(CSV_PATH, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)

            for row in reader:
                # 既存データチェック（再実行対策）
                exists = (
                    db.query(WorldHeritage)
                    .filter(WorldHeritage.name == row["name"])
                    .first()
                )
                if exists:
                    continue

                heritage = WorldHeritage(
                    name=row["name"],
                    type=row["type"],
                    address=to_none(row.get("address")),
                    year=int(row["year"]) if row.get("year") else None,

                    spot1_title=to_none(row.get("spot1_title")),
                    spot1_detail=to_none(row.get("spot1_detail")),
                    spot2_title=to_none(row.get("spot2_title")),
                    spot2_detail=to_none(row.get("spot2_detail")),
                    spot3_title=to_none(row.get("spot3_title")),
                    spot3_detail=to_none(row.get("spot3_detail")),

                    sites=to_none(row.get("sites")),
                    summary=to_none(row.get("summary")),

                    latitude=float(row["latitude"]) if row.get("latitude") else None,
                    longitude=float(row["longitude"]) if row.get("longitude") else None,

                    image_url=to_none(row.get("image_url")),
                    badge_image_url=to_none(row.get("badge_image_url")),
                )

                db.add(heritage)

            db.commit()

    finally:
        db.close()


if __name__ == "__main__":
    run()
