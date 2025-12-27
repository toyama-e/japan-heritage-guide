2025/12/22 作成
2025/12/22 更新
2025/12/26 更新

### テーブルと API リソースの対応

| テーブル           | API リソース                  |
| ------------------ | ----------------------------- |
| WorldHeritage      | `/Heritages`                  |
| WorldHeritageSites | `/heritages/{id}/sites`       |
| Recommended        | `/heritages/{id}/recommended` |
| Photos             | `/heritages/{id}/photos`      |
| Visit              | `/visits`                     |
| Diaries            | `/diaries`                    |
| DailyPhoto         | `/diaries/{id}/photos`        |
| Users              | `/users`                      |

---

## API 一覧

### WorldHeritage 世界遺産

| Method | Endpoint          | 内容         |
| ------ | ----------------- | ------------ |
| GET    | `/heritages`      | 世界遺産一覧 |
| GET    | `/heritages/{id}` | 世界遺産詳細 |

---

### Visit 訪問

| Method | Endpoint       | 内容           |
| ------ | -------------- | -------------- |
| POST   | `/visits`      | 訪問登録       |
| GET    | `/visits/me`   | 自分の訪問一覧 |
| DELETE | `/visits/{id}` | 訪問削除       |

---

### Diary 日記

| Method | Endpoint                         | 内容         |
| ------ | -------------------------------- | ------------ |
| POST   | `/visits/{id}/review`            | 日記投稿     |
| GET    | `/heritages/{id}/diaries`        | 日記一覧     |
| PATCH  | `/visits/{id}/review`            | 日記修正     |
| DELETE | `/diaries/{id}`                  | 日記削除     |
| POST   | `/diaries/{id}/photos`           | 日記写真追加 |
| DELETE | `/diaries/{id}/photos/{photoId}` | 日記写真削除 |

---

### ユーザー / 集計

| Method | Endpoint    | 内容               |
| ------ | ----------- | ------------------ |
| GET    | `/users/me` | 自分のユーザー情報 |
| PATCH  | `/users/me` | ユーザー情報更新   |
| DELETE | `/users/me` | 退会(ユーザー削除) |
