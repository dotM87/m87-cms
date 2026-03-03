const path = require("path");
const { formidable } = require("formidable");
const { MAX_UPLOAD_SIZE, ALLOWED_IMAGE_MIME, ALLOWED_IMAGE_EXT, UPLOADS_PATH } = require("../config/env");
const { UPLOADS_ABS_DIR } = require("../config/paths");
const uploadRepository = require("../repositories/uploadRepository");
const { AppError } = require("../utils/httpError");

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      keepExtensions: true,
      maxFileSize: MAX_UPLOAD_SIZE,
      uploadDir: UPLOADS_ABS_DIR,
      filter: part => part.mimetype && ALLOWED_IMAGE_MIME.has(part.mimetype)
    });

    form.parse(req, (error, fields, files) => {
      if (error) {
        reject(new AppError(400, "Error al subir imagen"));
        return;
      }
      resolve({ fields, files });
    });
  });
}

async function uploadImage(req) {
  const { files } = await parseForm(req);
  const uploaded = Array.isArray(files.image) ? files.image[0] : files.image;

  if (!uploaded) {
    throw new AppError(400, "No se recibió imagen");
  }

  const extension = path.extname(uploaded.originalFilename || uploaded.newFilename || "").toLowerCase() || ".png";
  if (!ALLOWED_IMAGE_MIME.has(uploaded.mimetype) || !ALLOWED_IMAGE_EXT.has(extension)) {
    uploadRepository.removeFile(uploaded.filepath);
    throw new AppError(400, "Tipo de archivo no permitido");
  }

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
  uploadRepository.moveUploadFile(uploaded.filepath, fileName);

  return { ok: true, url: `/${UPLOADS_PATH}/${fileName}` };
}

module.exports = {
  uploadImage
};
