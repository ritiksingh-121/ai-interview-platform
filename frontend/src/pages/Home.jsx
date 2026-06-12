import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function Home() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-darkbg text-white selection:bg-accent-500/30 selection:text-white pb-safe">
      {/* Glow Backdrops - hidden on mobile to prevent overflow */}
      <div className="hidden md:block absolute top-[10vh] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="hidden md:block absolute top-[80vh] right-10 w-[400px] h-[200px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="relative flex flex-col items-center text-center pt-28 sm:pt-32 pb-14 sm:pb-20 px-4 sm:px-6 w-full z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center w-full max-w-7xl mx-auto"
        >
          {/* Tagline Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/80 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-5 sm:mb-6"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
            </span>
            Next-Gen AI Mock Interview Platform
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-[clamp(2rem,8vw,4.5rem)] sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] max-w-4xl px-2 sm:px-0"
          >
            Crack Interviews with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-pink-500 to-accent-500 drop-shadow-sm">
              Real-time AI
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-5 sm:mt-6 text-sm sm:text-base lg:text-lg text-white/60 max-w-2xl leading-relaxed px-4 sm:px-0"
          >
            Practice real technical questions, get instant vocal and markdown feedback, and elevate your skills in a developer-first environment.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto px-4 sm:px-0"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/service")}
              className="w-full sm:w-auto justify-center"
            >
              Start Free Mock Interview
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/pricing")}
              className="w-full sm:w-auto justify-center"
            >
              View Pricing plans
            </Button>
          </motion.div>
        </motion.div>

        {/* Dashboard Mockup Preview - enlarged on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 sm:mt-16 w-full max-w-5xl rounded-2xl border border-white/10 bg-[#070709] p-1.5 sm:p-2 shadow-2xl relative mx-4 sm:mx-0"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-accent-500 rounded-2xl opacity-10 blur-xl" />
          <div className="rounded-xl overflow-hidden border border-white/5 bg-black/40 aspect-[4/3] sm:aspect-[16/9] flex items-center justify-center p-4 sm:p-6 relative">
            <div className="absolute top-0 left-0 right-0 h-9 sm:h-10 border-b border-white/5 bg-black/60 flex items-center px-3 sm:px-4 justify-between">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-[10px] sm:text-xs text-white/40 hidden sm:inline">AI Interview Workspace</span>
              <span className="w-4" />
            </div>

            <div className="w-full h-full pt-8 sm:pt-8 flex gap-3 sm:gap-4 text-left">
              <div className="w-1/3 border-r border-white/5 pr-3 sm:pr-4 flex flex-col justify-center gap-2 sm:gap-3">
                <div className="h-5 sm:h-6 w-16 sm:w-20 rounded bg-white/5 animate-pulse" />
                <div className="h-10 sm:h-10 w-full rounded-lg bg-white/5 animate-pulse" />
                <div className="h-24 sm:h-28 w-full rounded-lg bg-white/5 animate-pulse" />
              </div>
              <div className="flex-1 pl-3 sm:pl-4 flex flex-col justify-between py-1 sm:py-2">
                <div className="space-y-2 sm:space-y-2">
                  <div className="h-3.5 sm:h-4 w-1/3 rounded bg-white/5" />
                  <div className="h-3.5 sm:h-4 w-2/3 rounded bg-white/5" />
                  <div className="h-3.5 sm:h-4 w-1/2 rounded bg-white/5" />
                </div>
                <div className="h-10 sm:h-12 w-full rounded-lg border border-white/10 bg-white/5 flex items-center px-3 sm:px-4 justify-between">
                  <div className="h-3.5 sm:h-4 w-1/4 sm:w-1/3 rounded bg-white/10" />
                  <div className="h-5 sm:h-6 w-14 sm:w-16 rounded bg-brand-500/20 border border-brand-500/30" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section className="px-4 sm:px-6 py-20 sm:py-24 w-full relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Designed for high performance engineers
            </h2>
            <p className="text-white/60 mt-3 text-sm sm:text-base max-w-xl mx-auto">
              Everything you need to practice, iterate, and secure top offers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card hover variant="glass" className="p-6 sm:p-8 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-lg sm:text-xl mb-4 sm:mb-6">
                      {f.icon}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-2">{f.title}</h3>
                    <p className="text-white/60 text-xs sm:text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM COMPARISON MATRIX */}
      <section className="px-4 sm:px-6 py-20 sm:py-24 w-full relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              How we compare
            </h2>
            <p className="text-white/60 mt-3 text-sm sm:text-base">
              Why AI-driven interviewing beats peer-to-peer prep.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#070709]">
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="p-4 sm:p-6 text-xs sm:text-sm font-semibold text-white/50 whitespace-nowrap">Feature</th>
                  <th className="p-4 sm:p-6 text-xs sm:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-accent-400 whitespace-nowrap">AI Mock Interview</th>
                  <th className="p-4 sm:p-6 text-xs sm:text-sm font-semibold text-white/50 whitespace-nowrap">Pramp</th>
                  <th className="p-4 sm:p-6 text-xs sm:text-sm font-semibold text-white/50 whitespace-nowrap">Interviewing.io</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="p-4 sm:p-6 font-medium text-white/80">Immediate Feedback</td>
                  <td className="p-4 sm:p-6 text-success-light font-semibold">✔ Instant (Vocal & Markdown)</td>
                  <td className="p-4 sm:p-6 text-white/40">❌ Dependent on peer rating</td>
                  <td className="p-4 sm:p-6 text-white/40">❌ Paid sessions only</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 font-medium text-white/80">Availability</td>
                  <td className="p-4 sm:p-6 text-success-light font-semibold">✔ 24/7, No scheduling needed</td>
                  <td className="p-4 sm:p-6 text-white/40">❌ Schedule match required</td>
                  <td className="p-4 sm:p-6 text-white/40">❌ Limited booking slots</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 font-medium text-white/80">Anonymity & Safety</td>
                  <td className="p-4 sm:p-6 text-success-light font-semibold">✔ 100% Private, Safe space</td>
                  <td className="p-4 sm:p-6 text-white/40">❌ Talk to random peers</td>
                  <td className="p-4 sm:p-6 text-white/80">✔ Anonymous matching</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 font-medium text-white/80">Interactive Video/Speech</td>
                  <td className="p-4 sm:p-6 text-success-light font-semibold">✔ Video feed + Voice parsing</td>
                  <td className="p-4 sm:p-6 text-white/80">✔ Peer video connection</td>
                  <td className="p-4 sm:p-6 text-white/40">❌ Audio only (most sessions)</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 font-medium text-white/80">Cost</td>
                  <td className="p-4 sm:p-6 text-success-light font-semibold">✔ Free tier / Low Subscription</td>
                  <td className="p-4 sm:p-6 text-white/80">✔ Free (token-based)</td>
                  <td className="p-4 sm:p-6 text-error-light font-semibold">❌ High fee ($100+/interview)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative px-4 sm:px-6 py-20 sm:py-24 text-center w-full z-10 border-t border-white/5">
        <div className="absolute inset-0 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Ready to level up your prep?
          </h2>
          <p className="text-white/60 mt-3 sm:mt-4 max-w-xl mx-auto text-sm sm:text-base leading-relaxed px-4">
            Join engineers who are using our platform to practice coding, behavior, and design roles safely.
          </p>

          <div className="mt-6 sm:mt-8 flex justify-center px-4 sm:px-0">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/service")}
              className="w-full sm:w-auto justify-center"
            >
              Start Free Practice
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    title: "AI Interview Coaching",
    desc: "Real-time speech dialogue engine simulating professional interviewers matching selected roles (Frontend, DSA, HR, etc).",
    icon: "🎤",
  },
  {
    title: "Vocal and Text Feedback",
    desc: "Instant assessment of response clarity, vocabulary, syntax correctness, and detailed improvement roadmaps.",
    icon: "⚡",
  },
  {
    title: "Video Validation Space",
    desc: "Simulate a live workplace connection with an integrated video workspace supporting active gesture and focus pacing.",
    icon: "🎥",
  },
  {
    title: "Adaptive Role Settings",
    desc: "Switch dynamically between DSA coding roles, frontend specialist profiles, full stack positions, or HR behavioral sessions.",
    icon: "⚙️",
  },
  {
    title: "Track Performance Insight",
    desc: "Detailed scoring index mapping history attempts to analyze your progress over time.",
    icon: "📊",
  },
  {
    title: "Stripe Subscription Access",
    desc: "Flexible, secure billing tiers offering unlimited mock integrations, prioritize server loads, and detailed roadside assistance.",
    icon: "💳",
  },
];
