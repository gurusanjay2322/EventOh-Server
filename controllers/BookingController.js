import Booking from "../models/Booking.js";
import mongoose from "mongoose";
import Vendor from "../models/Vendor.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @desc Create a new booking
 * @route POST /api/bookings
 */
export const createBooking = async (req, res) => {
  try {
    const { vendorId, venueUnitId, startDate, endDate, totalAmount, notes } =
      req.body;
    const customerId = req.user?.id;

    if (!vendorId || !startDate || !endDate || !totalAmount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Check vendor existence
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    // ✅ Prevent double-booking
    const existingBooking = await Booking.findOne({
      vendorId,
      startDate: { $lt: new Date(endDate) },
      endDate: { $gt: new Date(startDate) },
      bookingStatus: { $in: ["pending", "confirmed"] },
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "Vendor or venue is already booked for the selected dates",
      });
    }

    // ✅ Calculate advance amount percentage
    let advancePercent = 0;
    switch (vendor.type) {
      case "venue":
        advancePercent = 0.4; // 40%
        break;
      case "freelancer":
        advancePercent = 0.25; // 25%
        break;
      case "event_team":
        advancePercent = 0.5; // 50%
        break;
      default:
        advancePercent = 0.3; // fallback
    }
    // ✅ Calculate totalAmount dynamically if not sent
    let finalTotal = totalAmount;
    if (!totalAmount || totalAmount <= 0) {
      if (vendor.type === "venue" && vendor.venueUnits?.length > 0) {
        const venueUnit = vendor.venueUnits.find(
          (v) => v._id.toString() === venueUnitId
        );
        if (venueUnit) {
          // Number of days between start & end
          const days =
            (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) +
            1;
          finalTotal = days * venueUnit.pricePerDay;
        }
      } else if (vendor.type === "freelancer") {
        finalTotal = vendor.pricing?.basePrice || 0;
      } else if (vendor.type === "event_team") {
        finalTotal = vendor.packagePrice || 0;
      }
    }

    const advanceAmount = totalAmount * advancePercent;

    // ✅ Create booking
    // ✅ Build booking data conditionally
    const bookingData = {
      customerId,
      vendorId,
      startDate,
      endDate,
      totalAmount,
      advanceAmount,
      notes,
      bookingType: vendor.type,
      paymentStatus: advanceAmount > 0 ? "partial" : "pending",
      bookingStatus: "pending",
    };

    // Only include venueUnitId if it's valid and vendor is a venue
    if (
      vendor.type === "venue" &&
      venueUnitId &&
      mongoose.isValidObjectId(venueUnitId)
    ) {
      bookingData.venueUnitId = venueUnitId;
    }

    const booking = await Booking.create(bookingData);

    res.status(201).json({
      message: "Booking created successfully",
      booking,
      paymentBreakdown: {
        totalAmount: finalTotal,
        advanceAmount,
        remainingAmount: finalTotal - advanceAmount,
        percentage: advancePercent * 100 + "%",
        note: `An advance of ${advancePercent * 100}% is required for ${
          vendor.type
        } bookings.`,
      },
    });
  } catch (err) {
    console.error("❌ Booking Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * @desc Get all bookings for a customer or vendor
 * @route GET /api/bookings
 */
export const getBookings = async (req, res) => {
  try {
    const { role, id } = req.user;
    let filter = {};

    if (role === "vendor") {
      // 🔍 Find vendor document linked to this user
      const vendor = await Vendor.findOne({ userId: id }).select("_id");
      if (!vendor) {
        return res
          .status(404)
          .json({ message: "Vendor profile not found for this user" });
      }
      filter = { vendorId: vendor._id };
    } else if (role === "customer") {
      filter = { customerId: id };
    } else if (role === "admin") {
      filter = {}; // admin can see all
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    console.log("🔍 Booking Filter:", filter);

    const bookings = await Booking.find(filter)
      .populate("vendorId", "name type city")
      .populate("customerId", "name email")
      .sort({ createdAt: -1 });

    console.log(`📦 Found ${bookings.length} bookings`);
    res.status(200).json({ bookings });
  } catch (err) {
    console.error("❌ Get Bookings Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const payRemainingAmount = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const remaining = booking.totalAmount - booking.advanceAmount;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: "Remaining Payment" },
            unit_amount: remaining * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?bookingId=${bookingId}&final=false`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-failed`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    res.status(500).json({ message: "Payment session failed" });
  }
};

/**
 * @desc Update booking status (e.g., confirm/cancel)
 * @route PUT /api/bookings/:id/status
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user.role !== "vendor") {
      return res
        .status(403)
        .json({ message: "Only vendors can update booking status" });
    }

    const allowed = ["pending", "confirmed", "cancelled", "completed"];
    if (!allowed.includes(status))
      return res.status(400).json({ message: "Invalid booking status" });

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Make sure the vendor owns this booking
    if (booking.vendorId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this booking" });
    }

    booking.bookingStatus = status;
    await booking.save();

    res.status(200).json({
      message: "Booking status updated successfully",
      booking,
    });
  } catch (err) {
    console.error("❌ Update Booking Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
