# Sand Gallery

A premium portfolio website for Kyle Touchet (@Sandemon) - developer, creative technologist, and AI enthusiast.

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19 + Vite 7 |
| Styling | Tailwind CSS 3.4 |
| Animation | Framer Motion 12 |
| Routing | React Router DOM 7 |
| Backend | Firebase (Firestore, Auth, Storage, Functions) |
| Web3 | OnchainKit, Wagmi, viem |
| Payments | Stripe |

---

## Features

### Pages
- **Home** (`/`) - Landing page with Kyle's bio and title
- **Gallery** (`/gallery`) - 8-category portfolio showcase
- **About** (`/about`) - About page
- **Contact** (`/contact`) - Contact information
- **Pricing** (`/pricing`) - Credit purchase (accessible via user dropdown)
- **Profile** (`/profile`) - User profile and credits balance
- **Admin Dashboard** (`/admin`) - Site management (owner only)
- **Admin Media** (`/admin/media`) - Media upload and category management (owner only)

### Gallery Categories
1. **GAMES** - Interactive experiences
2. **APPS** - Applications
3. **TOOLS** - Utilities and software
4. **VIDEOS** - Visual media
5. **3D** - 3D models and VR
6. **IMAGES** - Art and photography
7. **AUDIO** - Music and sound
8. **OTHER** - Miscellaneous

### Admin Features
- Media upload (images, videos, audio, embeds)
- Media library management
- Category assignment (assign media to gallery categories)

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project (for Auth, Firestore, Storage)

### Installation

```bash
# Clone the repository
git clone https://github.com/TheSandemon/sand-gallery.git
cd sand-gallery

# Install dependencies
npm install

# Create .env file with your Firebase config
# See .env.example or Firebase console
```

### Environment Variables

Create a `.env` file with:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_key
VITE_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_id
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build
```

---

## Project Structure

```
sand-gallery/
├── src/
│   ├── components/
│   │   ├── admin/           # MediaUploader, CategoryManager
│   │   ├── cms/            # DynamicRenderer, PricingGrid, GalleryGrid
│   │   ├── gallery/        # MasonryGrid, MediaCard, GalleryExplorer
│   │   ├── tools/          # AudioGenerator
│   │   ├── Navbar.jsx      # Navigation (hardcoded whitelist)
│   │   ├── Footer.jsx      # Dynamic versioning
│   │   ├── UserButton.jsx  # Avatar + dropdown
│   │   └── ...
│   ├── pages/
│   │   ├── Home.jsx        # Landing page
│   │   ├── Gallery.jsx     # 8-category gallery
│   │   ├── AdminMedia.jsx  # Media management
│   │   └── ...
│   ├── hooks/
│   │   ├── useSiteSettings.js
│   │   └── ...
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── Web3Provider.jsx
│   └── ...
├── .env                    # Environment variables
├── firebase.json           # Firebase config
├── firestore.rules         # Database rules
└── package.json
```

---

## Important Notes

### Navigation
The navigation bar uses a **hardcoded whitelist** in `Navbar.jsx` to prevent flickering issues that occurred when loading from Firestore. The current navigation is:
- **SAND** → `/` (landing page)
- **GALLERY** → `/gallery`
- **ABOUT** → `/about`
- **CONTACT** → `/contact`
- **ADMIN** → `/admin` (owner only)

**PRICING is NOT in the main nav** - it can only be accessed via the credits button in the user dropdown menu.

### Footer Version
The footer displays a **dynamic unique version timestamp** (`vYYYYMMDD-HHMMSS`) that changes on every page load. This ensures complete uniqueness for debugging purposes.

### Gallery Data
Gallery categories are hardcoded (8 categories), but the items within each category are fetched from Firestore at runtime. Use the Admin Media page to upload and assign content to categories.

### Firestore Collections

| Collection | Purpose |
|------------|---------|
| `users/{uid}` | User profiles, credits, roles |
| `gallery_categories/{id}` | Category items (games, apps, etc.) |
| `media/{id}` | Uploaded media files |
| `config/site_settings` | Site configuration |

---

## Known Issues / Limitations

1. **Firestore Nav Flicker**: Historically, nav links loaded from Firestore caused visual flicker. This was resolved by hardcoding the navigation in `Navbar.jsx`.

2. **Legacy Features**: The `/studio` and `/crm` routes exist but are legacy AI generation features not currently in active use.

3. **Admin Access**: Only users with `role === 'owner'` can access admin features. Role is set in Firestore under `users/{uid}/role`.

---

## Deployment

### Firebase Hosting
```bash
# Deploy to production
firebase deploy

# Deploy to preview channel
firebase hosting:channel:deploy
```

### GitHub Actions
The repository includes GitHub Actions workflows that:
1. Build the project on push
2. Deploy to Firebase Hosting preview on PR creation
3. Deploy to production on merge to main

---

## License

Private - All rights reserved.

---

## Author

**Kyle Touchet** (@Sandemon)
- Developer, Creative Technologist, AI Enthusiast
- Based in Louisiana, USA

---

## Documentation for Developers

See also:
- [CLAUDE.md](CLAUDE.md) - Detailed developer guide
- [SKILLS.md](SKILLS.md) - Required skills and knowledge areas
