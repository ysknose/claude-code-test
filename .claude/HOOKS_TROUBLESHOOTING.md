# Claude Code Hooks トラブルシューティングガイド

このドキュメントは、Claude Code hooksを実装する際に発生する一般的な問題と解決策をまとめたものです。

## 目次
1. [hooksが実行されない問題](#hooksが実行されない問題)
2. [文字化け問題（Windows/PowerShell）](#文字化け問題windowspowershell)
3. [設定ファイルの構造](#設定ファイルの構造)
4. [デバッグ方法](#デバッグ方法)
5. [テンプレート](#テンプレート)

---

## hooksが実行されない問題

### 問題1: 環境変数を使用してデータを取得しようとしている

#### ❌ 間違った実装例
```powershell
# score_prompt.ps1 - 動作しない例
$PROMPT = $env:CLAUDE_USER_PROMPT  # この環境変数は存在しない！
$TOOL_NAME = $env:CLAUDE_TOOL_NAME  # これも存在しない！
```

#### ✅ 正しい実装
Claude Codeのhooksは**環境変数ではなく、stdinを通じてJSON形式でデータを渡します**。

```powershell
# score_prompt.ps1 - 正しい実装
param()

# Set console encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Read hook data from stdin (JSON format)
$stdinData = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($stdinData)) { exit 0 }

try {
  $hookData = $stdinData | ConvertFrom-Json
  $PROMPT = $hookData.prompt
} catch {
  # If JSON parsing fails, exit silently
  exit 0
}

# 以降の処理...
```

#### JSON入力形式

**UserPromptSubmit:**
```json
{
  "prompt": "ユーザーが入力したプロンプト",
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/directory",
  "permission_mode": "default"
}
```

**PostToolUse:**
```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/directory",
  "permission_mode": "default",
  "hook_event_name": "PostToolUse",
  "tool_name": "Read",
  "tool_input": {
    "file_path": "/path/to/file.txt"
  },
  "tool_response": {
    "output": "ファイルの内容..."
  },
  "tool_use_id": "toolu_01ABC123..."
}
```

---

## 文字化け問題（Windows/PowerShell）

### 問題2: PowerShellで日本語が文字化けする

Windows環境でPowerShellスクリプトを使用すると、日本語が文字化けする問題が発生します。

#### 原因
1. PowerShellのデフォルトエンコーディングがShift-JIS（CP932）
2. `Add-Content -Encoding UTF8`がUTF-8 BOMを追加してしまう
3. Claude CodeからPowerShellを呼び出す際のエンコーディング設定

#### ✅ 解決策1: スクリプト内でエンコーディングを設定

```powershell
# スクリプトの冒頭に追加
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
```

#### ✅ 解決策2: ファイル書き込みをBOMなしUTF-8に変更

**❌ 間違い:**
```powershell
Add-Content -Path $LOG_FILE -Value $jsonEntry -Encoding UTF8
# これはUTF-8 BOMを追加してしまう
```

**✅ 正しい:**
```powershell
[System.IO.File]::AppendAllText($LOG_FILE, $jsonEntry + "`n", [System.Text.UTF8Encoding]::new($false))
# $falseでBOMなしを指定
```

#### ✅ 解決策3: hooks設定でPowerShell呼び出し時にエンコーディングを設定

`.claude/settings.json`:
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -NoProfile -ExecutionPolicy Bypass -Command \"[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; & '.claude\\scripts\\score_prompt.ps1'\""
          }
        ]
      }
    ]
  }
}
```

**重要なポイント:**
- `-File`ではなく`-Command`を使用
- スクリプト実行前にエンコーディングを設定
- `& 'スクリプトパス'`でスクリプトを実行

---

## 設定ファイルの構造

### settings.jsonの正しい形式

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -NoProfile -ExecutionPolicy Bypass -Command \"[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; & '.claude\\scripts\\score_prompt.ps1'\""
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -NoProfile -ExecutionPolicy Bypass -Command \"[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; & '.claude\\scripts\\score_execution.ps1'\""
          }
        ]
      }
    ]
  }
}
```

### 重要な注意点

1. **hooksフィールドは必須**: 各イベント（UserPromptSubmit、PostToolUseなど）の配列要素には必ず`hooks`フィールドが必要
2. **matcher**: PostToolUseなどでは`matcher`フィールドでツールを指定可能（`*`は全ツール）
3. **Windows環境でのパス**: バックスラッシュは`\\`でエスケープ

---

## デバッグ方法

### 1. スクリプト単体テスト

#### UserPromptSubmitのテスト
```powershell
# テスト用JSONを作成
@'
{
  "prompt": "これはテストプロンプトです",
  "session_id": "test123"
}
'@ | powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; & '.claude\scripts\score_prompt.ps1'"

# ログファイルを確認
tail -n 1 .claude/scoring/prompt_scores.jsonl
```

#### PostToolUseのテスト
```powershell
@'
{
  "tool_name": "Read",
  "tool_response": {
    "output": "テスト出力内容"
  }
}
'@ | powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; & '.claude\scripts\score_execution.ps1'"

# ログファイルを確認
tail -n 1 .claude/scoring/execution_scores.jsonl
```

### 2. Claude Code デバッグモード

```bash
# デバッグモードで実行すると、hook実行の詳細が表示される
claude --debug
```

出力例:
```
[DEBUG] Executing hooks for UserPromptSubmit
[DEBUG] Found 1 hook matchers in settings
[DEBUG] Matched 1 hooks for query
[DEBUG] Executing hook command: powershell.exe ... with timeout 60000ms
[DEBUG] Hook completed in 234ms
```

### 3. JSON構文チェック

```powershell
# settings.jsonが正しいか検証
Get-Content .claude\settings.json | ConvertFrom-Json

