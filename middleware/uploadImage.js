// src/middleware/uploadImage.js
import multer from "multer";

const storage = multer.memoryStorage(); // we will upload buffer to cloudinary
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file - tweak as needed
  fileFilter: (req, file, cb) => {
    // accept images only
    if (file.mimetype && file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  },
});

export default upload;
