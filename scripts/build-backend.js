const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const backendEntry = path.resolve(__dirname, '../../pos-backend/app.js');
const outputDir = path.resolve(__dirname, '../resources/backend');
const outputFile = path.join(outputDir, 'server.js');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('📦 Bundling Backend...');

esbuild.build({
    entryPoints: [backendEntry],
    bundle: true,
    platform: 'node',
    target: 'node18', // Electron 28+ uses Node 18+
    outfile: outputFile,
    external: [
        'electron',
        'mongodb-memory-server', // Should stay in frontend logic
        // Add native modules here if they can't be bundled (e.g. sharp, sqlite3)
        // 'bcrypt' // typically needs to be external but let's try bundling or treating specially if needed. 
        // Mongoose drivers sometimes have issues, but let's try standard bundle first.
    ],
    loader: { '.node': 'file' }, // Handle native addons if any
})
    .then(() => {
        console.log('✅ Backend bundled successfully at:', outputFile);
    })
    .catch((err) => {
        console.error('❌ Build failed:', err);
        process.exit(1);
    });
