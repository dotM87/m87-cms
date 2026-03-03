const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(process.cwd(), ".env") });

const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PROD = NODE_ENV === "production";

module.exports = {
  NODE_ENV,
  IS_PROD,
  PORT: Number(process.env.PORT) || 4321,
  CONTENT_DIR: process.env.CONTENT_DIR || "content",
  PUBLIC_DIR: process.env.PUBLIC_DIR || "public",
  ADMIN_DIR: process.env.ADMIN_DIR || "admin",
  UPLOADS_PATH: process.env.UPLOADS_PATH || "uploads",
  ADMIN_USER: process.env.ADMIN_USER || "admin",
  ADMIN_PASS_HASH: process.env.ADMIN_PASS_HASH || "",
  ADMIN_PASS: process.env.ADMIN_PASS || "admin123",
  SESSION_TTL_MS: Number(process.env.SESSION_TTL_MS) || 24 * 60 * 60 * 1000,
  MAX_UPLOAD_SIZE: Number(process.env.MAX_UPLOAD_SIZE) || 5 * 1024 * 1024,
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || "Strict",
  ALLOWED_IMAGE_MIME: new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]),
  ALLOWED_IMAGE_EXT: new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"])
};