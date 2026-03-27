import React from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getDashboardStats } from "../../https";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FiCalendar } from "react-icons/fi";

// Filter state is now OWNED by Dashboard.jsx and passed in as props.
// This allows RecentOrders to share the same filter.
const Metrics = ({ period, customRange, useCustomRange, onPresetChange, onCustomRangeChange, onCustomRangeApply }) => {

  const queryKey = useCustomRange
    ? ['dashboardStats', 'custom', customRange.start, customRange.end]
    : ['dashboardStats', period];

  const { data: statsData, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => {
      if (useCustomRange && customRange.start && customRange.end) {
        return getDashboardStats('custom', customRange.start, customRange.end);
      }
      return getDashboardStats(period);
    },
    enabled: true,
    retry: 1,
    placeholderData: keepPreviousData,
    staleTime: 0,
  });

  if (error) console.error("Dashboard Stats Error:", error);

  const kpi = statsData?.data?.data?.kpi || { revenue: 0, orders: 0, aov: 0 };
  const trend = Array.isArray(statsData?.data?.data?.trend) ? statsData.data.data.trend : [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length && payload[0]?.payload) {
      return (
        <div className="bg-black/95 border border-orange-500/50 rounded-lg p-3 shadow-2xl">
          <p className="text-white text-xs font-bold mb-2">{payload[0].payload._id}</p>
          <p className="text-orange-500 font-mono text-sm font-bold">
            Revenue: PKR {payload[0].value?.toLocaleString()}
          </p>
          {payload[1] && (
            <p className="text-blue-400 font-mono text-sm font-bold">
              Orders: {payload[1].value}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const PRESETS = ['day', 'week', 'month', 'year'];
  const activePreset = !useCustomRange ? period : null;

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="bg-[#1c1c1c] p-6 rounded-2xl border border-white/10 space-y-5 relative z-50">
        <div>
          <h2 className="font-black text-white text-2xl tracking-tight">Sales Overview</h2>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">PERFORMANCE METRICS</p>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Preset pill buttons */}
          <div className="flex bg-[#0a0a0a] p-1 rounded-xl border border-white/10 gap-0.5">
            {PRESETS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => onPresetChange(p)}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${activePreset === p
                    ? 'bg-white text-black shadow-lg'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-white/10 hidden md:block" />

          {/* Custom Date Range — improved UI */}
          <div className={`flex items-center gap-2 bg-[#0a0a0a] px-3 py-2 rounded-xl border transition-all ${useCustomRange ? 'border-orange-500/60 shadow-lg shadow-orange-500/10' : 'border-white/10'}`}>
            <FiCalendar className={`text-sm flex-shrink-0 ${useCustomRange ? 'text-orange-400' : 'text-gray-500'}`} />
            <input
              type="date"
              value={customRange.start}
              onChange={(e) => onCustomRangeChange({ ...customRange, start: e.target.value })}
              className="bg-transparent text-xs text-white outline-none cursor-pointer w-32 [color-scheme:dark]"
            />
            <span className="text-gray-600 text-xs font-bold">→</span>
            <input
              type="date"
              value={customRange.end}
              onChange={(e) => onCustomRangeChange({ ...customRange, end: e.target.value })}
              className="bg-transparent text-xs text-white outline-none cursor-pointer w-32 [color-scheme:dark]"
            />
            <button
              type="button"
              onClick={onCustomRangeApply}
              disabled={!customRange.start || !customRange.end}
              className="ml-1 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
            >
              Apply
            </button>
            {useCustomRange && (
              <button
                type="button"
                onClick={() => onPresetChange('day')}
                className="ml-1 text-gray-500 hover:text-white text-xs font-bold transition-all"
                title="Clear custom range"
              >
                ✕
              </button>
            )}
          </div>

          {/* Active filter badge */}
          {useCustomRange && (
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
              Custom Range Active
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#1c1c1c] rounded-2xl p-6 border border-white/10 h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1c1c1c] rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">TOTAL REVENUE</p>
            <p className="text-4xl font-black text-orange-500 tracking-tight mb-4">PKR {kpi.revenue.toLocaleString()}</p>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 w-full" />
            </div>
          </div>
          <div className="bg-[#1c1c1c] rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-all">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">TOTAL ORDERS</p>
            <p className="text-4xl font-black text-white tracking-tight mb-4">{kpi.orders}</p>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-full" />
            </div>
          </div>
          <div className="bg-[#1c1c1c] rounded-2xl p-6 border border-white/10 hover:border-green-500/30 transition-all">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">AVG. ORDER VALUE</p>
            <p className="text-4xl font-black text-white tracking-tight mb-4">PKR {kpi.aov}</p>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-full" />
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-[#1c1c1c] rounded-2xl p-6 border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">PERFORMANCE TREND</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Orders</span>
            </div>
          </div>
        </div>
        <div className="h-96 w-full">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs animate-pulse uppercase tracking-widest">Loading Chart data...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                <XAxis dataKey="_id" stroke="#666" fontSize={11} tickLine={false} axisLine={{ stroke: '#333' }} />
                <YAxis yAxisId="left" stroke="#f97316" fontSize={11} tickLine={false} axisLine={{ stroke: '#333' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={11} tickLine={false} axisLine={{ stroke: '#333' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar yAxisId="left" dataKey="sales" fill="#f97316" radius={[6, 6, 0, 0]} barSize={50} />
                <Bar yAxisId="right" dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Metrics;
