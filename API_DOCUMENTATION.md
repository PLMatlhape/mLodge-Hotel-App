# 🚀 Hotel Booking API - Complete Documentation

## 📋 Table of Contents
- [API Endpoints](#api-endpoints)
- [Project Summary](#project-summary)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)

---

## 🔗 API Endpoints

### 🔐 Authentication Endpoints
**Base URL:** `/api/auth`

| Method | Endpoint | Description | Access | Request Body |
|--------|----------|-------------|--------|--------------|
| POST | `/register` | Register new user | Public | `{ email, name, password, phone? }` |
| POST | `/login` | User login | Public | `{ email, password }` |
| GET | `/me` | Get current user profile | Private | - |
| POST | `/logout` | Logout user | Private | - |

**Example Request:**
```json
// POST /api/auth/register
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123",
  "phone": "+27123456789"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

---

### 🏨 Accommodation Endpoints
**Base URL:** `/api/accommodations`

| Method | Endpoint | Description | Access | Query Parameters |
|--------|----------|-------------|--------|------------------|
| GET | `/` | Search accommodations | Public | `city`, `country`, `min_price`, `max_price`, `star_rating`, `amenities`, `page`, `limit` |
| GET | `/:id` | Get accommodation details | Public | - |
| POST | `/` | Create accommodation | Private (Owner/Admin) | Accommodation data |
| PUT | `/:id` | Update accommodation | Private (Owner/Admin) | Accommodation data |
| DELETE | `/:id` | Delete accommodation | Private (Owner/Admin) | - |

**Search Example:**
```
GET /api/accommodations?city=Cape Town&min_price=500&max_price=2000&amenities=wifi,pool&page=1&limit=10
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "accommodations": [
      {
        "id": "uuid",
        "name": "Luxury Hotel Cape Town",
        "description": "5-star hotel with ocean views",
        "address": "123 Beach Road",
        "city": "Cape Town",
        "country": "South Africa",
        "price_per_night": 1500,
        "star_rating": 5,
        "amenities": ["wifi", "pool", "gym", "spa"],
        "images": ["url1", "url2"],
        "rooms_available": 10
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  }
}
```

---

### 📅 Booking Endpoints
**Base URL:** `/api/bookings`

| Method | Endpoint | Description | Access | Request Body |
|--------|----------|-------------|--------|--------------|
| GET | `/` | Get user's bookings | Private | Query: `status`, `page`, `limit` |
| GET | `/:id` | Get booking details | Private | - |
| POST | `/` | Create new booking | Private | Booking data |
| PUT | `/:id/status` | Update booking status | Private | `{ status }` |
| DELETE | `/:id` | Cancel booking | Private | `{ reason? }` |
| GET | `/stats` | Booking statistics | Private (Admin) | Query: `start_date`, `end_date` |

**Create Booking Example:**
```json
// POST /api/bookings
{
  "accommodation_id": "uuid",
  "checkin_date": "2025-11-01",
  "checkout_date": "2025-11-05",
  "guest_count": 2,
  "rooms": [
    {
      "room_id": "uuid",
      "quantity": 1
    }
  ],
  "notes": "Late check-in required"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "confirmation_code": "ABC12345",
    "status": "pending",
    "total_amount": 6000,
    "currency": "ZAR",
    "checkin_date": "2025-11-01",
    "checkout_date": "2025-11-05",
    "accommodation": {
      "name": "Luxury Hotel",
      "address": "123 Beach Road",
      "city": "Cape Town"
    },
    "items": [
      {
        "room_name": "Deluxe Suite",
        "quantity": 1,
        "price_per_night": 1500,
        "nights": 4,
        "subtotal": 6000
      }
    ]
  }
}
```

---

### 💳 Payment Endpoints
**Base URL:** `/api/payments`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/create-intent` | Create payment intent | Private |
| POST | `/verify/:id` | Verify payment | Private |
| POST | `/refund/:id` | Refund payment | Private (Admin) |
| GET | `/:id` | Get payment details | Private |
| GET | `/user/:userId` | Get user payments | Private |
| POST | `/webhook/stripe` | Stripe webhook | Public (Verified) |
| POST | `/webhook/paypal` | PayPal webhook | Public (Verified) |
| POST | `/webhook/flutterwave` | Flutterwave webhook | Public (Verified) |

**Create Payment Intent:**
```json
// POST /api/payments/create-intent
{
  "booking_id": "uuid",
  "provider": "stripe"
}
```

**Supported Payment Providers:**
- **Stripe** - Card payments
- **PayPal** - PayPal account payments
- **Flutterwave** - African payment methods

---

### 👤 User Endpoints
**Base URL:** `/api/users`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/profile` | Get user profile | Private |
| PUT | `/profile` | Update user profile | Private |
| PUT | `/password` | Change password | Private |
| DELETE | `/account` | Delete account | Private |

---

### 👨‍💼 Admin Endpoints
**Base URL:** `/api/admin`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/users` | Get all users | Admin Only |
| GET | `/users/:id` | Get user details | Admin Only |
| PUT | `/users/:id` | Update user | Admin Only |
| DELETE | `/users/:id` | Delete user | Admin Only |
| GET | `/bookings` | Get all bookings | Admin Only |
| GET | `/analytics` | System analytics | Admin Only |
| POST | `/export/bookings` | Export bookings (CSV) | Admin Only |

---

### 🏥 Health Check & Info
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/health` | Basic health check | Public |
| GET | `/api/health` | Detailed health check | Public |
| GET | `/api` | API information | Public |

---

## 📊 Project Summary

### ✅ What's Been Accomplished

#### 🏗️ **1. Enterprise Project Structure**
```
src/
├── app.ts                      # Main application with graceful shutdown
├── config/
│   ├── database.ts            # PostgreSQL with connection pooling
│   └── logger.ts              # Winston multi-transport logging
├── controllers/               # Request handlers (6 controllers)
├── middleware/               
│   ├── auth.ts               # JWT authentication
│   ├── errorHandler.ts       # Global error handling
│   ├── security.ts           # Rate limiting, CSRF, XSS protection
│   └── validation.ts         # Input validation
├── routes/                   # API route definitions
├── services/                 # Business logic layer
│   ├── accommodation.service.ts  # 670 lines - Advanced search
│   ├── auth.service.ts          # Authentication logic
│   ├── booking.service.ts       # 787 lines - Complex booking
│   └── payment.service.ts       # 618 lines - Multi-provider
├── types/
│   └── index.ts              # TypeScript interfaces
└── utils/
    ├── jwt.ts                # JWT token management
    ├── logger.ts             # Professional logging
    └── validators.ts         # Validation schemas
```

#### 🔒 **2. Authentication & Security**
- ✅ JWT-based authentication with refresh tokens
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Role-based access control (User, Owner, Admin)
- ✅ OAuth ready (Google integration)
- ✅ Protected route middleware
- ✅ Optional authentication for public endpoints

#### 🛡️ **3. Security Features**
- ✅ **Rate Limiting**: 100 requests/15min (API), 5 requests/15min (Auth), 10 requests/hour (Payment)
- ✅ **Brute Force Protection**: Exponential backoff
- ✅ **IP Filtering**: Whitelist/blacklist support
- ✅ **CSRF Protection**: Token validation
- ✅ **XSS Protection**: Input sanitization
- ✅ **SQL Injection Prevention**: Parameterized queries
- ✅ **Helmet Security Headers**: 12+ security headers
- ✅ **Request Size Limiting**: 10MB max
- ✅ **Content-Type Validation**: JSON-only APIs

#### 🏨 **4. Accommodation Management**
- ✅ Advanced search with 10+ filters
- ✅ Geospatial queries (location-based)
- ✅ Redis caching (5-minute TTL)
- ✅ Popularity algorithms
- ✅ Bulk operations support
- ✅ Image management (multiple images)
- ✅ Amenities filtering
- ✅ Star rating system

#### 📅 **5. Booking System**
- ✅ Complex availability checking
- ✅ Inventory management with locking
- ✅ Multi-room bookings
- ✅ Date range validation
- ✅ Automatic pricing calculation
- ✅ Booking statuses: pending, confirmed, checked_in, checked_out, cancelled, no_show
- ✅ Cancellation policy (24-hour rule)
- ✅ Automatic refund processing
- ✅ Confirmation code generation
- ✅ Email notifications
- ✅ Booking statistics & analytics

#### 💳 **6. Payment Processing**
- ✅ **Multi-Provider Support**:
  - Stripe (Card payments)
  - PayPal (Account payments)
  - Flutterwave (African methods)
- ✅ Payment intent creation
- ✅ Webhook handling (all providers)
- ✅ Payment verification
- ✅ Refund processing
- ✅ Transaction analytics
- ✅ Secure payment logs (90-day retention)

#### 🗄️ **7. Database Layer**
- ✅ PostgreSQL with optimized pooling
  - 50 max connections
  - 10 min connections
  - 30s idle timeout
- ✅ Query retry logic (3 attempts)
- ✅ Transaction support with auto-rollback
- ✅ Batch query execution
- ✅ Prepared statement caching
- ✅ Slow query detection (>1s)
- ✅ Health checks with detailed stats
- ✅ Graceful shutdown with connection draining

#### 📊 **8. Logging & Monitoring**
- ✅ **Winston Logger** with daily rotation
- ✅ **7 Specialized Loggers**:
  - Combined logs (14 days)
  - Error logs (14 days)
  - HTTP logs (14 days)
  - Security logs (30 days)
  - Payment logs (90 days)
  - Audit logs (365 days)
  - Exception/Rejection logs
- ✅ Colored console output
- ✅ Structured JSON logs
- ✅ Performance tracking
- ✅ Request tracing with UUID

#### 🛠️ **9. Error Handling**
- ✅ Global error handler
- ✅ Custom AppError class
- ✅ Async error wrapper
- ✅ Validation error formatting
- ✅ 404 handler
- ✅ Uncaught exception handling
- ✅ Unhandled rejection handling
- ✅ Process warning logging

#### 📝 **10. Validation**
- ✅ Express-validator integration
- ✅ Comprehensive validators:
  - Email validation
  - Password strength (8+ chars, uppercase, lowercase, number)
  - Phone number validation
  - Date range validation
  - Price range validation
  - Required field checks
- ✅ Sanitization middleware
- ✅ Custom validation messages

---

## 🎯 Key Features

### Performance Optimizations
- 🚀 Redis caching strategy
- 🚀 Database connection pooling
- 🚀 Query optimization with indexes
- 🚀 Response compression (gzip)
- 🚀 Batch operations
- 🚀 Pagination support

### Enterprise Features
- 🏢 Multi-tenant ready
- 🏢 Audit trail logging
- 🏢 Analytics & reporting
- 🏢 Data export (CSV)
- 🏢 Scalable architecture
- 🏢 Microservices-ready

### Developer Experience
- 💻 TypeScript with strict mode
- 💻 ES Modules
- 💻 Source maps for debugging
- 💻 Hot reload in development
- 💻 Comprehensive error messages
- 💻 In-code documentation

---

## 🛠️ Technology Stack

### Core Technologies
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.0+
- **Framework**: Express.js 4.18+
- **Module System**: ES Modules (ESNext)

### Database & Caching
- **Database**: PostgreSQL 14+
- **Caching**: Redis 7+
- **ORM**: Direct SQL with pg driver
- **Migrations**: Manual SQL scripts

### Authentication & Security
- **JWT**: jsonwebtoken 9.0+
- **Password Hashing**: bcrypt 5.1+
- **OAuth**: Passport.js (Google)
- **Rate Limiting**: express-rate-limit 7.1+
- **Security Headers**: Helmet 7.1+
- **Input Sanitization**: express-mongo-sanitize, xss-clean

### Payment Integration
- **Stripe**: stripe 14.10+
- **PayPal**: @paypal/checkout-server-sdk 1.0+
- **Flutterwave**: flutterwave-node-v3 1.0+

### Logging & Monitoring
- **Logger**: Winston 3.11+
- **Log Rotation**: winston-daily-rotate-file 4.7+
- **HTTP Logging**: Morgan 1.10+

### Validation & Testing
- **Validation**: express-validator 7.0+
- **Testing**: Jest 29.7+
- **Linting**: ESLint 8.56+

### DevOps
- **Containerization**: Docker & Docker Compose
- **Process Manager**: PM2 (production)
- **Environment**: dotenv 16.3+

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js >= 18.x
PostgreSQL >= 14.x
Redis >= 7.x
npm >= 9.x
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/PLMatlhape/Hotel-API.git
cd Hotel-API
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Setup database**
```bash
# Create PostgreSQL database
createdb hotel_booking_db

# Run migrations (if available)
npm run migrate
```

5. **Start development server**
```bash
npm run dev
```

### Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_booking_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_POOL_MAX=50
DB_POOL_MIN=10

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Payment Providers
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx
FLW_PUBLIC_KEY=xxx
FLW_SECRET_KEY=xxx

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs
LOG_MAX_FILES=14d
LOG_MAX_SIZE=20m
```

### Available Scripts

```bash
# Development
npm run dev              # Start with hot reload
npm run start:dev        # Start with ts-node

# Production
npm run build            # Compile TypeScript
npm start                # Start production server
npm run start:prod       # Start with NODE_ENV=production

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format with Prettier

# Database
npm run migrate          # Run migrations
npm run seed             # Seed database

# Docker
npm run docker:up        # Start containers
npm run docker:down      # Stop containers
```

### Docker Setup

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 📊 Project Statistics

- **Total Endpoints**: 35+
- **Services**: 4 core services
- **Controllers**: 6 controllers
- **Middleware**: 4 middleware layers
- **Lines of Code**: ~5,000+ (organized)
- **TypeScript Interfaces**: 10+
- **Security Layers**: 10+
- **Log Types**: 7 specialized loggers
- **Payment Providers**: 3 (Stripe, PayPal, Flutterwave)
- **Database Connections**: 50 max pool
- **Cache TTL**: 5 minutes (default)

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Rotate JWT secrets** regularly in production
3. **Use strong passwords** for database and Redis
4. **Enable SSL/TLS** in production
5. **Configure CORS** properly for your frontend
6. **Set up rate limiting** based on your needs
7. **Monitor logs** regularly for suspicious activity
8. **Keep dependencies updated** with `npm audit`
9. **Use environment-specific configs** for dev/staging/prod
10. **Implement IP whitelisting** for admin routes

---

## 📈 Performance Tips

1. **Database Indexes**: Create indexes on frequently queried columns
2. **Redis Caching**: Adjust TTL based on data volatility
3. **Connection Pooling**: Tune pool size based on load
4. **Pagination**: Always use pagination for list endpoints
5. **Query Optimization**: Use EXPLAIN to analyze slow queries
6. **Compression**: Enable gzip for all API responses
7. **CDN**: Use CDN for static assets
8. **Load Balancing**: Use multiple instances with PM2 or k8s

---

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify credentials in .env
psql -U postgres -d hotel_booking_db
```

**Redis Connection Failed**
```bash
# Check Redis is running
redis-cli ping

# Should return PONG
```

**Port Already in Use**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

**TypeScript Compilation Errors**
```bash
# Clean build
rm -rf dist/

# Rebuild
npm run build
```

---

## 📚 Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Stripe API Docs](https://stripe.com/docs/api)
- [PayPal API Docs](https://developer.paypal.com/docs/api/overview/)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**PLMatlhape**
- GitHub: [@PLMatlhape](https://github.com/PLMatlhape)

---

## 🎉 Acknowledgments

This is a **production-ready, enterprise-grade Hotel Booking API** with:
- ✅ Comprehensive security
- ✅ Advanced features
- ✅ Professional logging
- ✅ Scalable architecture
- ✅ Clean code structure

Built with ❤️ using TypeScript, Express, PostgreSQL, and Redis.
