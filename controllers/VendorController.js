// src/controllers/VendorController.js
import Vendor from "../models/Vendor.js";

/**
 * @desc Get all vendors (with optional filters)
 * @route GET /api/vendors
 */
export const getAllVendors = async (req, res) => {
  try {
    const { type, city, category } = req.query;
    const query = {};

    if (type) query.type = type;
    if (city) query.city = { $regex: new RegExp(city, "i") };
    if (category) query.freelancerCategory = category;

    const vendors = await Vendor.find(query).populate("userId", "name email");

    return res.status(200).json({ count: vendors.length, vendors });
  } catch (err) {
    console.error("❌ Get Vendors Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
/**
 * @desc Get logged-in vendor profile
 * @route GET /api/vendor/myProfile
 * @access Vendor only
 */
export const getMyVendorProfile = async (req, res) => {
  try {
    // Ensure only vendors can access
    if (req.user.role !== "vendor") {
      return res.status(403).json({ message: "Access denied: Not a vendor" });
    }

    // Find vendor document by logged-in user's ID
    const vendor = await Vendor.findOne({ userId: req.user.id }).populate(
      "userId",
      "name email role"
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    res.status(200).json({ vendor });
  } catch (err) {
    console.error("❌ Get My Vendor Profile Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
/**
 * @desc Get single vendor by ID
 * @route GET /api/vendors/:id
 */
export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate("userId", "name email");
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    return res.status(200).json(vendor);
  } catch (err) {
    console.error("❌ Get Vendor Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * @desc Update vendor profile
 * @route PUT /api/vendors/:id
 * @access Vendor only
 */
export const updateVendor = async (req, res) => {
  try {
    const vendorId = req.params.id;

    // Only allow vendor to update their own profile
    if (req.user.role !== "vendor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    if (String(vendor.userId) !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own profile" });
    }

    const updated = await Vendor.findByIdAndUpdate(vendorId, req.body, { new: true });

    return res.status(200).json({ message: "Vendor updated successfully", vendor: updated });
  } catch (err) {
    console.error("❌ Update Vendor Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * @desc Update vendor availability
 * @route PATCH /api/vendors/:id/availability
 * @access Vendor only
 */
export const updateAvailability = async (req, res) => {
  try {
    const { bookedDates } = req.body;
    if (!Array.isArray(bookedDates))
      return res.status(400).json({ message: "bookedDates must be an array" });

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    // (Optional) Add logic to merge with existing bookings
    vendor.bookedDates = bookedDates;
    await vendor.save();

    res.status(200).json({ message: "Availability updated successfully", bookedDates });
  } catch (err) {
    console.error("❌ Update Availability Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
/**
 * @desc Get all booked/unavailable dates for a vendor
 * @route GET /api/vendors/:id/booked-dates
 */
export const getBookedDates = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).select("bookedDates name type city");
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    return res.status(200).json({
      vendorId: vendor._id,
      name: vendor.name,
      type: vendor.type,
      city: vendor.city,
      bookedDates: vendor.bookedDates || [],
    });
  } catch (err) {
    console.error("❌ Get Booked Dates Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

