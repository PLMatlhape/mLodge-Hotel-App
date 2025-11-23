# mLodge Hotel App - Production Deployment Guide

## 📋 Overview
Complete guide for deploying the mLodge Hotel application to production.

## 🏗️ Project Structure
```
mLodge-Hotel-App/
├── backend/          # Node.js + Express + PostgreSQL API
├── frontend/         # React + Vite + TypeScript UI
└── Database/         # SQL schema and migrations
```

## ✅ Pre-Deployment Checklist

### 1. Removed Unnecessary Files
- ✅ Test scripts and temporary files deleted
- ✅ Duplicate root configuration files removed
- ✅ Empty directories cleaned up
- ✅ Test reports cleared

### 2. Build Verification
- ✅ Frontend builds successfully (`npm run build`)
- ✅ Backend compiles without errors (`npm run build`)
- ✅ TypeScript errors resolved
- ✅ Image asset imports fixed

### 3. Configuration Files
- ✅ `.gitignore` updated for production
- ✅ Environment variable examples created
- ✅ API URL consistency fixed (all using port 5001)

## 🚀 Deployment Instructions

### Backend Deployment

#### 1. Environment Setup
Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=production

# Database Configuration
DB_HOST=your-production-database-host
DB_PORT=5432
DB_USER=your-database-user
DB_PASSWORD=your-secure-password
DB_NAME=mLodge-Hotel

# Security
JWT_SECRET=your-super-secure-random-jwt-secret-minimum-32-characters
JWT_EXPIRES_IN=7d

# CORS - Set to your frontend domain
CORS_ORIGIN=https://your-frontend-domain.com

# Email Configuration (Optional but recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-app-specific-password
```

#### 2. Install Dependencies
```bash
cd backend
npm install --production
```

#### 3. Build Backend
```bash
npm run build
```

#### 4. Database Setup
1. Create PostgreSQL database named `mLodge-Hotel`
2. Run the main schema:
   ```bash
   psql -U your-user -d mLodge-Hotel -f Database/mLodge-Hotel.sql
   ```
3. Run analytics enhancements:
   ```bash
   psql -U your-user -d mLodge-Hotel -f Database/analytics-enhancement.sql
   ```

#### 5. Start Production Server
```bash
npm start
```

Or use PM2 for process management:
```bash
npm install -g pm2
pm2 start dist/server.js --name "mlodge-backend"
pm2 startup
pm2 save
```

### Frontend Deployment

#### 1. Environment Setup
Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=https://your-backend-api-domain.com/api
```

#### 2. Install Dependencies
```bash
cd frontend
npm install
```

#### 3. Build Frontend
```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

#### 4. Deploy Build

**Option A: Static Hosting (Netlify, Vercel, etc.)**
- Upload the `frontend/dist/` folder
- Configure redirects for SPA routing:
  
  Create `frontend/dist/_redirects`:
  ```
  /*    /index.html   200
  ```

**Option B: Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/mlodge-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Security Checklist

- [ ] Change `JWT_SECRET` to a strong, random string (minimum 32 characters)
- [ ] Update database credentials to secure passwords
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure firewall rules (allow only necessary ports)
- [ ] Set `NODE_ENV=production`
- [ ] Disable database root access from external IPs
- [ ] Configure CORS to only allow your frontend domain
- [ ] Enable rate limiting (already configured in backend)
- [ ] Set up database backups
- [ ] Configure proper logging

## 📊 Database Configuration

### Required Database Schema
1. `mLodge-Hotel.sql` - Main schema
2. `analytics-enhancement.sql` - Analytics features

### Important Notes
- Scripts in `backend/scripts/` are for development only and excluded from build
- Migration scripts in `Database/` folder are one-time setup scripts
- Backend automatically creates database connection pool on startup

## 🔧 Environment Variables Summary

### Backend Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5001` |
| `NODE_ENV` | Environment | `production` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `secure_password` |
| `DB_NAME` | Database name | `mLodge-Hotel` |
| `JWT_SECRET` | JWT signing key | `min-32-char-secret` |
| `CORS_ORIGIN` | Frontend URL | `https://app.domain.com` |

### Frontend Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.domain.com/api` |

## 🧪 Testing Production Build Locally

### Backend
```bash
cd backend
npm run build
npm start
```
Server should start on port 5001.

### Frontend
```bash
cd frontend
npm run build
npm run preview
```
Preview server runs on http://localhost:4173

## 📦 Build Output

### Frontend Build
- Location: `frontend/dist/`
- Size: ~1.3 MB (optimized)
- Assets: Images, CSS, JavaScript bundles
- Entry: `index.html`

### Backend Build
- Location: `backend/dist/`
- Compiled JavaScript from TypeScript
- Entry: `dist/server.js`

## 🐛 Troubleshooting

### Backend Won't Start
1. Check `.env` file exists in `backend/` directory
2. Verify database connection credentials
3. Ensure PostgreSQL is running
4. Check logs for specific errors
5. Verify port 5001 is available

### Frontend Can't Connect to Backend
1. Check `VITE_API_URL` in frontend `.env`
2. Verify CORS settings in backend `.env`
3. Ensure backend is running and accessible
4. Check browser console for specific errors
5. Verify network/firewall rules

### Database Connection Errors
1. Confirm PostgreSQL is running
2. Verify database exists: `psql -l | grep mLodge-Hotel`
3. Check database user permissions
4. Test connection: `psql -h HOST -U USER -d mLodge-Hotel`

### Build Errors
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear build cache: `rm -rf dist`
3. Check Node.js version (recommended: v18+)
4. Verify all dependencies installed

## 🔄 Update Procedure

### Backend Updates
```bash
cd backend
git pull origin main
npm install
npm run build
pm2 restart mlodge-backend
```

### Frontend Updates
```bash
cd frontend
git pull origin main
npm install
npm run build
# Deploy dist/ folder to hosting service
```

## 📝 Additional Notes

### Features Ready for Production
- ✅ User authentication (JWT)
- ✅ Role-based access control (Admin/Client)
- ✅ Room booking system
- ✅ Payment processing
- ✅ Email notifications (configure SMTP)
- ✅ Analytics dashboard
- ✅ Review system
- ✅ Promo codes
- ✅ Refunds management
- ✅ Audit logging
- ✅ Report generation

### Performance Optimizations Applied
- Image lazy loading
- Code splitting
- Gzip compression ready
- Database query optimization
- Rate limiting enabled
- Caching headers configured

### Monitoring Recommendations
- Set up error tracking (e.g., Sentry)
- Configure uptime monitoring
- Enable application performance monitoring (APM)
- Set up log aggregation
- Monitor database performance

## 📧 Support
For deployment issues or questions, refer to the main README.md or contact the development team.

---

**Last Updated:** November 2025  
**Version:** 1.0.0
