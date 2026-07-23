import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import interviewRoutes from "./routes/interviewRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import completionRoutes from "./routes/completionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.ts";
import roadmapRoutes from "./routes/roadmapRoutes.ts";
import challengeRoutes from "./routes/challengeRoutes.ts";
import hrRoutes from "./routes/hrRoutes.ts";
import codeReviewRoutes from "./routes/codeReviewRoutes.ts";
import codingRoutes from "./routes/codingRoutes.ts";
import voiceRoutes from "./routes/voiceRoutes.ts";
import recruiterRoutes from "./routes/recruiterRoutes.ts";
import coachRoutes from "./routes/coachRoutes.ts";
import githubRoutes from "./routes/githubRoutes.ts";
import portfolioRoutes from "./routes/portfolioRoutes.ts";
import { generalLimiter, aiLimiter } from "./middleware/rateLimit.ts";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(helmet());
app.use(cors({
  origin: ["http://localhost:5173", process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
}));
app.use(cookieParser());
app.use(generalLimiter);

app.use("/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/users", userRoutes);
app.use("/api/interview", aiLimiter, interviewRoutes);
app.use("/api/feedback", aiLimiter, feedbackRoutes);
app.use("/api/completion", aiLimiter, completionRoutes);
app.use("/api/resume", aiLimiter, resumeRoutes);
app.use("/api/roadmap", aiLimiter, roadmapRoutes);
app.use("/api/challenge", aiLimiter, challengeRoutes);
app.use("/api/hr", aiLimiter, hrRoutes);
app.use("/api/code-review", aiLimiter, codeReviewRoutes);
app.use("/api/coding", aiLimiter, codingRoutes);
app.use("/api/voice", aiLimiter, voiceRoutes);
app.use("/api/recruiter", aiLimiter, recruiterRoutes);
app.use("/api/coach", aiLimiter, coachRoutes);
app.use("/api/github", aiLimiter, githubRoutes);
app.use("/api/portfolio", aiLimiter, portfolioRoutes);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { plan, userId } = req.body;
    const priceMap: Record<string, number> = { pro: 19900, advanced: 49900 };

    if (!priceMap[plan]) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "inr",
          product_data: { name: `${plan.toUpperCase()} Plan` },
          unit_amount: priceMap[plan],
        },
        quantity: 1,
      }],
      metadata: { userId: userId || "unknown", plan },
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/webhook", (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("✅ Payment Successful - User:", session.metadata?.userId, "Plan:", session.metadata?.plan);
  }

  res.status(200).json({ received: true });
});

app.get("/", (_req, res) => {
  res.json({ status: "Backend Running 🚀" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
