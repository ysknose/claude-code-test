#!/bin/bash
# 実行結果採点スクリプト
# ツール実行結果を評価してスコアを記録

TOOL_NAME="${CLAUDE_TOOL_NAME:-unknown}"
TOOL_OUTPUT="${CLAUDE_TOOL_OUTPUT:-}"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
LOG_FILE=".claude/scoring/execution_scores.jsonl"

# ツール名が不明な場合はスキップ
if [ "$TOOL_NAME" = "unknown" ]; then
  exit 0
fi

# 出力サイズを計算
OUTPUT_SIZE=$(echo -n "$TOOL_OUTPUT" | wc -c)

# スコアリング基準
# 1. 実行成功スコア（1-4点）: エラーメッセージの有無
SUCCESS_SCORE=4
if echo "$TOOL_OUTPUT" | grep -qiE "(error|failed|exception|fatal|warning)"; then
  SUCCESS_SCORE=2
fi
if echo "$TOOL_OUTPUT" | grep -qiE "(fatal|exception|failed)"; then
  SUCCESS_SCORE=1
fi

# 2. 情報量スコア（1-3点）: 出力のサイズ
INFO_SCORE=2
if [ "$OUTPUT_SIZE" -gt 100 ]; then
  INFO_SCORE=3
elif [ "$OUTPUT_SIZE" -lt 10 ]; then
  INFO_SCORE=1
fi

# 3. ツール適切性スコア（1-3点）: ツールの種類に応じた評価
APPROPRIATENESS_SCORE=2
case "$TOOL_NAME" in
  "Read"|"Glob"|"Grep")
    APPROPRIATENESS_SCORE=3
    ;;
  "Edit"|"Write")
    APPROPRIATENESS_SCORE=3
    ;;
  "Bash")
    APPROPRIATENESS_SCORE=2
    ;;
  *)
    APPROPRIATENESS_SCORE=2
    ;;
esac

# 合計スコア（10点満点）
TOTAL_SCORE=$((SUCCESS_SCORE + INFO_SCORE + APPROPRIATENESS_SCORE))

# フィードバックメッセージ
FEEDBACK=""
if [ "$SUCCESS_SCORE" -le 2 ]; then
  FEEDBACK="${FEEDBACK}実行にエラーが含まれています。"
fi
if [ "$INFO_SCORE" -le 1 ]; then
  FEEDBACK="${FEEDBACK}出力が少なすぎます。"
fi
if [ "$TOTAL_SCORE" -ge 9 ]; then
  FEEDBACK="良好な実行結果です。"
fi

# JSON形式でログに記録（出力は最初の200文字のみ記録）
TRUNCATED_OUTPUT=$(echo -n "$TOOL_OUTPUT" | head -c 200)
cat >> "$LOG_FILE" << EOF
{"timestamp":"$TIMESTAMP","type":"execution","tool":"$TOOL_NAME","output_size":$OUTPUT_SIZE,"success_score":$SUCCESS_SCORE,"info_score":$INFO_SCORE,"appropriateness_score":$APPROPRIATENESS_SCORE,"total_score":$TOTAL_SCORE,"feedback":"$FEEDBACK","output_preview":"${TRUNCATED_OUTPUT//\"/\\\"}"}
EOF

# 低スコアの場合は警告を表示（オプション）
if [ "$TOTAL_SCORE" -le 5 ]; then
  echo "⚠️ 実行スコア: $TOTAL_SCORE/10 [$TOOL_NAME] - $FEEDBACK" >&2
fi

exit 0
