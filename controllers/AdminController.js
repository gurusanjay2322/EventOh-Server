import Vendor from "../models/Vendor.js";
import User from "../models/User.js";

/**
 * @desc Get all vendors for admin panel
 * @route GET /api/admin/vendors
 */
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().populate("userId", "name email role");
    res.status(200).json({ vendors });
  } catch (err) {
    console.error("❌ Error fetching vendors:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * @desc Verify a Venue
 * @route PUT /api/admin/vendors/:id/verify
 */
export const verifyVenue = async (req, res) => {
  try {
    const { vendorId, venueId } = req.params;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Find the venue unit inside the vendor
    const venueUnit = vendor.venueUnits.id(venueId);
    if (!venueUnit) {
      return res.status(404).json({ message: "Venue unit not found" });
    }

    // Toggle or set verification status
    venueUnit.verified = true;
    await vendor.save();

    return res.status(200).json({
      message: `Venue "${venueUnit.title}" verified successfully`,
      venueUnit,
    });
  } catch (error) {
    console.error("❌ verifyVenue Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

