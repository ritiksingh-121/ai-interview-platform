import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import interviewRoutes from "./routes/interviewRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";

dotenv.config();

const app = express();

// ⚠️ Webhook needs raw BEFORE json
app.use("/webhook", express.raw({ type: "application/json" }));

app.use(cors());
app.use(express.json());

app.use("/api/interview", interviewRoutes);
app.use("/api/feedback", feedbackRoutes);



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 🧩 CREATE CHECKOUT SESSION
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { plan, userId } = req.body;

    const priceMap = {
      pro: 19900,
      advanced: 49900
    };

    if (!priceMap[plan]) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // ✅ fixed
      mode: "payment", // ✅ fixed
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `${plan.toUpperCase()} Plan` // ✅ fixed
            },
            unit_amount: priceMap[plan]
          },
          quantity: 1
        }
      ],
      metadata: {
        userId: userId || "unknown" // 👈 important for webhook
      },
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/pricing"
    });

    res.json({ url: session.url });
  } catch (error) {
    console.log("Checkout Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 🧩 WEBHOOK (PAYMENT CONFIRMATION)
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
    console.log("❌ Webhook error:", err.message);
    return res.sendStatus(400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log("✅ Payment successful");
    console.log("User ID:", session.metadata.userId);

    // 👉 HERE you update Firestore later
  }

  res.sendStatus(200);
});

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});