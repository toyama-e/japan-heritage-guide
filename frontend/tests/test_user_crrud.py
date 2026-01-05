# test_user_crud.py
from app.core.db import SessionLocal
from app.schemas.user import UserCreate, UserUpdate
from app.crud.user import create_user, get_user, get_users, update_user, soft_delete_user

def main():
    db = SessionLocal()

    # --- 作成 ---
    user_data = UserCreate(firebase_uid="abc123", email="test@example.com", nickname="Tester")
    user = create_user(db, user_data)
    print("Created:", user.id, user.firebase_uid, user.nickname)

    # --- 取得 ---
    fetched = get_user(db, user.id)
    print("Fetched:", fetched.id, fetched.firebase_uid, fetched.nickname)

    # --- 更新 ---
    update_data = UserUpdate(nickname="UpdatedTester")
    user = update_user(db, fetched, update_data)
    print("Updated:", user.nickname)

    # --- 全件取得 ---
    all_users = get_users(db)
    print("All users count:", len(all_users))

    # --- 論理削除 ---
    soft_delete_user(db, user)
    deleted = get_user(db, user.id)
    print("After soft delete:", deleted)  # None になるはず

if __name__ == "__main__":
    main()
