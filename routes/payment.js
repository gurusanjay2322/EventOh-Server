import express from "express";
import Stripe from "stripe";
const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { amount, vendorName, customerEmail } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Advance Payment - ${vendorName}`,
            },
            unit_amount: Math.round(amount * 100), // convert to paise
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:5173/payment-success",
      cancel_url: "http://localhost:5173/payment-cancel",
    });

    // ✅ NEW: Return the full URL (not session.id)
    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe Session Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
