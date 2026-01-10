# backend/app/seed/seed_diaries_simple.py

from datetime import date
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.heritage import WorldHeritage
from app.models.user import User
from app.models.diary import Diary


# ここだけ必要なら変更
DEFAULT_USER_ID = 1
DEFAULT_WORLD_HERITAGE_ID = 1


def run() -> None:
    db: Session = SessionLocal()
    try:
        diaries = [
            Diary(
                user_id=DEFAULT_USER_ID,
                world_heritage_id=DEFAULT_WORLD_HERITAGE_ID,
                visit_id=None,
                visit_day=date(2025, 5, 28),
                title="ハイキングにもってこい",
                text="初挑戦の弥山登山。紅葉谷駅までロープウェーで行き、そこから山頂へはなかなか登りがいのある50分の登山コースでした。程よい汗をかいた後に山頂から眺める瀬戸内海は最高です！",
                image_url="https://upload.wikimedia.org/wikipedia/commons/0/0e/Itsukushima_Gate.jpg",
            ),
            Diary(
                user_id=DEFAULT_USER_ID,
                world_heritage_id=DEFAULT_WORLD_HERITAGE_ID,
                visit_id=None,
                visit_day=date(2025, 8, 20),
                title="歴史ロマン",
                text="荘厳ながら優美な社殿！当時の平家の繁栄ぶりが感じられました。夏は緑と赤い社殿のコントラストが美しいけれど、紅葉の季節にも訪れてみたいなあ。",
                image_url="https://upload.wikimedia.org/wikipedia/commons/6/66/%E5%B9%B3%E6%B8%85%E7%9B%9B%E5%83%8F%EF%BC%88%E5%8E%B3%E5%B3%B6%E7%A5%9E%E7%A4%BE%EF%BC%89.jpg",
            ),
            Diary(
                user_id=DEFAULT_USER_ID,
                world_heritage_id=DEFAULT_WORLD_HERITAGE_ID,
                visit_id=None,
                visit_day=date(2026, 1, 5),
                title="お土産もたくさん",
                text="有名な杓子のほかにも、宮島土鈴や張り子などならではのお土産もたくさんありました。島内には野生の鹿がいたるところに。奈良の鹿と違って少し気性が荒め？",
                image_url=None,  # 画像なしでもOK
            ),
        ]

        created = 0
        skipped = 0

        for d in diaries:
            # 超簡単な二重投入防止：同じタイトルがあればスキップ
            exists = db.query(Diary).filter(Diary.title == d.title).first()
            if exists:
                skipped += 1
                continue

            db.add(d)
            created += 1

        db.commit()
        print(f"[DONE] created={created}, skipped={skipped}")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
