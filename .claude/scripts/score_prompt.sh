#!/bin/bash
# プロンプト採点スクリプト
# ユーザープロンプトを評価してスコアを記録

PROMPT="${CLAUDE_USER_PROMPT:-}"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
LOG_FILE=".claude/scoring/prompt_scores.jsonl"

# プロンプトが空の場合はスキップ
if [ -z "$PROMPT" ]; then
  exit 0
fi

# 文字数と単語数を計算
CHAR_COUNT=$(echo -n "$PROMPT" | wc -m)
WORD_COUNT=$(echo "$PROMPT" | wc -w)

# スコアリング基準
# 1. 長さスコア（1-4点）: 10-500文字が最適
LENGTH_SCORE=1
if [ "$CHAR_COUNT" -ge 10 ] && [ "$CHAR_COUNT" -le 500 ]; then
  LENGTH_SCORE=4
elif [ "$CHAR_COUNT" -gt 500 ] || [ "$CHAR_COUNT" -lt 10 ]; then
  LENGTH_SCORE=2
fi

# 2. 具体性スコア（1-3点）: キーワードの存在をチェック
SPECIFICITY_SCORE=1
if echo "$PROMPT" | grep -qiE "(作成|実装|修正|追加|削除|変更|リファクタ|テスト|デプロイ|create|implement|fix|add|delete|change|refactor|test|deploy)"; then
  SPECIFICITY_SCORE=$((SPECIFICITY_SCORE + 1))
fi
if echo "$PROMPT" | grep -qE "[\.\/]"; then
  SPECIFICITY_SCORE=$((SPECIFICITY_SCORE + 1))
fi

# 3. 明確さスコア（1-3点）: 疑問符や複数の指示があるかチェック
CLARITY_SCORE=3
if echo "$PROMPT" | grep -qE "\?"; then
  CLARITY_SCORE=2
fi
if [ "$WORD_COUNT" -lt 3 ]; then
  CLARITY_SCORE=1
fi

# 合計スコア（10点満点）
TOTAL_SCORE=$((LENGTH_SCORE + SPECIFICITY_SCORE + CLARITY_SCORE))

# フィードバックメッセージ
FEEDBACK=""
if [ "$LENGTH_SCORE" -le 2 ]; then
  FEEDBACK="${FEEDBACK}プロンプトの長さを調整してください。"
fi
if [ "$SPECIFICITY_SCORE" -le 2 ]; then
  FEEDBACK="${FEEDBACK}具体的な指示やファイルパスを含めるとより良いです。"
fi
if [ "$CLARITY_SCORE" -le 2 ]; then
  FEEDBACK="${FEEDBACK}より明確な指示を心がけてください。"
fi

# JSON形式でログに記録
cat >> "$LOG_FILE" << EOF
{"timestamp":"$TIMESTAMP","type":"prompt","prompt":"${PROMPT//\"/\\\"}","char_count":$CHAR_COUNT,"word_count":$WORD_COUNT,"length_score":$LENGTH_SCORE,"specificity_score":$SPECIFICITY_SCORE,"clarity_score":$CLARITY_SCORE,"total_score":$TOTAL_SCORE,"feedback":"$FEEDBACK"}
EOF

# 低スコアの場合は警告を表示（オプション）
if [ "$TOTAL_SCORE" -le 5 ]; then
  echo "⚠️ プロンプトスコア: $TOTAL_SCORE/10 - $FEEDBACK" >&2
fi

exit 0
