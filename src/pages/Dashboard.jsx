import React, { useEffect, useState } from "react";
import Metrics from "../components/dashboard/Metrics";
import RecentOrders from "../components/dashboard/RecentOrders";

// Helper: compute start/end dates for preset periods
const getPresetRange = (period) => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const today = fmt(now);

  if (period === 'day') return { start: today, end: today };

  if (period === 'week') {
    const day = now.getDay(); // 0=Sun
    const diffToMon = (day === 0 ? -6 : 1 - day);
    const mon = new Date(now); mon.setDate(now.getDate() + diffToMon);
    return { start: fmt(mon), end: today };
  }

  if (period === 'month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: fmt(firstDay), end: today };
  }

  if (period === 'year') {
    const firstDay = new Date(now.getFullYear(), 0, 1);
    return { start: fmt(firstDay), end: today };
  }

  return { start: today, end: today };
};

const Dashboard = () => {
  // ✅ Shared filter state — drives BOTH Metrics and RecentOrders
  const [period, setPeriod] = useState('day');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [useCustomRange, setUseCustomRange] = useState(false);

  useEffect(() => {
    document.title = "POS | Admin Dashboard";
  }, []);

  const handlePresetChange = (p) => {
    setPeriod(p);
    setUseCustomRange(false);
    setCustomRange({ start: '', end: '' });
  };

  const handleCustomRangeApply = () => {
    if (customRange.start && customRange.end) setUseCustomRange(true);
  };

  // Resolved date range for queries
  const activeRange = useCustomRange ? customRange : getPresetRange(period);

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white overflow-y-auto">
      <div className="container mx-auto py-10 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-2">Dashboard</h1>
          <p className="text-gray-500">Welcome back, Admin</p>
        </div>

        <div className="space-y-8">
          <Metrics
            period={period}
            customRange={customRange}
            useCustomRange={useCustomRange}
            onPresetChange={handlePresetChange}
            onCustomRangeChange={setCustomRange}
            onCustomRangeApply={handleCustomRangeApply}
          />
          <RecentOrders
            startDate={activeRange.start}
            endDate={activeRange.end}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
