from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# 世界遺産一覧取得（GET /heritages）テスト
def test_list_heritages_returns_200_and_schema():
    res = client.get("/api/v1/heritages")
    assert res.status_code == 200

    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1

    first = data[0]
    # 必須項目（HeritageOutで必須）
    assert "id" in first
    assert "name" in first
    assert "type" in first

    assert isinstance(first["id"], int)
    assert isinstance(first["name"], str)
    assert isinstance(first["type"], str)

# 世界遺産詳細取得（GET /heritages/{heritage_id}）テスト：存在しない世界遺産IDを指定した場合 404 エラーを返す
def test_get_heritage_returns_404_for_nonexistent_id():
    res = client.get("/api/v1/heritages/999999")
    assert res.status_code == 404
    assert res.json()["detail"] == "Heritage not found"

# 世界遺産詳細取得（GET /heritages/{heritage_id}）テスト：存在する世界遺産IDを指定した場合 200 と正しいスキーマを返す
def test_get_heritage_returns_200_for_existing_id_and_schema():
    res_list = client.get("/api/v1/heritages")
    assert res_list.status_code == 200
    items = res_list.json()
    assert len(items) >= 1

    heritage_id = items[0]["id"]

    res = client.get(f"/api/v1/heritages/{heritage_id}")
    assert res.status_code == 200
    body = res.json()

    # 必須項目
    assert body["id"] == heritage_id
    assert isinstance(body["name"], str)
    assert isinstance(body["type"], str)

    # Optional項目は「存在してもいいし、Noneでもいい」のでチェックのみ
    assert "badge_image_url" in body
