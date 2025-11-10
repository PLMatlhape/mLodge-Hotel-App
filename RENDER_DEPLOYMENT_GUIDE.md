# Backend Deployment Guide - Render

## Prerequisites
- ✅ Render account created
- ✅ PostgreSQL database deployed on Render
- ✅ Frontend deployed to Vercel
- ✅ GitHub repository: mLodge-Hotel-App (branch: final_dev)

## Step 1: Generate Secure JWT Secret

Before deploying, generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the generated string - you'll need it for environment variables.

## Step 2: Get Database Connection Details

1. Go to your Render Dashboard
2. Click on your PostgreSQL database instance
3. Click on "Connect" > "External Connection"
4. Copy these details:
   - **Hostname**: (e.g., dpg-xxxxx.oregon-postgres.render.com)
   - **Port**: 5432
   - **Database**: (e.g., mlodge_hotel_xxxx)
   - **Username**: (e.g., mlodge_hotel_user)
   - **Password**: (auto-generated secure password)

## Step 3: Create Web Service on Render

1. Go to Render Dashboard > "New +" > "Web Service"
2. Connect your GitHub repository: `mLodge-Hotel-App`
3. Configure the service:

### Basic Configuration
- **Name**: `mlodge-hotel-backend` (or your preferred name)
- **Region**: Choose closest to your users (e.g., Oregon USA)
- **Branch**: `final_dev`
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Advanced Configuration
- **Instance Type**: Free (or paid for better performance)
- **Auto-Deploy**: Yes (automatically deploys on git push)

## Step 4: Configure Environment Variables

In the Render Web Service > Environment tab, add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `PORT` | `3001` | Render will override with its own port |
| `NODE_ENV` | `production` | Production environment |
| `DB_HOST` | `<from Step 2>` | Your Render PostgreSQL hostname |
| `DB_PORT` | `5432` | Standard PostgreSQL port |
| `DB_USER` | `<from Step 2>` | Your Render PostgreSQL username |
| `DB_PASSWORD` | `<from Step 2>` | Your Render PostgreSQL password |
| `DB_NAME` | `<from Step 2>` | Your Render PostgreSQL database name |
| `JWT_SECRET` | `<from Step 1>` | Your secure JWT secret |
| `JWT_EXPIRES_IN` | `7d` | JWT token expiration |
| `ADMIN_EMAIL` | `Admin@mlodgehotel.co.za` | Admin email |
| `ADMIN_PASSWORD` | `Admin@mlodgehotel` | Admin password |
| `CORS_ORIGIN` | `https://mlodge-hotel-app-steel.vercel.app` | Your Vercel frontend URL (NO trailing slash) |
| `UPLOAD_PATH` | `./uploads` | File upload directory |
| `MAX_FILE_SIZE` | `5242880` | Max file size in bytes (5MB) |

### Quick Copy-Paste Format

```
PORT=3001
NODE_ENV=production
DB_HOST=<your-render-postgres-hostname>
DB_PORT=5432
DB_USER=<your-render-postgres-username>
DB_PASSWORD=<your-render-postgres-password>
DB_NAME=<your-render-postgres-database>
JWT_SECRET=<your-secure-jwt-secret>
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=Admin@mlodgehotel.co.za
ADMIN_PASSWORD=Admin@mlodgehotel
CORS_ORIGIN=https://mlodge-hotel-app-steel.vercel.app
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

## Step 5: Deploy

1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Build the project (`npm run build`)
   - Start the server (`npm start`)
3. Monitor the deploy logs for any errors

## Step 6: Get Backend URL

Once deployed successfully:
1. Copy your backend URL from Render (e.g., `https://mlodge-hotel-backend.onrender.com`)
2. You'll need this for the frontend configuration

## Step 7: Update Frontend Environment Variable

