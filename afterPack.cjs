const fs = require('fs');
const path = require('path');

// This hook runs after electron-builder packs the app
// It copies node_modules which electron-builder filters out
exports.default = async function (context) {
    console.log('📦 AfterPack: Copying backend node_modules...');

    const source = path.join(__dirname, 'resources/backend/node_modules');
    const dest = path.join(context.appOutDir, 'resources/backend/node_modules');

    if (fs.existsSync(source)) {
        console.log('   From:', source);
        console.log('   To:', dest);

        // Ensure destination backend directory exists
        const destBackendDir = path.dirname(dest);
        if (!fs.existsSync(destBackendDir)) {
            fs.mkdirSync(destBackendDir, { recursive: true });
        }

        // Copy recursively
        fs.cpSync(source, dest, { recursive: true });

        console.log('✅ Backend node_modules copied successfully!');
    } else {
        console.error('❌ Source node_modules not found:', source);
        console.error('   Run: cd resources/backend && npm install');
    }
};
