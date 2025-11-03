# mLodge Hotel App - Login Credentials

## Admin Account
- **Email**: `admin@mlodge.com`
- **Password**: `Admin123`
- **Dashboard**: http://localhost:5173/admin/overview

## Test User Account
You can register a new user account at: http://localhost:5173/register

## Recent Fixes Applied

### 1. Fixed Registration Error Messages ✅
- **Issue**: When trying to register with an existing email, the error message wasn't displayed properly
- **Fix**: Updated `Register.tsx` to properly extract error messages from Axios responses
- **Result**: Now shows clear error: "Email already registered" when email is in use

### 2. Fixed Promo Codes API Port ✅
- **Issue**: Promo codes slice was calling wrong port (5001 instead of 3001)
- **Fix**: Changed `promoCodesSlice.ts` to use `VITE_API_URL` environment variable
- **Result**: Promo codes now load correctly from the backend API

### 3. Fixed Server Error Handler ✅
- **Issue**: Express error handler missing `next` parameter causing crashes
- **Fix**: Added `NextFunction` parameter with proper TypeScript typing
- **Result**: Server runs stably without crashes

## Application Status
- ✅ Backend server running on http://localhost:3001
- ✅ Frontend running on http://localhost:5173
- ✅ Database connected and operational
- ✅ Admin user verified and ready
- ✅ Authentication working properly

## How to Test

### Test Admin Login:
1. Navigate to http://localhost:5173/login
2. Enter email: `Admin@mlodgehotel.co.za`
3. Enter password: `Admin@mlodgehotel`
4. Click "Login" - should redirect to Admin Dashboard

### Test User Registration:
1. Navigate to http://localhost:5173/register
2. Fill in your details with a NEW email (not previously registered)
3. Click "Register" - should redirect to User Dashboard

### Test Error Messages:
1. Try registering with an already-used email
2. Should see error: "Email already registered"
3. Try logging in with wrong password
4. Should see error: "Invalid email or password"

## Notes
- Registration error messages now properly display backend errors
- Login error messages already had proper handling
- All API calls now use correct port (3001)
- Server is stable and handles errors gracefully
