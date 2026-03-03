const express = require("express");
const authController = require("../controllers/authController");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

router.post("/login", asyncHandler(authController.login));
router.post("/logout", authController.logout);
router.get("/session", authController.session);

module.exports = { authRoutes: router };
