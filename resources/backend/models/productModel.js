const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: false
    },
    isHotDeal: {
        type: Boolean,
        default: false
    },
    image_url: {
        type: String,
        default: ""
    },
    specifications: {
        type: [String], // Array of variants/specs
        default: []
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
