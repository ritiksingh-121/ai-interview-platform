import { motion } from "framer-motion";
import { handleCheckout } from "../api/stripe";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-darkbg text-white py-28 px-6 relative selection:bg-accent-500/30">
      {/* Glow Backdrops */}
      <div className="absolute top-[20vh] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Title block */}
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <Badge variant="accent" className="mb-4">Flexible Billing</Badge>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
          Choose Your Prep Plan
        </h1>
        <p className="text-white/60 mt-4 text-sm sm:text-base leading-relaxed">
          Unlock premium AI-driven mock interviews, detailed vocal clarity index reports, and custom roadmaps.
        </p>
      </div>

      {/* Pricing cards grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="flex"
          >
            <Card
              variant={plan.highlight ? "elevated" : "glass"}
              className={`p-5 sm:p-6 md:p-8 w-full flex flex-col justify-between border relative ${
                plan.highlight
                  ? "border-pink-500/30 shadow-glow"
                  : "border-white/5"
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-4 right-4">
                  <Badge variant="primary" className="text-[10px]">Popular</Badge>
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold text-white mb-2">{plan.name}</h2>
                <p className="text-xs text-white/50 mb-6">{plan.desc}</p>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold tracking-tight text-white">{plan.price}</span>
                  <span className="text-white/40 text-xs font-semibold">/month</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="text-sm text-white/70 flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => {
                  if (plan.name === "Free") {
                    return; // Do nothing
                  }
                  handleCheckout(plan.name.toLowerCase());
                }}
                variant={plan.highlight ? "primary" : "secondary"}
                className="w-full mt-auto"
              >
                {plan.cta}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const plans = [
  {
    name: "Free",
    price: "₹0",
    desc: "Test out core interview categories.",
    cta: "Start Free Practice",
    highlight: false,
    features: [
      "Basic AI interview questions",
      "Limited daily attempts (5)",
      "Vocal Speech feedback",
      "Access to 1 core category",
      "Standard server queues"
    ]
  },
  {
    name: "Pro",
    price: "₹199",
    desc: "Complete toolkit for active job hunters.",
    cta: "Upgrade to Pro",
    highlight: true,
    features: [
      "Unlimited mock interviews",
      "Advanced feedback + scoring index",
      "Multiple categories (DSA, HR, Dev)",
      "Vocal assessment metrics",
      "Active history log tracking",
      "Priority response speed"
    ]
  },
  {
    name: "Advanced",
    price: "₹499",
    desc: "Ultimate readiness cockpit for big-tech offers.",
    cta: "Go Advanced",
    highlight: false,
    features: [
      "Everything in Pro plan",
      "Simulate realistic voice interviews",
      "Vocal clarity analysis",
      "Detailed metrics dashboard",
      "Personalized learning roadmaps",
      "24/7 priority support"
    ]
  }
];