const mongoose = require("mongoose");

function connectDB() {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log(`Connected to MongoDB host: ${mongoose.connection.host}`);
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
    });
}

module.exports = connectDB;
