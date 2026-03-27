const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    icon: {
        type: String, // URL or Icon name
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);
