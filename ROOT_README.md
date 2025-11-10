# mLodge Hotel Application

A full-stack hotel booking and management system with separate frontend and backend applications.

## Project Structure

This project has been organized into two separate directories:

```
mLodge-Hotel-App/
├── frontend/          # React frontend application
│   ├── src/          # Frontend source code
│   ├── public/       # Static assets
│   ├── package.json  # Frontend dependencies
│   └── vite.config.ts
│
├── backend/          # Express backend API
│   ├── routes/      # API routes
│   ├── services/    # Business logic
│   ├── middleware/  # Express middleware
│   ├── config/      # Configuration files
│   ├── Database/    # SQL scripts
│   ├── scripts/     # Utility scripts
│   ├── package.json # Backend dependencies
│   └── server.ts    # Server entry point
│
└── README.md        # This file
```

## Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn**

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mLodge-Hotel-App
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory (copy from `.env.example`):

```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=mLodge-Hotel

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

ADMIN_EMAIL=Admin@mlodgehotel.co.za
ADMIN_PASSWORD=Admin@mlodgehotel

CORS_ORIGIN=http://localhost:5173
```

Initialize the database:

```bash
npm run init-db
```

Start the backend server:

```bash
npm run dev
```

The backend API will run on `http://localhost:3001`

### 3. Setup Frontend

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Running from Root Directory

You can use the root-level scripts to manage both applications:

```bash
# Install dependencies for both frontend and backend
npm run install:all

# Start both frontend and backend in development mode
npm run dev:all

# Build both applications for production
npm run build:all
```

## Features

### Guest Features
- Browse and search hotel accommodations
- View detailed room information with image galleries
- Book rooms with date selection
- Manage bookings and view booking history
- Leave reviews and ratings
- Save favorite accommodations
- View special offers and promotional codes
- Contact hotel staff via inquiry form

### Admin Features
- **Dashboard**: Overview of bookings, revenue, and analytics
- **Bookings**: Manage all reservations and booking statuses
- **Inventory**: Manage rooms and accommodations
- **Staff**: Staff member management
- **Promo Codes**: Create and manage promotional offers
- **Refunds**: Process refund requests
- **Reviews**: Moderate guest reviews
- **Analytics**: Detailed reports and data visualization
- **Email Templates**: Manage automated email communications
- **Audit Logs**: Track system activities and changes
- **Reports**: Generate custom reports (bookings, revenue, occupancy, guests)

## Technology Stack

### Frontend
- React 19
- TypeScript
- Redux Toolkit (State Management)
- React Router (Routing)
- Tailwind CSS (Styling)
- Vite (Build Tool)
- Axios (HTTP Client)
- Recharts (Data Visualization)

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL (Database)
- JWT (Authentication)
- Bcrypt (Password Hashing)
- Nodemailer (Email Service)
- Helmet (Security)
- Express Rate Limit (API Protection)

## API Documentation

The backend API is RESTful and runs on port 3001 by default.

### Main Endpoints:
- `/api/auth` - Authentication (login, register)
- `/api/accommodations` - Hotel accommodations
- `/api/bookings` - Booking management
- `/api/payments` - Payment processing
- `/api/reviews` - Review management
- `/api/admin` - Admin operations
- `/api/analytics` - Analytics data
- `/api/reports` - Report generation
- `/api/staff` - Staff management
- `/api/promo-codes` - Promotional codes
- `/api/refunds` - Refund processing

## Development

### Backend Development

```bash
cd backend
npm run dev
```

The backend uses `ts-node-dev` for hot reloading during development.

### Frontend Development

```bash
cd frontend
npm run dev
```

The frontend uses Vite's HMR for instant updates.

## Building for Production

### Backend Build

```bash
cd backend
npm run build
npm start
```

### Frontend Build

```bash
cd frontend
npm run build
npm run preview
```

## Database Management

### Initialize Database
```bash
cd backend
npm run init-db
```

### Run Migrations
```bash
cd backend
npm run migrate:rooms
npm run migrate:photos
```

### Test Database Connection
```bash
cd backend
npm run test-db
```

## Environment Variables

### Backend (.env)
- `PORT` - Backend server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `JWT_SECRET` - Secret key for JWT tokens
- `CORS_ORIGIN` - Allowed frontend origin

### Frontend
The frontend reads the API URL from `src/services/api.ts`. Update the base URL if your backend runs on a different port or domain.

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify database credentials in `.env`
- Ensure database exists and is initialized

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check CORS settings in backend
- Verify API base URL in `frontend/src/services/api.ts`

### Port conflicts
- Change backend port in `backend/.env`
- Change frontend port in `frontend/vite.config.ts`

## Documentation

Additional documentation can be found in:
- `ANALYTICS_DOCS.md` - Analytics implementation details
- `PAYMENT_IMPLEMENTATION.md` - Payment system documentation
- `PAYMENT_SECURITY_GUIDE.md` - Payment security guidelines
- `EMAIL_RECEIPTS_AND_BOOKINGS_IMPLEMENTATION.md` - Email system documentation

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Private - All rights reserved

## Support

For support, please contact the development team or create an issue in the repository.
