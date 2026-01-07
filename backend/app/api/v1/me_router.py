from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.firebase_auth import verify_firebase_token
from app.models.user import User as DBUser
from app.schemas.user import UserRead, UserCreate
from app.crud.user import create_user

router = APIRouter()

@router.get("/me", response_model=UserRead, tags=["User"])
def read_me(
    decoded_token: dict = Depends(verify_firebase_token),
    db: Session = Depends(get_db),
):
    """
    Firebase認証済みユーザー情報を取得。
    初回アクセスならDBにユーザーを登録する。
    """

    print("👧=== /me start ===👦")
    print("🌳decoded_token:", decoded_token)

    firebase_uid = decoded_token["uid"]
    email = decoded_token.get("email")

    # DBにユーザーが存在するか確認
    print(f"🌳UIDでDB照合中={firebase_uid}")
    user = db.query(DBUser).filter(DBUser.firebase_uid == firebase_uid, DBUser.deleted_at.is_(None)).first()
    if user:
        print(f"🌳DB照合結果: ユーザーあり (ID={user.id}, email={user.email})")
    else:
        print("🌳DB照合結果: ユーザーなし")

    # 初回アクセスなら作成
    if not user:
        print("🌳ユーザー登録がないので作成します Creating new user...")
        user_create = UserCreate(firebase_uid=firebase_uid, email=email)
        user = create_user(db, user_create)
        print(f"🌳DBへのユーザー登録完了: ID={user.id}, email={user.email}")

    # Pydantic v2対応
    class UserReadModel(UserRead):
        model_config = {"from_attributes": True}

    print("🌳登録済みユーザーの情報を読み込みます Returning UserRead from ORM")
    user_read = UserReadModel.from_orm(user)
    print("🌳ユーザー情報:", user_read)
    print("👧=== /me end ===👦")

    return user_read
