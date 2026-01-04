import csv
from pathlib import Path
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.heritage import WorldHeritage

APP_DIR = Path(__file__).resolve().parents[1]  # /app/app
CSV_PATH = APP_DIR / "data" / "world_heritages.csv"

def run():
    db: Session = SessionLocal()
    try:
        with open(CSV_PATH, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                heritage = WorldHeritage(
                    name=row["name"],
                    type=row["type"],
                    address=row["address"],
                    year=int(row["year"]) if row["year"] else None,
                    latitude=float(row["latitude"]) if row["latitude"] else None,
                    longitude=float(row["longitude"]) if row["longitude"] else None,
                    summary=row["summary"],
                    badge_image_url=row["badge_image_url"],
                )
                db.add(heritage)
            db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    run()
