import type { ErrorRequestHandler } from "express";

import multer from "multer";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  console.error(error);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File size must not exceed 2 MB",
      });
    }

    return res.status(400).json({
      message: error.message,
    });
  }

  if (error instanceof Error) {
    if (error.message.includes("Only JPG, JPEG and PNG images are allowed")) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }

  return res.status(500).json({
    message: "Internal server error",
  });
};
