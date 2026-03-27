const { app, BrowserWindow, ipcMain, dialog, protocol, net } = require('electron');
const path = require('path');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const isDev = !app.isPackaged;

// Global references
let mainWindow;
let backendProcess;
let mongod; // MongoDB Memory Server instance

const BACKEND_PORT = 3000;
const DATA_DIR = path.join(app.getPath('userData'), 'pos-data');
const DB_PATH = path.join(DATA_DIR, 'mongodb');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

// Register privileges for custom protocol
protocol.registerSchemesAsPrivileged([
    { scheme: 'media', privileges: { secure: true, supportFetchAPI: true, standard: true, bypassCSP: true, stream: true } }
]);

// Ensure directories exist
function ensureDirectories() {
    [DATA_DIR, DB_PATH, BACKUP_DIR, UPLOAD_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            preload: path.join(__dirname, 'preload.cjs'),
            webSecurity: true // Security enabled
        },
        icon: path.join(__dirname, '../public/icon.png')
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Security: Prevent navigation to external URLs
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (isDev && parsedUrl.origin === 'http://localhost:5173') return;
        if (parsedUrl.origin !== 'file://') {
            event.preventDefault();
        }
    });

    mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    mainWindow.on('closed', () => { mainWindow = null; });
}

async function startMongoDB() {
    console.log('🚀 Starting Embedded MongoDB...');
    console.log('   Data Path:', DB_PATH);

    // Clean up any stale lock files
    const lockFiles = ['mongod.lock', 'WiredTiger.lock'];
    lockFiles.forEach(lock => {
        const lockPath = path.join(DB_PATH, lock);
        if (fs.existsSync(lockPath)) {
            try { fs.unlinkSync(lockPath); } catch (e) { /* ignore */ }
        }
    });

    try {
        mongod = await MongoMemoryServer.create({
            binary: {
                version: '6.0.12',
            },
            instance: {
                dbPath: DB_PATH,
                storageEngine: 'wiredTiger', // Persistent storage!
            }
        });

        const uri = mongod.getUri();
        console.log('✅ MongoDB started at:', uri);
        return uri;
    } catch (err) {
        console.error('MongoDB Start Error:', err);
        throw err;
    }
}

function startBackend(dbUri) {
    if (isDev) {
        console.log('Development mode: Backend running separately');
        return;
    }

    const backendPath = path.join(process.resourcesPath, 'backend', 'app.js');

    if (!fs.existsSync(backendPath)) {
        console.error('❌ Backend not found at:', backendPath);
        return;
    }

    console.log('🚀 Starting Express backend...');

    backendProcess = spawn('node', [backendPath], {
        env: {
            ...process.env,
            PORT: BACKEND_PORT,
            MONGODB_URI: dbUri,
            NODE_ENV: 'production',
            UPLOAD_DIR: UPLOAD_DIR
        },
        cwd: path.dirname(backendPath)
    });

    backendProcess.stdout.on('data', (data) => {
        console.log(`[Backend] ${data.toString().trim()}`);
    });

    backendProcess.stderr.on('data', (data) => {
        console.error(`[Backend Error] ${data.toString().trim()}`);
    });
}

// ============ BACKUP SYSTEM ============
async function createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);
    try {
        fs.cpSync(DB_PATH, backupPath, { recursive: true });
        console.log('✅ Backup created:', backupPath);
        return { success: true, path: backupPath };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

async function restoreBackup(backupPath) {
    try {
        if (mongod) await mongod.stop();
        fs.rmSync(DB_PATH, { recursive: true, force: true });
        fs.cpSync(backupPath, DB_PATH, { recursive: true });
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

function listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) return [];
    return fs.readdirSync(BACKUP_DIR)
        .filter(name => name.startsWith('backup-'))
        .map(name => ({
            name,
            path: path.join(BACKUP_DIR, name),
            created: fs.statSync(path.join(BACKUP_DIR, name)).mtime
        }))
        .sort((a, b) => b.created - a.created);
}

async function exportBackup() {
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Backup',
        defaultPath: `pos-backup-${new Date().toISOString().split('T')[0]}.zip`,
        filters: [{ name: 'Backup Files', extensions: ['zip'] }]
    });
    if (result.canceled) return { success: false, canceled: true };
    try {
        execSync(`zip -r "${result.filePath}" .`, { cwd: DB_PATH });
        return { success: true, path: result.filePath };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

async function importBackup() {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Import Backup',
        filters: [{ name: 'Backup Files', extensions: ['zip'] }],
        properties: ['openFile']
    });
    if (result.canceled) return { success: false, canceled: true };
    try {
        if (mongod) await mongod.stop();
        fs.rmSync(DB_PATH, { recursive: true, force: true });
        fs.mkdirSync(DB_PATH, { recursive: true });
        execSync(`unzip -o "${result.filePaths[0]}" -d "${DB_PATH}"`);
        return { success: true, needsRestart: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

// ============ IPC HANDLERS ============
ipcMain.handle('backup:create', createBackup);
ipcMain.handle('backup:list', listBackups);
ipcMain.handle('backup:restore', (event, p) => restoreBackup(p));
ipcMain.handle('backup:export', exportBackup);
ipcMain.handle('backup:import', importBackup);
ipcMain.handle('print-receipt', async (event, data) => { return { success: true }; });
ipcMain.handle('get-backend-status', async () => ({ running: backendProcess !== null, port: BACKEND_PORT }));
ipcMain.handle('get-data-path', () => DATA_DIR);

// ============ APP LIFECYCLE ============
app.whenReady().then(async () => {
    ensureDirectories();

    // Register media:// protocol using registerFileProtocol (More reliable for local files)
    protocol.registerFileProtocol('media', (request, callback) => {
        // request.url will be media://filename.png
        // stripping schema
        const url = request.url.replace('media://', '');

        try {
            const decodedUrl = decodeURIComponent(url);
            const cleanPath = decodedUrl.split('?')[0]; // remove query params

            // Security: Normalize and enforce serving from UPLOAD_DIR
            const filename = path.basename(cleanPath);
            const filePath = path.join(UPLOAD_DIR, filename);

            // console.log('🖼️ Serving media file:', filePath);
            callback({ path: filePath });
        } catch (error) {
            console.error('Media protocol error:', error);
            // Electron fallback
            callback({ statusCode: 500 }); // or 404
        }
    });

    let dbUri;
    if (isDev) {
        dbUri = "mongodb://localhost:27017/pos-db";
    } else {
        try {
            dbUri = await startMongoDB();
        } catch (err) {
            console.error('❌ Failed to start MongoDB:', err.message);
            dialog.showErrorBox('Database Error', err.message);
            app.quit();
            return;
        }
    }

    startBackend(dbUri);
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', async () => {
    if (backendProcess) backendProcess.kill('SIGTERM');
    if (mongod) await mongod.stop();
});

app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, url) => {
        const parsedUrl = new URL(url);
        if (parsedUrl.origin !== 'file://' && !isDev) {
            event.preventDefault();
        }
    });
});
