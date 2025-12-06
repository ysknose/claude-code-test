# Claude Code Hooks - プロンプト採点システム

## 概要
このシステムは、Claude Codeのhooks機能を使用して、ユーザープロンプトとツール実行結果を自動的に採点・評価し、ログに記録します。

## 構成要素

### 1. スクリプト
- **`.claude/scripts/score_prompt.ps1`**: ユーザープロンプトを採点（PowerShell）
- **`.claude/scripts/score_execution.ps1`**: ツール実行結果を採点（PowerShell）

### 2. 設定ファイル
- **`.claude/settings.json`**: hooks設定（プロジェクト設定）

### 3. ログディレクトリ
- **`.claude/scoring/`**: 採点ログを保存（gitignore対象）
  - `prompt_scores.jsonl`: プロンプト採点ログ
  - `execution_scores.jsonl`: 実行結果採点ログ

## 採点基準

### プロンプト採点（10点満点）

1. **長さスコア（1-4点）**
   - 10-500文字: 4点
   - それ以外: 2点
   - 極端に短い/長い: 1点

2. **具体性スコア（1-3点）**
   - 動作を示すキーワード（作成、実装、修正など）: +1点
   - ファイルパスの記載: +1点

3. **明確さスコア（1-3点）**
   - 明確な指示: 3点
   - 疑問符を含む: 2点
   - 3単語未満: 1点

### 実行結果採点（10点満点）

1. **実行成功スコア（1-4点）**
   - エラーなし: 4点
   - 警告あり: 2点
   - 致命的エラー: 1点

2. **情報量スコア（1-3点）**
   - 十分な出力（100文字以上）: 3点
   - 標準的な出力: 2点
   - 少ない出力（10文字未満）: 1点

3. **ツール適切性スコア（1-3点）**
   - 適切なツール選択: 3点
   - 標準的なツール: 2点

## 使い方

### 1. セットアップ済み
既に以下の設定が完了しています：
- hooksスクリプトの作成
- `.claude/settings.local.json` の設定
- `.gitignore` への追加

### 2. 動作確認
Claude Codeでプロンプトを送信すると、自動的に：
1. プロンプト送信時に採点が実行される
2. ツール実行後に結果が採点される
3. ログが `.claude/scoring/` に記録される

### 3. ログの確認

```bash
# プロンプト採点ログを表示
cat .claude/scoring/prompt_scores.jsonl | jq '.'

# 実行結果採点ログを表示
cat .claude/scoring/execution_scores.jsonl | jq '.'

# 最新10件のプロンプトスコアを表示
tail -n 10 .claude/scoring/prompt_scores.jsonl | jq -r '.timestamp + " | スコア: " + (.total_score|tostring) + "/10 | " + .feedback'
```

### 4. 統計情報の取得

```bash
# プロンプトの平均スコアを計算
cat .claude/scoring/prompt_scores.jsonl | jq -s 'map(.total_score) | add/length'

# 実行結果の平均スコアを計算
cat .claude/scoring/execution_scores.jsonl | jq -s 'map(.total_score) | add/length'

# スコアが低い（5点以下）プロンプトを抽出
cat .claude/scoring/prompt_scores.jsonl | jq 'select(.total_score <= 5)'
```

## カスタマイズ

### スコアリング基準の変更
`.claude/scripts/score_prompt.sh` または `.claude/scripts/score_execution.sh` を編集してください。

### hooksの無効化
`.claude/settings.local.json` から該当のhook設定を削除またはコメントアウトしてください。

### 特定のツールのみ採点
`.claude/settings.local.json` の `matcher` を変更：

```json
{
  "event": "PostToolUse",
  "matcher": "Bash",  // Bashツールのみ採点
  "command": "bash .claude/scripts/score_execution.sh"
}
```

## 注意事項

1. **個人設定**: `settings.local.json` は個人設定ファイルで、gitには含まれません
2. **ログファイル**: `.claude/scoring/` はgitignore対象です
3. **スクリプト修正**: スクリプトを修正した場合は、実行権限を確認してください
4. **パフォーマンス**: 大量のツール実行がある場合、ログファイルが大きくなる可能性があります

## トラブルシューティング

### スクリプトが実行されない
```powershell
# PowerShell実行ポリシーの確認
Get-ExecutionPolicy

# スクリプトを手動実行してテスト
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".claude\scripts\score_prompt.ps1"
```

### ログファイルが作成されない（hooksが実行されていない）
```powershell
# ディレクトリの存在を確認
ls .claude/scoring/

# ディレクトリを作成
New-Item -ItemType Directory -Path .claude\scoring -Force

# Claude Codeのデバッグモードで実行
claude --debug
```

### hooks設定の確認
```powershell
# 設定ファイルを確認
cat .claude\settings.json

# JSONの構文が正しいか検証
Get-Content .claude\settings.json | ConvertFrom-Json
```

### スクリプトのデバッグ
hookデータをテスト用JSONとして手動で渡す：
```powershell
# UserPromptSubmitのテスト
@'
{
  "prompt": "テストプロンプト",
  "session_id": "test123"
}
'@ | powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".claude\scripts\score_prompt.ps1"

# PostToolUseのテスト
@'
{
  "tool_name": "Read",
  "tool_response": {
    "output": "テスト出力内容"
  }
}
'@ | powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".claude\scripts\score_execution.ps1"
```

## 参考リンク
- [Claude Code Hooks Documentation](https://code.claude.com/docs/en/hooks.md)
- [Claude Code Settings Guide](https://code.claude.com/docs/en/settings.md)
- **[詳細なトラブルシューティングガイド](.claude/HOOKS_TROUBLESHOOTING.md)** - hooksが動作しない問題・文字化け問題の解決策
