# テスト実行手順

このドキュメントは、バックエンドの **単体テスト（pytest）** および  
**大枠テスト（手動テスト）** を、チームメンバーが誰でも再現できるようにまとめた実行手順書です。

---

## 0. 前提条件

- Docker / Docker Compose がインストールされていること
- 本リポジトリを clone 済みであること
- プロジェクトルートでコマンドを実行していること

---

## 1. 初回 pull に build が必要です

```bash
docker compose up -d --build backend
```

キャッシュも疑わしい場合（最終手段）：

```bash
コードをコピーする
docker compose build --no-cache backend
docker compose up -d backend
```

## 2. コンテナの起動確認

```bash
docker compose ps
```

`backend` が **Up** になっていることを確認してください。

---

## 3. 単体テスト（pytest）の実行方法

### 3.1 全テストを実行（基本）

```bash
docker compose exec backend pytest -q
```

---

### 3.2 どのテストが通ったか詳細表示

```bash
docker compose exec backend pytest -v
```

---

### 3.3 print / log を表示したい場合（デバッグ用）

```bash
docker compose exec backend pytest -s
```

---

### 3.4 特定のテストファイルだけ実行

```bash
docker compose exec backend pytest -q tests/test_heritages_api.py
docker compose exec backend pytest -q tests/test_visits_api.py
```

---

## 4. 大枠テスト（手動テスト）

### 4.1 Heritages API 契約テスト（HTTP）

※ 初回実行時は実行権限を付与してください。

```bash
chmod +x backend/tests/manual/heritages_contract.sh
```

（`visits_contract.sh` や他の `.sh` にも同様に使えます）

API が起動している状態で実行します。
世界遺産一覧の件数やレスポンス構造を確認します。

```bash
backend/tests/manual/heritages_contract.sh
```

成功すると `true` が表示されます。

---

### 4.2 Firebase Admin SDK 疎通確認

以下を確認します。

- Firebase Admin SDK が正しく初期化できること
- ユーザー取得が可能であること

```bash
docker compose exec backend python tests/manual/firebase_admin_check.py
```

---

### 4.3 Visits API についての補足

- 現在の Visits API は
  **Firebase 認証（Authorization: Bearer トークン）** が本線です。

- `backend/tests/manual/visits_contract.sh` は
  **旧 dev 仮認証（X-User-Id）用のテスト**のため、
  現状そのままでは失敗します。

#### Visits API の大枠確認方法

以下のいずれかで実施します。

- Swagger UI
- curl + Bearer トークン
- 単体テスト（pytest）での確認

---

## 5. よくあるエラーと対処法

### pytest が見つからない

```text
pytest: command not found
```

対処方法：

- `backend/requirements.txt` に pytest が含まれているか確認
- 依存関係を変更した場合は再 build する

```bash
docker compose up -d --build backend
```

---

### visits_contract.sh が 422 / 401 になる

- 現行の Visits API は Firebase 認証が必須です
- `X-User-Id` ヘッダーは現在の実装では使用されていません

---

## 6. 関連ドキュメント

- テスト設計書：`docs/test_scenario.md`
- 単体テストコード：`backend/tests/*.py`
- 手動テスト：`backend/tests/manual/`
