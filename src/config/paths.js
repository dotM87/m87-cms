const path = require("path");
const fs = require("fs");
const { CONTENT_DIR, PUBLIC_DIR, ADMIN_DIR, UPLOADS_PATH } = require("./env");

const ROOT_DIR = process.cwd();
const CONTENT_ABS_DIR = path.resolve(ROOT_DIR, CONTENT_DIR);
const PUBLIC_ABS_DIR = path.resolve(ROOT_DIR, PUBLIC_DIR);
const ADMIN_ABS_DIR = path.resolve(ROOT_DIR, ADMIN_DIR);
const UPLOADS_ABS_DIR = path.join(PUBLIC_ABS_DIR, UPLOADS_PATH);

function ensureBaseDirectories() {
  fs.mkdirSync(CONTENT_ABS_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_ABS_DIR, { recursive: true });
}

module.exports = {
  ROOT_DIR,
  CONTENT_ABS_DIR,
  PUBLIC_ABS_DIR,
  ADMIN_ABS_DIR,
  UPLOADS_ABS_DIR,
  ensureBaseDirectories
};