# エラーがなければ問題なし
# エラーが出た場合はJSON構文エラー
```

### 4. ログファイルの確認

```powershell
# 最新のログエントリを確認
tail -n 1 .claude/scoring/prompt_scores.jsonl | ConvertFrom-Json | Format-List

# 全てのログを確認
Get-Content .claude/scoring/prompt_scores.jsonl | ForEach-Object { $_ | ConvertFrom-Json } | Format-Table timestamp, total_score, prompt -AutoSize
```

---

## テンプレート

### PowerShell Hook スクリプトテンプレート

```powershell
# hook_template.ps1
param()

# Set console encoding to UTF-8 (Windows環境で必須)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Read hook data from stdin (JSON format)
$stdinData = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($stdinData)) { exit 0 }

try {
  $hookData = $stdinData | ConvertFrom-Json
} catch {
  # If JSON parsing fails, exit silently
  exit 0
}

# Extract data from hookData
$TIMESTAMP = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$PROJECT_DIR = if ($env:CLAUDE_PROJECT_DIR) { $env:CLAUDE_PROJECT_DIR } else { (Get-Location).Path }
$LOG_FILE = Join-Path $PROJECT_DIR ".claude\logs\my_hook.jsonl"

# Your custom logic here
# 例: $hookData.prompt, $hookData.tool_name など

# Create log entry
$logEntry = [ordered]@{
  timestamp = $TIMESTAMP
  data = $hookData
}

$jsonEntry = $logEntry | ConvertTo-Json -Compress

# Ensure directory exists
$logDir = Split-Path $LOG_FILE -Parent
if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Append to log (UTF-8 without BOM)
[System.IO.File]::AppendAllText($LOG_FILE, $jsonEntry + "`n", [System.Text.UTF8Encoding]::new($false))

# Optional: Display message to user
# Write-Host "Hook executed successfully" -ForegroundColor Green

exit 0
```

### settings.json テンプレート

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -NoProfile -ExecutionPolicy Bypass -Command \"[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; & '.claude\\scripts\\your_script.ps1'\"",
            "timeout": 60,
            "statusMessage": "Running custom hook..."
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -NoProfile -ExecutionPolicy Bypass -Command \"[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; & '.claude\\scripts\\your_script.ps1'\"",
            "timeout": 60
          }
        ]
      }
    ]
  }
}
```

---

## チェックリスト

新しいhookを作成する際は、以下を確認してください：

### スクリプト作成時
- [ ] スクリプト冒頭でUTF-8エンコーディングを設定
- [ ] stdinからJSONデータを読み込む実装
- [ ] JSON解析エラーのtry-catchを実装
- [ ] ログファイル書き込みはBOMなしUTF-8を使用
- [ ] ディレクトリが存在しない場合の作成処理を含める

### settings.json設定時
- [ ] PowerShell呼び出し時にエンコーディングを設定
- [ ] `-Command`と`&`を使用してスクリプトを実行
- [ ] パスのバックスラッシュをエスケープ（`\\`）
- [ ] JSON構文が正しいか検証

### テスト時
- [ ] スクリプト単体で動作確認
- [ ] テスト用JSONでstdin入力をシミュレート
- [ ] ログファイルが正しく作成されるか確認
- [ ] 日本語が文字化けしていないか確認
- [ ] Claude Code実行時に実際に動作するか確認

---

## よくある質問

### Q: hooksが全く実行されない
A: 以下を確認してください：
1. `settings.json`の構文が正しいか
2. スクリプトファイルが存在するか
3. PowerShellの実行ポリシーが制限されていないか
4. Claude Codeを再起動したか

### Q: スクリプトは実行されるがログが記録されない
A: 以下を確認してください：
1. stdinからデータを読み込んでいるか（環境変数ではない）
2. JSON解析が成功しているか
3. ログディレクトリが作成されているか
4. ファイル書き込み権限があるか

### Q: 文字化けが解決しない
A: 以下を全て実施してください：
1. スクリプト冒頭でエンコーディング設定
2. ファイル書き込みをBOMなしUTF-8に変更
3. settings.jsonでPowerShell呼び出し時にエンコーディング設定
4. Claude Codeを再起動

### Q: 特定のツールのみhookを実行したい
A: `matcher`フィールドを使用してください：
```json
{
  "matcher": "Read|Write",  // ReadとWriteのみ
  "hooks": [...]
}
```

---

## 参考リンク

- [Claude Code Hooks Documentation](https://code.claude.com/docs/en/hooks.md)
- [Claude Code Settings Guide](https://code.claude.com/docs/en/settings.md)
- [PowerShell Encoding Issues](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_character_encoding)

---

## まとめ

### 最重要ポイント

1. **stdinからJSON形式でデータを取得する**（環境変数ではない）
2. **Windows/PowerShellでは必ずUTF-8エンコーディングを設定する**（3箇所）
3. **ファイル書き込みはBOMなしUTF-8を使用する**
4. **settings.jsonでPowerShell呼び出し時にエンコーディング設定**

これらを守れば、Windows環境でも日本語を含むhooksが正しく動作します。
