import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-safe">
      {/* HERO */}
      <section className="relative overflow-hidden pt-28 sm:pt-32 pb-20 sm:pb-24 px-4 sm:px-6">
        <div className="absolute inset-0 bg-glow-accent pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

        <motion.div className="flex flex-col items-center text-center w-full max-w-7xl mx-auto" variants={stagger} initial="initial" animate="animate">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] font-medium text-pink-300 mb-6 tracking-wide uppercase">
            Next-Gen AI Mock Interview Platform
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] max-w-4xl px-2 tracking-tight">
            Crack Interviews with{" "}
            <span className="gradient-accent-text">Real-time AI</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed px-4">
            Practice real technical questions, get instant feedback, and elevate your skills in a developer-first environment.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto px-4">
            <Button variant="gradient" size="lg" onClick={() => navigate("/service")} className="w-full sm:w-auto justify-center">
              Start Free Mock Interview
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate("/pricing")} className="w-full sm:w-auto justify-center">
              View Pricing Plans
            </Button>
          </motion.div>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 w-full max-w-5xl rounded-xl border border-zinc-800 bg-zinc-900/60 p-2 mx-4 sm:mx-0 shadow-2xl shadow-black/40"
        >
          <div className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950/80 aspect-[4/3] sm:aspect-[16/9] flex items-center justify-center p-4 sm:p-6 relative">
            <div className="absolute top-0 left-0 right-0 h-9 sm:h-10 border-b border-zinc-800 bg-zinc-900/90 flex items-center px-3 sm:px-4 justify-between">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="text-[11px] text-zinc-500">AI Interview Workspace</span>
              <span className="w-4" />
            </div>
            <div className="w-full h-full pt-8 flex gap-3 sm:gap-4 text-left">
              <div className="w-1/3 border-r border-zinc-800 pr-3 sm:pr-4 flex flex-col justify-center gap-2 sm:gap-3">
                <div className="h-5 sm:h-6 w-16 sm:w-20 rounded bg-zinc-800/60" />
                <div className="h-10 sm:h-10 w-full rounded bg-zinc-800/60" />
                <div className="h-24 sm:h-28 w-full rounded bg-zinc-800/60" />
              </div>
              <div className="flex-1 pl-3 sm:pl-4 flex flex-col justify-between py-1 sm:py-2">
                <div className="space-y-2">
                  <div className="h-3.5 sm:h-4 w-1/3 rounded bg-zinc-800/60" />
                  <div className="h-3.5 sm:h-4 w-2/3 rounded bg-zinc-800/60" />
                  <div className="h-3.5 sm:h-4 w-1/2 rounded bg-zinc-800/60" />
                </div>
                <div className="h-10 sm:h-12 w-full rounded-lg border border-zinc-800 bg-zinc-900/40 flex items-center px-3 sm:px-4 justify-between">
                  <div className="h-3.5 sm:h-4 w-1/4 rounded bg-zinc-800/60" />
                  <div className="h-5 sm:h-6 w-14 sm:w-16 rounded bg-pink-500/20 border border-pink-500/30" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="px-4 sm:px-6 py-24 border-t border-zinc-800/60">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Designed for high performance engineers</h2>
            <p className="text-base text-zinc-400 mt-3 max-w-xl mx-auto">
              Everything you need to practice, iterate, and secure top offers.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card variant="glass" hover className="p-8 h-full flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 flex items-center justify-center text-lg mb-6 group-hover:border-pink-500/40 transition-all">{f.icon}</div>
                    <h3 className="text-lg font-semibold text-zinc-100 mb-2">{f.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="px-4 sm:px-6 py-24 border-t border-zinc-800/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">How we compare</h2>
            <p className="text-base text-zinc-400 mt-3">Why AI-driven interviewing beats peer-to-peer prep.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60">
            <table className="w-full text-left border-collapse text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80">
                  <th className="p-4 sm:p-6 font-medium text-zinc-400">Feature</th>
                  <th className="p-4 sm:p-6 font-medium text-pink-400">AI Mock Interview</th>
                  <th className="p-4 sm:p-6 font-medium text-zinc-400">Pramp</th>
                  <th className="p-4 sm:p-6 font-medium text-zinc-400">Interviewing.io</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 sm:p-6 text-zinc-100 font-medium">{row.feature}</td>
                    <td className="p-4 sm:p-6 text-emerald-400">{row.ai}</td>
                    <td className="p-4 sm:p-6 text-zinc-400">{row.pramp}</td>
                    <td className="p-4 sm:p-6 text-zinc-400">{row.io}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-24 text-center border-t border-zinc-800/60">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-pink-500/10 via-zinc-900 to-purple-500/10 border border-zinc-800 rounded-2xl p-12 sm:p-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Ready to level up your prep?</h2>
          <p className="text-base text-zinc-400 mt-4 max-w-xl mx-auto px-4">
            Join engineers who are using our platform to practice coding, behavior, and design roles safely.
          </p>
          <div className="mt-8 flex justify-center px-4">
            <Button variant="gradient" size="lg" onClick={() => navigate("/service")} className="w-full sm:w-auto justify-center">
              Start Free Practice
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

const features = [
  { title: "AI Interview Coaching", desc: "Real-time speech dialogue engine simulating professional interviewers matching selected roles.", icon: "🎤" },
  { title: "Vocal and Text Feedback", desc: "Instant assessment of response clarity, vocabulary, syntax correctness, and improvement roadmaps.", icon: "⚡" },
  { title: "Video Validation Space", desc: "Simulate a live workplace connection with an integrated video workspace.", icon: "🎥" },
  { title: "Adaptive Role Settings", desc: "Switch between DSA coding, frontend, full stack, or HR behavioral sessions.", icon: "⚙️" },
  { title: "Track Performance Insight", desc: "Detailed scoring index mapping history attempts to analyze progress over time.", icon: "📊" },
  { title: "Stripe Subscription Access", desc: "Flexible billing tiers with unlimited mock integrations and priority server loads.", icon: "💳" },
];

const comparisonRows = [
  { feature: "Immediate Feedback", ai: "Instant (Vocal & Markdown)", pramp: "Dependent on peer rating", io: "Paid sessions only" },
  { feature: "Availability", ai: "24/7, No scheduling needed", pramp: "Schedule match required", io: "Limited booking slots" },
  { feature: "Anonymity & Safety", ai: "100% Private, Safe space", pramp: "Talk to random peers", io: "Anonymous matching" },
  { feature: "Interactive Video/Speech", ai: "Video feed + Voice parsing", pramp: "Peer video connection", io: "Audio only (most sessions)" },
  { feature: "Cost", ai: "Free tier / Low Subscription", pramp: "Free (token-based)", io: "High fee ($100+/interview)" },
];
