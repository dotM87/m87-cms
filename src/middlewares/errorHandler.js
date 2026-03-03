const { AppError } = require("../utils/httpError");

function notFoundHandler(req, res) {
  res.status(404).send("Not Found");
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Payload inválido" });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  return res.status(500).json({ error: "Error interno del servidor" });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
