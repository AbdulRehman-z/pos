/**
 * Electron API Type Definitions
 * 
 * Add this to your React project for TypeScript/IntelliSense support
 * Place in: src/types/electron.d.ts
 */

interface ElectronAPI {
    /**
     * Print a receipt to the thermal printer
     * @param receiptData - Receipt information to print
     * @returns Promise with print status
     */
    printReceipt: (receiptData: {
        orderId: string;
        items: Array<{
            name: string;
            quantity: number;
            price: number;
        }>;
        total: number;
        customerName?: string;
        timestamp?: string;
    }) => Promise<{ success: boolean; error?: string }>;

    /**
     * Check if the Express backend is running
     * @returns Backend status and port information
     */
    getBackendStatus: () => Promise<{
        running: boolean;
        port: number;
    }>;

    /**
     * Platform information
     * 'win32' | 'darwin' | 'linux'
     */
    platform: string;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

export { };
