# 🏥 MedCare - Healthcare Medicine Management Platform

A **modern, role-based healthcare management system** for managing medicine inventory, doctor requests, and delivery tracking. Built with Next.js, React, Tailwind CSS, and Firebase for real-time data synchronization.

**🚀 [Live Demo](https://medcare-nine-theta.vercel.app/)** - Try it now!

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

- **Frontend**: [Next.js 16](https://nextjs.org/) with App Router, [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom animations
- **Backend**: [Firebase](https://firebase.google.com/) (Auth, Firestore)
- **State Management**: React Hooks & Context API
- **Deployment Ready**: Vercel optimization

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Firebase project setup

### Installation

```bash
# Clone the repository
git clone https://github.com/Vighnesh64/Medcare.git
cd Medcare

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app locally.

### Live Deployment

Visit the live app: **[medcare-nine-theta.vercel.app](https://medcare-nine-theta.vercel.app/)**

### Environment Setup

Create a `.env.local` file with your Firebase credentials:

```plaintext
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Customer home with featured medicines
│   ├── login/page.tsx        # Authentication portal
│   ├── doctor/page.tsx       # Doctor dashboard
│   ├── admin/page.tsx        # Admin portal
│   ├── delivery/page.tsx     # Delivery staff dashboard
│   ├── components/
│   │   └── RoleGuard.tsx     # Protected route wrapper
│   ├── context/
│   │   └── AuthContext.tsx   # Authentication context
│   └── layout.tsx            # App layout
├── lib/
│   └── firebase.ts           # Firebase configuration
└── globals.css               # Global styles & animations
```

## ✨ Key Highlights

- **Real-Time Updates**: Live medicine inventory and request status via Firestore
- **Modern UI/UX**: Smooth animations, gradient backgrounds, responsive design
- **Accessible**: WCAG-compliant interface suitable for elderly users
- **Secure**: Role-based access control with Firebase Auth
- **Production-Ready**: Optimized for performance with Next.js 16 Turbopack

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

The app is optimized for deployment on [Vercel](https://vercel.com):

```bash
npm run build
npm run start
```

## ‍💻 Author

**Vignesh Das** - Healthcare Innovation Project

---

**Built with ❤️ for better healthcare accessibility**
