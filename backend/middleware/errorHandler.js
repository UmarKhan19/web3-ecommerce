const errorHandler = (err, req, res, next) => {
  // Log the error
  console.error(err.stack);

  // Default to Internal Server Error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Set a default response
  const response = {
    success: false,
    message: message,
  };

  // Include additional information in development mode
  if (process.env.NODE_ENV !== "production") {
    response.error = err;
  }

  // Send the response
  res.status(statusCode).json(response);
};

module.exports = errorHandler;
