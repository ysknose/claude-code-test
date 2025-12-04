---
description: Multi-perspective code review with git diff
---

# Code Review Command

Please perform a comprehensive code review from multiple perspectives.

## Step 1: Get Git Diff

First, run the following commands in parallel to understand the changes:
- `git diff --staged` - Get staged changes
- `git diff` - Get unstaged changes
- `git status` - Check current status

## Step 2: Parallel Expert Review

Launch the following review agents **in parallel** (all in a single message with multiple Task tool calls). Each agent should analyze the git diff from their specialized perspective:

### 1. Frontend Review Agent
**Use the `frontend-reviewer` custom subagent**

"Use the frontend-reviewer subagent to perform a detailed frontend code review."

### 2. Backend Review Agent
**Use the `backend-reviewer` custom subagent**

"Use the backend-reviewer subagent to perform a detailed backend code review."

### 3. Security Review Agent
**Use the `security-reviewer` custom subagent**

"Use the security-reviewer subagent to perform a detailed security code review."

### 4. Performance Review Agent
**Use the `performance-reviewer` custom subagent**

"Use the performance-reviewer subagent to perform a detailed performance code review."

### 5. Infrastructure/DevOps Review Agent
**Use the `devops-reviewer` custom subagent**

"Use the devops-reviewer subagent to perform a detailed DevOps and infrastructure code review."

## Step 3: Consolidate Results

After all agents complete their reviews, provide:

1. **Summary of Changes** - Brief overview of what was changed
2. **Critical Issues** - High-priority problems that must be fixed
3. **Warnings** - Medium-priority issues to consider
4. **Suggestions** - Nice-to-have improvements
5. **Positive Highlights** - Good practices worth noting

Format each finding with:
- [Category] Issue title
- File location and line numbers
- Explanation of the issue
- Suggested fix or improvement

## Step 4: Save Results to File

**IMPORTANT: Save the consolidated review results to a file**

Create the directory `.claude/review-results/` if it doesn't exist, then save the complete review results to:
```
.claude/review-results/review-YYYY-MM-DD-HHMMSS.md
```

Use the current timestamp for the filename. The file should contain:
- Review metadata (date, commit hash, branch)
- All consolidated review results
- Summary statistics (number of Critical/Warning/Suggestion issues)

After saving, inform the user of the file path.

## Important Instructions

- Run all review agents in **parallel** by using multiple Task tool calls in a single message
- Wait for all agents to complete before consolidating results
- Each agent should receive the full git diff output
- Prioritize findings by severity: Critical > Warning > Suggestion
- Include code snippets in findings when helpful
- If no changes are detected (clean working tree), inform the user
- **Always save the final results to a Markdown file in `.claude/review-results/`**
