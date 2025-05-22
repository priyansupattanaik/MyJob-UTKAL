// Permit middleware to allow only specific roles
module.exports.Permit = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: "Permission denied" });
    }
    next(); // If the role matches, proceed to the next middleware/controller
  };
};
