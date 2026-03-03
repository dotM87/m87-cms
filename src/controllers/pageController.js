const path = require("path");
const { PUBLIC_ABS_DIR, ADMIN_ABS_DIR } = require("../config/paths");

function homePage(req, res) {
  res.sendFile(path.join(PUBLIC_ABS_DIR, "index.html"));
}

function postPage(req, res) {
  res.sendFile(path.join(PUBLIC_ABS_DIR, "post.html"));
}

function adminPage(req, res) {
  res.sendFile(path.join(ADMIN_ABS_DIR, "index.html"));
}

module.exports = {
  homePage,
  postPage,
  adminPage
};