1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. **Edit** (don't add) the existing `VITE_API_URL` variable:
   - **Value**: `https://mlodge-hotel-backend.onrender.com` (your Render backend URL)
3. Redeploy frontend:
   - Go to Deployments tab
   - Click on the latest deployment > "..." > "Redeploy"

## Step 8: Verify Deployment

### Test Backend Health
Open in browser:
```
https://mlodge-hotel-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Test Database Connection
Check the deploy logs for database connection success message.

### Test Frontend-Backend Connection
1. Open your Vercel frontend: `https://mlodge-hotel-app-steel.vercel.app`
2. Try to login with admin credentials
3. Check browser console for any CORS or API errors

## Troubleshooting

### Issue: Build Fails
**Solution**: Check deploy logs for specific errors. Common issues:
- Missing dependencies: Run `npm install` in backend folder locally
- TypeScript errors: Run `npm run build` locally to test

### Issue: CORS Errors
**Solution**: 
- Verify `CORS_ORIGIN` has NO trailing slash
- Check server.ts has correct CORS configuration
- Ensure frontend URL is exact match

### Issue: Database Connection Fails
**Solution**:
- Verify all DB_* environment variables are correct
- Check Render PostgreSQL is running
- Verify database has been initialized with schema

### Issue: 502 Bad Gateway
**Solution**:
- Check if server is listening on correct port
- Verify `npm start` command works locally
- Check Render logs for startup errors

### Issue: Free Instance Spins Down
**Note**: Render free tier spins down after 15 minutes of inactivity. First request after spin-down takes ~30 seconds.

**Solutions**:
- Upgrade to paid instance for always-on service
- Use a service like UptimeRobot to ping your backend every 10 minutes
- Accept the delay for free tier

## Post-Deployment Checklist

- [ ] Backend health endpoint responding
- [ ] Database connection successful
- [ ] Frontend updated with backend URL
- [ ] Frontend can login successfully
- [ ] Frontend can fetch data from backend
- [ ] No CORS errors in browser console
- [ ] File uploads working (if applicable)
- [ ] Admin functionality accessible
- [ ] Booking functionality working
- [ ] Payment integration working (if applicable)

## Monitoring

### Render Dashboard
- Monitor logs for errors
- Check metrics (CPU, Memory, Response time)
- Set up alerts for downtime

### Database Monitoring
- Check connection pool status
- Monitor query performance
- Review slow query logs

## Updating the Backend

After making code changes:

### Option 1: Auto-Deploy (Recommended)
1. Commit changes to `final_dev` branch
2. Push to GitHub
3. Render automatically detects and deploys

### Option 2: Manual Deploy
1. Go to Render Dashboard > Your Web Service
2. Click "Manual Deploy" > "Deploy latest commit"

## Environment-Specific Notes

### Development (.env)
- Uses local PostgreSQL
- CORS allows http://localhost:5173

### Production (Render)
- Uses Render PostgreSQL
- CORS allows only Vercel frontend URL
- JWT secrets are cryptographically secure

## Security Checklist

- [ ] JWT_SECRET is cryptographically secure (32+ bytes)
- [ ] ADMIN_PASSWORD changed from default
- [ ] Database credentials are secure (auto-generated by Render)
- [ ] CORS_ORIGIN only allows your frontend domain
- [ ] NODE_ENV is set to "production"
- [ ] No sensitive data in git repository
- [ ] .env files are in .gitignore

## Cost Considerations

### Free Tier Limits (Render)
- 750 hours/month per service
- Spins down after 15 minutes inactivity
- 100GB bandwidth/month
- PostgreSQL: 1GB storage, 1 month data retention

### Upgrading
If you need better performance:
- Starter: $7/month (always-on, no spin-down)
- Standard: $25/month (more resources)
- PostgreSQL: $7/month (10GB, continuous backups)

## Support

### Render Specific Issues
- [Render Documentation](https://render.com/docs)
- [Render Community Forum](https://community.render.com)
- [Render Status Page](https://status.render.com)

### Application Issues
- Check deploy logs in Render Dashboard
- Review backend error logs
- Test locally with production-like .env

---

## Quick Reference Commands

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Test Backend Build Locally
```bash
cd backend
npm run build
```

### Test Backend Start Locally
```bash
cd backend
npm start
```

### View Render Logs
```bash
# Install Render CLI (optional)
npm install -g render-cli
render logs <service-name>
```

---

**Deployment Date**: _________________
**Backend URL**: _________________
**Database Host**: _________________
**Deployed By**: _________________
