-- =====================================================
-- INDIVIDUAL SQL QUERIES FOR ADMIN USER MANAGEMENT
-- =====================================================

-- ========== QUERY 1: DELETE ADMIN USER ==========
-- Use this to remove the existing admin user
DELETE FROM users 
WHERE email = 'Admin@mlodgehotel.co.za';


-- ========== QUERY 2: CREATE NEW ADMIN USER ==========
-- Creates admin with verified bcrypt hash
INSERT INTO users (
  email, 
  name, 
  phone, 
  password, 
  role, 
  is_active,
  created_at,
  updated_at
) VALUES (
  'Admin@mlodgehotel.co.za',
  'Admin User',
  '+27 11 123 4567',
  '$2a$10$2sGRB0wd9Pjv70J/Gvb1muodzzuCofBdRLgNbWDsc0OeD5SxsHZ5i',
  'admin',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);


-- ========== QUERY 3: VERIFY ADMIN USER ==========
-- Check admin user details
SELECT 
  id,
  email,
  name,
  role,
  is_active,
  LEFT(password, 30) || '...' AS password_preview,
  created_at
FROM users 
WHERE email = 'Admin@mlodgehotel.co.za';


-- ========== QUERY 4: UPDATE ADMIN PASSWORD (if needed) ==========
-- Use this if you need to reset the admin password
-- Current working hash for password: Admin@mlodgehotel
UPDATE users 
SET password = '$2a$10$2sGRB0wd9Pjv70J/Gvb1muodzzuCofBdRLgNbWDsc0OeD5SxsHZ5i',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'Admin@mlodgehotel.co.za';


-- ========== QUERY 5: CHECK ALL ADMIN USERS ==========
-- List all users with admin role
SELECT 
  id,
  email,
  name,
  role,
  is_active,
  created_at
FROM users 
WHERE role = 'admin'
ORDER BY created_at DESC;
