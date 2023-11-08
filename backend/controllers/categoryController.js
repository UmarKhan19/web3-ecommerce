const Category = require("../models/categoryModel");
const Product = require("../models/productModel");

const addCategory = async (req, res) => {
  try {
    const { name, description, parentCategory } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Please provide category name",
      });
    }

    // Check if the category already exists
    const existingCategory = await Category.exists({ name });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    // Check if the parentCategory exists (if provided)
    if (parentCategory !== "" && parentCategory) {
      const parentExists = await Category.exists({ _id: parentCategory });

      if (!parentExists) {
        return res.status(400).json({
          success: false,
          message: "Parent category does not exist",
        });
      }
    }

    // Create a new category
    const newCategory = new Category({ name, description });

    if (parentCategory !== "") {
      newCategory.parentCategory = parentCategory;
    }

    await newCategory.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Check if the category exists
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if the category has child categories
    const hasChildCategories = await Category.exists({
      parentCategory: categoryId,
    });

    if (hasChildCategories) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a category with child categories",
      });
    }

    // Check if the category is assigned to any products
    const isCategoryUsed = await Product.exists({ category: categoryId });

    if (isCategoryUsed) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a category assigned to products",
      });
    }

    // Delete the category
    await Category.findByIdAndDelete(categoryId);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, parentCategory } = req.body;

    // Check if the category exists
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if the category has child categories
    const hasChildCategories = await Category.exists({
      parentCategory: categoryId,
    });

    if (hasChildCategories) {
      return res.status(400).json({
        success: false,
        message: "Cannot update a category with child categories",
      });
    }

    // Update the category fields
    category.name = name || category.name;
    category.description = description || category.description;
    category.parentCategory = parentCategory || category.parentCategory;

    // Save the updated category
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({})
      .populate("parentCategory")
      .sort({ createdAt: -1 });

    if (categories.length === 0) {
      return res
        .status(404)
        .json({ success: true, message: "No categories found" });
    }

    res
      .status(201)
      .json({ success: true, totalCategories: categories.length, categories });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.log(error);
    }
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const searchCategory = async (req, res) => {
  try {
    const query = req.query.q; // Get the search query from the query parameter

    const categories = await Category.find({
      $or: [
        { name: { $regex: query, $options: "i" } }, // Search by product name (case-insensitive)
        { description: { $regex: query, $options: "i" } }, // Search by product description (case-insensitive)
      ],
    }).populate("parentCategory");

    if (categories.length === 0) {
      return res
        .status(404)
        .json({ message: "No categories found matching the search query" });
    }

    res.status(200).json({ totalCategories: categories.length, categories });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};

module.exports = {
  addCategory,
  deleteCategory,
  updateCategory,
  getCategories,
  searchCategory,
};
