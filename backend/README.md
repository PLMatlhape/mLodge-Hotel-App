# mLodge Hotel - Backend API

Backend server for the mLodge Hotel Application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the database credentials and other settings

3. Initialize the database:
```bash
npm run init-db
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run test-db` - Test database connection
- `npm run migrate:rooms` - Run room fields migration
- `npm run migrate:photos` - Run photos table migration

## Environment Variables

See `.env.example` for required environment variables.

## Database

The backend uses PostgreSQL. Make sure you have PostgreSQL installed and running.

## API Documentation

The API runs on port 3001 by default (configurable via PORT environment variable).

Base URL: `http://localhost:3001/api`

### Main Routes:
- `/api/auth` - Authentication endpoints
- `/api/accommodations` - Hotel accommodations
- `/api/bookings` - Booking management
- `/api/payments` - Payment processing
- `/api/reviews` - Review management
- `/api/admin` - Admin dashboard
- `/api/analytics` - Analytics data
- `/api/reports` - Report generation
