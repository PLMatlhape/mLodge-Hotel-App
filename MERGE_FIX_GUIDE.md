# 🔧 GitHub Merge Error Fix Guide

## Overview
After merging branches on GitHub, several TypeScript compilation errors have emerged in the backend. This guide provides a complete fix strategy.

---

## 🔴 Critical Errors Found

### **1. Backend Compilation Errors (36+ errors)**

#### **A. express-validator Import Issues**
**Problem:** TypeScript cannot find named exports from 'express-validator'  
**Root Cause:** Version mismatch or incorrect type definitions  
**Files Affected:** All route files

#### **B. Variable Redeclaration Errors**
**Problem:** Multiple scripts declare the same variables (`Pool`, `bcrypt`, `fs`, `path`, `pool`)  
**Files Affected:**
- `scripts/initDatabase.ts`
- `scripts/insertDummyRefunds.ts`
- `scripts/setupRoutes.ts`

#### **C. Type Safety Issues**
- `routes/admin.ts:266` - Unknown error type
- `routes/favourites.ts:133,140` - Return type mismatch
- `routes/reviews.ts:16,17` - Query parameter type issues
- `scripts/insertDummyRefunds.ts` - Implicit 'any' types

### **2. Frontend Warnings (186 warnings)**
**Issue:** CSS inline styles should be moved to external CSS  
**Impact:** Non-blocking, code quality issue  
**Files:** Admin pages (Analytics, AuditLogs, Bookings, etc.)

---

## ✅ **Solutions**

### **Fix 1: Reinstall express-validator with correct version**

```powershell
# Navigate to backend
cd src/backend

# Remove existing packages
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force

# Install correct version
npm install express-validator@^6.14.3
npm install --save-dev @types/express-validator@^3.0.1

# Reinstall all dependencies
npm install
```

### **Fix 2: Update tsconfig.json for better compatibility**

Add these compiler options to `src/backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    ...existing options,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false
  }
}
```

### **Fix 3: Fix Variable Redeclarations in Scripts**

**Option A:** Rename variables in each script  
**Option B:** Add proper module isolation

For `scripts/initDatabase.ts`:
```typescript
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({...});
```

### **Fix 4: Fix Type Errors in Routes**

#### routes/admin.ts (line 266)
```typescript
// Before
catch (error) {
  res.status(500).json({ error: 'Server error' });
}

// After
catch (error: unknown) {
  console.error('Error:', error);
  res.status(500).json({ error: 'Server error' });
}
```

#### routes/favourites.ts (lines 133, 140)
```typescript
// Add return type and explicit return
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  // ... existing code
  res.status(201).json({ message: 'Added to favourites', favourite });
  return; // Add explicit return
});
```

#### routes/reviews.ts (lines 16-17)
```typescript
// Add type checking
const accommodationId = req.query.accommodation_id as string | undefined;
const status = req.query.status as string | undefined;

const page = parseInt((req.query.page as string) || '1');
const limit = parseInt((req.query.limit as string) || '10');
```

#### scripts/insertDummyRefunds.ts
```typescript
// Add explicit types
.reduce((acc: Record<string, any>, room: any) => {
  // existing code
}, {});

const randomRoom = rooms[Math.floor(Math.random() * rooms.length)] as any;

refunds.forEach((refund: any) => {
  // existing code
});
```

---

## 🚀 Quick Fix Commands

Run these commands in PowerShell:

```powershell
# 1. Fix Backend Dependencies
cd src/backend
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue
npm install

# 2. Try to build backend
npm run build

# 3. If errors persist, downgrade express-validator
npm uninstall express-validator @types/express-validator
npm install express-validator@6.14.3 --save
npm install @types/express-validator@3.0.1 --save-dev

# 4. Rebuild
npm run build
```

---

## 🧪 Testing After Fixes

### Backend
```powershell
cd src/backend
npm run build    # Should complete without errors
npm run dev      # Start development server
```

### Frontend
```powershell
cd ../..
npm run dev      # Start frontend development server
```

### Full System Test
1. Start backend: `cd src/backend && npm run dev`
2. Start frontend: `npm run dev` (in root)
3. Test endpoints:
   - http://localhost:5173 (Frontend)
   - http://localhost:3001/api (Backend)

---

## 📝 Notes

- **Priority:** Fix backend compilation errors first (blocking)
- **Frontend warnings:** Can be addressed later (non-blocking)
- **Database:** Ensure PostgreSQL is running before testing
- **Environment:** Check `.env` files are properly configured

---

## 🆘 If Issues Persist

1. **Check Node version:** `node --version` (Should be 18.x or 20.x)
2. **Check npm version:** `npm --version` (Should be 9.x or 10.x)
3. **Clear all caches:**
   ```powershell
   npm cache clean --force
   Remove-Item node_modules -Recurse -Force
   Remove-Item package-lock.json
   npm install
   ```
4. **Check for merge conflicts:** `git status`
5. **Review recent commits:** `git log --oneline -10`

---

## ✨ Post-Fix Checklist

- [ ] Backend compiles without errors
- [ ] Frontend compiles without errors
- [ ] Backend server starts successfully
- [ ] Frontend server starts successfully
- [ ] API endpoints respond correctly
- [ ] Database connections work
- [ ] Authentication flows work
- [ ] Admin panel accessible
- [ ] Client dashboard accessible

---

Generated: November 7, 2025
