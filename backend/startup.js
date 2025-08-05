const { spawn } = require('child_process');
const path = require('path');

console.log('Starting African Fintech Backend...');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

// Check if we're in production (Azure)
const isProduction = process.env.NODE_ENV === 'production' || process.env.WEBSITE_SITE_NAME;

if (isProduction) {
  console.log('Running in production mode');
  
  // Try to run the built version first
  const distPath = path.join(__dirname, 'dist', 'index.js');
  console.log('Looking for built version at:', distPath);
  
  try {
    require('fs').accessSync(distPath);
    console.log('Found built version, starting...');
    require('./dist/index.js');
  } catch (error) {
    console.log('Built version not found, building first...');
    
    // Build the project
    const build = spawn('npm', ['run', 'build'], { 
      stdio: 'inherit',
      shell: true 
    });
    
    build.on('close', (code) => {
      if (code === 0) {
        console.log('Build successful, starting application...');
        require('./dist/index.js');
      } else {
        console.error('Build failed with code:', code);
        process.exit(1);
      }
    });
  }
} else {
  console.log('Running in development mode');
  require('./src/index.ts');
} 