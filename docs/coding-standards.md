# コーディング規約

参考：https://qiita.com/kabosu3d/items/06ce9266bc2db1226421

参考：https://qiita.com/simonritchie/items/bb06a7521ae6560738a7

**対象**

- フロントエンド：Next.js / TypeScript
- バックエンド：Python

**目的**

- 可読性・保守性・品質の担保
- コードスタイルの議論コスト削減
- フォーマッタ／Lint による自動化前提の開発

---

## 1. 共通方針（必須）

- フォーマットは **人ではなくツールに任せる**
- コードは「何をしているか」より **「なぜそうしているか」** をコメントする
- マジックナンバー禁止（定数化する）
- TODO コメントには必ず理由または Issue 番号を付ける

```tsx
// TODO(#123): APIレスポンス形式変更対応
```

---

## 2. インデント・文字コード

### 2.1 インデント

| 対象 | ルール |
| --- | --- |
| フロント（TypeScript / Next.js） | **スペース2** |
| バックエンド（Python） | **スペース4（PEP8準拠）** |

※ タブは禁止

---

### 2.2 文字コード・改行

- UTF-8（BOMなし）
- 改行コード：LF
- ファイル末尾に改行を入れる

---

## 3. フロントエンド（Next.js / TypeScript）

### 3.1 基本方針

- TypeScript 必須
- App Router（`app/`）前提
- ESLint + Prettier を必ず使用
- ロジックと UI を分離する

---

### 3.2 ディレクトリ構成（例）

```
app/
├─ layout.tsx
├─ page.tsx
├─ api/
│  └─ users/route.ts
components/
├─ ui/
├─ layout/
lib/
types/
```

---

### 3.3 命名規則

| 種類 | ルール | 例 |
| --- | --- | --- |
| コンポーネント | PascalCase | `UserCard.tsx` |
| 変数・関数 | camelCase | `fetchUser` |
| 型・interface | PascalCase | `User` |
| 定数 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| ディレクトリ | kebab-case | `user-profile` |

---

### 3.4 変数宣言

- `const` を基本とする
- 再代入がある場合のみ `let`
- `var` は使用禁止

---

### 3.5 コンポーネント記述

```tsx
typeProps = {
name:string;
};

exportconstUserCard = ({ name }: Props) => {
return<div>{name}</div>;
};
```

- `React.FC` は使用しない
- Props は必ず型定義する
- 1ファイル1コンポーネント

---

### 3.6 TypeScript 特有ルール

- `any` 原則禁止（やむを得ない場合は理由コメント必須）
- `unknown` を優先する
- `strict: true` を tsconfig で有効化

---

### 3.7 スタイル

- インデント：スペース2
- クォート：Prettier に従う（推奨：シングルクォート）
- ネストは深くしすぎない（目安：2段）

---

## 4. バックエンド（Python）

### 4.1 基本方針

- PEP8 準拠
- 可読性優先
- 型ヒントを積極的に使用

---

### 4.2 インデント・行長

- インデント：**スペース4**
- 1行の長さ：
    - コード：79文字以内
    - コメント / docstring：72文字以内

---

### 4.3 import ルール

1. 標準ライブラリ
2. サードパーティ
3. 自プロジェクト

各グループは空行で区切る

- `import os, sys` のような書き方は禁止
- `from x import *` 禁止
- 絶対 import 推奨

---

### 4.4 命名規則

| 種類 | ルール |
| --- | --- |
| 変数・関数 | snake_case |
| クラス | PascalCase |
| 定数 | UPPER_SNAKE_CASE |
| モジュール | snake_case |
| 非公開要素 | 先頭 `_` |

---

### 4.5 関数・クラス

```python
defget_user(user_id: int) ->dict:
"""ユーザー情報を取得する."""
return {"id": user_id}

```

- 戻り値の型を明示
- 公開関数・クラスには docstring 必須

---

### 4.6 条件・比較

- `None` チェックは `is None`
- 真偽値は `if flag:` / `if not flag:`
- 空配列・空辞書は `if not items:`

---

### 4.7 例外処理

```python
try:
    ...
except ValueErroras e:
    ...

```

- `except:` や `except Exception:` の乱用禁止
- 独自例外は `Error` サフィックスを付ける

---

### 4.8 チェック除外

- テスト/検証用ファイル
- Alembicのversions配下とenv.py
- firebase関連ファイル

---

## 5. フォーマッタ・Lint（必須）

### フロント

- Prettier（フォーマッター）
- ESLint（Lint / 静的解析）

### バック

- black（フォーマッター）
- ruff（Lint / 静的解析）
- flake8（Lint / 静的解析）
- isort（フォーマッター）

---

## 6. EditorConfig（推奨）

```
root =true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline =true

[*.{ts,tsx,js,jsx}]
indent_style = space
indent_size =2

[*.py]
indent_style = space
indent_size =4
```

---

## 7. 例外運用

- 規約から外れる場合は **理由を明記**
- 一時的な回避は TODO + Issue 管理

---

## 8. 最終原則

> 「人が悩む余地を減らし、ツールに判断させる」
> 

この規約は品質を縛るためではなく、

**チーム全員が迷わず開発できる状態を作るためのもの**とする。