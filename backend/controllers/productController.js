const Comment = require("../models/reviewModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const productVariant = require("../models/productVariantModel");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dgrttjl8s",
  api_key: "391611877572426",
  api_secret: "KNKqkXrQoRIWy-IRVUDViRguifw",
});

// //////////////////////////////////////////////////////////////////
// Create Product
// //////////////////////////////////////////////////////////////////

const createProduct = async (req, res) => {
  try {
    const { name, description, categories } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide product name" });
    }

    // Use a single query to find all categories by their IDs
    const productCategories = await Category.find({ _id: { $in: categories } });
    if (categories) {
      if (productCategories.length === 0) {
        return res.status(400).json({
          success: false,
          message: "One or more categories do not exist",
        });
      }
    }

    const newProduct = new Product({
      name,
      description,
      category: productCategories,
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      id: savedProduct._id,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// //////////////////////////////////////////////////////////////////
// Add Product Variant
// //////////////////////////////////////////////////////////////////

const addVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const { size, color, stock, price, discount } = req.body;
    const { images } = req.files;

    const uploadedImageUrls = await Promise.all(
      images.map(async (url) => {
        const uploadedImage = await cloudinary.uploader.upload(
          url.tempFilePath
        );
        return uploadedImage.secure_url;
      })
    );
    const totalPrice = price - (discount * price) / 100;

    const variant = new productVariant({
      size,
      color,
      stock,
      price,
      discount,
      totalPrice,
      images: uploadedImageUrls,
      product: productId,
    });

    await variant.save();

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId },
      {
        $push: {
          variants: variant._id,
        },
      }
    );

    if (!updatedProduct) {
      for (const imageUrl of uploadedImageUrls) {
        const publicId = imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(201).json({
      success: true,
      message: "Variant added successfully",
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// //////////////////////////////////////////////////////////////////
// Delete Product
// //////////////////////////////////////////////////////////////////

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Delete associated images from Cloudinary
    const deletedImageUrls = [];

    for (variant of deletedProduct.variants) {
      const variants = await productVariant.findById(variant);
      variants.images.map((imgUrl) => deletedImageUrls.push(imgUrl));
    }

    if (deletedImageUrls.length !== 0) {
      for (const images of deletedImageUrls) {
        const publicId = images?.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
    }

    deletedProduct.variants?.forEach(async (variant) => {
      await productVariant.findByIdAndDelete(variant);
    });

    res.status(200).json({
      success: true,
      message: "Product and associated images deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// //////////////////////////////////////////////////////////////////
// Get All Products
// //////////////////////////////////////////////////////////////////

const getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get page number from query parameter
    const perPage = parseInt(req.query.perPage) || 10; // Get number of items per page from query parameter

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / perPage);

    const products = await Product.find({ variants: { $not: { $size: 0 } } })
      .populate("variants")
      .populate("category")
      .populate({ path: "category", populate: "parentCategory" })
      .skip((page - 1) * perPage)
      .limit(perPage);

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json({
      totalProducts,
      totalPages,
      currentPage: page,
      products,
    });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};

// //////////////////////////////////////////////////////////////////
// Get single product
// //////////////////////////////////////////////////////////////////

const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate("variants")
      .populate("category")
      .populate({ populate: "parentCategory", path: "category" });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "No product found with id " + id });
    }
    product.viewCount += 1;

    // Save the updated product
    await product.save();

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// //////////////////////////////////////////////////////////////////
// Update Product
// //////////////////////////////////////////////////////////////////

const updateProduct = async (req, res, next) => {
  const { id } = req.params;
  const { name, description, categories } = req.body;

  try {
    const productUpdate = {
      description,
      name,
    };

    const productCategories = await Category.find({ _id: { $in: categories } });
    if (categories) {
      if (!productCategories.length) {
        return res.status(400).json({
          success: false,
          message: "One or more categories do not exist",
        });
      }
      productUpdate.category = productCategories;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, productUpdate, {
      new: true,
    });

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "No product found with id " + id });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    // Pass the error to the error handler middleware
    next(error);
  }
};

// //////////////////////////////////////////////////////////////////
// Update Product Variant
// //////////////////////////////////////////////////////////////////

const updateVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { size, color, stock, price, discount } = req.body;

    let images = [];
    if (req.files && req.files.images) {
      const imageFiles = req.files.images;

      if (imageFiles.length === undefined) {
        images.push(imageFiles);
      } else {
        for (const image of imageFiles) {
          images.push(image);
        }
      }
    }
    const originalVariant = await productVariant.findById(variantId);

    if (!originalVariant) {
      return res
        .status(404)
        .json({ success: false, message: "Variant not found" });
    }

    const originalImageUrls = originalVariant.images.slice();

    originalVariant.size = size || originalVariant.size;
    originalVariant.stock = stock || originalVariant.stock;
    originalVariant.color = color || originalVariant.color;
    originalVariant.price = price || originalVariant.price;
    originalVariant.discount = discount || originalVariant.discount;

    originalVariant.totalPrice = price - (discount * price) / 100;

    originalVariant.save();
    if (images.length !== 0) {
      const uploadedImageUrls = await Promise.all(
        images.map(async (url) => {
          const uploadedImage = await cloudinary.uploader.upload(
            url.tempFilePath
          );
          return uploadedImage.secure_url;
        })
      );

      originalVariant.images = uploadedImageUrls;

      originalVariant.save();
    }

    if (images.length !== 0) {
      try {
        for (const imageUrl of originalImageUrls) {
          // Extract public ID from image URL
          const publicId = imageUrl.split("/").pop().split(".")[0];
          // Delete image from Cloudinary using the public ID
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (error) {
        // Revert back to original image URLs
        originalVariant.images = originalImageUrls;
        await originalProduct.save();
        return res.status(500).json({
          success: false,
          message: "Failed to delete previous images from Cloudinary",
        });
      }
    }

    res
      .status(200)
      .json({ success: true, message: "Variant updated successfully" });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error(error);

    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// //////////////////////////////////////////////////////////////////
// Delete Product Variant
// //////////////////////////////////////////////////////////////////

const deleteVariant = async (req, res) => {
  try {
    const { variantId } = req.params;

    const variantToDelete = await productVariant.findOne({ _id: variantId });
    if (!variantToDelete) {
      return res
        .status(404)
        .json({ success: false, message: "Variant not found" });
    }

    // Delete images from Cloudinary
    try {
      for (const imageUrl of variantToDelete.images) {
        const publicId = imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete variant images from Cloudinary",
      });
    }

    // Remove the variant from the array and save the product

    await Product.findOneAndUpdate(
      { variants: variantId },
      { $pull: { variants: variantId } },
      { new: true }
    );

    await productVariant.findOneAndDelete({ _id: variantId });
    res.status(200).json({
      success: true,
      message: "Variant deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// //////////////////////////////////////////////////////////////////
// Search Products
// //////////////////////////////////////////////////////////////////

const searchProduct = async (req, res, next) => {
  try {
    const query = req.query.q; // Get the search query from the query parameter

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } }, // Search by product name (case-insensitive)
        { description: { $regex: query, $options: "i" } }, // Search by product description (case-insensitive)
      ],
    })
      .populate("variants")
      .populate("category")
      .populate({ populate: "parentCategory", path: "category" });

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found matching the search query" });
    }

    res.status(200).json({ totalProducts: products.length, products });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};

// //////////////////////////////////////////////////////////////////
// Filter and Sort Products
// //////////////////////////////////////////////////////////////////

const filterAndSort = async (req, res, next) => {
  try {
    const {
      category,
      color,
      size,
      minPrice,
      maxPrice,
      minDiscount,
      maxDiscount,
      sortBy,
      sortOrder,
    } = req.query;

    const filter = {};
    if (category) {
      filter.category = category;
    }
    if (color) {
      filter["variants.color"] = color;
    }
    if (size) {
      filter["variants.size"] = size;
    }
    if (minPrice && maxPrice) {
      filter.price = { $gte: minPrice, $lte: maxPrice };
    }
    if (minDiscount && maxDiscount) {
      filter.discount = { $gte: minDiscount, $lte: maxDiscount };
    }

    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
    }

    const products = await Product.find(filter)
      .sort(sortOptions)
      .populate("variants")
      .populate("category")
      .populate({ path: "category", populate: "parentCategory" });

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json({
      totalProducts: products.length,
      products: products,
    });
  } catch (error) {
    next(error);
  }
};

