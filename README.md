# 会社備品管理システム

会社の備品を効率的に管理するためのWebアプリケーションです。

## 機能

- **備品管理**
  - 備品の登録・編集・削除
  - 備品の検索・フィルタリング
  - 在庫状況の確認

- **貸出管理**
  - 備品の貸出・返却
  - 貸出履歴の表示
  - 現在の借用状況の確認

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router), TypeScript
- **ランタイム**: Bun
- **UI**: shadcn/ui, Tailwind CSS
- **状態管理**: TanStack Query
- **テーブル**: TanStack Table
- **バリデーション**: Valibot
- **日付処理**: date-fns
- **データストレージ**: JSON ファイル
- **リンター/フォーマッター**: Biome

## セットアップ

### 前提条件

- Bun がインストールされていること

### インストール

```bash
# 依存関係のインストール
bun install
```

### 開発サーバーの起動

```bash
bun run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## プロジェクト構造

```
.
├── app/                    # Next.js App Router ページ
│   ├── api/               # API Routes
│   ├── equipment/         # 備品ページ
│   ├── loans/             # 貸出履歴ページ
│   └── my-loans/          # マイページ
├── components/            # Reactコンポーネント
│   └── ui/               # shadcn/ui コンポーネント
├── hooks/                 # カスタムフック
├── lib/                   # ユーティリティ
│   ├── services/         # ビジネスロジック
│   ├── utils/            # ヘルパー関数
│   └── validations/      # バリデーションスキーマ
├── types/                 # TypeScript型定義
└── data/                  # JSONデータファイル
```

## 使用方法

### 備品の登録

1. トップページから「備品一覧」をクリック
2. 「新規登録」ボタンをクリック
3. 必要な情報を入力して「登録」

### 備品の貸出

1. 備品一覧から借りたい備品を選択
2. 詳細ページで「借りる」ボタンをクリック

### 備品の返却

1. マイページで現在借りている備品を確認
2. 返却したい備品の「返却する」ボタンをクリック

## データモデル

### 備品（Equipment）

- id: 一意のID
- name: 備品名
- category: カテゴリ
- description: 説明
- totalQuantity: 総数量
- availableQuantity: 利用可能数量
- purchaseDate: 購入日
- usefulLife: 耐用年数（オプション）
- createdAt: 登録日時
- updatedAt: 更新日時

### 貸出記録（Loan）

- id: 一意のID
- equipmentId: 備品ID
- userId: ユーザーID
- borrowedAt: 貸出日時
- returnedAt: 返却日時
- status: ステータス（active / returned）

### ユーザー（User）

- id: 一意のID
- name: ユーザー名
- email: メールアドレス
- role: 役割（user / admin）

## デモユーザー

システムには以下のデモユーザーが設定されています：

- **管理者**: `00000000-0000-0000-0000-000000000001`
- **ユーザー1**: `00000000-0000-0000-0000-000000000002` (デフォルトで使用)

## ライセンス

MIT
