const mongoose = require("mongoose");
const config = require("../config/config");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");

const seedOrders = async () => {
    try {

        console.log("MONGODB_URI FROM ENV:", process.env.MONGODB_URI)
        const uri = process.env.MONGODB_URI || config.databaseURI;
        console.log("MONGODB_URI FROM CONFIG:", config.databaseURI)
        console.log(`⏳ Connecting to MongoDB at ${uri}...`);
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("✅ Connected.");

        // 1. Ensure Categories exist
        const categoryData = [
            { name: "Burgers", icon: "🍔" },
            { name: "Pizza", icon: "🍕" },
            { name: "Drinks", icon: "🥤" },
            { name: "Desserts", icon: "🍰" },
            { name: "Appetizers", icon: "🍟" },
            { name: "Seafood", icon: "🦞" }
        ];

        for (const cat of categoryData) {
            const exists = await Category.findOne({ name: cat.name });
            if (!exists) {
                await Category.create(cat);
            }
        }
        const categories = await Category.find();
        console.log(`📂 Found/Created ${categories.length} categories.`);

        // 2. Ensure Products exist
        const CatBurgers = categories.find(c => c.name === "Burgers")._id;
        const CatPizza = categories.find(c => c.name === "Pizza")._id;
        const CatDrinks = categories.find(c => c.name === "Drinks")._id;
        const CatAppetizers = categories.find(c => c.name === "Appetizers")._id;
        const CatSeafood = categories.find(c => c.name === "Seafood")._id;

        const productData = [
            { name: "Classic Burger", price: 550, category_id: CatBurgers },
            { name: "Cheese Burger", price: 650, category_id: CatBurgers },
            { name: "Zinger Burger", price: 750, category_id: CatBurgers },
            { name: "Double Patty Burger", price: 950, category_id: CatBurgers },
            { name: "Margherita Pizza", price: 1200, category_id: CatPizza },
            { name: "Pepperoni Pizza", price: 1500, category_id: CatPizza },
            { name: "Vegetarian Pizza", price: 1100, category_id: CatPizza },
            { name: "BBQ Chicken Pizza", price: 1600, category_id: CatPizza },
            { name: "Coca Cola", price: 150, category_id: CatDrinks },
            { name: "Pepsi", price: 150, category_id: CatDrinks },
            { name: "Mineral Water", price: 80, category_id: CatDrinks },
            { name: "French Fries", price: 350, category_id: CatAppetizers },
            { name: "Onion Rings", price: 300, category_id: CatAppetizers },
            { name: "Grilled Prawns", price: 1800, category_id: CatSeafood }
        ];

        for (const prod of productData) {
            const exists = await Product.findOne({ name: prod.name });
            if (!exists) {
                await Product.create(prod);
            }
        }
        const products = await Product.find();
        console.log(`🍟 Found/Created ${products.length} products.`);

        console.log(`🍟 Found ${products.length} products. Starting order generation for March 2026...`);

        const startDate = new Date(2026, 2, 1); // March is 2 (0-indexed)
        const endDate = new Date(2026, 2, 31);
        endDate.setHours(23, 59, 59, 999);

        console.log("🧹 Clearing existing orders for March 2026 to avoid duplicates...");
        await Order.deleteMany({
            timestamp: { $gte: startDate, $lte: endDate }
        });

        let totalOrdersCreated = 0;

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const numOrders = Math.floor(Math.random() * 11) + 5; // 5 to 15 orders per day
            const dayOrders = [];

            for (let i = 0; i < numOrders; i++) {
                // Random time during the day
                const hours = Math.floor(Math.random() * 14) + 10; // 10 AM to 12 AM
                const minutes = Math.floor(Math.random() * 60);
                const seconds = Math.floor(Math.random() * 60);
                const orderDate = new Date(d);
                orderDate.setHours(hours, minutes, seconds);

                // Pick 1-5 random products
                const numItems = Math.floor(Math.random() * 5) + 1;
                const items = [];
                let totalAmount = 0;

                for (let j = 0; j < numItems; j++) {
                    const product = products[Math.floor(Math.random() * products.length)];
                    const qty = Math.floor(Math.random() * 3) + 1;
                    items.push({
                        product_id: product._id,
                        name: product.name,
                        qty: qty,
                        price: product.price
                    });
                    totalAmount += (product.price * qty);
                }

                const orderId = `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`;

                dayOrders.push({
                    order_id: orderId,
                    items: items,
                    total_amount: totalAmount,
                    status: "completed",
                    timestamp: orderDate,
                    customerDetails: { name: "Guest" },
                    table: String(Math.floor(Math.random() * 15) + 1),
                    paymentMethod: Math.random() > 0.3 ? "Cash" : "Card"
                });
            }

            await Order.insertMany(dayOrders);
            totalOrdersCreated += numOrders;
            console.log(`✅ ${d.toDateString()}: Created ${numOrders} orders.`);
        }

        console.log(`✨ DONE! Successfully seeded ${totalOrdersCreated} orders for March 2026.`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedOrders();
