# テスト駆動開発 (TDD) の基本

## 基本概念

テスト駆動開発（TDD）は次の 3 ステップを繰り返す開発サイクルです：

1. **Red** – 失敗するテストを書く
2. **Green** – テストを通す最小実装を書く
3. **Refactor** – 実装とテストを整理・改善する

## 重要な考え方

- **テストは仕様である**：テストコードは実装の振る舞いを正確に記述する
- **Arrange → Act → Assert** の順序で整理する
  1. **結果（Assert）** – 期待する出力を先に書く
  2. **操作（Act）** – テスト対象の処理を実行する
  3. **準備（Arrange）** – モックやデータなどのテスト環境を用意する
- **テスト名は「状況-操作-結果」形式**
  例：`有効なトークンの場合にユーザー情報を取得すると成功すること`

## リファクタリングフェーズの主要ツール (pnpm)

| 目的 | 代表的コマンド例 | 備考 |
| --- | --- | --- |
| **静的解析・型チェック** | ```bash pnpm exec tsc --noEmit pnpm exec eslint "src/**/*.{ts,tsx}" ``` | `tsconfig.json` と `eslint` でルール統一 |
| **デッドコード検出** | ```bash pnpm exec ts-prune ``` | `ts-prune` や `tsx-unused-exports` を利用 |
| **コードカバレッジ**<br>(Vitest 推奨) | ```bash pnpm exec vitest run --coverage ``` | Jest を使う場合は `--coverage` |
| **Git コミット運用** | フェーズごとにコミットし、プレフィックスで分類<br>`test:` / `feat:` / `refactor:` | 変更確認：<br>```bash git status git add <files> git commit -m "feat: XXX" ``` |

