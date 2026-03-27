// import React, { useState, useRef } from 'react';
// import BillReceipt from './BillReceipt';
// import Modal from '../ui/Modal';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { addOrder } from '../../https';
// import { enqueueSnackbar } from 'notistack';

// const OrderCart = ({ cart, setCart }) => {
//     const [customer, setCustomer] = useState({ name: 'Walk-in Customer', phone: '', address: '', table: '0' });
//     const [payment, setPayment] = useState({ received: 0, method: 'Cash' });
//     const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
//     const [invoiceId, setInvoiceId] = useState('');
//     const [printerPort, setPrinterPort] = useState(null);

//     const receiptRef = useRef();
//     const queryClient = useQueryClient();

//     const totalBill = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
//     const balance = payment.received - totalBill;

//     const handleQtyChange = (id, delta) => {
//         setCart(prev => prev.map(item => {
//             if (item._id === id) {
//                 return { ...item, qty: Math.max(1, item.qty + delta) };
//             }
//             return item;
//         }));
//     };

//     const handleRemove = (id) => {
//         setCart(prev => prev.filter(item => item._id !== id));
//     };

//     // Connect to thermal printer
//     const connectThermalPrinter = async () => {
//         try {
//             const port = await navigator.serial.requestPort();
//             await port.open({ baudRate: 9600 }); // Adjust if your printer uses different baud rate
//             setPrinterPort(port);
//             enqueueSnackbar('Printer connected successfully!', { variant: 'success' });
//             return port;
//         } catch (error) {
//             console.error('Failed to connect printer:', error);
//             enqueueSnackbar('Failed to connect to printer', { variant: 'error' });
//             return null;
//         }
//     };

//     // Print to thermal printer using ESC/POS commands
//     const printToThermalPrinter = async (port, orderData) => {
//         try {
//             const writer = port.writable.getWriter();
//             const encoder = new TextEncoder();

//             // Format date
//             const date = new Date().toLocaleString('en-US', {
//                 year: 'numeric',
//                 month: '2-digit',
//                 day: '2-digit',
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: true
//             });

//             // Build ESC/POS commands
//             let receipt = '';

//             // Initialize printer
//             receipt += '\x1B\x40';

//             // Center align + Bold + Large text for header
//             receipt += '\x1B\x61\x01'; // Center align
//             receipt += '\x1B\x21\x30'; // Double height + width
//             receipt += 'HABIBI Fast Food\n';
//             receipt += '\x1B\x21\x00'; // Normal text
//             receipt += 'Sadar Food Street\n';
//             receipt += 'Phone: 0300-1234567\n';

//             // Separator
//             receipt += '\x1B\x61\x00'; // Left align
//             receipt += '================================\n';

//             // Order details
//             receipt += `Inv #: ${orderData.invoiceId || '---'}\n`;
//             receipt += `Date: ${date}\n`;
//             receipt += `Customer: ${orderData.customer.name}\n`;
//             receipt += `Table: ${orderData.customer.table}\n`;
//             receipt += `Method: ${orderData.paymentMethod}\n`;
//             receipt += '================================\n';

//             // Items header
//             receipt += 'Item           Qty  Price  Total\n';
//             receipt += '--------------------------------\n';

//             // Items
//             orderData.cart.forEach(item => {
//                 const itemName = item.name.substring(0, 12).padEnd(13);
//                 const qty = String(item.qty).padStart(3);
//                 const price = String(item.price).padStart(5);
//                 const total = String(item.price * item.qty).padStart(6);
//                 receipt += `${itemName}${qty} ${price} ${total}\n`;
//             });

//             receipt += '================================\n';

//             // Totals with bold
//             receipt += '\x1B\x21\x08'; // Bold
//             receipt += `Total:              ${orderData.totals.total.toFixed(2)}\n`;
//             receipt += '\x1B\x21\x00'; // Normal
//             receipt += `Received:           ${orderData.totals.received.toFixed(2)}\n`;
//             receipt += `Change:             ${orderData.totals.change.toFixed(2)}\n`;
//             receipt += '================================\n';

