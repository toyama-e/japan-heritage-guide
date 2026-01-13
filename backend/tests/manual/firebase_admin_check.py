# 実行コマンド
# docker compose exec backend python tests/manual/firebase_admin_check.py

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

sys.path.append(str(Path(__file__).resolve().parent.parent / "app"))

from app.core.firebase_admin import init_firebase_admin
from firebase_admin import auth

print("=== Firebase Admin テスト開始 ===")

# 初期化
init_firebase_admin()
print("✅ Firebase Admin 初期化 OK")

# ユーザー一覧取得
try:
    user = next(auth.list_users().iterate_all())
    print("✅ ユーザー一覧取得 OK")
    print("UID:", user.uid)
    print("Email:", user.email)
except StopIteration:
    print("ユーザーが1人も存在しません")

# UID 指定取得
TEST_UID = "AhYtpAt9ljV050M0XBrPhqHyM7A2"

try:
    user = auth.get_user(TEST_UID)
    print("✅ 指定UID取得 OK")
    print("UID:", user.uid)
    print("Email:", user.email)
except auth.UserNotFoundError:
    print("ユーザーが存在しません")

print("=== Firebase Admin テスト終了 ===")
