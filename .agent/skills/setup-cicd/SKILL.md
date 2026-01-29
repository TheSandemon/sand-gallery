---
name: setup-cicd
description: Automated setup of Firebase Hosting and GitHub Actions CI/CD pipeline for React apps.
---

# Setup CI/CD Pipeline

This skill automates the process of connecting a local React (Vite) app to Firebase Hosting and GitHub Actions for continuous deployment.

## Prerequisites
- Local project with `git` initialized.
- GitHub repository created and linked as remote `origin`.
- Firebase CLI installed and authenticated.
- `gh` CLI tool (optional but recommended).

## Workflow Steps

### 1. Initialize Project (if new)
```bash
npm create vite@latest . -- --template react
npm install
git init
git add .
git commit -m "Initial commit"
```

### 2. Connect to GitHub
```bash
# Create and push to repo
git remote add origin https://github.com/USERNAME/REPO.git
git branch -M main
git push -u origin main
```

### 3. Initialize Firebase
```bash
# Verify project access
firebase projects:list
firebase use <project-id>

# Run initialization (Interactive)
firebase init hosting
```

**Key Inputs for `firebase init hosting`:**
- **Public directory**: `dist`
- **Single-page app**: `Yes`
- **GitHub builds/deploys**: `Yes`
- **Overwrite existing files**: `No` (unless necessary)
- **Build script**: `npm ci && npm run build`
- **Auto-deploy to live**: `Yes`
- **Live branch**: `main`

## Verification
- Run `npm run build` to verify local build.
- Push changes to `main` to trigger the `firebase-hosting-merge.yml` workflow.
- Check GitHub Actions tab for success.
- Verify site availability at the Firebase Hosting URL.
