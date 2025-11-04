import cron from "node-cron";
import Booking from "../models/Booking.js";
import { sendEmail } from "../utils/mailer.js";

// ✅ Exported function that starts the cron job
export const startPaymentReminderJob = () => {
  // Runs every day at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ Checking for bookings with pending payments...");

    const now = new Date();

    try {
      const dueBookings = await Booking.find({
        endDate: { $lt: now },
        paymentStatus: "partial",
        finalPaymentReminderSent: { $ne: true },
      }).populate("customerId", "email name");

      for (const booking of dueBookings) {
        const { customerId, totalAmount, advanceAmount, _id } = booking;
        const remaining = totalAmount - advanceAmount;

        // ✉️ Send reminder email
        await sendEmail(
          customerId.email,
          "Payment Reminder",
          `Hi ${customerId.name}, your booking has ended. Please pay the remaining ₹${remaining}.`
        );

        // ✅ Mark reminder as sent
        booking.finalPaymentReminderSent = true;
        await booking.save();

        console.log(`🔔 Reminder sent for booking ${_id}`);
      }
    } catch (err) {
      console.error("❌ Error in payment reminder job:", err);
    }
  });
};
