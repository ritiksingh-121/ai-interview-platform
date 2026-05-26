import { motion } from "framer-motion";
import { handleCheckout } from "../api/stripe";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-black text-white py-20 px-6">

      {/* 🔥 TITLE */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-violet-600 bg-clip-text text-transparent">
          Choose Your Plan 
        </h1>
        <p className="text-gray-400 mt-4">
          Upgrade your interview skills with AI-powered training
        </p>
      </div>

      {/* 💎 PRICING CARDS */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

        {plans.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: i * 0.2 }}
            whileHover={{ scale: 1.05 }}
            className={`p-8 rounded-2xl border ${
              plan.highlight
                ? "border-violet-500 shadow-[0_0_30px_rgba(138,43,226,0.5)]"
                : "border-white/10"
            } bg-white/5 backdrop-blur-xl`}
          >
            <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>

            <p className="text-3xl font-bold mb-6">
              {plan.price}
              <span className="text-gray-400 text-sm">/month</span>
            </p>

            <ul className="space-y-3 mb-8">
              {plan.features.map((f, idx) => (
                <li key={idx} className="text-gray-300">
                  ✔ {f}
                </li>
              ))}
            </ul>

            <button 
             onClick={() => { if (plan.name === "Free") {
      return; // do nothing
    }
              handleCheckout(plan.name.toLowerCase())}}
              className={`w-full py-3 rounded-lg font-semibold ${
                plan.highlight
                  ? "bg-gradient-to-r from-red-500 to-violet-600"
                  : "bg-white/10"
              }`}
            >
              {plan.cta}
           </button>
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
    cta: "Get Started",
    highlight: true,
    features: [
      "Basic AI interview questions",
      "Limited daily attempts (5)",
      "Basic feedback",
      "Access to 1 category",
      "No history tracking"
    ]
  },
  {
    name: "Pro",
    price: "₹199",
    cta: "Upgrade to Pro",
    highlight: true,
    features: [
      "Unlimited mock interviews",
      "Advanced AI feedback + scoring",
      "Multiple categories (DSA, HR, Dev)",
      "Interview history tracking",
      "Performance insights",
      "Priority AI response"
    ]
  },
  {
    name: "Advanced",
    price: "₹499",
    cta: "Go Advanced",
    highlight: true,
    features: [
      "Everything in Pro",
      "Real-time mock interview simulation",
      "Voice-based interviews 🎤",
      "Detailed analytics dashboard",
      "Personalized improvement roadmap",
      "Premium support"
    ]
  }
];