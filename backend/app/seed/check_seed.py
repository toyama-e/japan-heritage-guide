# check_seed.py
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from models.heritage import WorldHeritage

def main():
    db: Session = SessionLocal()  # DBセッション作成
    try:
        # 件数を確認
        count = db.query(WorldHeritage).count()
        print(f"world_heritages テーブルの件数: {count}")

        # データの一部を確認
        print("\n一部データの表示（5件）:")
        items = db.query(WorldHeritage).limit(5).all()
        for h in items:
            print(f"ID: {h.id}, Name: {h.name}, Address: {h.address}, Year: {h.year}")
    finally:
        db.close()  # セッションを必ずクローズ

if __name__ == "__main__":
    main()
