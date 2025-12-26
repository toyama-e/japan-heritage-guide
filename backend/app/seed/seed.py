# backend/seed.py
from app.core.database import SessionLocal
from app.models.heritage import WorldHeritage

def seed():
    db = SessionLocal()

    heritages = [
        WorldHeritage(
            name="富士山",
            type="文化",
            address="静岡県・山梨県",
            year=2013,
            summary="日本を象徴する霊峰",
            latitude=35.3606,
            longitude=138.7274,
        ),
        WorldHeritage(
            name="屋久島",
            type="自然",
            address="鹿児島県",
            year=1993,
            summary="原生的な森林生態系",
            latitude=30.358,
            longitude=130.528,
        ),
    ]

    db.add_all(heritages)
    db.commit()
    db.close()

if __name__ == "__main__":
    seed()
