# Project Architecture Diagram

## 🏗️ Separated Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     mLodge-Hotel-App (Root)                     │
│                                                                 │
│  ┌─────────────────────┐         ┌─────────────────────┐      │
│  │      Frontend       │         │      Backend        │      │
│  │   (React + Vite)    │◄───────►│  (Express + Node)   │      │
│  │                     │  HTTP   │                     │      │
│  │  Port: 5173        │  API    │  Port: 3001        │      │
│  └─────────────────────┘         └─────────────────────┘      │
│           │                               │                     │
│           │                               │                     │
│           ▼                               ▼                     │
│  ┌─────────────────────┐         ┌─────────────────────┐      │
│  │   Browser (User)    │         │    PostgreSQL       │      │
│  │  localhost:5173     │         │   Database Server   │      │
│  └─────────────────────┘         └─────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 Detailed Directory Structure

```
mLodge-Hotel-App/
│
├── frontend/                          ← React Frontend Application
│   ├── src/
│   │   ├── components/               ← UI Components
│   │   │   ├── ui/                   ← Base UI elements
│   │   │   ├── shared/               ← Shared components
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── RoomDialog.tsx
│   │   │
│   │   ├── Pages/                    ← Page Components
│   │   │   ├── admin/                ← Admin pages
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── Analytics.tsx
│   │   │   │   ├── Bookings.tsx
│   │   │   │   ├── Inventory.tsx
│   │   │   │   └── ...
│   │   │   ├── Client/               ← Client pages
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Bookings.tsx
│   │   │   │   ├── Profile.tsx
│   │   │   │   └── ...
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ...
│   │   │
│   │   ├── store/                    ← Redux Store
│   │   │   ├── slices/               ← Redux slices
│   │   │   │   ├── authSlice.ts
│   │   │   │   ├── bookingsSlice.ts
│   │   │   │   ├── roomsSlice.ts
│   │   │   │   └── ...
│   │   │   ├── store.ts
│   │   │   └── hooks.ts
│   │   │
│   │   ├── services/                 ← API Services
│   │   │   ├── api.ts                ← API client
│   │   │   └── paymentService.ts     ← Payment logic
│   │   │
│   │   ├── assets/                   ← Static Assets
│   │   │   ├── icons/
│   │   │   ├── image/
│   │   │   └── Admin icon/
│   │   │
│   │   ├── lib/                      ← Utilities
│   │   │   └── toast.ts
│   │   │
│   │   ├── App.tsx                   ← Main App Component
│   │   ├── main.tsx                  ← Entry Point
│   │   └── index.css
│   │
│   ├── public/                       ← Public Assets
│   ├── package.json                  ← Frontend Dependencies
│   ├── vite.config.ts                ← Vite Configuration
│   ├── tailwind.config.js            ← Tailwind Config
│   ├── tsconfig.json                 ← TypeScript Config
│   ├── index.html                    ← HTML Template
│   └── README.md                     ← Frontend Docs
│
├── backend/                           ← Express Backend API
│   ├── routes/                       ← API Routes
│   │   ├── auth.ts                   ← Authentication
│   │   ├── bookings.ts               ← Bookings API
│   │   ├── accommodations.ts         ← Accommodations
│   │   ├── payments.ts               ← Payment processing
│   │   ├── admin.ts                  ← Admin operations
│   │   ├── analytics.ts              ← Analytics data
│   │   ├── reports.ts                ← Report generation
│   │   └── ...
│   │
│   ├── services/                     ← Business Logic
│   │   └── emailService.ts           ← Email handling
│   │
│   ├── middleware/                   ← Express Middleware
│   │   └── auth.ts                   ← JWT authentication
│   │
│   ├── config/                       ← Configuration
│   │   └── database.ts               ← DB connection
│   │
│   ├── Database/                     ← SQL Scripts
│   │   ├── mLodge-Hotel.sql          ← Schema
│   │   ├── dummy-data.sql            ← Sample data
│   │   └── analytics-enhancement.sql
│   │
│   ├── scripts/                      ← Utility Scripts
│   │   ├── initDatabase.ts           ← DB initialization
│   │   ├── testDatabase.ts           ← DB testing
│   │   └── ...
│   │
│   ├── types/                        ← TypeScript Types
│   │   └── index.ts
│   │
│   ├── server.ts                     ← Server Entry Point
│   ├── package.json                  ← Backend Dependencies
│   ├── tsconfig.json                 ← TypeScript Config
│   ├── .env                          ← Environment Variables
│   └── README.md                     ← Backend Docs
│
├── src/                               ← Original Source (Preserved)
│   └── ...                            (Unchanged)
│
├── ROOT_README.md                     ← Main Documentation
├── ROOT_PACKAGE.json                  ← Workspace Management
├── SEPARATION_GUIDE.md                ← Migration Guide
├── SEPARATION_SUMMARY.md              ← Summary Document
├── QUICK_START.md                     ← Quick Start Guide
└── README.md                          ← Original README
```

---

## 🔄 Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  1. User Interaction                                         │
│     └─► Browser (React App on Port 5173)                   │
│                                                              │
│  2. State Management                                         │
│     └─► Redux Store (Local State)                          │
│                                                              │
│  3. API Call                                                 │
│     └─► Axios → HTTP Request to Backend                    │
│                                                              │
│  4. Backend Processing                                       │
│     └─► Express Server (Port 3001)                         │
│         ├─► Authentication Middleware                       │
│         ├─► Route Handler                                   │
│         └─► Business Logic                                  │
│                                                              │
│  5. Database Operation                                       │
│     └─► PostgreSQL Query                                    │
│         └─► Return Data                                     │
│                                                              │
│  6. Response Flow                                            │
│     └─► Backend → JSON Response                            │
│         └─► Frontend → Update Redux State                  │
│             └─► React Re-render                            │
│                 └─► UI Update                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🌐 API Communication

