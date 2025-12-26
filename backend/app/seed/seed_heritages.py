import csv
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.heritage import WorldHeritage

def run():
    db: Session = SessionLocal()
    try:
        with open("data/world_heritages.csv", newline="", encoding="utf-8-sig") as f:
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
                )
                db.add(heritage)
            db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    run()
