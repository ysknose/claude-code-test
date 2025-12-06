@echo off
set CLAUDE_USER_PROMPT=Test prompt for debugging hooks
set CLAUDE_PROJECT_DIR=C:\dev\claude-code-test
powershell -NoProfile -ExecutionPolicy Bypass -File .claude\scripts\score_prompt.ps1
