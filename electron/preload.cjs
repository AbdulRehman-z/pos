const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Print functionality
    printReceipt: (receiptData) => ipcRenderer.invoke('print-receipt', receiptData),

    // Backend status
    getBackendStatus: () => ipcRenderer.invoke('get-backend-status'),

    // Backup & Restore
    backup: {
        create: () => ipcRenderer.invoke('backup:create'),
        list: () => ipcRenderer.invoke('backup:list'),
        restore: (backupPath) => ipcRenderer.invoke('backup:restore', backupPath),
        export: () => ipcRenderer.invoke('backup:export'),
        import: () => ipcRenderer.invoke('backup:import'),
    },

    // App info
    getDataPath: () => ipcRenderer.invoke('get-data-path'),
    platform: process.platform,
    isElectron: true,
});
