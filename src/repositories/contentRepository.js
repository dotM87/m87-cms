const fs = require("fs");
const path = require("path");
const { CONTENT_ABS_DIR } = require("../config/paths");

function getPostFilePath(slug) {
  return path.join(CONTENT_ABS_DIR, `${slug}.md`);
}

function listPostFiles() {
  return fs.readdirSync(CONTENT_ABS_DIR).filter(file => file.endsWith(".md"));
}

function postExists(slug) {
  return fs.existsSync(getPostFilePath(slug));
}

function readPostRawBySlug(slug) {
  return fs.readFileSync(getPostFilePath(slug), "utf8");
}

function readPostStatBySlug(slug) {
  return fs.statSync(getPostFilePath(slug));
}

function writePostBySlug(slug, content) {
  fs.writeFileSync(getPostFilePath(slug), content, "utf8");
}

module.exports = {
  getPostFilePath,
  listPostFiles,
  postExists,
  readPostRawBySlug,
  readPostStatBySlug,
  writePostBySlug
};
