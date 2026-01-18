2025/12/22 作成
2025/12/22 更新
2025/12/26 更新
2026/01/03 更新
2026/01/14 更新

## テーブルと API リソースの対応

| テーブル      | API リソース |
| ------------- | ------------ |
| WorldHeritage | `/Heritages` |
| Visits        | `/visits`    |
| Diaries       | `/diaries`   |
| Users         | `/users`     |

## API 一覧

### WorldHeritage 世界遺産

| Method | Endpoint          | 内容         |
| ------ | ----------------- | ------------ |
| GET    | `/heritages`      | 世界遺産一覧 |
| GET    | `/heritages/{id}` | 世界遺産詳細 |

### Visit 訪問

| Method | Endpoint       | 内容           |
| ------ | -------------- | -------------- |
| POST   | `/visits`      | 訪問登録       |
| GET    | `/visits/me`   | 自分の訪問一覧 |
| DELETE | `/visits/{id}` | 訪問削除       |

### Diary 日記

| Method | Endpoint              | 内容             |
| ------ | --------------------- | ---------------- |
| GET    | `/diaries`            | 日記一覧         |
| GET    | `/diaries/{id}`       | 日記詳細         |
| POST   | `/diaries`            | 日記投稿         |
| PATCH  | `/diaries/{id}`       | 日記更新         |
| PATCH  | `/diaries/{id}/image` | 日記画像差し替え |
| DELETE | `/diaries/{id}`       | 日記削除         |

### ユーザー / 集計

| Method | Endpoint    | 内容               |
| ------ | ----------- | ------------------ |
| GET    | `/users/me` | 自分のユーザー情報 |
| PATCH  | `/users/me` | ユーザー情報更新   |
| DELETE | `/users/me` | 退会(ユーザー削除) |

### マイページに自分が書いた日記取得

| Method | Endpoint | 内容                 |
| ------ | -------- | -------------------- |
| GET    | `/me`    | 自分が書いた日記取得 |

### opneAI API よりおすすめ行き先世界遺産提案

| Method | Endpoint        | 内容                                         |
| ------ | --------------- | -------------------------------------------- |
| POST   | `/ai/recommend` | ユーザーの好みに合わせたおすすめ世界遺産提案 |
