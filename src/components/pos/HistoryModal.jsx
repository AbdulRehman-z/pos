import React from 'react';

const HistoryModal = ({ isOpen, onClose, orders }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1c1c1c] w-[800px] h-[600px] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#242424]">
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest">Order History</h2>
                    <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-auto p-6 scrollbar-hide">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="sticky top-0 bg-[#1c1c1c] z-10">
                            <tr className="uppercase text-[10px] font-black border-b border-white/5 text-gray-500">
                                <th className="pb-4 pl-4">Order ID</th>
                                <th className="pb-4">Date</th>
                                <th className="pb-4">Customer</th>
                                <th className="pb-4 text-center">Table</th>
                                <th className="pb-4 text-right">Total</th>
                                <th className="pb-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {orders?.map(order => (
                                <tr key={order._id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="py-4 pl-4 font-mono text-xs text-orange-500">#{order._id.slice(-6)}</td>
                                    <td className="py-4 text-gray-300">{new Date(order.createdAt).toLocaleString()}</td>
                                    <td className="py-4 font-bold text-white">{order.customerDetails?.name}</td>
                                    <td className="py-4 text-center">{order.table}</td>
                                    <td className="py-4 text-right font-mono text-green-400 font-bold">PKR {order.bills?.total}</td>
                                    <td className="py-4 text-center">
                                        <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-green-500/20">
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(!orders || orders.length === 0) && (
                        <div className="flex flex-col items-center justify-center h-64 opacity-20">
                            <p className="uppercase font-black tracking-widest">No History Found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;
