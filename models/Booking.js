// models/Booking.js

import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    venueUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VenueUnit",
      required: function () {
        return this.bookingType === "venue"; // only required for venues
      },
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    advanceAmount: { type: Number, default: 0 }, // 💸 NEW FIELD
    notes: { type: String },
    bookingType: {
      type: String,
      enum: ["venue", "freelancer", "event_team"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid", "refunded"],
      default: "pending",
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    finalPaymentReminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
