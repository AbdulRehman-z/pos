const Product = require("../models/productModel");
const createHttpError = require("http-errors");

const getProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ isAvailable: true });
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    try {
        let { name, category_id, price, image_url, specifications, isHotDeal } = req.body;

        // Handle file upload
        if (req.file) {
            // Construct the URL to access the file
            // Note: In production Electron, this will be served from the persistent storage
            image_url = `/upload/${req.file.filename}`;
        }

        // Parse fields if coming from FormData (they come as strings)
        if (typeof specifications === 'string') {
            try { specifications = JSON.parse(specifications); } catch (e) { specifications = []; }
        }
        if (typeof category_id === 'string' && (category_id === 'null' || category_id === 'undefined' || category_id === '' || category_id === 'HOT_DEALS')) {
            category_id = undefined;
        }
        if (isHotDeal === 'true') isHotDeal = true;
        else isHotDeal = false; // Default to false for 'undefined', 'null', etc.


        // Ensure price is a number
        if (price) {
            price = Number(price);
        }

        if (!name || (!category_id && !isHotDeal) || !price) {
            throw createHttpError(400, "Name, Price and (Category ID or Hot Deal flag) are required");
        }

        const newProduct = new Product({
            name,
            category_id,
            price,
            image_url,
            specifications,
            isHotDeal: isHotDeal || false
        });

        await newProduct.save();
        res.status(201).json({ success: true, message: isHotDeal ? "Hot Deal created successfully" : "Product created successfully", data: newProduct });
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        let updateData = { ...req.body };

        // Handle file upload
        if (req.file) {
            updateData.image_url = `/upload/${req.file.filename}`;
        }

        // Parse fields if coming from FormData
        if (typeof updateData.specifications === 'string') {
            try { updateData.specifications = JSON.parse(updateData.specifications); } catch (e) { }
        }
        if (updateData.isHotDeal === 'true') updateData.isHotDeal = true;
        else if (updateData.isHotDeal === 'false' || updateData.isHotDeal === 'undefined') updateData.isHotDeal = false;

        // Handle category_id if it's 'null', 'undefined' or empty string from FormData
        if (updateData.category_id === 'null' || updateData.category_id === 'undefined' || updateData.category_id === '' || updateData.category_id === 'HOT_DEALS') {
            updateData.category_id = undefined;
        }

        // Ensure price is a number
        if (updateData.price) {
            updateData.price = Number(updateData.price);
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedProduct) {
            throw createHttpError(404, "Product not found");
        }
        res.status(200).json({ success: true, message: "Product updated", data: updatedProduct });
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            throw createHttpError(404, "Product not found");
        }
        res.status(200).json({ success: true, message: "Product deleted" });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
