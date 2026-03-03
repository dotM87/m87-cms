const express = require("express");
const postController = require("../controllers/postController");
const { requireAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/posts", postController.listPosts);
router.get("/post/:slug", postController.getPublicPost);
router.get("/admin/post/:slug", requireAuth, postController.getAdminPost);
router.post("/posts", requireAuth, postController.createPost);
router.put("/posts/:slug", requireAuth, postController.updatePost);

module.exports = { postRoutes: router };
