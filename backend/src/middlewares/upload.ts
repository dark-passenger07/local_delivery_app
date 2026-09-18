import { Request, Response, NextFunction } from "express";
import multer from "multer";

// Keep the uploaded file in memory (as a Buffer) so we can stream it straight
// to Cloudinary without ever persisting it to the server's disk.
const storage = multer.memoryStorage();

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

/**
 * Parse a single `image` form-data field and translate any multer error into a
 * clean JSON response, instead of letting it bubble up as an unhandled error.
 * On success, the file is available as `req.file`.
 */
export const uploadSingleImage = (req: Request, res: Response, next: NextFunction) => {
  upload.single("image")(req, res, (err: unknown) => {
    if (err) {
      const message =
        err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE"
          ? "Image is too large. Please pick an image under 5 MB."
          : err instanceof Error
          ? err.message
          : "Failed to upload image";
      return res.status(400).json({ success: false, message });
    }
    next();
  });
};

export default upload;
