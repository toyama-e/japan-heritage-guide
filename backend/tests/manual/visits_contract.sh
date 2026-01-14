# NOTE:
# これは「旧 dev 仮認証（X-User-Id）」用の手動テストです。
# 現在の Visits API は Firebase 認証（Authorization: Bearer <ID_TOKEN>）が本線のため、
# 本スクリプトはそのままだと 422/401 になります。

#!/bin/bash
set -e

BASE_URL="${BASE_URL:-http://localhost:8000}"
API_PREFIX="${API_PREFIX:-/api/v1}"

VISITS_ME_URL="$BASE_URL$API_PREFIX/visits/me"
VISITS_URL="$BASE_URL$API_PREFIX/visits"

# ✅ dev 仮認証（FastAPI側の get_dev_user_id が読むヘッダー）
# 例: USER_ID=1 ./scripts/visits_manual_test.sh
USER_ID="${USER_ID:-1}"
AUTH_HEADER="X-User-Id: ${USER_ID}"

# すでに訪問済みだと 201 が出ないので、未訪問のIDに変えられるようにしておく
WORLD_HERITAGE_ID="${WORLD_HERITAGE_ID:-26}"
VISITED_FROM="${VISITED_FROM:-2026-01-01}"
VISITED_TO="${VISITED_TO:-2026-01-01}"

PAYLOAD="{\"world_heritage_id\":$WORLD_HERITAGE_ID,\"visited_from\":\"$VISITED_FROM\",\"visited_to\":\"$VISITED_TO\"}"

echo "============================="
echo "Visits Contract Test (manual)"
echo "BASE_URL=$BASE_URL"
echo "API_PREFIX=$API_PREFIX"
echo "USER_ID=$USER_ID"
echo "world_heritage_id=$WORLD_HERITAGE_ID"
echo "============================="
echo

# --- 1) GET /visits/me -------------------------------------------------------
echo "1) GET /api/v1/visits/me 自分の訪問一覧取得"

status=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "$AUTH_HEADER" \
  "$VISITS_ME_URL")
echo "status=$status"

if [ "$status" != "200" ]; then
  echo "❌ GET /visits/me 取得失敗"
  exit 1
fi
echo "✅ GET /visits/me 取得成功"
echo

# --- 2) POST /visits (create) ------------------------------------------------
echo "2) POST /api/v1/visits 訪問記録 新規作成"
echo "payload=$PAYLOAD"

status=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$VISITS_URL" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "$PAYLOAD")

echo "status=$status"

if [ "$status" != "201" ]; then
  echo "❌ POST /visits 新規登録失敗（既に登録済みなら 409 になります）"
  exit 1
fi
echo "✅ POST /visits 新規登録成功"
echo

# --- 3) GET /visits/me (after create) ----------------------------------------
echo "3) GET /api/v1/visits/me（作成後に取得できるか）"

status=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "$AUTH_HEADER" \
  "$VISITS_ME_URL")
  
echo "status=$status"

if [ "$status" != "200" ]; then
  echo "❌ GET /visits/me（作成後）取得失敗"
  exit 1
fi
echo "✅ GET /visits/me（作成後）取得成功"
echo

# --- 4) POST /visits (duplicate -> 409) --------------------------------------
echo "4) POST /api/v1/visits（重複POST → 409）"
echo "payload=$PAYLOAD"

status=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$VISITS_URL" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "$PAYLOAD")

echo "status=$status"

if [ "$status" != "409" ]; then
  echo "❌ 重複POSTが409になりませんでした"
  exit 1
fi
echo "✅ 重複POST 409 を確認"
echo

echo "🎉 パンパカパ〜ン、全てのテストが成功しました！"
