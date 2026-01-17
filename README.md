# TeamD_FinalProject

いさんぽ JAPAN

## プロジェクト概要

日本の世界遺産を「知る・行く・記録する」を一つの体験としてつなぐ Web アプリ。

## 技術スタック

- Frontend: Next.js / TypeScript / Tailwind CSS
- Backend: FastAPI / Python
- Database: PostgreSQL（Supabase）
- Auth: Firebase Authentication
- Infra: Docker / Docker Compose

## ディレクトリ構成（概要）

- frontend/ : Next.js（フロントエンド）
- backend/ : FastAPI（バックエンド API）
- docs/ : 各種ドキュメント
- docker-compose.yml : 開発環境起動（Docker Compose）

## 開発環境起動

```bash
git clone https://github.com/ms-engineer-bc25-10/TeamD_FinalProject.git
cd TeamD_FinalProject
docker compose up --build
```

## 停止

```bash
docker compose down
```

## 動作確認

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## ドキュメント一覧

- [要件定義](docs/requirements_definition.md)  
  プロジェクトの目的・課題・スコープを定義

- [プロダクト要件（PRD）](docs/product_requirements.md)  
  機能一覧・ユーザー体験・制約条件

- [システム構成](docs/architecture.md)  
  フロント・バックエンド・DB の構成

- [API 仕様](docs/api.md)  
  エンドポイント一覧・リクエスト／レスポンス

## テスト

- [テスト実行手順（pytest / 手動テスト）](docs/how_to_test.md)
- [テスト設計書 / テストシナリオ](docs/test_scenario.md)
