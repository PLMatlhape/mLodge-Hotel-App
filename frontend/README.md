# mLodge Hotel - Frontend

React-based frontend application for the mLodge Hotel booking system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
   - The frontend connects to the backend API
   - Default backend URL: `http://localhost:3001/api`
   - Configure in `src/services/api.ts` if needed

## Available Scripts

- `npm run dev` - Start development server (runs on http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Recharts** - Data visualization

## Project Structure

```
src/
├── assets/          # Images, icons, and static assets
├── components/      # Reusable UI components
│   ├── ui/         # Base UI components
│   └── shared/     # Shared components
├── Pages/          # Page components
│   ├── admin/      # Admin dashboard pages
│   └── Client/     # Client dashboard pages
├── services/       # API and external services
├── store/          # Redux store and slices
├── lib/            # Utility functions
├── App.tsx         # Main app component
└── main.tsx        # Application entry point
```

## Features

### Guest Features
- Browse hotel rooms and accommodations
- View room details with images and amenities
- Book rooms with date selection
- Manage bookings
- Leave reviews
- Favorite accommodations
- View special offers and events

### Admin Features
- Dashboard with analytics
- Booking management
- Room inventory management
- Staff management
- Promo code management
- Refund processing
- Review moderation
- Email template management
- Audit logs
- Report generation

## Development

The application uses Vite for fast development with Hot Module Replacement (HMR).

To start development:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Environment Configuration

Make sure the backend server is running on `http://localhost:3001` or update the API base URL in `src/services/api.ts`.