//             // Footer - Center align
//             receipt += '\x1B\x61\x01';
//             receipt += '\nThank you for dining with us!\n';
//             receipt += 'Software by Codeclub\n';

//             // Feed and cut
//             receipt += '\n\n\n';
//             receipt += '\x1D\x56\x42\x00'; // Partial cut

//             // Write to printer
//             await writer.write(encoder.encode(receipt));
//             writer.releaseLock();

//             enqueueSnackbar('Receipt printed successfully!', { variant: 'success' });
//         } catch (error) {
//             console.error('Print failed:', error);
//             enqueueSnackbar('Failed to print receipt', { variant: 'error' });
//         }
//     };

//     // Handle print with thermal printer
//     const handlePrint = async () => {
//         let port = printerPort;

//         // If not connected, connect first
//         if (!port) {
//             port = await connectThermalPrinter();
//             if (!port) return; // Connection failed
//         }

//         // Prepare receipt data
//         const receiptData = {
//             cart,
//             customer,
//             totals: {
//                 total: totalBill,
//                 received: payment.received,
//                 change: balance
//             },
//             paymentMethod: payment.method,
//             invoiceId
//         };

//         // Print to thermal printer
//         await printToThermalPrinter(port, receiptData);

//         // Clear cart and reset
//         setCart([]);
//         setPayment({ ...payment, received: 0 });
//         setIsConfirmModalOpen(false);
//         setInvoiceId('');
//     };

//     // Save Order Mutation
//     const saveOrderMutation = useMutation({
//         mutationFn: addOrder,
//         onSuccess: (response) => {
//             queryClient.invalidateQueries(['orders']);
//             const orderId = response?.data?.data?.order_id || `INV-${Date.now()}`;
//             setInvoiceId(orderId);
//             enqueueSnackbar('Order Saved!', { variant: 'success' });

//             // Trigger thermal print after a short delay
//             setTimeout(() => {
//                 handlePrint();
//             }, 100);
//         },
//         onError: (err) => {
//             enqueueSnackbar('Failed to save order', { variant: 'error' });
//             console.error(err);
//         }
//     });

//     const handleCheckout = () => {
//         if (cart.length === 0) return enqueueSnackbar('Cart is empty', { variant: 'warning' });

//         const orderData = {
//             customerDetails: {
//                 name: customer.name,
//                 phone: customer.phone || '0000000000',
//                 guests: 1
//             },
//             orderStatus: 'completed',
//             bills: {
//                 total: totalBill,
//                 tax: 0,
//                 totalWithTax: totalBill
//             },
//             items: cart.map(i => ({
//                 product_id: i._id,
//                 name: i.name,
//                 price: i.price,
//                 qty: i.qty,
//                 variant: ""
//             })),
//             paymentMethod: payment.method,
//             table: customer.table
//         };

//         saveOrderMutation.mutate(orderData);
//     };

