# CLAUDE.md - Sand Gallery Project Guide

## Project Overview

**Sand Gallery** is a portfolio website for Kyle Touchet (@Sandemon) - a developer, creative technologist, and AI enthusiast. The site showcases his work across multiple categories including Games, Apps, Tools, Videos, 3D, Images, Audio, and Other.

### Technology Stack
- **Frontend**: React 19 + Vite 7 + Tailwind CSS
- **Backend**: Firebase (Firestore, Storage, Auth, Functions)
- **Web3**: OnchainKit, Wagmi, viem (for wallet connections)
- **Routing**: React Router DOM 7
- **Animations**: Framer Motion 12
- **Icons**: Lucide React
- **Payments**: Stripe

---

## Project Structure

```
sand-gallery/
├── src/
│   ├── components/
│   │   ├── admin/          # Admin components (MediaUploader, CategoryManager)
│   │   ├── cms/            # CMS components (DynamicRenderer, PricingGrid, GalleryGrid)
│   │   ├── gallery/        # Gallery components (MasonryGrid, MediaCard, GalleryExplorer)
│   │   ├── tools/          # Tool components (AudioGenerator)
│   │   ├── AppWrapper.jsx  # App wrapper with layout
│   │   ├── CircuitEffect.jsx  # Background particle effect
│   │   ├── Footer.jsx      # Footer with dynamic versioning
│   │   ├── Hero.jsx        # Hero section component
│   │   ├── MediaViewer.jsx # Media viewer modal
│   │   ├── Navbar.jsx      # Navigation bar (CRITICAL - uses hardcoded whitelist)
│   │   ├── StudioLayout.jsx
│   │   ├── StudioSettings.jsx
│   │   ├── UserButton.jsx  # User avatar + dropdown menu
│   │   └── VideoAnalysis.jsx
│   ├── config/
│   │   ├── models.js       # AI model configurations
│   │   └── wagmi.js        # Wagmi web3 configuration
│   ├── context/
│   │   ├── AuthContext.jsx # Firebase auth + user roles
│   │   ├── StudioContext.jsx
│   │   └── Web3Provider.jsx
│   ├── cms/
│   │   ├── gridConfig.js
│   │   ├── initialData.js  # Default CMS data
│   │   ├── pageRegistry.js
│   │   └── registry.js
│   ├── hooks/
│   │   ├── useDeviceState.js
│   │   ├── useMediaLibrary.js
│   │   ├── usePageContent.js
│   │   └── useSiteSettings.js  # CRITICAL - manages nav links from Firestore
│   ├── pages/
│   │   ├── Home.jsx        # Landing page with Kyle's bio
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   ├── Gallery.jsx     # 8-category gallery (games, apps, tools, videos, 3d, images, audio, other)
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminMedia.jsx  # Media management (3 tabs: Upload, Library, Categories)
│   │   ├── Pricing.jsx     # Credit purchase page
│   │   ├── Profile.jsx     # User profile + credits
│   │   ├── Studio.jsx      # AI generation studio
│   │   ├── CRM.jsx         # AI critic/video analysis
│   │   └── Anthem.jsx
│   ├── App.jsx             # Main routing
│   ├── App.css             # Global styles
│   ├── firebase.js         # Firebase initialization
│   ├── index.css           # Tailwind imports
│   └── main.jsx            # Entry point
├── .env                    # Environment variables
├── firebase.json           # Firebase config
├── firestore.rules         # Firestore security rules
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## Critical Rules for Working on This Project

### 1. Navigation is Hardcoded
The Navbar uses a **whitelist approach** in `src/components/Navbar.jsx`. It does NOT use Firestore settings because of historical flickering issues. If you need to modify navigation:
```javascript
const ALLOWED_LINKS = [
    { label: 'SAND', path: '/' },
    { label: 'GALLERY', path: '/gallery' },
    { label: 'ABOUT', path: '/about' },
    { label: 'CONTACT', path: '/contact' },
];
```
- **PRICING is NOT in nav** - only accessible via the credits button in the UserButton dropdown
- ADMIN appears only for users with `role === 'owner'`

### 2. Footer Uses Dynamic Versioning
The Footer displays a unique timestamp: `vYYYYMMDD-HHMMSS`. This is generated client-side using `useMemo` to ensure uniqueness on every page load.

### 3. Gallery Fetches from Firestore
The Gallery page (`src/pages/Gallery.jsx`) fetches category items from Firestore:
- Collection: `gallery_categories`
- Documents: `{categoryId}` (games, apps, tools, videos, 3d, images, audio, other)
- Structure: `{ items: [{ id, name, description, link }] }`

### 4. Admin Media Management
- Route: `/admin/media`
- Access: Owner role only
- Features:
  - Upload: Drag-drop or URL for images, videos, audio, embeds
  - Library: View all uploaded media
  - Categories: Assign media to gallery categories

### 5. Firestore Site Settings
The `useSiteSettings` hook loads from `config/site_settings` in Firestore, but the Navbar **ignores** these settings due to flicker issues. The defaults in the hook are:
```javascript
navLinks: [
    { label: 'SAND', path: '/' },
    { label: 'GALLERY', path: '/gallery' },
    { label: 'ABOUT', path: '/about' },
    { label: 'CONTACT', path: '/contact' },
]
```

---

## Known Issues / Gotchas

1. **Firestore Nav Flicker**: Historically, nav links loaded from Firestore caused a "flash" of incorrect content before rendering correctly. This was solved by hardcoding the whitelist in Navbar.jsx.

2. **Two SAND Links**: Both the logo and SAND nav link go to `/` (the Home/landing page). This is intentional - the landing page contains Kyle's bio.

3. **PRICING Only in Dropdown**: The credits/pricing page is not in the main navigation. It can only be accessed via the UserButton dropdown (click the avatar in the top-right).

4. **GitHub Auth**: Authentication is handled via Firebase Auth (Google GitHub provider).

5. **Studio/CRM are Legacy**: These were part of the original AI studio features but are not actively used in the current portfolio design.

---

## Common Development Tasks

### Running Locally
```bash
cd sand-gallery
npm run dev
```

### Building for Production
```bash
npm run build
```

### Firebase Deployment
```bash
firebase deploy  # Full deployment
firebase deploy --only hosting  # Just frontend
firebase deploy --only functions  # Just backend functions
```

---

## Firestore Collections

| Collection | Purpose |
|------------|---------|
| `users/{uid}` | User profiles with credits, role |
| `config/site_settings` | Site title, nav links (partially deprecated) |
| `gallery_categories/{categoryId}` | Gallery category items |
| `media/{mediaId}` | Uploaded media files |
| `pages/{slug}` | CMS page content |
| `studio_instances` | AI studio instances |

---

## Environment Variables (.env)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_VAPID_KEY=
VITE_STRIPE_PUBLIC_KEY=
VITE_WALLET_CONNECT_PROJECT_ID=
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `Navbar.jsx` | Navigation - uses hardcoded whitelist |
| `Footer.jsx` | Dynamic version timestamp |
| `Gallery.jsx` | 8-category portfolio gallery |
| `AdminMedia.jsx` | Media upload & category management |
| `Home.jsx` | Landing page with Kyle's bio |
| `useSiteSettings.js` | Firestore settings hook (partially deprecated) |
| `AuthContext.jsx` | Authentication & user roles |
| `UserButton.jsx` | Avatar dropdown with credits link |
