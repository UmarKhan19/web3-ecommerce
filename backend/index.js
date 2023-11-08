const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const couponRoutes = require("./routes/couponRoutes");
const orderRoutes = require("./routes/orderRoutes");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

dotenv.config({ path: "./config/.env" });

const PORT = process.env.PORT || 5000;

connectDB();
const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use(fileUpload({ useTempFiles: true }));

// Routes
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/order", orderRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "mac"} mode on port ${PORT}`
  );
});
