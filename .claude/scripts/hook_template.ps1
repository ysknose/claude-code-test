# hook_template.ps1 - Claude Code Hook スクリプトテンプレート
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
# 例: $hookData.prompt, $hookData.tool_name, $hookData.tool_response など

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

# Optional: Display message to user (will be shown in Claude Code output)
# Write-Host "Hook executed successfully" -ForegroundColor Green

exit 0
