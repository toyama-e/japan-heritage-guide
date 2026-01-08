from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User as DBUser
from app.crud.user import create_user
from app.schemas.user import UserCreate
from app.core.firebase_auth import verify_firebase_token

def get_current_user(
    decoded_token: dict = Depends(verify_firebase_token),
    db: Session = Depends(get_db),
) -> DBUser:
    """
    Firebase認証済みユーザーを取得。
    DBに存在しなければ自動で作成。
    """
    print("\n👧=== get_current_user start ===")
    print("🌳 decoded_token:", decoded_token)

    firebase_uid = decoded_token["uid"]
    email = decoded_token.get("email")
    nickname = decoded_token.get("name", "")
    print(f"🌳 UID={firebase_uid}, Email={email}, Nickname={nickname}")

    # DB照合
    user = db.query(DBUser).filter(
        DBUser.firebase_uid == firebase_uid,
        DBUser.deleted_at.is_(None)
    ).first()

    if user:
        print(f"🌳 DB照合結果: ユーザーあり (ID={user.id}, email={user.email}, nickname={user.nickname})")
    else:
        print("🌳 DB照合結果: ユーザーなし。新規作成します。")
        user_create = UserCreate(firebase_uid=firebase_uid, email=email, nickname=nickname)
        user = create_user(db, user_create)
        print(f"🌳 DBへのユーザー登録完了: ID={user.id}, email={user.email}, nickname={user.nickname}")

    print("=== get_current_user end ===👦\n")
    return user
