const fs = require("fs");
const path = require("path");
const { UPLOADS_ABS_DIR } = require("../config/paths");

function getUploadPath(fileName) {
  return path.join(UPLOADS_ABS_DIR, fileName);
}

function moveUploadFile(sourcePath, targetFileName) {
  const targetPath = getUploadPath(targetFileName);
  fs.renameSync(sourcePath, targetPath);
  return targetPath;
}

function removeFile(filePath) {
  fs.unlink(filePath, () => {});
}

module.exports = {
  getUploadPath,
  moveUploadFile,
  removeFile
};
