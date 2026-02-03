---
name: ai-critic-ecosystem
description: Comprehensive documentation for the 'AI Critic' Video Analysis feature and the 'Admin CRM' Dashboard. Covers Logic, Storage, Database, and Admin workflows.
---

# 🤖 AI Critic & Admin CRM Ecosystem

**Target Audience:** Developers working on Video Analysis, Admin Tools, or User Data Management.
**Purpose:** Explains the end-to-end flow of uploading a video, getting a Gemini critique, and managing that data via the Admin Dashboard.

---

## 🏗️ Architecture Overview

The system bridges User Content (Video) with Admin Oversight (CRM) using AI as the intermediary.

```mermaid
graph TD
    User[User Profile] -->|Upload Video| Storage[Firebase Storage]
    Storage -->|Trigger/Call| Function[analyzeVideo (Cloud Function)]
    Function -->|Call| Gemini[Gemini 2.0 Flash/Pro]
    Gemini -->|JSON Critique| Function
    Function -->|Save| Firestore[Firestore: users/uid/video_analyses]
    
    Admin[Admin CRM] -->|Read| Firestore
    Admin -->|Deep Link| Storage
    Admin -->|Deep Link| Console[Firebase Console]
```

---

## 🧩 Key Components

### 1. User Facing: `VideoAnalysis.jsx`
-   **Location**: `src/components/VideoAnalysis.jsx` (Used in `Profile.jsx`).
-   **Functionality**:
    -   **Drag & Drop**: Accepts video files.
    -   **Direct Upload**: Uploads to `user_uploads/{uid}/{timestamp}_{filename}`.
    -   **Callable Function**: Calls `analyzeVideo` immediately after upload success.
    -   **Holographic UI**: Displays the JSON result (Scores 0-100, Critique Text) in a "Glassmorphic" card layout.
    -   **Persistence**: Listens to Firestore `users/{uid}/video_analyses` to show history.

### 2. The Brain: `analyzeVideo` (Backend)
-   **Location**: `functions/index.js`.
-   **Model**: Uses `gemini-2.0-flash` (or Pro) for video understanding.
-   **Process**:
    1.  Receives `storagePath`.
    2.  Generates a **Signed URL** (internal) or uses GenAI File API to pass video to Gemini.
    3.  **Prompt**: "Analyze this film cut. Output JSON with scores (pacing, editing, fx, story) and critical feedback."
    4.  **Storage**: Saves the result to `users/{uid}/video_analyses/{analysisId}`.
    5.  **Metadata**: Adds `timestamp`, `model_used`, and `storage_ref`.

### 3. Admin Facing: `CRM.jsx` (The Dashboard)
-   **Location**: `src/pages/CRM.jsx`.
-   **Route**: `/crm` (Protected: `role == 'owner' || 'admin'`).
-   **Capabilities**:
    -   **User Inspector**: Search users by Name/Email/ID.
    -   **Credit Manager**: Manually Add/Grant credits (updates `users/{uid}.credits`).
    -   **Role Manager**: Promote/Demote users.
    -   **History Viewer**: Expands user row to show their *entire* `video_analyses` history.
    -   **Console Links**: Dynamic "Deep Links" to the exact Firestore Document or Storage Bucket location for that user (auto-detects Project ID).

---

## 🔒 Security & Rules

### Firestore (`firestore.rules`)
-   **Admins**: Full Read/Write access to ALL collections.
-   **Users**: Read/Write ONLY their own documents (`users/{uid}`).
-   **Video Analyses**: Users can read their own. Admins can read all.

### Storage (`storage.rules`)
-   **Critical**: Users MUST have permission to upload to `user_uploads/{uid}/*`.
-   **Rule**: `allow write: if request.auth.uid == userId;`
-   **Issue History**: We've had bugs where users got "Permission Denied" on upload. **Always verify `storage.rules` if uploads stall.**

---

## 🛠️ Data Models

### User Document (`users/{uid}`)
```json
{
  "displayName": "Kyle",
  "email": "kyle@example.com",
  "credits": 1250,
  "role": "owner" // or 'admin', 'user'
}
```

### Analysis Document (`users/{uid}/video_analyses/{id}`)
```json
{
  "timestamp": "Timestamp",
  "storagePath": "user_uploads/...",
  "scores": {
    "editing": 85,
    "pacing": 70,
    "fx": 90,
    "storytelling": 60,
    "quality": 88
  },
  "critique": {
    "quality_notes": "Great transitions but the pacing drags in the middle.",
    "editing_notes": "Cut tighter on the action scenes."
  }
}
```

---

## 🚀 Future AI Integration Guide

If you are adding a **New AI Agent** or **Feature** to this ecosystem:

1.  **Frontend**: Use `VideoAnalysis.jsx` as a template for file handling + callable functions.
2.  **Backend**:
    -   Always return **JSON** from the LLM.
    -   Always **Save to Firestore** immediately (don't rely on frontend state).
3.  **Admin**:
    -   Update `CRM.jsx` to display the new data type if you add a new subcollection (e.g., `audio_analyses`).

---

## ⚠️ Troubleshooting

-   **Stuck on "Uploading..."**: Check browser console. 99% of the time this is `storage.rules` blocking the write.
-   **"Analysis Failed"**: Check Cloud Function logs. Gemini might have refused the video (too long/copyright) or the JSON parsing failed.
-   **Admin Access Denied**: Check your `users/{uid}.role` field in Firestore. It must be strictly `owner` or `admin`.
