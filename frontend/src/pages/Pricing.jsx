import { motion } from "framer-motion";
import { handleCheckout } from "../api/stripe";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { fadeUp, staggerContainer } from "../lib/motion";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-safe">
      {/* HERO HEADER */}
      <section className="relative pt-32 pb-20 px-4 sm:px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-cyan-500/8 blur-[120px]" />
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-blue-600/10 blur-[80px]" />
          <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full bg-indigo-600/10 blur-[80px]" />
        </div>

        <div className="text-center max-w-3xl mx-auto space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge variant="cyan" className="px-4 py-1.5 text-xs uppercase tracking-widest">
              💎 Transparent Pricing
            </Badge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white"
          >
            Invest in Your{" "}
            <span className="gradient-accent-text">Next Tech Offer</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-base text-zinc-400 leading-relaxed max-w-xl mx-auto"
          >
            Choose a plan that fits your interview timeline. All paid plans include unlimited mock interviews and instant AI feedback.
          </motion.p>
        </div>
      </section>

      {/* PLAN CARDS */}
      <section className="px-4 sm:px-8 pb-16 max-w-6xl mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid md:grid-cols-3 gap-8 items-stretch"
        >
          {plans.map((plan, i) => (
            <motion.div key={i} variants={fadeUp} className="flex">
              <div
                className={`relative w-full rounded-2xl border p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.highlight
                    ? "border-cyan-500/40 bg-gradient-to-b from-cyan-950/30 via-zinc-900 to-zinc-900/80 shadow-2xl shadow-emerald-500/10 scale-105 z-10"
                    : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                }`}
              >
                {plan.highlight && (
                  <>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-blue-500/5 pointer-events-none" />
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/30">
                        ★ Most Popular
                      </span>
                    </div>
                  </>
                )}

                <div className="space-y-6 relative z-10">
                  <div>
                    <h2 className={`text-2xl font-bold ${plan.highlight ? "text-emerald-400" : "text-white"}`}>
                      {plan.name}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1 font-normal">{plan.desc}</p>
                  </div>

                  <div className={`flex items-baseline gap-1 py-3 border-y ${plan.highlight ? "border-cyan-500/30" : "border-zinc-800/80"}`}>
                    <span className="text-5xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">/month</span>
                  </div>

                  <ul className="space-y-3.5">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="text-xs text-zinc-300 flex items-start gap-3">
                        <svg
                          className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlight ? "text-emerald-400" : "text-blue-400"}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8 mt-auto relative z-10">
                  <Button
                    onClick={() => {
                      if (plan.name !== "Free") handleCheckout(plan.name.toLowerCase());
                    }}
                    variant={plan.highlight ? "gradient" : "secondary"}
                    className="w-full justify-center uppercase tracking-wider text-xs py-3.5"
                  >
                    {plan.cta}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* FEATURE COMPARISON */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden"
        >
          <div className="px-8 py-6 border-b border-zinc-800 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Full Feature Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80">
                  <th className="p-5 font-medium text-zinc-400">Feature</th>
                  <th className="p-5 font-medium text-zinc-400">Free</th>
                  <th className="p-5 font-bold text-emerald-400">Pro ⭐</th>
                  <th className="p-5 font-medium text-blue-400">Advanced</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 text-zinc-100 font-medium text-xs">{row.feature}</td>
                    <td className="p-5 text-xs">{renderCell(row.free)}</td>
                    <td className="p-5 text-xs bg-cyan-500/5">{renderCell(row.pro)}</td>
                    <td className="p-5 text-xs">{renderCell(row.advanced)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* TRUST FOOTER */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-8 pt-10 mt-10 border-t border-zinc-800/80 text-xs text-zinc-500 font-medium"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Secured by Stripe Payments
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Instant Plan Activation
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Cancel or Downgrade Anytime
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            No Hidden Fees
          </span>
        </motion.div>
      </section>
    </div>
  );
}

function renderCell(val) {
  if (val === true) return <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>;
  if (val === false) return <span className="text-zinc-600">—</span>;
  return <span className="text-zinc-300">{val}</span>;
}

const plans = [
  {
    name: "Free",
    price: "₹0",
    desc: "Test core features and interview categories.",
    cta: "Start Free Practice",
    highlight: false,
    features: [
      "Basic AI interview questions",
      "5 daily mock attempts",
      "Web speech recognition & TTS",
      "1 core interview category",
      "Standard queue priority",
    ],
  },
  {
    name: "Pro",
    price: "₹199",
    desc: "The complete preparation suite for active job hunters.",
    cta: "Upgrade to Pro",
    highlight: true,
    features: [
      "Unlimited mock interviews",
      "Advanced scoring index (0–100)",
      "All role categories (Frontend, Backend, DSA, HR)",
      "Voice & video workspace feed",
      "Session history tracking",
      "Fast Groq Llama 3.1 AI response speed",
    ],
  },
  {
    name: "Advanced",
    price: "₹499",
    desc: "Ultimate coaching environment for FAANG level offers.",
    cta: "Go Advanced",
    highlight: false,
    features: [
      "Everything in Pro plan",
      "Simulate strict top-tier interviewers",
      "Speech pacing & syntax analysis",
      "Personalized focus milestone roadmaps",
      "Priority AI API gateway load",
      "24/7 dedicated support",
    ],
  },
];

const comparisonRows = [
  { feature: "Daily Mock Interviews",  free: "5 / day",      pro: "Unlimited",      advanced: "Unlimited" },
  { feature: "AI Scoring Index",       free: false,           pro: true,             advanced: true },
  { feature: "Voice Recognition",      free: true,            pro: true,             advanced: true },
  { feature: "Video Workspace",        free: false,           pro: true,             advanced: true },
  { feature: "Role Categories",        free: "1",             pro: "All 5",          advanced: "All 5 + Custom" },
  { feature: "Session History",        free: false,           pro: true,             advanced: true },
  { feature: "STAR & Resume Tools",    free: false,           pro: true,             advanced: true },
  { feature: "Priority AI Speed",      free: false,           pro: false,            advanced: true },
  { feature: "Dedicated Support",      free: false,           pro: false,            advanced: true },
];
