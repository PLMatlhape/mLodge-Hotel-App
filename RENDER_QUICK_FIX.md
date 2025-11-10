# 🔧 Render Deployment - Quick Fix Guide

## ❌ Error You're Getting
```
Error: Cannot find module '/opt/render/project/src/backend/dist/server.js'
```

## ✅ The Fix (3 Steps)

### Step 1: Update Render Configuration

Go to your Render Web Service > **Settings** > **Build & Deploy**:

| Setting | Value |
|---------|-------|
| **Root Directory** | `backend` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

### Step 2: Environment Variables Check

Make sure Render has these environment variables (Dashboard > Environment):

**Critical Variables**:
```
NODE_ENV=production
DB_HOST=<your-render-postgres-host>
DB_PORT=5432
DB_USER=<your-render-postgres-user>
DB_PASSWORD=<your-render-postgres-password>
DB_NAME=<your-render-postgres-database>
JWT_SECRET=<your-secure-jwt-secret>
CORS_ORIGIN=https://mlodge-hotel-app-steel.vercel.app
```

**Optional** (Render sets this automatically):
```
PORT=10000
```

> **Note**: Render automatically sets the PORT variable. Your app reads it from `process.env.PORT`.

### Step 3: Manual Deploy

1. **Save Changes** in Settings
2. Go to **Manual Deploy** tab
3. Click **"Deploy latest commit"**
4. Watch the logs for success

---

## 🔍 What Was Wrong

The error showed:
```
/opt/render/project/src/backend/dist/server.js
```

But the file is actually at:
```
/opt/render/project/src/dist/server.js
```

**Why?** When you set Root Directory to `backend`, Render:
1. `cd backend` (now in /opt/render/project/src/)
2. Runs `npm install && npm run build` (creates /opt/render/project/src/dist/)
3. Runs `npm start` which runs `node dist/server.js`

So the path is correct: `/opt/render/project/src/dist/server.js` ✅

---

## ✅ What We Fixed Locally

1. **Removed `postinstall` script** from `package.json`
   - Was causing build issues on Render
   - Build now runs explicitly in Build Command

2. **Verified build works locally**:
   ```powershell
   cd backend
   npm run build
   # ✅ Success! dist/server.js created
   ```

---

## 📋 After Deployment Checklist

Once Render shows "Your service is live 🎉":

### 1. Check Build Logs
Look for:
```
==> Running 'npm install && npm run build'
✓ Build successful
```

### 2. Check Start Logs
Look for:
```
==> Running 'npm start'
✅ Server successfully bound to port 10000
🚀 Server running on port 10000
```

### 3. Test Health Endpoint
Open in browser:
```
https://your-backend-url.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-11-10T..."
}
```

### 4. Check Database Connection
In the logs, look for:
```
✅ Database connected successfully
```

### 5. Update Frontend
Go to **Vercel** > Your Project > **Settings** > **Environment Variables**:
- **Edit** (don't add new) `VITE_API_URL`
- **Value**: `https://your-backend-url.onrender.com`
- Click **Save**
- Go to **Deployments** > **Redeploy**

### 6. Test Full Application
1. Open frontend: https://mlodge-hotel-app-steel.vercel.app
2. Try logging in
3. Check browser console for errors
4. Verify data loads correctly

---

## 🐛 Still Having Issues?

### Build Fails?
**Check**: Do you have all dependencies in `package.json`?
```powershell
cd backend
npm install
npm run build
```
If it fails locally, it will fail on Render too.

### Start Fails?
**Check**: Environment variables
- Missing DB_HOST, DB_USER, DB_PASSWORD?
- Typos in variable names?

**Check**: Database connection
- Is your Render PostgreSQL running?
- Are credentials correct?

### CORS Errors?
**Check**: `CORS_ORIGIN` has **NO** trailing slash
```
✅ CORS_ORIGIN=https://mlodge-hotel-app-steel.vercel.app
❌ CORS_ORIGIN=https://mlodge-hotel-app-steel.vercel.app/
```

### 502 Bad Gateway?
**Check**: Is server listening on `0.0.0.0`?
- Your server.ts has: `app.listen(PORT, '0.0.0.0', ...)` ✅

---

## 📝 Quick Copy-Paste

### Render Configuration
```
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
```

### Environment Variables (Update with your values)
```
NODE_ENV=production
DB_HOST=dpg-xxxxx-xxxxx.oregon-postgres.render.com
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=Admin@mlodgehotel.co.za
ADMIN_PASSWORD=Admin@mlodgehotel
CORS_ORIGIN=https://mlodge-hotel-app-steel.vercel.app
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

---

## 🎯 Expected Timeline

- Configuration update: **1 minute**
- Render build & deploy: **3-5 minutes**
- Testing: **2 minutes**
- Frontend update: **2 minutes**

**Total**: ~10 minutes from now to live backend! 🚀

---

## ✅ Success Criteria

- [ ] Build logs show successful compilation
- [ ] Start logs show "Server running on port"
- [ ] Start logs show "Database connected successfully"
- [ ] Health endpoint returns 200 OK
- [ ] Frontend can reach backend (no CORS errors)
- [ ] Login works
- [ ] Data loads correctly

---

**Ready?** Go to Render and update those 3 settings, then hit deploy! 💪
