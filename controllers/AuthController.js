// src/controllers/AuthController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
/**
 * Helper: generate JWT token
*/
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });
};

/**
 * Helper: sanitize user object before sending to client
*/
const sanitizeUser = (userDoc) => {
  if (!userDoc) return null;
  const { _id, name, email, role, createdAt, profilePhoto } = userDoc;
  return { id: _id, name, email, role, createdAt, profilePhoto };
};
  



const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};
/**
 * @desc Register a normal customer user
 * @route POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    // Create user first (to get an _id for folder path)
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role: "customer",
    });

    const folderPath = `eventoh/customers/${user._id}`;
    let profilePhotoUrl = "";

    // ✅ Handle profile photo upload if provided
    const profilePhotoFile = req.files?.find((f) => f.fieldname === "profilePhoto");
    if (profilePhotoFile) {
      profilePhotoUrl = await uploadToCloudinary(profilePhotoFile, folderPath);
      user.profilePhoto = profilePhotoUrl;
    }

    await user.save();

    const token = generateToken(user);

    return res.status(201).json({
      message: "Customer registration successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("❌ Register Error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};



/**
 * @desc Register a vendor and create vendor profile
 * @route POST /api/auth/vendorRegister
 */
export const vendorRegister = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      type,
      city,
      contactNumber,
      description,
      freelancerCategory,
      basePrice,
      packageName,
      packageDescription,
      packagePrice,
      eventTypes,
    } = req.body;

    if (!name || !email || !password || !type || !city) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "vendor",
    });

    const folderPath = `eventoh/vendors/${user._id}`;
    let profilePhotoUrl = "";
    let portfolioUrls = [];

    // ✅ Profile Photo Upload
    const profilePhotoFile = req.files.find(
      (f) => f.fieldname === "profilePhoto"
    );
    if (profilePhotoFile) {
      profilePhotoUrl = await uploadToCloudinary(profilePhotoFile, folderPath);
    }

    // ✅ Portfolio Upload
    const portfolioFiles = req.files.filter((f) => f.fieldname === "portfolio");
    if (portfolioFiles.length) {
      const uploads = portfolioFiles.map((f) =>
        uploadToCloudinary(f, `${folderPath}/portfolio`)
      );
      portfolioUrls = await Promise.all(uploads);
    }

    // ✅ Build vendorData
    const vendorData = {
      userId: user._id,
      name,
      type,
      city,
      contactNumber,
      description,
      profilePhoto: profilePhotoUrl,
      portfolio: portfolioUrls,
      pricing: basePrice ? { basePrice, currency: "INR" } : undefined,
    };

    // ✅ Type-based handling
    if (type === "freelancer") {
      vendorData.freelancerCategory = freelancerCategory;
    }

    if (type === "event_team") {
      vendorData.eventTeamDetails = {
        eventTypesCovered: eventTypes ? eventTypes.split(",") : [],
        packages: [
          {
            name: packageName,
            description: packageDescription,
            price: Number(packagePrice),
          },
        ],
      };
    }

    // ✅ Venue-specific handling (multi-venue with images)
    if (type === "venue") {
      const venues = [];

      for (let i = 0; ; i++) {
        // support both "venue[0].title" and "venue[0][title]"
        const title =
          req.body[`venue[${i}].title`] || req.body[`venue[${i}][title]`];
        if (!title) break; // stop if no more venues

        const capacity =
          Number(
            req.body[`venue[${i}].capacity`] ||
              req.body[`venue[${i}][capacity]`]
          ) || 0;
        const pricePerDay =
          Number(
            req.body[`venue[${i}].pricePerDay`] ||
              req.body[`venue[${i}][pricePerDay]`]
          ) || 0;
        const pricePerHour =
          Number(
            req.body[`venue[${i}].pricePerHour`] ||
              req.body[`venue[${i}][pricePerHour]`]
          ) || 0;

        const amenitiesRaw =
          req.body[`venue[${i}].amenities`] ||
          req.body[`venue[${i}][amenities]`] ||
          "";
        const amenities = amenitiesRaw
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean);

        const imageFiles = (req.files || []).filter(
          (f) =>
            f.fieldname === `venue[${i}].images` ||
            f.fieldname === `venue[${i}][images]`
        );

        let uploadedImages = [];
        if (imageFiles.length > 0) {
          const uploads = imageFiles.map((file) =>
            uploadToCloudinary(file, `${folderPath}/venues/venue_${i}`)
          );
          uploadedImages = await Promise.all(uploads);
        }

        venues.push({
          title,
          capacity,
          pricePerDay,
          pricePerHour,
          amenities,
          images: uploadedImages,
        });
      }

      if (venues.length === 0) {
        return res
          .status(400)
          .json({ message: "At least one venue is required." });
      }

      vendorData.venueUnits = venues;
    }

    const newVendor = new Vendor(vendorData);
    await newVendor.save();

    const token = jwt.sign(
      { id: user._id, role: "vendor" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Vendor registered successfully",
      user: { id: user._id, email, role: "vendor" },
      vendor: newVendor,
      token,
    });
  } catch (err) {
    console.error("❌ Vendor Register Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * @desc Login (common for all users)
 * @route POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log("🧠 Login attempt:", email);
    console.log("📦 Found user:", user);

    const validPassword = await bcrypt.compare(password, user.password);
    console.log("🔐 Comparing:", password, "vs", user.password);
    console.log("✅ Match result:", validPassword);

    if (!validPassword)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    let vendorProfile = null;
    if (user.role === "vendor") {
      vendorProfile = await Vendor.findOne({ userId: user._id }).lean();
    }

    return res.status(200).json({
      message: "Login successful",
      token,
      user: sanitizeUser(user),
      vendorProfile,
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
