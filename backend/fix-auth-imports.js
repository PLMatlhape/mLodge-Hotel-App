const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.ts'));

console.log(`Fixing ${files.length} route files...`);

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix AuthRequest imports
  content = content.replace(/, AuthRequest \}/g, ', type AuthRequest }');
  
  fs.writeFileSync(filePath, content);
  console.log(`✓ Fixed ${file}`);
});

console.log('\n✅ All files fixed!');
