# Execution scoring script (PowerShell version)
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
  $TOOL_NAME = $hookData.tool_name

  # Extract output from tool_response
  $TOOL_OUTPUT = ""
  if ($hookData.tool_response) {
    # Convert tool_response object to string
    if ($hookData.tool_response.output) {
      $TOOL_OUTPUT = $hookData.tool_response.output
    } else {
      # If no specific output field, convert entire response to JSON string
      $TOOL_OUTPUT = $hookData.tool_response | ConvertTo-Json -Compress
    }
  }
} catch {
  # If JSON parsing fails, exit silently
  exit 0
}

if (-not $TOOL_NAME) { $TOOL_NAME = "unknown" }
if ($TOOL_NAME -eq "unknown") { exit 0 }

$TIMESTAMP = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$PROJECT_DIR = if ($env:CLAUDE_PROJECT_DIR) { $env:CLAUDE_PROJECT_DIR } else { (Get-Location).Path }
$LOG_FILE = Join-Path $PROJECT_DIR ".claude\scoring\execution_scores.jsonl"

# Calculate metrics
$OUTPUT_SIZE = $TOOL_OUTPUT.Length

# Scoring
$SUCCESS_SCORE = 4
if ($TOOL_OUTPUT -match "(?i)(error|failed|exception|fatal|warning)") { $SUCCESS_SCORE = 2 }
if ($TOOL_OUTPUT -match "(?i)(fatal|exception|failed)") { $SUCCESS_SCORE = 1 }

$INFO_SCORE = 2
if ($OUTPUT_SIZE -gt 100) { $INFO_SCORE = 3 }
elseif ($OUTPUT_SIZE -lt 10) { $INFO_SCORE = 1 }

$APPROPRIATENESS_SCORE = 2
switch ($TOOL_NAME) {
  {$_ -in "Read", "Glob", "Grep"} { $APPROPRIATENESS_SCORE = 3 }
  {$_ -in "Edit", "Write"} { $APPROPRIATENESS_SCORE = 3 }
  "Bash" { $APPROPRIATENESS_SCORE = 2 }
  default { $APPROPRIATENESS_SCORE = 2 }
}

$TOTAL_SCORE = $SUCCESS_SCORE + $INFO_SCORE + $APPROPRIATENESS_SCORE

$FEEDBACK = ""
$IMPROVEMENTS = @()

if ($SUCCESS_SCORE -le 2) {
  $FEEDBACK += "実行にエラーが含まれています。"
  if ($TOOL_OUTPUT -match "(?i)(fatal|exception)") {
    $IMPROVEMENTS += "致命的なエラーが発生しました。エラーメッセージを確認してください"
    $IMPROVEMENTS += "対処: エラーの原因を特定し、コードやコマンドを修正してから再実行"
  } elseif ($TOOL_OUTPUT -match "(?i)(error|failed)") {
    $IMPROVEMENTS += "エラーが発生しました。"
    $IMPROVEMENTS += "対処: 出力を確認し、不足している依存関係やパス、権限などを確認"
  } elseif ($TOOL_OUTPUT -match "(?i)warning") {
    $IMPROVEMENTS += "警告が含まれています。必要に応じて対処してください"
  }
}

if ($INFO_SCORE -le 1) {
  $FEEDBACK += "出力が短すぎます。"
  $IMPROVEMENTS += "ツールが期待通りの結果を返していない可能性があります"
  switch ($TOOL_NAME) {
    "Read" { $IMPROVEMENTS += "対処: ファイルパスが正しいか確認してください" }
    "Grep" { $IMPROVEMENTS += "対処: 検索パターンを見直すか、対象ファイル/ディレクトリを確認" }
    "Glob" { $IMPROVEMENTS += "対処: パターンマッチが適切か、対象ディレクトリが正しいか確認" }
    "Bash" { $IMPROVEMENTS += "対処: コマンドが正しく実行されたか、出力が想定通りか確認" }
    default { $IMPROVEMENTS += "対処: ツールの使用方法や引数を見直してください" }
  }
}

if ($TOTAL_SCORE -ge 9) {
  $FEEDBACK = "良好な実行結果です。"
} elseif ($IMPROVEMENTS.Count -gt 0) {
  $FEEDBACK += "`n改善提案:`n" + ($IMPROVEMENTS -join "`n")
}

# Output preview (first 200 chars)
$TRUNCATED_OUTPUT = if ($TOOL_OUTPUT.Length -gt 200) {
  $TOOL_OUTPUT.Substring(0, 200)
} else {
  $TOOL_OUTPUT
}

# Create log entry
$logEntry = [ordered]@{
  timestamp = $TIMESTAMP
  type = "execution"
  tool = $TOOL_NAME
  output_size = $OUTPUT_SIZE
  success_score = $SUCCESS_SCORE
  info_score = $INFO_SCORE
  appropriateness_score = $APPROPRIATENESS_SCORE
  total_score = $TOTAL_SCORE
  feedback = $FEEDBACK
  output_preview = $TRUNCATED_OUTPUT
}

$jsonEntry = $logEntry | ConvertTo-Json -Compress

# Ensure directory exists
$logDir = Split-Path $LOG_FILE -Parent
if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Append to log (UTF-8 without BOM)
[System.IO.File]::AppendAllText($LOG_FILE, $jsonEntry + "`n", [System.Text.UTF8Encoding]::new($false))

if ($TOTAL_SCORE -le 5) {
  Write-Host "実行スコア: $TOTAL_SCORE/10 [$TOOL_NAME] - $FEEDBACK" -ForegroundColor Yellow
}

exit 0
