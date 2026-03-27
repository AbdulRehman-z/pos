import React, { useState, useEffect } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders } from "../../https/index";
import { formatDateAndTime } from "../../utils";

const RecentOrders = ({ startDate, endDate }) => {
  const [page, setPage] = useState(1);
  const limit = 20;

  // Reset to page 1 whenever the date filter changes
  useEffect(() => {
    setPage(1);
  }, [startDate, endDate]);

  const { data: resData, isError, isLoading } = useQuery({
    queryKey: ["orders", page, startDate, endDate],
    queryFn: () => getOrders({ page, limit, startDate, endDate }),
    placeholderData: keepPreviousData,
  });

  if (isLoading) return (
    <div className="bg-[#262626] rounded-2xl border border-white/5 p-12 text-center">
      <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Orders...</p>
    </div>
  );

  if (isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" });
    return <div className="text-red-500 p-8 text-center bg-[#262626] rounded-2xl">Error loading orders</div>;
  }

  const ordersList = resData?.data?.data || [];
  const pagination = resData?.data?.pagination || { totalPages: 1, total: 0 };

  return (
    <div className="bg-[#1c1c1c] rounded-2xl border border-white/5 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-white/5">
        <h2 className="text-white text-xl font-black tracking-tight uppercase">Recent Orders</h2>
        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          Total: {pagination.total}
        </span>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left text-[#f5f5f5]">
          <thead className="bg-[#0a0a0a] text-[#ababab] border-b border-white/5 uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Items</th>
              <th className="p-4">Table No</th>
              <th className="p-4">Total</th>
              <th className="p-4 text-center">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {ordersList.map((order) => (
              <tr key={order._id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 font-mono text-sm text-gray-400">#{order.order_id}</td>
                <td className="p-4 font-bold text-sm">{order.customerDetails?.name || 'Guest'}</td>
                <td className="p-4 text-xs text-gray-500">{formatDateAndTime(order.timestamp || order.createdAt)}</td>
                <td className="p-4">
                  <span className="text-xs font-bold bg-white/5 px-2 py-1 rounded border border-white/5">
                    {order.items.length} Items
                  </span>
                </td>
                <td className="p-4 text-sm text-center font-mono">{order.table || '0'}</td>
                <td className="p-4 font-black text-orange-500 font-mono">PKR {order.total_amount?.toLocaleString()}</td>
                <td className="p-4 text-center">
                  <span className="text-[10px] font-black uppercase tracking-tighter bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">
                    {order.paymentMethod}
                  </span>
                </td>
              </tr>
            ))}
            {ordersList.length === 0 && (
              <tr>
                <td colSpan="7" className="p-16 text-center text-gray-600 uppercase tracking-widest text-xs font-bold">
                  No orders found for selected period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="p-4 border-t border-white/5 flex justify-center items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex gap-1.5">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-xl text-xs font-black transition-all border ${page === i + 1
                    ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-600/20'
                    : 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
