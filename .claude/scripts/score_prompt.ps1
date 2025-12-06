# Prompt scoring script (PowerShell version)
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

if (-not $PROMPT) { exit 0 }
if ([string]::IsNullOrEmpty($PROMPT)) { exit 0 }

$TIMESTAMP = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$PROJECT_DIR = if ($env:CLAUDE_PROJECT_DIR) { $env:CLAUDE_PROJECT_DIR } else { (Get-Location).Path }
$LOG_FILE = Join-Path $PROJECT_DIR ".claude\scoring\prompt_scores.jsonl"

# Calculate metrics
$CHAR_COUNT = $PROMPT.Length
$WORD_COUNT = ($PROMPT -split '\s+').Count

# Detect prompt type
$PROMPT_TYPE = "task"  # default
if ($PROMPT -match "(?i)(教えて|説明|どう|何|いつ|なぜ|どこ|誰|explain|how|what|why|where|who|when|tell me|show me|について|とは)") {
  $PROMPT_TYPE = "question"
} elseif ($PROMPT -match "(?i)(探して|検索|find|search|locate|look for|調べて)") {
  $PROMPT_TYPE = "exploration"
} elseif ($PROMPT -match "(?i)(create|implement|fix|add|delete|change|refactor|test|update|remove|作成|追加|修正|削除|変更|実装)") {
  $PROMPT_TYPE = "task"
}

# Scoring based on prompt type
$LENGTH_SCORE = 1
if ($CHAR_COUNT -ge 10 -and $CHAR_COUNT -le 500) { $LENGTH_SCORE = 4 }
elseif ($CHAR_COUNT -gt 500 -or $CHAR_COUNT -lt 10) { $LENGTH_SCORE = 2 }

$SPECIFICITY_SCORE = 1
switch ($PROMPT_TYPE) {
  "task" {
    # Task: require action verb and file path
    if ($PROMPT -match "(?i)(create|implement|fix|add|delete|change|refactor|test|update|remove|作成|追加|修正|削除|変更|実装)") {
      $SPECIFICITY_SCORE++
    }
    if ($PROMPT -match "[\.\/]") { $SPECIFICITY_SCORE++ }
  }
  "question" {
    # Question: clarity is more important than specificity
    if ($PROMPT -match "(?i)(について|とは|の|how|what|why|explain)") {
      $SPECIFICITY_SCORE = 3  # Questions are naturally specific
    }
  }
  "exploration" {
    # Exploration: search target is important
    if ($PROMPT -match "(?i)(ファイル|関数|クラス|コンポーネント|file|function|class|component)") {
      $SPECIFICITY_SCORE++
    }
    if ($PROMPT -match "[\.\/]") { $SPECIFICITY_SCORE++ }
  }
}

$CLARITY_SCORE = 3
if ($PROMPT_TYPE -eq "question") {
  # Questions can use question marks
  if ($WORD_COUNT -ge 3) { $CLARITY_SCORE = 3 }
  elseif ($WORD_COUNT -lt 3) { $CLARITY_SCORE = 1 }
} else {
  # Tasks/exploration: imperative form preferred
  if ($PROMPT -match "\?") { $CLARITY_SCORE = 2 }
  if ($WORD_COUNT -lt 3) { $CLARITY_SCORE = 1 }
}

$TOTAL_SCORE = $LENGTH_SCORE + $SPECIFICITY_SCORE + $CLARITY_SCORE

$FEEDBACK = ""
$IMPROVEMENTS = @()

