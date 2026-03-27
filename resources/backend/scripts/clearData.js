const mongoose = require("mongoose");
const config = require("../config/config");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Table = require("../models/tableModel");
const User = require("../models/userModel");

const clearDatabase = async () => {
    try {
        console.log("⏳ Connecting to MongoDB...");
        await mongoose.connect(config.databaseURI);
        console.log("✅ Connected. Starting cleanup...");

        // Delete all data except maybe admin user? 
        // User is usually fine to keep, but since the user said "whole data", I'll clear almost everything.
        // Actually, let's clear everything.

        await Order.deleteMany({});
        console.log("🗑️  Orders cleared");

        await Product.deleteMany({});
        console.log("🗑️  Products cleared");

        await Category.deleteMany({});
        console.log("🗑️  Categories cleared");

        await Table.deleteMany({});
        console.log("🗑️  Tables cleared");

        console.log("✨ Database cleanup successful!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Cleanup failed:", error.message);
        process.exit(1);
    }
};

clearDatabase();