// //////////////////////////////////////////////////////////////////
// Add Reviews on Products
// //////////////////////////////////////////////////////////////////

const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { comment, rating } = req.body;
    const userId = req.user.id; // Extracted from authentication middleware

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Please provide a rating",
      });
    }

    if (rating > 5 || rating < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 0 and 5" });
    }

    // Check if the user has already reviewed the product
    const existingReview = await Comment.findOne({
      user: userId,
      product: productId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Find the product
    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Create a new comment
    const newComment = new Comment({
      comment,
      rating: parseInt(rating),
      user: userId,
      product: productId,
    });

    // Save the comment
    await newComment.save();

    // Update the product's reviews array with the new comment's ID
    product.reviews.push(newComment);

    // Calculate new product rating based on all comments
    const ratings = product.reviews.map((comment) => comment.rating);

    const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
    product.rating = totalRating / product.reviews.length;

    // Save the updated product
    await product.save();

    res
      .status(201)
      .json({ success: true, message: "Review added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// //////////////////////////////////////////////////////////////////
// Get Reviews of Products
// //////////////////////////////////////////////////////////////////

const getReviews = async (req, res) => {
  const { productId } = req.params;

  const reviews = await Comment.find({ product: productId });

  if (reviews.length === 0) {
    return res.status(404).json({ success: false, message: "No reviews" });
  }

  res
    .status(200)
    .json({ success: true, totalReviews: reviews.length, reviews });
};

// //////////////////////////////////////////////////////////////////
// Delete Reviews on Products
// //////////////////////////////////////////////////////////////////

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id; // Extracted from authentication middleware

    // Find the comment
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    // Check if the user is the author of the comment
    if (comment.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment",
      });
    }

    // Remove the comment reference from the product's comments array
    const product = await Product.findOneAndUpdate(
      { reviews: commentId },
      { $pull: { reviews: commentId } },
      { new: true }
    );

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    // Update the product's rating based on remaining comments
    const remainingComments = await Comment.find({
      _id: { $in: product.reviews },
    });

    if (remainingComments.length === 0) {
      product.rating = 0; // No remaining comments, set rating to 0
    } else {
      const totalRating = remainingComments.reduce(
        (sum, comment) => sum + comment.rating,
        0
      );
      product.rating = totalRating / remainingComments.length;
    }

    await product.save();

    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// //////////////////////////////////////////////////////////////////
// Get Hot Products
// //////////////////////////////////////////////////////////////////

const getHotProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("variants")
      .populate("category")
      .populate({ populate: "parentCategory", path: "category" });

    // Calculate hotnessScore for each product
    const hotProducts = products.map((product) => {
      const salesCount = product.salesCount || 0; // If salesCount is not available, assume 0
      const viewsCount = product.viewCount || 0; // If viewsCount is not available, assume 0
      const averageRating = product.rating || 0; // If rating is not available, assume 0

      // Assign weights to each factor
      const salesWeight = 0.4;
      const viewsWeight = 0.3;
      const ratingWeight = 0.3;

      // Calculate hotnessScore
      const hotnessScore =
        salesCount * salesWeight +
        viewsCount * viewsWeight +
        averageRating * ratingWeight;

      return {
        ...product.toObject(),
        hotnessScore,
      };
    });

    // Sort hotProducts by hotnessScore in descending order
    hotProducts.sort((a, b) => b.hotnessScore - a.hotnessScore);

    // Select top 10 hot products
    const topHotProducts = hotProducts.slice(0, 10);

    res.status(200).json({ success: true, hotProducts: topHotProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  updateVariant,
  addVariant,
  searchProduct,
  filterAndSort,
  deleteProduct,
  deleteVariant,
  addReview,
  getReviews,
  deleteComment,
  getHotProducts,
};
