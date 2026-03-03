const { AppError } = require("../utils/httpError");

function requireAuth(req, res, next) {
  if (req.auth && req.auth.authenticated) {
    return next();
  }

  next(new AppError(401, "Unauthorized"));
}

module.exports = { requireAuth };