//     return (
//         <div className="flex flex-col h-full bg-[#1c1c1c] text-white rounded-2xl border border-white/5 shadow-2xl overflow-hidden relative">
//             {/* Header Section */}
//             <div className="p-4 border-b border-white/5 bg-[#242424] space-y-4">
//                 {/* Printer Connection Button */}
//                 <div className="flex justify-end">
//                     <button
//                         onClick={connectThermalPrinter}
//                         className={`text-xs px-3 py-1.5 rounded-lg font-bold uppercase transition-all ${printerPort
//                             ? 'bg-green-600/20 text-green-400 border border-green-500/30'
//                             : 'bg-orange-600/20 text-orange-400 border border-orange-500/30 hover:bg-orange-600/30'
//                             }`}
//                     >
//                         {printerPort ? '✓ Printer Connected' : 'Connect Printer'}
//                     </button>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-1">
//                         <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Customer Name</label>
//                         <input
//                             className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 rounded-xl text-sm focus:border-orange-500 outline-none transition-all placeholder-gray-700"
//                             placeholder="Guest"
//                             value={customer.name}
//                             onChange={e => setCustomer({ ...customer, name: e.target.value })}
//                         />
//                     </div>
//                     <div className="space-y-1">
//                         <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Table No</label>
//                         <input
//                             className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 rounded-xl text-sm focus:border-orange-500 outline-none transition-all placeholder-gray-700 text-center font-mono"
//                             placeholder="0"
//                             value={customer.table}
//                             onChange={e => setCustomer({ ...customer, table: e.target.value })}
//                         />
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-1">
//                         <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Payment Type</label>
//                         <div className="relative">
//                             <select
//                                 className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 rounded-xl text-sm focus:border-orange-500 outline-none appearance-none cursor-pointer"
//                                 value={payment.method}
//                                 onChange={e => setPayment({ ...payment, method: e.target.value })}
//                             >
//                                 <option>Cash</option>
//                                 <option>Card</option>
//                                 <option>Online</option>
//                             </select>
//                             <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs">▼</div>
//                         </div>
//                     </div>
//                     <div className="space-y-1">
//                         <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Order Info</label>
//                         <div className="w-full bg-[#0a0a0a] border border-white/5 px-4 py-3 rounded-xl text-xs text-center text-gray-500 flex items-center justify-center font-mono">
//                             #{Math.floor(Math.random() * 1000)} / {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Cart Items */}
//             <div className="flex-1 overflow-auto scrollbar-hide">
//                 <table className="w-full text-left border-collapse">
//                     <thead className="sticky top-0 bg-[#1c1c1c] z-10 text-[10px] uppercase text-gray-500 font-bold border-b border-white/5">
//                         <tr>
//                             <th className="p-3">Item</th>
//                             <th className="p-3 text-center">Qty</th>
//                             <th className="p-3 text-right">Price</th>
//                             <th className="p-3 w-8"></th>
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-white/5 text-sm">
//                         {cart.map((item) => (
//                             <tr key={item._id} className="hover:bg-white/5 transition-colors">
//                                 <td className="p-3 font-medium">
//                                     <div className="break-words max-w-[150px]">{item.name}</div>
//                                 </td>
//                                 <td className="p-3 text-center">
//                                     <div className="flex items-center justify-center gap-2 bg-[#0a0a0a] rounded-lg p-1 border border-white/5 inline-flex">
//                                         <button onClick={() => handleQtyChange(item._id, -1)} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white">-</button>
//                                         <span className="w-4 text-center text-xs font-bold">{item.qty}</span>
//                                         <button onClick={() => handleQtyChange(item._id, 1)} className="w-5 h-5 flex items-center justify-center text-orange-500 hover:text-white">+</button>
//                                     </div>
//                                 </td>
//                                 <td className="p-3 text-right font-mono text-gray-300">
//                                     {(item.price * item.qty).toFixed(0)}
//                                 </td>
//                                 <td className="p-3 text-center">
//                                     <button onClick={() => handleRemove(item._id)} className="text-red-500 hover:text-red-400">
//                                         &times;
//                                     </button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//                 {cart.length === 0 && (
//                     <div className="p-8 text-center text-gray-600 text-xs uppercase tracking-widest mt-10">
//                         Cart Empty
//                     </div>
//                 )}
//             </div>

//             {/* Footer / Calculation */}
//             <div className="p-4 border-t border-white/5 bg-[#242424] space-y-4">
//                 <div className="space-y-4">
//                     <div className="flex justify-between items-center text-base">
//                         <span className="text-gray-400">Total</span>
//                         <span className="font-black text-3xl text-white font-mono tracking-tight">PKR {totalBill.toFixed(2)}</span>
//                     </div>
//                     <div className="flex justify-between items-center text-sm font-bold">
//                         <span className="text-gray-500">Received</span>
//                         <input
//                             type="number"
//                             className="bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-right text-green-400 w-40 outline-none focus:border-green-500 font-mono font-bold text-lg"
//                             value={payment.received}
//                             onChange={e => setPayment({ ...payment, received: Number(e.target.value) })}
//                         />
//                     </div>
//                     <div className="flex justify-between items-center text-xs">
//                         <span className="text-gray-500">Change</span>
//                         <span className={`font-mono font-black text-xl ${balance >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
//                             PKR {balance >= 0 ? balance.toFixed(2) : '0.00'}
//                         </span>
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-3">
//                     <button onClick={() => setCart([])} className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white py-3 rounded-xl font-bold uppercase text-xs transition-all">
//                         Clear
//                     </button>
//                     <button
//                         onClick={() => {
//                             if (payment.received < totalBill) {
//                                 enqueueSnackbar(`Insufficient Payment! Short by ${(totalBill - payment.received).toFixed(2)}`, { variant: 'error' });
//                             } else {
//                                 setIsConfirmModalOpen(true);
//                             }
//                         }}
//                         className="bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-bold uppercase text-xs transition-all shadow-lg active:scale-95"
//                     >
//                         Checkout
//                     </button>
//                 </div>
//             </div>

