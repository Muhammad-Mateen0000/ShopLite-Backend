import multer from "multer";
import type { FileFilterCallback } from "multer";
import type { Request } from "express";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const allowedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
];

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
) => {
  const extension = file.originalname
    .toLowerCase()
    .slice(file.originalname.lastIndexOf("."));

  const validMimeType = allowedMimeTypes.includes(
    file.mimetype
  );

  const validExtension = allowedExtensions.includes(
    extension
  );

  if (!validMimeType || !validExtension) {
    callback(
      new Error(
        "Only JPG, PNG and WebP images are allowed"
      )
    );

    return;
  }

  callback(null, true);
};

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter,
});