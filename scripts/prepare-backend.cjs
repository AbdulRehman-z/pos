const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = path.resolve(__dirname, '../../pos-backend');
const destDir = path.resolve(__dirname, '../backend-dist');

console.log('🚀 Preparing Backend for Production Build...');

// 1. Clean destination
if (fs.existsSync(destDir)) {
    console.log('🧹 Cleaning previous build...');
    fs.rmSync(destDir, { recursive: true, force: true });
}
fs.mkdirSync(destDir);

// 2. Copy files (excluding node_modules and git files)
console.log('RX Copying source files...');
const copyRecursiveSync = (src, dest) => {
    if (fs.statSync(src).isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(childItemName => {
            // Skip node_modules and hidden files
            if (childItemName === 'node_modules' || childItemName.startsWith('.')) return;
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
};

copyRecursiveSync(sourceDir, destDir);

// 3. Install Production Dependencies
console.log('📦 Installing production dependencies...');
try {
    // Use npm or bun. Bun is faster.
    execSync('bun install --production', { cwd: destDir, stdio: 'inherit' });
} catch (error) {
    console.error('❌ Failed to install dependencies:', error);
    process.exit(1);
}

console.log('✅ Backend prepared in:', destDir);
