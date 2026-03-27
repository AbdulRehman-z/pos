const Order = require("../models/orderModel");

const getDashboardStats = async (req, res, next) => {
    try {
        const { period, startDate, endDate } = req.query;

        // Define date filter logic
        let dateFilter = {};
        let groupFormat = "%Y-%m-%d"; // Default: group by day
        const now = new Date();

        if (period === 'custom' && startDate && endDate) {
            // Custom date range
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (isNaN(start) || isNaN(end)) {
                const error = new Error("Invalid date range provided");
                error.statusCode = 400;
                throw error;
            }

            end.setHours(23, 59, 59, 999); // Include full end date
            dateFilter = { timestamp: { $gte: start, $lte: end } };

            // Determine granularity based on range
            const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            if (daysDiff > 60) {
                groupFormat = "%Y-%m"; // Group by month for ranges > 60 days
            }
        } else if (period === 'day') {
            const today = new Date(now);
            today.setHours(0, 0, 0, 0); // Midnight today
            dateFilter = { timestamp: { $gte: today } };
            groupFormat = "%Y-%m-%d";
        } else if (period === 'week') {
            const startOfWeek = new Date(now);
            const day = startOfWeek.getDay();
            const diffToMon = (day === 0 ? -6 : 1 - day); // Monday is start of week
            startOfWeek.setDate(now.getDate() + diffToMon);
            startOfWeek.setHours(0, 0, 0, 0);
            dateFilter = { timestamp: { $gte: startOfWeek } };
        } else if (period === 'month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            startOfMonth.setHours(0, 0, 0, 0);
            dateFilter = { timestamp: { $gte: startOfMonth } };
        } else if (period === 'year') {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            startOfYear.setHours(0, 0, 0, 0);
            dateFilter = { timestamp: { $gte: startOfYear } };
            groupFormat = "%Y-%m";
        }

        console.log(`📊 Dashboard Stats Request: Period=${period}, Start=${startDate}, End=${endDate}`);
        console.log("📅 Date Filter Generated:", JSON.stringify(dateFilter, null, 2));

        // Base Match Stage
        const matchStage = { status: 'completed', ...dateFilter };

        // Aggregation for KPI
        const stats = await Order.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$total_amount" },
                    totalOrders: { $sum: 1 },
                    avgOrderValue: { $avg: "$total_amount" }
                }
            }
        ]);

        const kpi = stats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

        // Aggregation for Chart (Granular Trend)
        const salesTrend = await Order.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: { $dateToString: { format: groupFormat, date: "$timestamp" } },
                    sales: { $sum: "$total_amount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                kpi: {
                    revenue: kpi.totalRevenue,
                    orders: kpi.totalOrders,
                    aov: Math.round(kpi.avgOrderValue),
                    netProfit: Math.round(kpi.totalRevenue * 0.4) // Mock 40% profit margin
                },
                trend: salesTrend
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboardStats };
