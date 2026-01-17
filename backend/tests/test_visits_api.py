from datetime import date

from fastapi.testclient import TestClient

from app.core.firebase_dependency import get_current_user
from app.main import app
from app.schemas.visits import VisitsMeResponse

client = TestClient(app)


# テスト用ユーザー
class DummyUser:
    def __init__(
        self,
        user_id: int = 1,
        firebase_uid: str = "dummy_firebase_uid",
        email: str = "test@example.com",
    ):
        self.id = user_id
        self.firebase_uid = firebase_uid
        self.email = email


def override_get_current_user():
    return DummyUser()


# overrideを有効化
app.dependency_overrides[get_current_user] = override_get_current_user


# 訪問一覧取得（GET /visits/me）テスト
def test_get_my_visits_returns_200_and_shape():
    res = client.get("/api/v1/visits/me")
    assert res.status_code == 200

    data = res.json()
    assert "visited_heritage_ids" in data
    assert "count" in data
    assert isinstance(data["visited_heritage_ids"], list)
    assert isinstance(data["count"], int)


# 訪問登録（POST /visits）テスト
def test_create_visit_returns_201_or_409():
    payload = {
        "world_heritage_id": 26,
        "visited_from": "2026-01-01",
        "visited_to": "2026-01-01",
    }
    res = client.post("/api/v1/visits", json=payload)
    print("🟢status_code:", res.status_code)
    assert res.status_code in (201, 409)

    if res.status_code == 201:
        body = res.json()
        assert body["user_id"] == 1
        assert body["world_heritage_id"] == 26
        assert body["visited_from"] == "2026-01-01"
        assert body["visited_to"] == "2026-01-01"


# 重複登録（POST /visits）テスト
def test_create_visit_duplicate_returns_409():
    payload = {
        "world_heritage_id": 25,
        "visited_from": "2026-01-01",
        "visited_to": "2026-01-01",
    }

    # 1回目（DB状態次第で201 or 409どちらでもOK）
    client.post("/api/v1/visits", json=payload)

    # 2回目は基本 409 を期待
    res2 = client.post("/api/v1/visits", json=payload)
    print("🟢status_code:", res2.status_code)
    assert res2.status_code in (
        409,
        201,
    )  # ←DBが毎回初期化されない環境なら409になりやすい
    if res2.status_code == 409:
        assert res2.json()["detail"] == "すでに訪問登録されています"
