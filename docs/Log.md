# ログ設計

## 1. 目的

本ログ設計書は、アプリ運用において以下を実現するためのログ方針を定義する。

- 障害発生時に原因を迅速に特定できる（復旧時間短縮）
- セキュリティ上の異常兆候を検知・追跡できる
- 性能劣化の要因を把握し、改善につなげられる
- 個人情報・機密情報をログから漏洩させない

---

## 2. 対象範囲

- フロントエンド（Next.js）
- バックエンドAPI（FastAPI）
- データベース（PostgreSQL / Supabase）
- 外部連携（Firebase Auth / Firebase Storage / Stripe / Google Maps / OpenAI）

※ DB自体の内部ログ（PostgreSQLログ）は運用環境の設定に依存するため、MVPでは「アプリ側ログ」を主対象とする。

---

## 3. ログの基本方針

### 3.1 記録方針（基本）

- **アプリの主要イベント**（リクエスト、エラー、重要操作、外部API呼び出し）を記録
- ログは **構造化ログ（JSON）** を採用し、検索・集計しやすくする
- フロントとAPIのログを **同一の相関IDで追跡可能** にする

---

### 3.2 出力レベル

| レベル | 用途 | 例 |
| --- | --- | --- |
| DEBUG | 開発・調査用（本番では原則OFF） | 入力パラメータの要約など |
| INFO | 正常系の主要イベント | リクエスト完了、重要操作 |
| WARN | 異常の兆候（継続利用は可能） | リトライ、外部API遅延 |
| ERROR | 処理失敗 | 4xx/5xx、例外 |
| CRITICAL | サービス停止級 | DB接続不能、重大障害 |

---

## 4. ログ種別と要件

## 4.1 アクセスログ（API Request Log）

**目的**：障害調査・性能把握のベース

**出力タイミング**

- APIリクエスト開始（任意）
- APIリクエスト終了（必須）

**必須項目**

- `timestamp`
- `level`
- `service`（例：`api`）
- `env`（dev/stg/prod）
- `request_id`（相関ID）
- `method`, `path`
- `status`
- `latency_ms`
- `user_id`（ログイン時のみ。なければnull）
- `client_ip`（収集するならマスク方針を明記）
- `user_agent`（任意）

---

## 4.2 エラーログ（Exception/Error Log）

**目的**：例外の原因特定、再発防止

**対象**

- 5xx（サーバー内部エラー）
- 想定外例外
- 外部サービス連携失敗（Storage/Stripe/OpenAIなど）

**必須項目**

- `timestamp`, `level=ERROR`
- `service`, `env`
- `request_id`
- `status`（あれば）
- `error_type`（例：`ValidationError`, `TimeoutError`）
- `message`（短い説明）
- `stacktrace`（本番は要検討：最低限は保持）
- `user_id`（あれば）

---

## 4.3 監査ログ（Audit Log：重要操作ログ）

**目的**：不正利用追跡・操作履歴の把握（後から追える）

**記録対象（MVP必須）**

- ログイン成功/失敗（失敗は回数のみでも可）
- 新規登録
- 日記：作成／更新／削除
- 画像アップロード（成功/失敗）
- 決済：開始／成功／失敗（Stripe webhook含む場合はイベントIDも）
- 権限に関わる変更（課金状態の更新など）

**必須項目**

- `timestamp`, `level=INFO`
- `service`, `env`
- `event_name`（例：`DIARY_CREATE`）
- `request_id`
- `user_id`
- `target_type`（例：`diary`）
- `target_id`
- `result`（success/fail）
- `reason`（fail時の簡易理由）

---

## 4.4 外部連携ログ（External Service Log）

**目的**：外部依存で遅い/落ちるを切り分ける

**対象**

- Firebase Auth検証
- Firebase Storage upload
- Stripe決済・webhook
- Google Maps API（エラー時のみでもOK）
- OpenAI API（遅延・失敗に備える）

**必須項目**

- `timestamp`, `level`
- `service`, `env`
- `request_id`
- `external_service`（firebase/stripe/openai/maps）
- `operation`（verify_token / upload / charge / recommend）
- `latency_ms`
- `result`（success/fail）
- `external_status`（HTTP statusなど）
- `error_code`（あれば）

---

## 5. 相関ID（request_id）設計

### 5.1 方針

- フロントで `request_id` を生成し、APIにヘッダで送る
- API側でログ出力に必ず含める
- 生成されない場合はAPI側で生成して補完する

**推奨ヘッダ**

- `X-Request-Id: <uuid>`

---

## 6. 個人情報・機密情報の取り扱い

### 6.1 ログ出力禁止（絶対）

- Firebase IDトークン／リフレッシュトークン
- パスワード、メールアドレス（原則）
- Stripe secret key、Webhook secret
- DBパスワード、APIキー（OpenAI/Maps含む）
- ユーザーの自由記述本文（日記全文をそのまま出さない）

### 6.2 マスク・匿名化方針（必要時）

- メール等を記録したい場合は **ハッシュ化** または一部マスク
- IPは取得するなら末尾をマスク（例：`xxx.xxx.xxx.0`）

---

## 7. ログフォーマット（JSON例）

### 7.1 アクセスログ例

```json
{
"timestamp":"2026-01-14T10:12:03.123+09:00",
"level":"INFO",
"service":"api",
"env":"prod",
"request_id":"c1f3a0c2-....",
"method":"GET",
"path":"/api/v1/heritages",
"status":200,
"latency_ms":187,
"user_id":12
}

```

### 7.2 監査ログ例

```json
{
"timestamp":"2026-01-14T10:15:44.002+09:00",
"level":"INFO",
"service":"api",
"env":"prod",
"request_id":"c1f3a0c2-....",
"event_name":"DIARY_CREATE",
"user_id":12,
"target_type":"diary",
"target_id":345,
"result":"success"
}

```

---

## 8. 保持期間・保管方針

| 種別 | 保持期間（案） | 理由 |
| --- | --- | --- |
| アクセスログ | 14日 | 障害調査・性能分析の最低限 |
| エラーログ | 30日 | 再発傾向の把握 |
| 監査ログ | 90日 | 不正調査・操作追跡 |
| 外部連携ログ | 30日 | 問題切り分け |

※ 保持期間はストレージコスト・運用方針に応じて見直す。

---

## 9. 運用（見るべきログと頻度）

### 9.1 日次チェック（MVP）

- ERROR/CRITICALの件数
- 5xxの発生有無（発生したら原因を確認）
- AIおすすめの失敗率が急増していないか
- Stripe決済失敗が連続していないか

### 9.2 障害時の参照順（テンプレ）

1. エラーログ（request_idで抽出）
2. 該当request_idのアクセスログ（status/latency）
3. 外部連携ログ（openai/stripe/firebase）
4. DB側原因が疑わしい場合：該当APIのクエリ/処理を確認

---

## 10. MVPでの実装優先度

### 10.1 MVP必須

- APIアクセスログ（終了時）
- エラーログ（例外捕捉）
- 監査ログ（少なくとも日記CRUD、決済イベント）
- request_id（相関ID）

### 10.2 余裕があれば

- 外部サービス呼び出しの latency 計測
- DB処理時間（db_time_ms）
- フロント側の簡易ログ（画面表示完了など）