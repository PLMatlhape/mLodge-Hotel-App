# mLodge Hotel App - Restructured Application

## Overview
Complete hotel management application with client-facing features and admin dashboard.

## Project Structure

```
src/
├── components/
│   ├── shared/          # Reusable components across the app
│   │   ├── Button.tsx   # Customizable button with variants
│   │   ├── Input.tsx    # Form input with labels and error states
│   │   ├── Card.tsx     # Card container component
│   │   └── Modal.tsx    # Modal/dialog component
│   ├── ui/              # Admin UI components (shadcn-style)
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── button.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── label.tsx
│   │   ├── badge.tsx
│   │   └── dropdown-menu.tsx
│   ├── Navigation.tsx   # Site navigation header
│   ├── Footer.tsx       # Site footer
│   └── AdminLayout.tsx  # Admin dashboard layout with sidebar
├── Pages/
│   ├── Home.tsx         # Landing page
│   ├── Login.tsx        # Login page with credential routing
│   ├── Offers.tsx       # Special offers section
│   ├── HottestRooms.tsx # Room showcase section
│   ├── Events.tsx       # Events section
│   ├── Client/
│   │   ├── Dashboard.tsx    # Client room browsing
│   │   └── RoomDetails.tsx  # Room details modal
│   └── admin/
│       ├── AdminDashboard.tsx  # Main admin router
│       ├── Overview.tsx        # Dashboard overview
│       ├── BookingsNew.tsx     # Bookings management
│       ├── Staff.tsx           # Staff management
│       ├── ReviewModeration.tsx
│       ├── PromoCodes.tsx
│       ├── Reports.tsx
│       ├── Refunds.tsx
│       ├── Inventory.tsx
│       ├── Inquiries.tsx
│       ├── EmailTemplates.tsx
│       ├── Bookings.tsx
│       ├── AuditLogs.tsx
│       └── Analytics.tsx
├── lib/
│   └── toast.ts         # Custom toast notification system
└── App.tsx              # Main routing component

```

## Routing Structure

### Client Routes
- `/` - Home page (landing)
- `/login` - Login page
- `/dashboard` - Client room browsing dashboard

### Admin Routes
- `/admin/overview` - Admin dashboard (requires Admin@mlodgehotel.co.za login)
- All admin routes use AdminLayout wrapper with sidebar navigation

## Authentication

### Client Login
- Email: Any email
- Password: Any password
- Routes to: `/dashboard`

### Admin Login
- Email: `Admin@mlodgehotel.co.za`
- Password: `Admin@mlodgehotel`
- Routes to: `/admin/overview`

## Component Reusability

### Shared Components (`/components/shared/`)
These components are designed for maximum reusability across both client and admin interfaces:

#### Button Component
- **Props**: variant (primary, secondary, outline, danger), size (sm, md, lg), fullWidth
- **Usage**: Consistent button styling across the app
- **Example**:
  ```tsx
  <Button variant="primary" size="lg" fullWidth>
    Book Now
  </Button>
  ```

#### Input Component
- **Props**: label, error, icon, all standard input props
- **Usage**: Form inputs with consistent styling
- **Example**:
  ```tsx
  <Input
    label="Email"
    type="email"
    placeholder="Enter your email"
    error={emailError}
  />
  ```

#### Card Component
- **Props**: children, className, onClick, hoverable
- **Usage**: Container for content sections
- **Example**:
  ```tsx
  <Card hoverable onClick={() => viewDetails(room)}>
    <img src={room.image} alt={room.name} />
    <h3>{room.name}</h3>
  </Card>
  ```

#### Modal Component
- **Props**: isOpen, onClose, title, children, size
- **Usage**: Dialogs and overlays
- **Example**:
  ```tsx
  <Modal isOpen={showDetails} onClose={() => setShowDetails(false)} title="Room Details" size="lg">
    <RoomDetailsContent />
  </Modal>
  ```

### UI Components (`/components/ui/`)
Specialized components for admin dashboard (shadcn-style):
- Card, Input, Button, Select, Dialog, Label, Badge, DropdownMenu
- These follow shadcn/ui API conventions for admin interface consistency

## Color Palette
- **Primary Navy**: `#001F3F`
- **Dark Navy**: `#001C43`
- **Primary Blue**: `#0056D2`
- **Button Blue**: `#0F51AF`
- **Success Green**: `#00CD07`
- **Gray**: `#D9D9D9`

## Admin Dashboard Features

### Sidebar Navigation
- Dashboard Overview
- Bookings Management
- Staff Management
- Reviews Moderation
- Promo Codes
- Reports
- Refunds
- Collapsible sidebar
- Logout functionality

### Overview Page
- Key statistics (bookings, revenue, guests, occupancy, ratings)
- Booking trends chart (Line chart)
- Revenue chart (Bar chart)
- Recent bookings table

### Bookings Page
- Search and filter functionality
- Status management (Confirmed, Pending, Cancelled, Completed)
- Edit booking details
- Toast notifications for actions

### Staff Page
- Staff member management
- Role assignment (Manager, Receptionist, Housekeeping, Maintenance)
- Add/Edit/Remove functionality
- Contact information management

## Technology Stack
- **React** 19.1.1 + TypeScript
- **Vite** 7.1.7 (Build tool)
- **Tailwind CSS** 3.4.1 (Styling)
- **lucide-react** (Icons for admin)
- **recharts** (Charts for admin dashboard)
- **Custom routing** (No react-router-dom, pathname-based)

## Composition Pattern in App.tsx

The App.tsx follows a simple routing composition pattern:

```tsx
function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  // Route matching
  if (currentPath === '/login') return <Login />
  if (currentPath.startsWith('/admin')) return <AdminDashboard />
  if (currentPath === '/dashboard') return <Dashboard />
  return <Home />
}
```

This allows for:
1. **Clear route hierarchy**
2. **Easy route additions**
3. **Component-based composition**
4. **No external routing library dependency**

## Key Improvements Made

### 1. Component Reusability
- Created shared component library (`/components/shared/`)
- Standardized props and styling
- Consistent API across components

### 2. Admin Integration
- Fixed all import paths for UI components
- Replaced sonner toast with custom toast system
- Created AdminLayout wrapper for consistent admin UI
- Implemented credential-based routing

### 3. Routing Structure
- Clear separation between client and admin routes
- Credential detection in Login component
- Single routing logic in App.tsx

### 4. Code Organization
- Logical folder structure
- Separation of concerns (client vs admin)
- Shared utilities (toast, UI components)

## Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Future Enhancements
1. Add React Router for more advanced routing features
2. Implement proper authentication with JWT
3. Connect to real backend API
4. Add state management (Redux/Zustand)
5. Implement more admin pages (Analytics, Inventory, etc.)
6. Add form validation library (React Hook Form + Zod)
7. Implement real-time updates (WebSocket)
8. Add unit and integration tests

## Notes
- All toast notifications use custom toast system in `/lib/toast.ts`
- Admin dashboard requires lucide-react and recharts packages
- UI components in `/components/ui/` are optimized for admin dashboard
- Shared components in `/components/shared/` can be used anywhere in the app
- Login credentials are hardcoded for demo purposes
