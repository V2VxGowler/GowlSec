import multer from "multer";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const profileUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 2,
    fields: 12,
  },
  fileFilter(req, file, callback) {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      const error = new Error(
        "Format refusé. Utilise une image PNG, JPG ou WebP."
      );
      error.code = "INVALID_IMAGE_TYPE";
      return callback(error);
    }

    return callback(null, true);
  },
});

export function handleProfileUploadError(error, req, res, next) {
  if (!error) return next();

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "Chaque image doit peser 5 Mo maximum.",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Fichier invalide ou formulaire d’upload incorrect.",
    });
  }

  if (error.code === "INVALID_IMAGE_TYPE") {
    return res.status(415).json({
      success: false,
      message: error.message,
    });
  }

  return next(error);
}