//             {/* Confirmation Modal */}
//             <Modal
//                 isOpen={isConfirmModalOpen}
//                 onClose={() => setIsConfirmModalOpen(false)}
//                 title="Confirm Order"
//             >
//                 <div className="space-y-4">
//                     <div className="bg-[#0a0a0a] p-5 rounded-xl border border-white/5 space-y-4">
//                         {/* Header Details */}
//                         <div className="flex justify-between items-end border-b border-white/10 pb-4">
//                             <div>
//                                 <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">Date & Time</p>
//                                 <p className="text-white text-xs font-mono">{new Date().toLocaleString()}</p>
//                             </div>
//                             <div className="text-right">
//                                 <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">Receipt Type</p>
//                                 <p className="text-orange-500 text-xs font-bold uppercase">{payment.method}</p>
//                             </div>
//                         </div>

//                         {/* Items List */}
//                         <div className="max-h-40 overflow-y-auto scrollbar-hide space-y-2 py-2">
//                             {cart.map((item, idx) => (
//                                 <div key={idx} className="flex justify-between items-center text-sm group">
//                                     <div className="flex items-center gap-3">
//                                         <span className="bg-white/10 text-gray-300 w-6 h-6 rounded flex items-center justify-center text-xs font-bold">{item.qty}</span>
//                                         <span className="text-gray-300">{item.name}</span>
//                                     </div>
//                                     <span className="font-mono text-gray-400">{(item.price * item.qty).toFixed(0)}</span>
//                                 </div>
//                             ))}
//                         </div>

//                         {/* Financials */}
//                         <div className="border-t border-white/10 pt-4 space-y-2">
//                             <div className="flex justify-between text-sm">
//                                 <span className="text-gray-500">Total Amount</span>
//                                 <span className="text-white font-bold font-mono">PKR {totalBill.toFixed(2)}</span>
//                             </div>
//                             <div className="flex justify-between text-sm">
//                                 <span className="text-gray-500">Amount Received</span>
//                                 <span className="text-green-500 font-bold font-mono">PKR {payment.received.toFixed(2)}</span>
//                             </div>
//                             <div className="flex justify-between text-base pt-2 border-t border-white/5 mx-[-8px] px-2 bg-white/5 rounded">
//                                 <span className="text-gray-300 font-bold">Change Due</span>
//                                 <span className="text-blue-400 font-black font-mono">PKR {balance.toFixed(2)}</span>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-2 gap-3 pt-2">
//                         <button
//                             onClick={() => setIsConfirmModalOpen(false)}
//                             className="bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold uppercase text-xs"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             onClick={handleCheckout}
//                             className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold uppercase text-xs shadow-lg"
//                         >
//                             Confirm & Print
//                         </button>
//                     </div>
//                 </div>
//             </Modal>

//             {/* Hidden Receipt - Keep for backup/fallback */}
//             <div style={{ display: 'none' }}>
//                 <BillReceipt
//                     ref={receiptRef}
//                     cart={cart}
//                     customer={customer}
//                     totals={{ total: totalBill, received: payment.received, change: balance }}
//                     paymentMethod={payment.method}
//                     invoiceId={invoiceId}
//                 />
//             </div>
//         </div>
//     );
// };

// export default OrderCart;