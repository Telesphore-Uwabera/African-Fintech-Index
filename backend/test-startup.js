console.log('🧪 TEST STARTUP SCRIPT RUNNING');
console.log('📅 Time:', new Date().toISOString());
console.log('🔧 Node Version:', process.version);
console.log('📁 Current Directory:', process.cwd());
console.log('📋 Process Arguments:', process.argv);

// List files in current directory
const fs = require('fs');
try {
  console.log('📂 Files in current directory:');
  const files = fs.readdirSync('.');
  files.forEach(file => {
    console.log('  -', file);
  });
} catch (error) {
  console.log('❌ Error reading directory:', error.message);
}

// Check if dist folder exists
try {
  console.log('📂 Checking dist folder:');
  const distFiles = fs.readdirSync('./dist');
  console.log('✅ Dist folder exists with files:', distFiles);
} catch (error) {
  console.log('❌ Dist folder error:', error.message);
}

// Check if package.json exists
try {
  const packageJson = fs.readFileSync('./package.json', 'utf8');
  console.log('✅ Package.json exists');
  const pkg = JSON.parse(packageJson);
  console.log('📦 Package name:', pkg.name);
  console.log('📦 Start script:', pkg.scripts?.start);
} catch (error) {
  console.log('❌ Package.json error:', error.message);
}

console.log('🧪 TEST STARTUP COMPLETE'); 