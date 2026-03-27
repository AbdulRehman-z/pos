const Category = require("../models/categoryModel");
const createHttpError = require("http-errors");

const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

const createCategory = async (req, res, next) => {
    try {
        const { name, icon } = req.body;
        if (!name) {
            throw createHttpError(400, "Category name is required");
        }
        const newCategory = new Category({ name, icon });
        await newCategory.save();
        res.status(201).json({ success: true, message: "Category created", data: newCategory });
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, icon } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(id, { name, icon }, { new: true });
        if (!updatedCategory) throw createHttpError(404, "Category not found");
        res.status(200).json({ success: true, message: "Category updated", data: updatedCategory });
    } catch (error) {
        next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const Category = require("../models/categoryModel");
        const Product = require("../models/productModel");

        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) throw createHttpError(404, "Category not found");

        // Cascade delete products
        await Product.deleteMany({ category_id: id });

        res.status(200).json({ success: true, message: "Category and associated products deleted" });
    } catch (error) {
        next(error);
    }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
