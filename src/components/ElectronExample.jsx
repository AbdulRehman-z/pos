import React from 'react';

/**
 * Example React Component showing how to use Electron APIs
 * 
 * This demonstrates:
 * 1. Thermal printer integration
 * 2. Backend status checking
 * 3. Platform detection
 */

const ElectronExample = () => {
    const [backendStatus, setBackendStatus] = React.useState(null);
    const [isPrinting, setIsPrinting] = React.useState(false);

    // Check if running in Electron
    const isElectron = typeof window !== 'undefined' && window.electronAPI;

    // Check backend status on mount
    React.useEffect(() => {
        if (isElectron) {
            checkBackendStatus();
        }
    }, []);

    const checkBackendStatus = async () => {
        try {
            const status = await window.electronAPI.getBackendStatus();
            setBackendStatus(status);
            console.log('Backend status:', status);
        } catch (error) {
            console.error('Failed to check backend status:', error);
        }
    };

    const handlePrintReceipt = async () => {
        if (!isElectron) {
            console.warn('Not running in Electron, cannot print');
            return;
        }

        setIsPrinting(true);

        try {
            const receiptData = {
                orderId: 'ORD-' + Date.now(),
                items: [
                    { name: 'Butter Chicken', quantity: 2, price: 350 },
                    { name: 'Naan', quantity: 4, price: 40 },
                    { name: 'Lassi', quantity: 2, price: 80 }
                ],
                total: 900,
                customerName: 'Table 5',
                timestamp: new Date().toLocaleString()
            };

            const result = await window.electronAPI.printReceipt(receiptData);

            if (result.success) {
                console.log('Receipt printed successfully!');
            } else {
                console.error('Print failed:', result.error);
            }
        } catch (error) {
            console.error('Print error:', error);
        } finally {
            setIsPrinting(false);
        }
    };

    // Platform-specific rendering
    const platform = isElectron ? window.electronAPI.platform : 'browser';
    const platformName = {
        'win32': 'Windows',
        'darwin': 'macOS',
        'linux': 'Linux',
        'browser': 'Web Browser'
    }[platform] || platform;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Electron Integration Example</h2>

            <div style={{ marginBottom: '20px' }}>
                <strong>Environment:</strong> {isElectron ? 'Electron Desktop App' : 'Web Browser'}
            </div>

            <div style={{ marginBottom: '20px' }}>
                <strong>Platform:</strong> {platformName}
            </div>

            {isElectron && (
                <>
                    <div style={{ marginBottom: '20px' }}>
                        <strong>Backend Status:</strong>{' '}
                        {backendStatus ? (
                            <span style={{ color: backendStatus.running ? 'green' : 'red' }}>
                                {backendStatus.running ? `Running on port ${backendStatus.port}` : 'Not Running'}
                            </span>
                        ) : (
                            'Checking...'
                        )}
                        <button onClick={checkBackendStatus} style={{ marginLeft: '10px' }}>
                            Refresh
                        </button>
                    </div>

                    <div>
                        <button
                            onClick={handlePrintReceipt}
                            disabled={isPrinting}
                            style={{
                                padding: '10px 20px',
                                fontSize: '16px',
                                cursor: isPrinting ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isPrinting ? 'Printing...' : 'Print Test Receipt'}
                        </button>
                    </div>
                </>
            )}

            {!isElectron && (
                <div style={{
                    padding: '15px',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '4px'
                }}>
                    <strong>Note:</strong> Electron features are only available in the desktop app.
                    <br />
                    Run <code>bun run electron:dev</code> to test Electron features.
                </div>
            )}
        </div>
    );
};

export default ElectronExample;
