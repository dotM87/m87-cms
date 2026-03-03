const express = require("express");
const pageController = require("../controllers/pageController");

const router = express.Router();

router.get("/", pageController.homePage);
router.get("/post", pageController.postPage);
router.get("/admin", pageController.adminPage);

module.exports = { pageRoutes: router };
