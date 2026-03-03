const express = require("express");
const uploadController = require("../controllers/uploadController");
const { requireAuth } = require("../middlewares/authMiddleware");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

router.post("/upload-image", requireAuth, asyncHandler(uploadController.uploadImage));

module.exports = { uploadRoutes: router };
