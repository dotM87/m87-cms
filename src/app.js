const express = require("express");
const path = require("path");
const { securityHeaders } = require("./middlewares/securityHeaders");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");
const authService = require("./services/authService");
const { authRoutes } = require("./routes/authRoutes");
const { postRoutes } = require("./routes/postRoutes");
const { uploadRoutes } = require("./routes/uploadRoutes");
const { pageRoutes } = require("./routes/pageRoutes");
const { PUBLIC_ABS_DIR } = require("./config/paths");
const { UPLOADS_PATH } = require("./config/env");
const { AppError } = require("./utils/httpError");

function createApp() {
  const app = express();

  app.set("trust proxy", true);
  app.use(securityHeaders);

  app.use((req, res, next) => {
    req.auth = authService.getAuthState(req);
    next();
  });

  app.use(express.json({ limit: "1mb" }));

  app.use((error, req, res, next) => {
    if (error && error.type === "entity.too.large") {
      return next(new AppError(400, "Payload inválido"));
    }
    next(error);
  });

  app.use(`/${UPLOADS_PATH}`, express.static(path.join(PUBLIC_ABS_DIR, UPLOADS_PATH)));
  app.get("/style.css", (req, res) => {
    res.sendFile(path.join(PUBLIC_ABS_DIR, "style.css"));
  });
  app.use("/js", express.static(path.join(PUBLIC_ABS_DIR, "js")));

  app.use("/api/admin", authRoutes);
  app.use("/api", postRoutes);
  app.use("/api", uploadRoutes);
  app.use(pageRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
