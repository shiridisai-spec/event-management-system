const UnauthenticatedError = require("../errors/unauthenticated");

const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      throw new UnauthenticatedError("Access denied");
    }
    next();
  };
};

module.exports = roleMiddleware;
