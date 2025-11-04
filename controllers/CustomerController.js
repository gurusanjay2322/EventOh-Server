import User from "../models/User.js";

/**
 * @desc Get customer profile (self)
 * @route GET /api/customers/me
 * @access Customer only (requires JWT)
 */
export const getMyProfile = async (req, res) => {
  try {
    // only logged-in users can access
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Access denied: Customers only" });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "Customer profile retrieved successfully",
      user,
    });
  } catch (err) {
    console.error("❌ Get Profile Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * @desc Update customer profile
 * @route PUT /api/customers/me
 * @access Customer only
 */
export const updateMyProfile = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Access denied: Customers only" });
    }

    const allowedFields = ["name", "phone", "city"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field]) updates[field] = req.body[field];
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, select: "-password" }
    );

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("❌ Update Profile Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
