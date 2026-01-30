---
name: professional-git-workflow
description: Enforces a strict Feature Branch -> Firebase Preview -> Merge workflow. Use this for all code modifications.
---

# Professional Git Workflow

This skill enforces a "Black Belt" CI/CD pipeline where `main` is protected, and all changes are verified via Firebase Hosting previews before merging.

## Critical Rules
1.  **NEVER Commit to Main**: You are strictly prohibited from committing directly to the `main` branch.
2.  **One Branch Per Feature**: Every distinct task must have its own branch (e.g., `feat/dark-mode`, `fix/navbar-spacing`).
3.  **Preview Before Merge**: The user must review the live Firebase Preview URL before the PR is merged.

## Workflow Steps

### 1. START: Create Feature Branch
Before writing any code, create and switch to a new branch.
```bash
git checkout -b feat/your-feature-name
```

### 2. WORK: Implement Changes
- Write code.
- Verify locally (`npm run dev` or `npm run build`).

### 3. FINISH: Push & Notify
When the task is complete:
```bash
git add .
git commit -m "feat: detailed description of changes"
git push -u origin feat/your-feature-name
```
**STOP HERE.**

### 4. HANDOVER: User Review
Notify the user:
> "Changes pushed to `feat/your-feature-name`.
> Please review the Firebase Preview URL on the GitHub Pull Request.
> If satisfied, merge the PR to deploy to production."

## Handling Updates
If the user requests changes during review:
1.  Stay on the same feature branch.
2.  Make changes.
3.  `git add .`
4.  `git commit -m "fix: address review comments"`
5.  `git push` (updates the existing PR/Preview).
