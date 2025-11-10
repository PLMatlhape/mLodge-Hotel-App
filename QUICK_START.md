# Quick Start Guide - Separated Structure

## 🚀 Get Started in 3 Minutes

### Step 1: Start Backend (Terminal 1)

```bash
cd backend
npm install
npm run dev
```

✅ Backend running on `http://localhost:3001`

### Step 2: Start Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend running on `http://localhost:5173`

### Step 3: Access Application

Open browser: `http://localhost:5173`

**Default Admin Login:**
- Email: `Admin@mlodgehotel.co.za`
- Password: `Admin@mlodgehotel`

---

## 📁 Project Structure

```
mLodge-Hotel-App/
├── frontend/          ← React app (Port 5173)
├── backend/           ← Express API (Port 3001)
├── src/               ← Original code (preserved)
├── ROOT_README.md     ← Full documentation
└── SEPARATION_GUIDE.md ← Migration details
```

---

## ⚡ Common Commands

### Frontend
```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run linter
```

### Backend
```bash
cd backend
npm run dev      # Start dev server with hot reload
npm run build    # Build TypeScript
npm start        # Run production build
npm run test-db  # Test database connection
npm run init-db  # Initialize database
```

---

## 🔧 Configuration Check

### Backend (.env file)
Location: `backend/.env`

Required settings:
```env
PORT=3001
DB_HOST=localhost
DB_NAME=mLodge-Hotel
DB_USER=postgres
DB_PASSWORD=mosa123
CORS_ORIGIN=http://localhost:5173
```

### Frontend (API connection)
Location: `frontend/src/services/api.ts`

Should point to: `http://localhost:3001/api`

---

## ✅ Verification Steps

1. **Backend Health Check:**
   - Visit: `http://localhost:3001/api/`
   - Should see API response

2. **Frontend Health Check:**
   - Visit: `http://localhost:5173`
   - Should see hotel homepage

3. **Integration Check:**
   - Try logging in
   - Check browser console for errors

---

## 🐛 Quick Troubleshooting

### Backend won't start?
```bash
# Check PostgreSQL is running
# Verify .env file exists in backend/
cd backend
npm run test-db
```

### Frontend can't connect?
```bash
# 1. Verify backend is running on port 3001
# 2. Check CORS settings in backend/.env
# 3. Clear browser cache
```

### Port conflicts?
```bash
# Backend: Change PORT in backend/.env
# Frontend: Change port in frontend/vite.config.ts
```

---

## 📚 More Information

- **Full Documentation:** See `ROOT_README.md`
- **Migration Details:** See `SEPARATION_GUIDE.md`
- **Frontend README:** See `frontend/README.md`
- **Backend README:** See `backend/README.md`

---

## 💡 Tips

1. **Always start backend first**, then frontend
2. **Keep terminals open** to see real-time logs
3. **Use Ctrl+C** to stop each server
4. **Clear browser cache** if seeing old data
5. **Check both terminals** for error messages

---

**Need help?** Check the troubleshooting section in ROOT_README.md
