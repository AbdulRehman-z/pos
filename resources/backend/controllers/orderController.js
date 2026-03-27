const createHttpError = require("http-errors");
const Order = require("../models/orderModel");
const { default: mongoose } = require("mongoose");

const addOrder = async (req, res, next) => {
  try {
    const { customerDetails, items, bills, table, paymentMethod, order_id: clientOrderId } = req.body;

    // ✅ Use the client-provided ID if present, otherwise generate one.
    // Using findOneAndUpdate+upsert makes this IDEMPOTENT:
    // If the exact same order_id is sent twice (network retry, Electron re-fire,
    // double-click), MongoDB updates the existing doc instead of inserting a duplicate.
    const order_id = clientOrderId || `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;

    const orderPayload = {
      items,
      total_amount: bills.total,
      status: 'completed',
      customerDetails,
      table,
      paymentMethod
    };

    const savedOrder = await Order.findOneAndUpdate(
      { order_id },                         // ← find by the unique idempotency key
      { $setOnInsert: { order_id, ...orderPayload } }, // ← only write on first insert
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    // 201 on genuine insert, 200 on idempotent replay
    const isNewOrder = savedOrder.createdAt?.getTime() === savedOrder.updatedAt?.getTime();
    res
      .status(isNewOrder ? 201 : 200)
      .json({ success: true, message: isNewOrder ? "Order created!" : "Order already exists (idempotent replay)", data: savedOrder });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(404, "Invalid id!");
      return next(error);
    }

    const order = await Order.findById(id);
    if (!order) {
      const error = createHttpError(404, "Order not found!");
      return next(error);
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      startDate,
      endDate
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query filter
    let query = {};

    // Search by order_id or customer name
    if (search) {
      query.$or = [
        { order_id: { $regex: search, $options: "i" } },
        { "customerDetails.name": { $regex: search, $options: "i" } }
      ];
    }

    // Date Range Filter
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate).setHours(23, 59, 59, 999)
      };
    }

    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total: totalOrders,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalOrders / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(404, "Invalid id!");
      return next(error);
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true }
    );

    if (!order) {
      const error = createHttpError(404, "Order not found!");
      return next(error);
    }

    res
      .status(200)
      .json({ success: true, message: "Order updated", data: order });
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(404, "Invalid id!");
      return next(error);
    }

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      const error = createHttpError(404, "Order not found!");
      return next(error);
    }

    res
      .status(200)
      .json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteAllOrders = async (req, res, next) => {
  try {
    await Order.deleteMany({});
    res.status(200).json({ success: true, message: "All order records have been cleared" });
  } catch (error) {
    next(error);
  }
};

module.exports = { addOrder, getOrderById, getOrders, updateOrder, deleteOrder, deleteAllOrders };
