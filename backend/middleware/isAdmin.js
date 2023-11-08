const checkAdmin = (req, res, next) => {
  const userRole = req.user && req.user.role;

  if (userRole !== "admin") {
    return res.status(403).json({
      error: "Access forbidden. Only admin users are allowed.",
    });
  }

  next();
};

module.exports = checkAdmin;
