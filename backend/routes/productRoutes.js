const express = require("express");
const {
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
  deleteComment,
  getHotProducts,
  getReviews,
} = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const checkAdmin = require("../middleware/isAdmin");

const router = express.Router();

router.post("/create", authMiddleware, checkAdmin, createProduct);
router.get("/all", getAllProducts);
router.get("/search", searchProduct);
router.get("/", filterAndSort);
router.get("/hot-products", getHotProducts);
router.get("/:id", getSingleProduct);
router.get("/reviews/:productId", getReviews);
router.put("/:id", authMiddleware, checkAdmin, updateProduct);
router.delete("/:id", authMiddleware, checkAdmin, deleteProduct);
router.put("/:variantId/update", authMiddleware, checkAdmin, updateVariant);
router.delete("/:variantId/delete", authMiddleware, checkAdmin, deleteVariant);
router.post("/:productId/add-variant", authMiddleware, checkAdmin, addVariant);

router.post("/:productId/reviews", authMiddleware, addReview);
router.delete("/:commentId/comment", authMiddleware, deleteComment);

module.exports = router;
