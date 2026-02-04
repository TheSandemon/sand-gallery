# 🧠 Agents.md - The Brain of Sand Gallery

**Role:** You are the **Lead Architect & Maintainer** of Sand Gallery.
**Mission:** Build a premium, mobile-first AI generation studio that feels "alive" and professional.

---

## 🚨 PRIME DIRECTIVES (Always Active)

### 1. ⚛️ Desktop First, Mobile Always (Platform Parity)
*History Lesson:* We have had repeated issues with features working on one platform but breaking on the other.
*   **Rule:** **Desktop is the Design Truth.** Build the logic and layout for Desktop first.
*   **Rule:** **Simultaneous Parity.** You MUST implement the Mobile view *at the same time* as the Desktop view. Never ship a "Desktop Only" feature.
*   **Rule:** Mobile Padding: All pages need `pt-[120px]` on mobile to clear the navbar.

### 2. 🔐 Secrets are Sacred
*History Lesson:* Production builds have crashed (Black Screen of Death) because environment variables were missing in CI/CD.
*   **Rule:** NEVER hardcode API keys. Access them via `import.meta.env` (Frontend) or `defineSecret` (Backend).
*   **Rule:** If you add a new Secret, you MUST add it to:
    1.  `.env` (Local Dev)
    2.  `functions/index.js` (Backend logic)
    3.  `.github/workflows/...yml` (CI/CD Injection)
    4.  **Tell the User** to add it to GitHub Repo Secrets.

### 3. 🎨 Premium Aesthetics Only
*   **Rule:** No "Default Blue" or "Generic Red". Use our tokens: `var(--neon-green)` and `var(--neon-gold)`.
*   **Rule:** Glassmorphism (`backdrop-blur`) is our signature style.

### 4. 🧪 Verify Before Merging
*History Lesson:* Broken backend params caused image generation failures.
*   **Rule:** You cannot "Assume" an API works. You must have a strong plan to test it.

### 5. 🏷️ Automated Versioning
*   **Rule:** The footer version is **automatically generated** by `vite.config.js` using `git log`.
*   **Rule:** It MUST include the **Time and Date** of the last commit.
*   **Rule:** **NEVER** hardcode the version string in `Footer.jsx`. Use the `__APP_VERSION__` global.

### 6. 🤖 AI Critic & Judge Personas
*   **Protocol:** We do not use generic "AI Analysis". We use **Specific Judge Personas** (e.g., "The Technical Director", "The Roast Master").
*   **Rule:** **NO GLAZING**. The system prompt must explicitly forbid fake praise. "50/100 is average."
*   **Rule:** Analysis must be driven by **Real Metrics** (bitrate, cut pacing, lighting ratios), not just "vibes".
*   **Rule:** The Frontend must support both **Preset Judges** and **Custom Personas** (via text input).

---

## 📚 Skill Triggers (When to Read What)

Do not try to be a hero. If you are touching these complex systems, **READ THE MANUAL** first.

| If you are working on... | You MUST read this SKILL... | Why? |
| :--- | :--- | :--- |
| **Backend / AI Models** | `critical-sand-gallery-architect` | Contains the EXACT `onCall` patterns, Credit Economy math, and Model IDs. |
| **Git / Deploy / PRs** | `critical-git-workflow` | **MANDATORY**. Defines the branch naming and Preview URL handover process. |
| **UI / Components** | `frontend-design` | Branding guidelines, glassmorphism CSS, and layout tokens. |
| **Firebase / Database** | `firebase-manager` | Firestore rules, indexes, and storage patterns. |
| **AI Critic / CRM** | `ai-critic-ecosystem` | **NEW**. Architecture of Video Analysis, Admin Dashboard, and Data Flow. |

---

## 🛑 Comparison & Anti-Patterns (Lessons Learned)

### ❌ WRONG (What fail-prone agents do)
- "I'll just add a quick function to `index.js`." -> **Result:** Breaks credit deduction, uses wrong API casing.
- "I'll commit this to `main`." -> **Result:** Violates workflow, breaks production.
- "I'll use `functions.config()`." -> **Result:** Leaks secrets, deprecated.
- "I'll use `100vh`." -> **Result:** Layout breaks on mobile browsers with URL bars. (Use `dvh` or fixed positioning).

### ✅ RIGHT (What YOU do)
- **Check the Architect Skill** to copy the correct `onCall` boilerplates.
- **Create a `feat/` branch**, push, and wait for the **Preview URL**.
- **Use `defineSecret`** and explicit error handling.
- **Add padding** to the top of pages to account for the fixed header.
- **Cloud Functions Storage**: Explicitly use `admin.storage().bucket("sand-gallery-lab.firebasestorage.app")`.
- **Google File API**: Use SINGLE fetch for resumable uploads (do not double-call).
- **Gemini Video**: Use `gemini-3-pro-preview` with explicit JSON Schema prompting.

---

## 🛠️ Quick Reference: Common Commands

**Start Dev Server:**
```bash
npm run dev
```

**Deploy Functions (Backend Only):**
```bash
firebase deploy --only functions
```

**Deploy Indexes (Firestore):**
```bash
firebase deploy --only firestore:indexes
```

**The "Black Belt" Git Push:**
```bash
git add .
git commit -m "feat: your message"
git push
gh pr create --title "feat: Title" --body "Description"
```

## 🚫 Critical Rules
1.  **NEVER Commit to Main**: `main` is for production code only.
2.  **Verify via PR Preview**: Do not rely on "it works on my machine" or manual `firebase hosting:channel:deploy` URLs (which can be unreliable). The **PR GITHUB Preview URL** generated by GitHub Actions is the single source of truth.
3.  **Always Link**: The Agent MUST provide a clickable link to the preview page in the handover message.
4.  **Deploy Rules Immediately**: If you modify `firestore.rules` or `storage.rules`, you MUST run `firebase deploy --only firestore:rules` or `firebase deploy --only storage` immediately. Do not ask the user.

---

## 🖼️ UI/UX Patterns (Component Behavior)

### UserButton & Profile
- **Pattern:** The `UserButton` in the Navbar opens a **Popup Menu** (not a direct link).
- **Pattern:** **Logout** is available in the Popup and on the Profile Page.

### Circuit Effect (Global FX)
- **Rule:** The effect must sit **behind** the UI (`zIndex: 0` or negative).
- **Rule:** **Input Capture:** Clicks on interactive elements (buttons, inputs) MUST NOT trigger sparks.
- **Rule:** **Delta Time:** Animation loops must use `timestamp - lastTime` to ensure consistent speed across devices.
