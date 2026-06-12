import { motion } from "framer-motion";
import { handleCheckout } from "../api/stripe";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-24 pb-safe px-4 sm:px-6">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <Badge variant="primary" className="mb-4">Flexible Billing</Badge>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Choose Your Prep Plan</h1>
        <p className="text-base text-zinc-400 mt-4 leading-relaxed">
          Unlock premium AI-driven mock interviews, detailed vocal clarity index reports, and custom roadmaps.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card
              variant={plan.highlight ? "elevated" : "glass"}
              className={`p-6 md:p-8 w-full flex flex-col justify-between relative ${plan.highlight ? "border-pink-500/30" : ""}`}
            >
              {plan.highlight && (
                <div className="absolute top-4 right-4">
                  <Badge variant="gradient">Popular</Badge>
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-zinc-100 mb-2">{plan.name}</h2>
                <p className="text-xs text-zinc-400 mb-6">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl sm:text-5xl font-bold tracking-tight">{plan.price}</span>
                  <span className="text-xs text-zinc-500 font-medium">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="text-sm text-zinc-400 flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-pink-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                onClick={() => { if (plan.name !== "Free") handleCheckout(plan.name.toLowerCase()); }}
                variant={plan.highlight ? "gradient" : "secondary"}
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
  { name: "Free", price: "₹0", desc: "Test out core interview categories.", cta: "Start Free Practice", highlight: false, features: ["Basic AI interview questions", "Limited daily attempts (5)", "Vocal Speech feedback", "Access to 1 core category", "Standard server queues"] },
  { name: "Pro", price: "₹199", desc: "Complete toolkit for active job hunters.", cta: "Upgrade to Pro", highlight: true, features: ["Unlimited mock interviews", "Advanced feedback + scoring index", "Multiple categories (DSA, HR, Dev)", "Vocal assessment metrics", "Active history log tracking", "Priority response speed"] },
  { name: "Advanced", price: "₹499", desc: "Ultimate readiness cockpit for big-tech offers.", cta: "Go Advanced", highlight: false, features: ["Everything in Pro plan", "Simulate realistic voice interviews", "Vocal clarity analysis", "Detailed metrics dashboard", "Personalized learning roadmaps", "24/7 priority support"] },
];
