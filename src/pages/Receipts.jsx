import React, { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getOrders } from '../https';
import { formatDateAndTime, formatPKT } from '../utils';
import Modal from '../components/ui/Modal';
import { FiCalendar } from 'react-icons/fi';

// Helper: compute start/end dates for preset periods
const getPresetRange = (period) => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const today = fmt(now);

    if (period === 'day') return { start: today, end: today };
    if (period === 'week') {
        const day = now.getDay();
        const diffToMon = day === 0 ? -6 : 1 - day;
        const mon = new Date(now); mon.setDate(now.getDate() + diffToMon);
        return { start: fmt(mon), end: today };
    }
    if (period === 'month') {
        return { start: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), end: today };
    }
    if (period === 'year') {
        return { start: fmt(new Date(now.getFullYear(), 0, 1)), end: today };
    }
    return { start: today, end: today };
};

const PRESETS = ['day', 'week', 'month', 'year'];

const Receipts = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [period, setPeriod] = useState('day');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [useCustomRange, setUseCustomRange] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const limit = 20;

    // Reset to page 1 on any filter change
    useEffect(() => { setPage(1); }, [period, useCustomRange, customRange.start, customRange.end, searchTerm]);

    const activeRange = useCustomRange ? customRange : getPresetRange(period);

    const { data: resData, isLoading, isPlaceholderData } = useQuery({
        queryKey: ['orders', page, searchTerm, activeRange.start, activeRange.end],
        queryFn: () => getOrders({
            page,
            limit,
            search: searchTerm,
            startDate: activeRange.start,
            endDate: activeRange.end,
        }),
        placeholderData: keepPreviousData,
    });

    const orders = resData?.data?.data || [];
    const pagination = resData?.data?.pagination || { totalPages: 1, total: 0 };

    const handlePresetChange = (p) => {
        setPeriod(p);
        setUseCustomRange(false);
        setCustomRange({ start: '', end: '' });
    };

    const handleApplyCustom = () => {
        if (customRange.start && customRange.end) setUseCustomRange(true);
    };

    const activePreset = !useCustomRange ? period : null;

    return (
        <div className="bg-[#0a0a0a] min-h-screen text-white p-6">
            <div className="container mx-auto">

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-1 uppercase">Receipts</h1>
                        <p className="text-gray-500 text-sm font-medium">Transaction Records ({pagination.total})</p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-3">
                        {/* Row 1: Presets + Search */}
                        <div className="flex flex-wrap gap-3 items-center justify-end">
                            {/* Preset period buttons */}
                            <div className="flex bg-[#1c1c1c] p-1 rounded-xl border border-white/10 gap-0.5">
                                {PRESETS.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => handlePresetChange(p)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${activePreset === p
                                            ? 'bg-white text-black shadow-md'
                                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by Order ID or Name..."
                                    className="bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-xs w-64 focus:border-orange-500 outline-none transition-all placeholder:text-gray-600"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <svg className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Row 2: Custom date range */}
                        <div className="flex justify-end">
                            <div className={`flex items-center gap-2 bg-[#1c1c1c] px-3 py-2 rounded-xl border transition-all ${useCustomRange ? 'border-orange-500/60 shadow-lg shadow-orange-500/10' : 'border-white/10'}`}>
                                <FiCalendar className={`text-sm flex-shrink-0 ${useCustomRange ? 'text-orange-400' : 'text-gray-500'}`} />
                                <input
                                    type="date"
                                    value={customRange.start}
                                    onChange={(e) => setCustomRange(r => ({ ...r, start: e.target.value }))}
                                    className="bg-transparent text-xs text-white outline-none cursor-pointer w-32 [color-scheme:dark]"
                                />
                                <span className="text-gray-600 text-xs font-bold">→</span>
                                <input
                                    type="date"
                                    value={customRange.end}
                                    onChange={(e) => setCustomRange(r => ({ ...r, end: e.target.value }))}
                                    className="bg-transparent text-xs text-white outline-none cursor-pointer w-32 [color-scheme:dark]"
                                />
                                <button
                                    onClick={handleApplyCustom}
                                    disabled={!customRange.start || !customRange.end}
                                    className="ml-1 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                                >
                                    Apply
                                </button>
                                {useCustomRange && (
                                    <button
                                        onClick={() => handlePresetChange('day')}
                                        className="ml-1 text-gray-500 hover:text-white text-xs font-bold transition-all"
                                        title="Clear custom range"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Active badge */}
                        {useCustomRange && (
                            <div className="flex justify-end">
                                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
                                    Custom Range: {customRange.start} → {customRange.end}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                {isLoading ? (
                    <div className="bg-[#1c1c1c] rounded-2xl p-20 text-center border border-white/5">
                        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Fetching Records...</p>
                    </div>
                ) : (
                    <div className={`bg-[#1c1c1c] rounded-2xl border border-white/5 overflow-hidden shadow-2xl transition-opacity ${isPlaceholderData ? 'opacity-60' : 'opacity-100'}`}>
                        <div className="overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#0a0a0a] text-gray-500 uppercase font-black text-[10px] tracking-widest border-b border-white/5">
                                    <tr>
                                        <th className="p-5">Order ID</th>
                                        <th className="p-5">Time</th>
                                        <th className="p-5">Customer</th>
                                        <th className="p-5 text-right">Total Amount</th>
                                        <th className="p-5 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {orders.map(order => (
                                        <tr key={order._id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-5 font-mono text-gray-400 font-bold text-xs uppercase">
                                                #{order.order_id}
                                            </td>
                                            <td className="p-5 text-gray-500 text-xs font-medium">
                                                {formatDateAndTime(order.timestamp || order.createdAt)}
                                            </td>
                                            <td className="p-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white text-sm tracking-tight">{order.customerDetails?.name || 'Walk-in Customer'}</span>
                                                    <span className="text-[10px] text-gray-600 font-black uppercase mt-1">{order.items.length} Items Delivered</span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-right">
                                                <span className="font-mono font-black text-orange-500 text-lg tracking-tighter">
                                                    PKR {order.total_amount?.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="p-5 text-center">
                                                <button
                                                    onClick={() => setSelectedReceipt(order)}
                                                    className="text-white font-black text-[10px] uppercase tracking-widest px-5 py-2.5 bg-white/5 rounded-xl border border-white/5 hover:bg-orange-600 hover:border-orange-500 transition-all transform active:scale-95"
                                                >
                                                    VIEW RECEIPT
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-20 text-center">
                                                <p className="text-gray-600 font-black uppercase tracking-[0.2em] text-xs">No records found for the selected period</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="bg-[#0a0a0a]/50 p-4 border-t border-white/5 flex justify-center items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-white/5"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="flex gap-1.5 mx-2">
                                    {[...Array(pagination.totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={`w-10 h-10 rounded-xl text-xs font-black transition-all border ${page === i + 1 ? 'bg-orange-600 text-white border-orange-500 shadow-xl shadow-orange-600/20' : 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                    disabled={page === pagination.totalPages}
                                    className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-white/5"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Receipt Detail Modal */}
            {selectedReceipt && (
                <Modal
                    isOpen={!!selectedReceipt}
                    onClose={() => setSelectedReceipt(null)}
                    title="Transaction Receipt"
                >
                    <div className="bg-white text-black p-8 rounded-lg max-w-md mx-auto shadow-2xl ring-1 ring-black/5" style={{ fontFamily: 'monospace' }}>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Frydate Cafe</h2>
                            <p className="text-[10px] uppercase font-bold text-gray-500 mt-1">Opp PSO PUMP, Mall Road, Peshawar Cantt</p>
                            <p className="text-[10px] uppercase font-bold text-gray-500">+923189622272</p>
                        </div>

                        <div className="border-y border-black/10 py-4 mb-6 text-[11px] font-bold uppercase leading-relaxed">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400">Invoice ID</span>
                                <span className="text-black">{selectedReceipt.order_id}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400">Date/Time</span>
                                <span className="text-black">{formatPKT(selectedReceipt.timestamp || selectedReceipt.createdAt)}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400">Customer</span>
                                <span className="text-black">{selectedReceipt.customerDetails?.name || 'WALK-IN'}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400">Table</span>
                                <span className="text-black">{selectedReceipt.table || '0'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Payment</span>
                                <span className="bg-black text-white px-1.5 py-0.5 rounded-sm">{selectedReceipt.paymentMethod}</span>
                            </div>
                        </div>

                        <table className="w-full text-[11px] mb-8">
                            <thead>
                                <tr className="border-b border-black text-left uppercase font-black text-[9px] tracking-widest">
                                    <th className="py-2">Item</th>
                                    <th className="text-center py-2">Qty</th>
                                    <th className="text-right py-2">Price</th>
                                    <th className="text-right py-2">Total</th>
                                </tr>
                            </thead>
                            <tbody className="font-bold">
                                {selectedReceipt.items.map((item, idx) => (
                                    <tr key={idx} className="border-b border-gray-100">
                                        <td className="py-3 uppercase">{item.name}</td>
                                        <td className="text-center py-3">{item.qty}</td>
                                        <td className="text-right py-3">{item.price}</td>
                                        <td className="text-right py-3">{item.price * item.qty}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="border-t-2 border-black pt-4">
                            <div className="flex justify-between items-center font-black text-xl tracking-tighter">
                                <span className="text-xs uppercase">Grand Total</span>
                                <span>PKR {selectedReceipt.total_amount?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="text-center mt-12 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
                            <p className="mb-1 text-black">Shukriya!</p>
                            <p>Software by codeclub.tech</p>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Receipts;
