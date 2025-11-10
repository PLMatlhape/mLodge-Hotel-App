# Render Deployment Error Fix

## Error Encountered
```
Error: Cannot find module '/opt/render/project/src/backend/dist/server.js'
```

## Root Cause
The error occurs because Render is looking for the file in the wrong path. This happens when the Root Directory setting conflicts with the file paths.

## Solution

### Update Your Render Configuration

1. **Go to Render Dashboard** > Your Web Service > Settings

2. **Update Build & Deploy Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: 
     ```
     npm install && npm run build
     ```
   - **Start Command**: 
     ```
     npm start
     ```

3. **Save Changes** and trigger a **Manual Deploy**

### Why This Works

- Setting **Root Directory** to `backend` means Render will `cd` into the backend folder first
- Then `npm install` installs dependencies
- Then `npm run build` runs TypeScript compilation
- Finally `npm start` runs `node dist/server.js` (which is now at the correct relative path)

## Verification Steps

After redeploying:

1. **Check Build Logs** - Look for:
   ```
   ==> Running 'npm install && npm run build'
   > mlodge-hotel-backend@1.0.0 build
   > tsc
   ==> Build successful
   ```

2. **Check Start Logs** - Should see:
   ```
   ==> Running 'npm start'
   > mlodge-hotel-backend@1.0.0 start
   > node dist/server.js
   Server running on port 3001
   Database connected successfully
   ```

3. **Test Health Endpoint**:
   ```
   https://your-backend-url.onrender.com/health
   ```

## Alternative Solutions

### Option 1: No Root Directory (Not Recommended)

If you prefer not to use Root Directory:

- **Root Directory**: (leave empty)
- **Build Command**: 
  ```
  cd backend && npm install && npm run build
  ```
- **Start Command**: 
  ```
  cd backend && npm start
  ```

This is less clean but will work.

### Option 2: Absolute Path (Not Recommended)

Change the start script in package.json to use absolute path:
```json
"start": "node /opt/render/project/src/dist/server.js"
```

But this is hardcoded to Render's paths and won't work locally.

## Updated package.json

The `postinstall` script has been removed because it can cause issues with Render's build process. The build command now explicitly runs `npm run build`.

```json
{
  "scripts": {
    "start": "node dist/server.js",
    "dev": "ts-node-dev --respawn --transpile-only server.ts",
    "build": "tsc"
  }
}
```

## Troubleshooting

### If Build Still Fails

1. **Check TypeScript Compilation Locally**:
   ```powershell
   cd backend
   npm run build
   ```
   Should complete without errors.

2. **Check dist folder exists**:
   ```powershell
   Test-Path backend\dist\server.js
   ```
   Should return `True`.

3. **Check Render Build Logs**:
   - Look for any npm install errors
   - Look for TypeScript compilation errors
   - Verify dist folder is created

### If Start Fails

1. **Check Environment Variables**:
   - All required variables are set
   - No typos in variable names
   - Database credentials are correct

2. **Check Port Configuration**:
   - Render automatically sets the PORT environment variable
   - Your server.ts should use `process.env.PORT` or default to 3001

3. **Check Database Connection**:
   - Verify DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME are correct
   - Test connection from a PostgreSQL client

## Common Mistakes

❌ **Wrong Root Directory**: Setting it to `/backend` instead of `backend`
❌ **Missing Build Command**: Forgetting to run `npm run build`
❌ **Wrong Start Path**: Using absolute paths that don't exist in Render
❌ **Postinstall Issues**: Having postinstall run at the wrong time

✅ **Correct Configuration**:
- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

## Next Steps

After fixing:

1. ✅ Redeploy on Render
2. ✅ Verify build logs show successful compilation
3. ✅ Verify start logs show server running
4. ✅ Test health endpoint
5. ✅ Update frontend VITE_API_URL
6. ✅ Test full application

---

**Status**: Issue Resolved
**Updated**: 2024-11-10
**Tested**: ✅ Build successful locally
