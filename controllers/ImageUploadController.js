import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import Vendor from "../models/Vendor.js";

export const uploadImagesForVendor = async (req, res) => {
  try {
    // Must be logged in as vendor
    if (!req.user || req.user.role !== "vendor") {
      return res.status(403).json({ message: "Only vendors can upload images" });
    }

    const vendorId = req.params.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Ownership check
    if (vendor.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "You can only upload to your own profile" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedURLs = [];

    // Helper to upload buffer to Cloudinary
    const uploadBuffer = (fileBuffer, filename) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `eventoh/vendors/${vendorId}`,
            public_id: filename.replace(/\.[^/.]+$/, ""),
            overwrite: false,
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Upload Error:", error);
              return reject(error);
            }
            resolve(result);
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    // Upload sequentially
    for (const file of req.files) {
      const result = await uploadBuffer(file.buffer, file.originalname);
      uploadedURLs.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }

    // Append to vendor portfolio
    const existing = vendor.portfolio || [];
    const newUrls = uploadedURLs.map((u) => u.url);
    vendor.portfolio = Array.from(new Set([...existing, ...newUrls]));
    await vendor.save();

    return res.status(200).json({
      message: "Images uploaded successfully",
      uploaded: uploadedURLs,
      portfolio: vendor.portfolio,
    });
  } catch (err) {
    console.error("❌ Image Upload Error:", err);
    // Always respond with JSON
    return res.status(500).json({
      message: "Upload failed",
      error: err.message || "Unknown error",
    });
  }
};
