import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: { error: "AI request limit reached. Please wait before sending more requests." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many authentication attempts" },
  standardHeaders: true,
  legacyHeaders: false,
});
