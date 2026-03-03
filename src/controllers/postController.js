const postService = require("../services/postService");

function listPosts(req, res) {
  res.status(200).json(postService.listPosts());
}

function getPublicPost(req, res) {
  const post = postService.getPublicPost(req.params.slug);
  res.status(200).json(post);
}

function getAdminPost(req, res) {
  const post = postService.getAdminPost(req.params.slug);
  res.status(200).json(post);
}

function createPost(req, res) {
  const result = postService.createPost(req.body || {});
  res.status(201).json(result);
}

function updatePost(req, res) {
  const result = postService.updatePost(req.params.slug, req.body || {});
  res.status(200).json(result);
}

module.exports = {
  listPosts,
  getPublicPost,
  getAdminPost,
  createPost,
  updatePost
};
