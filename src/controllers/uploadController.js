const uploadService = require("../services/uploadService");
const rateLimitService = require("../services/rateLimitService");
const { AppError } = require("../utils/httpError");

async function uploadImage(req, res) {
  if (rateLimitService.isRateLimited(req, "upload", 30, 15 * 60 * 1000)) {
    throw new AppError(429, "Límite de subidas alcanzado temporalmente");
  }

  const result = await uploadService.uploadImage(req);
  res.status(201).json(result);
}

module.exports = {
  uploadImage
};