```
Frontend (Port 5173)                 Backend (Port 3001)
─────────────────                    ─────────────────

┌─────────────────┐                 ┌─────────────────┐
│   React App     │                 │  Express Server │
│                 │                 │                 │
│  ┌───────────┐  │   HTTP/REST    │  ┌───────────┐  │
│  │  API.ts   │──┼────────────────┼─►│  Routes   │  │
│  └───────────┘  │                 │  └───────────┘  │
│       │         │                 │       │         │
│       ▼         │                 │       ▼         │
│  ┌───────────┐  │                 │  ┌───────────┐  │
│  │   Redux   │  │   JSON Data    │  │Middleware │  │
│  │   Store   │◄─┼────────────────┼──│   (JWT)   │  │
│  └───────────┘  │                 │  └───────────┘  │
│       │         │                 │       │         │
│       ▼         │                 │       ▼         │
│  ┌───────────┐  │                 │  ┌───────────┐  │
│  │Components │  │                 │  │ Database  │  │
│  │   (UI)    │  │                 │  │  (Pool)   │  │
│  └───────────┘  │                 │  └───────────┘  │
└─────────────────┘                 └─────────────────┘
```

---

## 🔐 Authentication Flow

```
1. Login Request
   └─► Frontend Form
       └─► POST /api/auth/login
           └─► Backend Auth Route
               └─► Verify Credentials (bcrypt)
                   └─► Generate JWT Token
                       └─► Return Token + User Data

2. Authenticated Request
   └─► Frontend adds JWT to headers
       └─► Authorization: Bearer <token>
           └─► Backend Middleware validates token
               └─► Attach user to request
                   └─► Process request
                       └─► Return protected data
```

---

## 📊 Component Hierarchy (Frontend)

```
App.tsx
│
├─► Navigation.tsx
│
├─► Routes
│   │
│   ├─► Public Routes
│   │   ├─► Home.tsx
│   │   ├─► Login.tsx
│   │   ├─► Register.tsx
│   │   ├─► HottestRooms.tsx
│   │   ├─► Events.tsx
│   │   └─► Contact.tsx
│   │
│   ├─► Client Routes (Protected)
│   │   └─► Dashboard.tsx
│   │       ├─► Bookings.tsx
│   │       ├─► Profile.tsx
│   │       └─► Favourites.tsx
│   │
│   └─► Admin Routes (Protected + Admin)
│       └─► AdminDashboard.tsx
│           └─► AdminLayout.tsx
│               ├─► Overview.tsx
│               ├─► Bookings.tsx
│               ├─► Inventory.tsx
│               ├─► Analytics.tsx
│               ├─► Staff.tsx
│               ├─► PromoCodes.tsx
│               ├─► Refunds.tsx
│               ├─► Reviews.tsx
│               ├─► Reports.tsx
│               └─► ...
│
└─► Footer.tsx
```

---

## 🗄️ Database Schema Overview

```
PostgreSQL Database: mLodge-Hotel
│
├─► users                (User accounts)
├─► accommodations       (Hotel properties)
├─► rooms               (Room inventory)
├─► room_photos         (Room images)
├─► bookings            (Reservations)
├─► payments            (Payment records)
├─► reviews             (Guest reviews)
├─► amenities           (Hotel amenities)
├─► promo_codes         (Discount codes)
├─► refunds             (Refund requests)
├─► inquiries           (Contact inquiries)
├─► email_templates     (Email templates)
├─► audit_logs          (System logs)
├─► reports             (Generated reports)
└─► favourites          (User favorites)
```

---

## 🚀 Deployment Architecture

```
Production Deployment Options:

┌─────────────────────────────────────────────────────┐
│                                                     │
│  Frontend Hosting (Choose One):                    │
│  ├─► Vercel        (Recommended)                   │
│  ├─► Netlify       (Alternative)                   │
│  ├─► AWS S3 + CloudFront                          │
│  └─► DigitalOcean Static                          │
│                                                     │
│  Backend Hosting (Choose One):                     │
│  ├─► Railway       (Recommended)                   │
│  ├─► Heroku        (Alternative)                   │
│  ├─► DigitalOcean Droplet                         │
│  └─► AWS EC2                                       │
│                                                     │
│  Database Hosting:                                  │
│  ├─► Railway PostgreSQL (Recommended)             │
│  ├─► Heroku Postgres                               │
│  ├─► AWS RDS                                       │
│  └─► DigitalOcean Managed Database                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Technology Stack Breakdown

### Frontend Stack
```
React 19.1.1          ─► UI Framework
TypeScript 5.9.3      ─► Type Safety
Redux Toolkit 2.9.2   ─► State Management
React Router 7.9.5    ─► Routing
Vite 7.1.7           ─► Build Tool
Tailwind CSS 3.4.1    ─► Styling
Axios 1.13.1         ─► HTTP Client
Recharts 3.3.0       ─► Data Visualization
```

### Backend Stack
```
Node.js + Express 4.18.2  ─► Server Framework
TypeScript 5.9.3         ─► Type Safety
PostgreSQL (pg 8.11.3)    ─► Database
JWT 9.0.2               ─► Authentication
Bcrypt 6.0.0            ─► Password Hashing
Nodemailer 6.9.15        ─► Email Service
Helmet 7.1.0            ─► Security
Express Rate Limit 7.1.5  ─► API Protection
```

---

This architecture provides a clear separation of concerns, enabling:
- Independent development and deployment
- Better scalability and performance
- Easier maintenance and debugging
- Flexible hosting options
- Clear team responsibilities
