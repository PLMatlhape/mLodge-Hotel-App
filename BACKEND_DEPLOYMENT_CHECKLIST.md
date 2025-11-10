# Backend Deployment Checklist

## Pre-Deployment ✅

- [x] Backend package.json updated with engines
- [x] Backend builds successfully (`npm run build`)
- [x] CORS_ORIGIN trailing slash removed
- [x] .env.production.template created
- [x] Frontend deployed to Vercel
- [x] Database deployed to Render

## Render Backend Deployment Steps

### 1. Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
- [ ] JWT Secret generated and saved securely

### 2. Get Database Connection Details
From Render Dashboard > PostgreSQL > Connect > External Connection:
- [ ] DB_HOST copied
- [ ] DB_PORT (5432) noted
- [ ] DB_USER copied
- [ ] DB_PASSWORD copied
- [ ] DB_NAME copied

### 3. Create Render Web Service
- [ ] Go to Render Dashboard > New + > Web Service
- [ ] Connect GitHub repository: mLodge-Hotel-App
- [ ] Branch: `final_dev`
- [ ] Root Directory: `backend`
- [ ] Environment: `Node`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`

### 4. Configure Environment Variables
- [ ] PORT=3001
- [ ] NODE_ENV=production
- [ ] DB_HOST (from Step 2)
- [ ] DB_PORT=5432
- [ ] DB_USER (from Step 2)
- [ ] DB_PASSWORD (from Step 2)
- [ ] DB_NAME (from Step 2)
- [ ] JWT_SECRET (from Step 1)
- [ ] JWT_EXPIRES_IN=7d
- [ ] ADMIN_EMAIL=Admin@mlodgehotel.co.za
- [ ] ADMIN_PASSWORD=Admin@mlodgehotel
- [ ] CORS_ORIGIN=https://mlodge-hotel-app-steel.vercel.app
- [ ] UPLOAD_PATH=./uploads
- [ ] MAX_FILE_SIZE=5242880

### 5. Deploy and Monitor
- [ ] Click "Create Web Service"
- [ ] Monitor deploy logs for errors
- [ ] Wait for "Your service is live 🎉" message
- [ ] Copy backend URL (e.g., https://mlodge-hotel-backend.onrender.com)

### 6. Update Frontend
- [ ] Go to Vercel > Project > Settings > Environment Variables
- [ ] **Edit** existing VITE_API_URL to your Render backend URL
- [ ] Redeploy frontend (Deployments > Latest > Redeploy)

### 7. Verification
- [ ] Backend health endpoint: https://[your-backend-url]/health
- [ ] Frontend loads: https://mlodge-hotel-app-steel.vercel.app
- [ ] Login works
- [ ] Data fetches successfully
- [ ] No CORS errors in browser console

## Post-Deployment

- [ ] Document backend URL: _____________________
- [ ] Test all major features
- [ ] Set up monitoring (optional)
- [ ] Update project README with live URLs

## Git Commands (Run After Deployment Testing)

Once everything is working, commit your changes:

```powershell
# Navigate to project root
cd s:\CodeTribe\Hosting\mLodge-Hotel-App

# Stage changes
git add backend/package.json
git add backend/.env
git add backend/.env.production.template
git add RENDER_DEPLOYMENT_GUIDE.md
git add BACKEND_DEPLOYMENT_CHECKLIST.md

# Commit changes
git commit -m "Configure backend for Render deployment

- Add Node.js engine specification in package.json
- Fix CORS_ORIGIN trailing slash
- Add postinstall build script
- Create production environment template
- Add comprehensive Render deployment guide"

# Push to GitHub
git push origin final_dev
```

## Quick Reference

**Frontend URL**: https://mlodge-hotel-app-steel.vercel.app
**Backend URL**: _____________________
**Database Host**: _____________________

**Admin Login**:
- Email: Admin@mlodgehotel.co.za
- Password: Admin@mlodgehotel

**Deployment Stack**:
- Frontend: Vercel
- Backend: Render
- Database: Render PostgreSQL

---

**Status**: Ready for deployment
**Last Updated**: 2024-01-15
