# MedCare Monorepo Architecture

## Overview

This project has been restructured into a **monorepo** with clean separation of concerns:

- **Frontend**: Pure React + Vite (no server-side rendering)
- **Backend**: Next.js API routes only (REST API)
- **Shared**: TypeScript types and utilities

## Getting Started

### Quick Start

```bash
# Install all dependencies
npm install

# Run frontend and backend concurrently
npm run dev
```

### Run Separately

**Frontend only** (port 3000):
```bash
cd packages/frontend
npm run dev
```

**Backend only** (port 3001):
```bash
cd packages/backend
npm run dev
```

## Architecture

### Frontend (`packages/frontend/`)
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **API Communication**: Axios with interceptors
- **State**: React Context + Hooks

### Backend (`packages/backend/`)
- **Framework**: Next.js 16
- **Port**: 3001
- **API Routes**: `/src/app/api/**`
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication

### Frontend → Backend Communication

Frontend makes requests to backend via:
```typescript
// In frontend code
const response = await fetch('/api/medicines')
// Proxied to: http://localhost:3001/api/medicines
```

Configured in `packages/frontend/vite.config.ts`:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true
  }
}
```

## Environment Variables

Create `.env.local` in `packages/backend/`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

## Build & Deploy

```bash
# Build all packages
npm run build

# Results in:
# - packages/frontend/dist/ (static files)
# - packages/backend/.next/ (Next.js build)
```

## Project Structure

```
packages/
├── frontend/
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── context/      # React Context (Auth, etc.)
│   │   ├── lib/          # Utilities (API client, etc.)
│   │   ├── App.tsx       # Root component
│   │   └── main.tsx      # Entry point
│   ├── index.html        # HTML template
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── app/
│   │   │   └── api/      # API routes
│   │   └── lib/          # Firebase config
│   ├── next.config.js
│   └── package.json
└── shared/
    ├── src/
    │   ├── types.ts      # Shared TypeScript types
    │   └── index.ts      # Exports
    └── package.json
```

## Common Tasks

### Add a new page to frontend
```bash
# Create new route in packages/frontend/src/pages/YourPage.tsx
# Add route in packages/frontend/src/App.tsx
```

### Add a new API endpoint to backend
```bash
# Create new file: packages/backend/src/app/api/your-endpoint/route.ts
# Call from frontend: fetch('/api/your-endpoint')
```

### Update Firebase config
```bash
# Edit: packages/backend/src/lib/firebase.ts
# Update .env.local with credentials
```

## Notes

- Both frontend and backend run concurrently with `npm run dev`
- Frontend proxies API requests to backend automatically
- Shared types are available to both packages
- No breaking changes from original project structure

---

**Next Step**: Update frontend pages and backend API routes incrementally! 🚀
