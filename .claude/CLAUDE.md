# プロジェクトメモリ - 会社備品管理システム

## プロジェクト概要
会社の備品を効率的に管理するためのWebアプリケーション。備品の貸出・返却、在庫管理を行う。

## 技術スタック
- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **ランタイム**: Bun
- **UI**: shadcn/ui, Tailwind CSS
- **状態管理**: TanStack Query
- **テーブル**: TanStack Table
- **バリデーション**: Valibot
- **日付処理**: date-fns
- **データストレージ**: JSON ファイル (`data/` ディレクトリ)
- **リンター/フォーマッター**: Biome

## プロジェクト構造
```
app/                    # Next.js App Router ページ
├── api/               # API Routes
├── equipment/         # 備品ページ
├── loans/             # 貸出履歴ページ
└── my-loans/          # マイページ
components/            # Reactコンポーネント
└── ui/               # shadcn/ui コンポーネント
hooks/                 # カスタムフック
lib/                   # ユーティリティ
├── services/         # ビジネスロジック
├── utils/            # ヘルパー関数
└── validations/      # バリデーションスキーマ
types/                 # TypeScript型定義
data/                  # JSONデータファイル
```

## コーディング規約・スタイル
- フォーマット: Biome を使用 (`bun run format`)
- リント: Biome を使用 (`bun run lint` / `bun run lint:fix`)
- コンポーネント: React Server Components を優先
- スタイリング: Tailwind CSS + shadcn/ui
- バリデーション: Valibot スキーマを使用
- 日付フォーマット: date-fns を使用

## データモデル
### Equipment (備品)
- id, name, category, description
- totalQuantity, availableQuantity
- purchaseDate, usefulLife (optional)
- createdAt, updatedAt

### Loan (貸出記録)
- id, equipmentId, userId
- borrowedAt, returnedAt
- status: 'active' | 'returned'

### User (ユーザー)
- id, name, email
- role: 'user' | 'admin'

## デモユーザー
- 管理者: `00000000-0000-0000-0000-000000000001`
- ユーザー1: `00000000-0000-0000-0000-000000000002` (デフォルト)

## Claude Code 拡張機能

### カスタムエージェント
プロジェクトには以下の専門エージェントが用意されています：
- **planner-test**: テスト戦略・テストケース設計の専門家
- **reviewer-backend**: バックエンドコードレビュー専門家
- **reviewer-devops**: DevOps/インフラレビュー専門家
- **reviewer-frontend**: React/Next.js コードレビュー専門家
- **reviewer-performance**: パフォーマンス最適化専門家
- **reviewer-security**: セキュリティレビュー専門家

使い方の詳細: `.claude/AGENTS_README.md` を参照

### Hooks
プロンプトと実行結果を自動採点するhooksを設定済み：
- **UserPromptSubmit**: プロンプトの品質を10点満点で採点
- **PostToolUse**: ツール実行結果を10点満点で採点
- ログは `.claude/scoring/` に保存（gitignore対象）

使い方の詳細: `.claude/HOOKS_README.md` を参照

## 開発メモ
<!-- ここに開発中の気づきや改善点などを記録 -->

## 将来の拡張・改善案
<!-- 将来的に追加したい機能や改善案を記録 -->

## トラブルシューティング
<!-- 問題が発生した際の対処法を記録 -->
