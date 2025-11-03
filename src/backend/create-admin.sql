-- Delete existing admin users
DELETE FROM users WHERE role = 'admin';

-- Create admin user with password: Admin123
-- Hash generated with: bcrypt.hash('Admin123', 10)
INSERT INTO users (email, name, phone, password, role, is_active, created_at, updated_at) 
VALUES (
  'admin@mlodge.com',
  'Admin User',
  '+27 123 456 789',
  '$2a$10$iV6bbhoLApq.StOvNCDTTOhP0GHvsqo7T3L3cJawaJ.NubtmXJlAW',
  'admin',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Verify admin user
SELECT id, email, name, role, is_active, 
       SUBSTRING(password, 1, 7) as hash_prefix,
       LENGTH(password) as hash_length
FROM users 
WHERE email = 'admin@mlodge.com';
