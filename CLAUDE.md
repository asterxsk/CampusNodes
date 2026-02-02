# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Location

**All projects MUST be created in:** `C:/Users/prithish/Desktop/main/pproj/`

This is the designated workspace directory. Do not create projects elsewhere.

## Project Overview

**Campus Nodes** - A student connection platform combining a marketplace with a real-time social network.
- **Stack:** React 19, Vite, Tailwind CSS, Supabase
- **3D Features:** Three.js via React Three Fiber
- **Animation:** Framer Motion, Anime.js
- **Current Version:** 7.9.5 (see `package.json` and `src/components/ui/VersionBanner.jsx`)

## Common Commands

```bash
# Development
npm run dev              # Start Vite dev server (http://localhost:5173)

# Build & Deploy
npm run build            # Production build to dist/
npm run preview          # Preview production build locally
npm run deploy           # Deploy to GitHub Pages (via gh-pages)

# Code Quality
npm run lint             # Run ESLint
```

## Architecture

### Directory Structure
```
src/
├── components/          # React components
│   ├── chat/           # ChatWidget for messaging
│   ├── hero/           # Hero section, PixelGrid (3D background), Scene3D
│   ├── layout/         # Sidebar, Navbar, CartIcon
│   └── ui/             # UI primitives (Button, Toast, VersionBanner, etc.)
├── context/            # React Context providers
│   ├── AuthContext.jsx # Authentication state
│   ├── CartContext.jsx # Shopping cart state
│   └── UIContext.jsx   # UI state (sidebar, etc.)
├── data/               # Static data (marketItems.js)
├── hooks/              # Custom React hooks
├── lib/                # Utilities
│   ├── supabaseClient.js  # Supabase connection
│   └── encryption.js      # Crypto utilities
├── pages/              # Route components
│   ├── Marketplace.jsx, Services.jsx, Connections.jsx
│   ├── Messages.jsx, Profile.jsx, Settings.jsx
│   ├── Login.jsx, Signup.jsx
│   ├── Payment.jsx, ProductDetails.jsx
│   └── index.jsx       # Entry point
```

### Key Patterns
- **Routing:** HashRouter from react-router-dom (GitHub Pages compatible)
- **State:** React Context API (no Redux)
- **Styling:** Tailwind CSS with custom design system
- **3D Background:** PixelGrid component rendered globally, hidden on non-home routes
- **Authentication:** Supabase Auth with email verification

## Deployment Workflow

**Primary:** Vercel (recommended)
**Alternative:** GitHub Pages (legacy)

### Publishing Checklist (follow `publish.md`)
1. **Document:** Update `CHANGES.md` with all changes
2. **Version Sync:** Update version in:
   - `package.json`
   - `src/components/ui/VersionBanner.jsx` (CURRENT_VERSION constant)
   - Add patch notes to VersionBanner's PATCH_NOTES array (keep 4-5 recent)
   - `README.md` version badge
3. **Git Tag:** Create and push tag (triggers GitHub Action)
   ```bash
   git tag v7.9.5
   git push origin main
   git push origin v7.9.5
   ```
4. **Deploy:**
   - Vercel: `vercel --prod`
   - GitHub Pages: `npm run deploy`

## Agent Roles

### Developer
- Use functional components and hooks
- Style with Tailwind CSS
- **Reminder:** When changing features, check if `VersionBanner.jsx` needs a version bump

### QA Engineer
- Trigger: "test", "verify", "check"
- Run `npm run lint` and check for console errors

### DevOps Engineer
- Trigger: "publish", "release", "deploy"
- Follow `publish.md` strictly for release workflow
- Ensure version synchronization across all files before tagging

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```
