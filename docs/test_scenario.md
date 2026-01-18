# テスト設計書 / テストシナリオ

## 1. テスト方針

本プロジェクトでは、以下の観点でテストを実施する。

- 単体テスト：pytest を用いて API 単位での動作確認を行う
- 大枠テスト：HTTP 経由での API 契約確認および外部サービス疎通確認を行う

---

## 2. 単体テスト（自動テスト）

### 2.1 Heritages API

対象エンドポイント：

- GET /api/v1/heritages
- GET /api/v1/heritages/{heritage_id}

確認内容：

- 200 / 404 のステータスコード
- レスポンスが HeritageOut スキーマに準拠していること

実施方法：

- pytest（test_heritages_api.py）

---

### 2.2 Visits API

対象エンドポイント：

- GET /api/v1/visits/me
- POST /api/v1/visits

確認内容：

- 認証済みユーザーでの正常取得（200）
- 新規登録時の 201
- 重複登録時の 409

実施方法：

- pytest（test_visits_api.py）
- 認証は get_current_user を override して実施

---

## 3. 大枠テスト（手動テスト）

### 3.1 Heritages API 契約テスト

目的：

- API が起動中の状態で正しいレスポンス構造を返すことを確認する

実施内容：

- GET /api/v1/heritages の件数確認
- 必須キー（id, badge_image_url）の存在確認

実施方法：

- backend/tests/manual/heritages_contract.sh

---

### 3.2 Firebase Admin SDK 疎通確認

目的：

- Firebase Admin SDK が正しく初期化され、ユーザー取得が可能であることを確認する

実施内容：

- Admin SDK 初期化
- ユーザー一覧取得
- UID 指定でのユーザー取得

実施方法：

- backend/tests/manual/firebase_admin_check.py

---

### 3.3 Visits API（Firebase 認証）手動確認

目的：

- Firebase 認証を用いた実環境に近い形での動作確認

実施内容：

- Bearer トークンを付与した GET /visits/me
- Bearer トークンを付与した POST /visits

実施方法：

- Swagger UI / curl を用いて手動確認
