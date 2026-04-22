# 🏥 MedCare - Healthcare Medicine Management Platform

A **modern, role-based healthcare management system** for managing medicine inventory, doctor requests, and delivery tracking. Built with React, Vite, Next.js, Tailwind CSS, and Firebase for real-time data synchronization.

**🚀 [Live Demo](https://medcare-nine-theta.vercel.app/)** - Try it now!

## 📦 Monorepo Structure

```
medcare/
├── packages/
│   ├── frontend/          # React + Vite frontend app
│   │   ├── src/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── index.html
│   ├── backend/           # Next.js API routes backend
│   │   ├── src/
│   │   │   ├── app/       # API routes
│   │   │   └── lib/       # Firebase config
│   │   └── package.json
│   └── shared/            # Shared types and utilities
│       ├── src/
│       └── package.json
└── package.json           # Root monorepo config
```

## 🎯 Features

### 👨‍⚕️ **Doctor Portal**
- 🔍 **Search Medicines** - Real-time medicine availability lookup with fuzzy search
- 📋 **Request Medicines** - Submit medicine requests for patients with quantity details
- ✓ **Track Requests** - Monitor request status (Pending, Delivered, etc.)

### 🏢 **Admin Dashboard**
- 📊 Manage medicine inventory
- 👥 User and staff management
- 📈 Request monitoring and fulfillment

### 🚚 **Delivery Staff Portal**
- 📦 View assigned deliveries
- ✓ Track delivery status
- 📱 Real-time location updates (planned)

### 🏪 **Customer Home Page**
- 🏷️ Browse featured medicines
- 🔎 Smart search functionality
- 📱 Responsive elderly-friendly interface
- 🎨 Modern animations and intuitive UX

### 🔐 **Multi-Role Authentication**
- Google Sign-In integration
- Role-based access control (Doctor, Admin, Delivery Staff)
- Secure Firebase authentication
- Automatic role assignment on first login

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling with animations

### Backend
- **Next.js 16** - API routes and backend
- **Firebase** - Authentication & Firestore database
- **CORS** - Cross-origin request handling

### Database
- **Firebase Firestore** - Real-time NoSQL database
- **Firebase Auth** - User authentication

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Vighnesh64/Medcare.git
cd Medcare

# Install dependencies for all packages
npm install

# or if using yarn workspaces
yarn install
```

### Environment Setup

Create a `.env.local` file in the `packages/backend` directory with your Firebase credentials:

```plaintext
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Running Locally

```bash
# Start both frontend and backend in development mode
npm run dev

# Frontend runs on: http://localhost:3000
# Backend API runs on: http://localhost:3001
```

### Building for Production

```bash
npm run build

# Then deploy to your hosting platform
```

## 📁 Package Details

### `packages/frontend`
React + Vite frontend application with:
- Component-based UI with Tailwind CSS
- Client-side routing with React Router
- Authentication context
- API client with axios interceptors
- Responsive design & animations

Run frontend:
```bash
cd packages/frontend
npm run dev
```

### `packages/backend`
Next.js API backend with:
- Firebase integration
- RESTful API routes
- Authentication endpoints
- CORS support

Run backend:
```bash
cd packages/backend
npm run dev
```

### `packages/shared`
Shared TypeScript types and utilities:
- Type definitions for Medicine, User, DoctorRequest
- Reusable utilities
- Exported to both frontend and backend

## ✨ Key Highlights

- **Real-Time Updates**: Live medicine inventory and request status via Firestore
- **Modern UI/UX**: Smooth animations, gradient backgrounds, responsive design
- **Accessible**: WCAG-compliant interface suitable for elderly users
- **Secure**: Role-based access control with Firebase Auth
- **Production-Ready**: Optimized for performance with Next.js & Vite
- **Monorepo Architecture**: Clean separation of concerns with shared types

## 👥 User Roles

1. **Elderly Customer** - Browse and check medicine availability
2. **Doctor** - Request medicines for patients and track orders
3. **Admin** - Manage inventory and oversee operations
4. **Delivery Staff** - Fulfill and track medicine deliveries

## 🔄 Data Flow

```
Customer Home → Search/Browse Medicines
                ↓
            Doctor Login → Request Medicines → Submit
                ↓
        Admin Reviews Requests
                ↓
        Delivery Staff Fulfills
                ↓
            Delivery Complete
```

## 🎨 UI/UX Features

- Gradient color schemes (blue → indigo)
- Smooth fade-in and slide-down animations
- Hover effects on interactive elements
- Mobile-responsive grid layouts
- Color-coded status badges
- Loading spinners and feedback states

## 📊 Firestore Collections

- **medicines** - Medicine inventory with quantity and dosage
- **users** - User profiles with roles
- **doctor_requests** - Medicine requests from doctors
- **deliveries** - Delivery tracking records (planned)

## 🚢 Deployment

### Frontend Deployment (Vercel, Netlify, etc.)
```bash
cd packages/frontend
npm run build
# Deploy the dist/ folder
```

### Backend Deployment (Vercel, Railway, etc.)
```bash
cd packages/backend
npm run build
npm run start
```

### Full Stack Deployment
The entire app is deployed at: **[medcare-nine-theta.vercel.app](https://medcare-nine-theta.vercel.app/)**

## 👨‍💻 Author

**Vignesh Das** - Healthcare Innovation Project

---

**Built with ❤️ for better healthcare accessibility**
