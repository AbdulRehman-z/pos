const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Backend is now directly inside resources/backend (no more copying!)
const backendDir = path.resolve(__dirname, '../resources/backend');

console.log('🚀 Preparing Backend for Electron...');

// Just ensure node_modules are installed
console.log('📦 Installing production dependencies...');
try {
    execSync('npm install --production --legacy-peer-deps', {
        cwd: backendDir,
        stdio: 'inherit'
    });
} catch (error) {
    console.error('❌ Failed to install dependencies:', error);
    process.exit(1);
}

console.log('✅ Backend ready at:', backendDir);
