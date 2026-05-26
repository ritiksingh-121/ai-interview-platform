import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

import interviewRoutes from "./routes/interviewRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.FRONTEND_URL,
    ],
    credentials: true,
  })
);

// Stripe webhook MUST come before express.json()
app.use("/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

// Routes
app.use("/api/interview", interviewRoutes);
app.use("/api/feedback", feedbackRoutes);

// ========================================
// CREATE CHECKOUT SESSION
// ========================================
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { plan, userId } = req.body;

    const priceMap = {
      pro: 19900, // ₹199
      advanced: 49900, // ₹499
    };

    if (!priceMap[plan]) {
      return res.status(400).json({
        error: "Invalid plan",
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "inr",

            product_data: {
              name: `${plan.toUpperCase()} Plan`,
            },

            unit_amount: priceMap[plan],
          },

          quantity: 1,
        },
      ],

      metadata: {
        userId: userId || "unknown",
        plan,
      },

      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
    });

    res.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout Error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// ========================================
// STRIPE WEBHOOK
// ========================================
app.post("/webhook", (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log("✅ Payment Successful");
    console.log("User ID:", session.metadata.userId);
    console.log("Plan:", session.metadata.plan);

    // TODO:
    // Update Firestore user subscription here
  }

  res.status(200).json({
    received: true,
  });
});

// Health Check
app.get("/", (req, res) => {
  res.json({
    status: "Backend Running 🚀",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});