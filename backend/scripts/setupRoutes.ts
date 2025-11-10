const fs = require('fs');
const path = require('path');

// Create routes directory structure
const routes = [
  'users.js',
  'rooms.js', 
  'bookings.js',
  'reviews.js',
  'amenities.js',
  'favourites.js',
  'admin.js'
];

const routesDir = path.join(__dirname, '../routes');

// Ensure routes directory exists
if (!fs.existsSync(routesDir)) {
  fs.mkdirSync(routesDir, { recursive: true });
}

// Create placeholder route files
routes.forEach(route => {
  const filePath = path.join(routesDir, route);
  if (!fs.existsSync(filePath)) {
    const routeName = route.replace('.js', '');
    const content = `const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// TODO: Implement ${routeName} routes

module.exports = router;
`;
    fs.writeFileSync(filePath, content);
    console.log(`✅ Created ${route}`);
  }
});

console.log('✅ Route files setup complete');