# Type-specific feedback
switch ($PROMPT_TYPE) {
  "task" {
    if ($LENGTH_SCORE -le 2) {
      if ($CHAR_COUNT -lt 10) {
        $FEEDBACK += "プロンプトが短すぎます。"
        $IMPROVEMENTS += "例: 'fix bug' → 'Fix the authentication bug in lib/services/user-service.ts that causes login to fail'"
      } else {
        $FEEDBACK += "プロンプトが長すぎます。"
        $IMPROVEMENTS += "例: 要点を絞って簡潔に記述してください（500文字以内推奨）"
      }
    }

    if ($SPECIFICITY_SCORE -le 2) {
      $FEEDBACK += "具体的な指示やファイルパスを含めてください。"
      $missingElements = @()
      if ($PROMPT -notmatch "(?i)(create|implement|fix|add|delete|change|refactor|test|update|remove|作成|追加|修正|削除|変更|実装)") {
        $missingElements += "動詞（add/fix/refactor/implement など）"
      }
      if ($PROMPT -notmatch "[\.\/]") {
        $missingElements += "ファイルパス（例: lib/services/user-service.ts）"
      }
      if ($missingElements.Count -gt 0) {
        $IMPROVEMENTS += "含めるべき要素: $($missingElements -join ', ')"
      }
      $IMPROVEMENTS += "例: '機能追加して' → 'Add pagination to the equipment list in app/equipment/page.tsx'"
    }

    if ($CLARITY_SCORE -le 2) {
      $FEEDBACK += "より明確な指示を心がけてください。"
      if ($PROMPT -match "\?") {
        $IMPROVEMENTS += "タスクは質問形式ではなく指示形式で記述してください"
        $IMPROVEMENTS += "例: 'どうすればいい?' → 'Refactor the fetchEquipment function to use async/await'"
      }
      if ($WORD_COUNT -lt 3) {
        $IMPROVEMENTS += "最低3単語以上で具体的に記述してください"
        $IMPROVEMENTS += "例: 'fix' → 'Fix the loan return validation in lib/services/loan-service.ts'"
      }
    }
  }

  "question" {
    if ($LENGTH_SCORE -le 2) {
      if ($CHAR_COUNT -lt 10) {
        $FEEDBACK += "質問が短すぎます。"
        $IMPROVEMENTS += "例: '何?' → 'このプロジェクトの認証の仕組みについて教えてください'"
      }
    }

    if ($WORD_COUNT -lt 3) {
      $IMPROVEMENTS += "質問は最低3単語以上で具体的に記述してください"
      $IMPROVEMENTS += "例: 'どう?' → 'このエラーの原因は何ですか？'"
    }

    if ($SPECIFICITY_SCORE -le 2) {
      $FEEDBACK += "質問をより具体的にしてください。"
      $IMPROVEMENTS += "例: '教えて' → 'プロンプトスコアリングの改善方法について教えてください'"
    }
  }

  "exploration" {
    if ($LENGTH_SCORE -le 2) {
      if ($CHAR_COUNT -lt 10) {
        $FEEDBACK += "探索指示が短すぎます。"
        $IMPROVEMENTS += "例: '探して' → '認証関連の処理を行っているファイルを探してください'"
      }
    }

    if ($SPECIFICITY_SCORE -le 2) {
      $FEEDBACK += "探索対象をより具体的に指定してください。"
      $IMPROVEMENTS += "探索対象を明確に: ファイル名、関数名、クラス名など"
      $IMPROVEMENTS += "例: '探して' → 'ユーザー認証を処理している関数を lib/services/ から探してください'"
    }
  }
}

if ($IMPROVEMENTS.Count -gt 0) {
  $FEEDBACK += "`n改善提案:`n" + ($IMPROVEMENTS -join "`n")
}

# Create log entry
$logEntry = [ordered]@{
  timestamp = $TIMESTAMP
  type = "prompt"
  prompt_type = $PROMPT_TYPE
  prompt = $PROMPT
  char_count = $CHAR_COUNT
  word_count = $WORD_COUNT
  length_score = $LENGTH_SCORE
  specificity_score = $SPECIFICITY_SCORE
  clarity_score = $CLARITY_SCORE
  total_score = $TOTAL_SCORE
  feedback = $FEEDBACK
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
  Write-Host "プロンプトスコア: $TOTAL_SCORE/10 - $FEEDBACK" -ForegroundColor Yellow
}

exit 0
