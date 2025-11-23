# mLodge Hotel App - Startup Guide

## 🔧 Configuration Summary

### Fixed Issues:
1. **Backend Port**: Changed from 3001 → 5001 in `backend/.env`
2. **Frontend API URL**: Created `frontend/.env` with `VITE_API_URL=http://localhost:5001/api`
3. **CORS Configuration**: Updated `backend/server.ts` to accept both ports 5173 and 5174
4. **Database Connection**: Verified PostgreSQL connection on startup

---

## 📂 Project Structure
```
mLodge-Hotel-App/
├── backend/                 # Backend API (Node.js + Express + TypeScript)
│   ├── .env                # Backend environment variables (PORT=5001)
│   ├── server.ts           # Main server file
│   ├── package.json        # Backend dependencies
│   └── routes/             # API routes
│
└── frontend/               # Frontend (React + Vite + TypeScript)
    ├── .env                # Frontend environment variables (VITE_API_URL)
    ├── package.json        # Frontend dependencies
    └── src/                # React source code
```

---

## 🚀 How to Start the Application

### Prerequisites:
- Node.js installed (v16+)
- PostgreSQL installed and running
- Database `mLodge-Hotel` created with credentials in `backend/.env`

### Step 1: Start the Backend (Port 5001)
Open a terminal and run:
```powershell
cd S:\CodeTribe\Major\mLodge-Hotel-App\backend
npm run dev
```

**Expected Output:**
```
✅ Server successfully bound to port 5001
🚀 Server running on port 5001
📦 Database connected
✅ Database connection verified at startup
```

**Note:** You may see an email service warning - this is normal and doesn't affect API functionality.

### Step 2: Start the Frontend (Port 5173/5174)
Open a **NEW** terminal (keep backend running) and run:
```powershell
cd S:\CodeTribe\Major\mLodge-Hotel-App\frontend
npm run dev
```

**Expected Output:**
```
VITE ready in XXXms
➜  Local:   http://localhost:5173/
```

### Step 3: Access the Application
Open your browser and navigate to:
- **Frontend**: http://localhost:5173 (or 5174 if 5173 is busy)
- **Backend API**: http://localhost:5001/api
- **Health Check**: http://localhost:5001/api/health

---

## 🔍 Testing Endpoints

### Test Health Endpoint:
```powershell
curl http://localhost:5001/api/health
```

### Test Hottest Rooms:
```powershell
curl http://localhost:5001/api/rooms/hottest/top
```

### Test Login (POST):
```powershell
curl -X POST http://localhost:5001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"Admin@mlodgehotel.co.za","password":"Admin@mlodgehotel"}'
```

---

## 🛠️ Configuration Files

### Backend Configuration (`backend/.env`):
```properties
PORT=5001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=mosa123
DB_NAME=mLodge-Hotel
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRES_IN=7d
```

### Frontend Configuration (`frontend/.env`):
```properties
VITE_API_URL=http://localhost:5001/api
```

### CORS Configuration (`backend/server.ts`):
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.CORS_ORIGIN || 'http://localhost:5173'
  ],
  credentials: true,
}));
```

---

## ❌ Common Errors & Solutions

### Error: `ERR_CONNECTION_REFUSED` on port 5001
**Cause:** Backend is not running or running on wrong port
**Solution:** 
1. Check `backend/.env` has `PORT=5001`
2. Restart backend: `cd backend && npm run dev`
3. Verify with: `curl http://localhost:5001/api/health`

### Error: `Network Error` in Login
**Cause:** Frontend can't reach backend API
**Solution:**
1. Ensure backend is running on port 5001
2. Check `frontend/.env` has correct `VITE_API_URL`
3. Restart frontend to load new env vars

### Error: `CORS policy` error
**Cause:** Frontend port not allowed by backend
**Solution:** Backend now accepts ports 5173 and 5174 automatically

### Error: Database connection failed
**Cause:** PostgreSQL not running or wrong credentials
**Solution:**
1. Start PostgreSQL service
2. Verify credentials in `backend/.env`
3. Ensure database `mLodge-Hotel` exists

### Error: Port 5173 already in use
**Solution:** Vite will automatically use port 5174 - this is normal

---

## 📝 What Was Fixed

1. **Backend Port Mismatch**
   - **Before:** Backend `.env` had `PORT=3001`
   - **After:** Changed to `PORT=5001`
   - **Why:** Frontend expects backend at `http://localhost:5001/api`

2. **Missing Frontend Environment File**
   - **Before:** No `frontend/.env` file
   - **After:** Created with `VITE_API_URL=http://localhost:5001/api`
   - **Why:** Ensures frontend always points to correct backend URL

3. **CORS Configuration**
   - **Before:** Only allowed `http://localhost:5173`
   - **After:** Accepts both 5173 and 5174
   - **Why:** Vite uses port 5174 when 5173 is busy

4. **Database Connection**
   - **Status:** ✅ Verified working
   - **Credentials:** Confirmed in `backend/.env`

---

## 🎯 Key Files Modified

1. `backend/.env` - Changed PORT to 5001
2. `frontend/.env` - Created with VITE_API_URL
3. `backend/server.ts` - Updated CORS to accept multiple origins

---

## 📱 Default Admin Credentials

- **Email:** Admin@mlodgehotel.co.za
- **Password:** Admin@mlodgehotel

---

## 🔄 How to Restart After Changes

### After Backend Changes:
The backend uses `ts-node-dev` which auto-restarts on file changes.
If needed, manually restart with `Ctrl+C` then `npm run dev`

### After Frontend Changes:
Vite hot-reloads automatically.
If needed, manually restart with `Ctrl+C` then `npm run dev`

### After .env Changes:
**Must restart** both servers to load new environment variables:
1. Stop with `Ctrl+C`
2. Run `npm run dev` again

---

## ✅ Verification Checklist

- [ ] Backend starts on port 5001
- [ ] Frontend starts on port 5173 or 5174
- [ ] Health endpoint returns JSON: `http://localhost:5001/api/health`
- [ ] Hottest rooms endpoint works: `http://localhost:5001/api/rooms/hottest/top`
- [ ] Login page can submit without network errors
- [ ] Browser console shows no CORS errors
- [ ] Database connection confirmed in backend logs

---

## 📧 Email Service Note

The warning about "self-signed certificate in certificate chain" is expected during development.
Email notifications are disabled but won't affect other API functionality.

To enable emails (optional):
1. Add valid SMTP credentials to `backend/.env`
2. Or use a mail service like SendGrid, Mailgun, or Gmail

---

## 🎉 Success Indicators

When everything is working correctly, you should see:

**Backend Terminal:**
```
✅ Server successfully bound to port 5001
📦 Database connected
✅ Database connection verified at startup
```

**Frontend Terminal:**
```
VITE ready in XXXms
➜  Local:   http://localhost:5173/
```

**Browser:**
- No network errors in console
- Login form submits successfully
- Hottest rooms load on homepage
- No CORS policy errors

---

## 🆘 Still Having Issues?

1. **Kill all Node processes:**
   ```powershell
   taskkill /F /IM node.exe
   ```

2. **Clear npm cache:**
   ```powershell
   cd backend && npm cache clean --force
   cd ../frontend && npm cache clean --force
   ```

3. **Reinstall dependencies:**
   ```powershell
   cd backend && rm -r node_modules && npm install
   cd ../frontend && rm -r node_modules && npm install
   ```

4. **Check if ports are in use:**
   ```powershell
   netstat -ano | findstr :5001
   netstat -ano | findstr :5173
   ```

---

**Last Updated:** November 23, 2025
