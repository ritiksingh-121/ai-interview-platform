import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/ui/Button";

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };
const fadeIn = { initial: { opacity: 0 }, animate: { opacity: 1 } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

function Home() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* ─── HERO ─── */}
      <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-emerald-500/5 blur-[180px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-teal-500/5 blur-[120px]" />
        </div>

        <motion.div className="max-w-6xl mx-auto flex flex-col items-center text-center relative" variants={stagger} initial="initial" animate="animate">
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-semibold text-emerald-500 mb-6 tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI-Powered Interview Preparation Platform
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] max-w-4xl tracking-tight text-zinc-100">
            Crack Every Interview with{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Real-time AI</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 text-base sm:text-lg text-zinc-500 max-w-2xl leading-relaxed">
            Practice technical, behavioral, and coding interviews with AI. Get instant feedback, track your progress, and land your dream job at top companies.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button variant="green" size="lg" onClick={() => navigate("/dashboard")} className="w-full sm:w-auto justify-center px-8 py-4 text-sm shadow-xl shadow-emerald-500/25">
              Start Free Mock Interview
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/pricing")} className="w-full sm:w-auto justify-center px-8 py-4 text-sm border-zinc-800 text-zinc-500">
              View Pricing Plans
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12">
            {[
              { value: "50K+", label: "Mock Interviews" },
              { value: "15+", label: "Career Tools" },
              { value: "98%", label: "Satisfaction" },
              { value: "24/7", label: "AI Availability" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">{s.value}</p>
                <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="mt-16 w-full max-w-5xl rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-2 shadow-xl shadow-black/20">
            <div className="rounded-xl overflow-hidden border border-zinc-800/60 bg-zinc-950/60 aspect-[4/3] sm:aspect-[16/9] flex items-center justify-center p-4 sm:p-6 relative">
              <div className="absolute top-0 left-0 right-0 h-9 sm:h-10 border-b border-zinc-800/60 bg-zinc-900/80 flex items-center px-4 justify-between rounded-t-xl">
                <div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><span className="w-2.5 h-2.5 rounded-full bg-green-400" /></div>
                <span className="text-[11px] text-zinc-500">AI Interview Workspace</span>
                <span className="w-4" />
              </div>
              <div className="w-full h-full pt-8 flex gap-4 text-left">
                <div className="w-1/3 border-r border-zinc-800/60 pr-4 flex flex-col justify-center gap-3">
                  <div className="h-5 w-20 rounded bg-zinc-800/60" />
                  <div className="h-10 w-full rounded-lg bg-zinc-800/40 border border-zinc-700/50" />
                  <div className="h-28 w-full rounded-lg bg-zinc-800/40 border border-zinc-700/50" />
                </div>
                <div className="flex-1 pl-4 flex flex-col justify-between py-2">
                  <div className="space-y-2.5">
                    <div className="h-4 w-1/3 rounded bg-zinc-800/60" />
                    <div className="h-4 w-2/3 rounded bg-zinc-800/60" />
                    <div className="h-4 w-1/2 rounded bg-zinc-800/60" />
                    <div className="h-4 w-3/4 rounded bg-zinc-800/40" />
                  </div>
                  <div className="h-12 w-full rounded-xl border border-zinc-800/60 bg-zinc-900/40 flex items-center px-4 justify-between">
                    <div className="h-4 w-1/4 rounded bg-zinc-800/60" />
                    <div className="h-6 w-16 rounded-md bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border border-emerald-500/30" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── WHY CHOOSE US ─── */}
      <section className="px-4 sm:px-6 py-24 border-t border-zinc-800/60">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-[0.2em]">Why Choose Us</span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mt-3 text-zinc-100">Built by Engineers, for Engineers</h2>
            <p className="text-base text-zinc-500 mt-3 max-w-2xl mx-auto">
              We know what it takes to crack top-tier tech interviews because we have been there. Our AI platform simulates real interview pressure, adapts to your skill level, and helps you improve with every session.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: "🎯", title: "Real Interview Pressure", desc: "Our AI mimics real interviewers from Google, Amazon, Meta & more. Timed sessions, follow-up questions, and dynamic difficulty adjustment." },
              { icon: "🧠", title: "Smart Feedback System", desc: "Get scored on communication, technical accuracy, problem-solving, and confidence. Detailed improvement plans for every weak area." },
              { icon: "📈", title: "Track Your Growth", desc: "Analytics dashboard shows your progress across roles, companies, and skills. See your readiness index improve over time." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 cursor-default"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-300 pointer-events-none" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 group-hover:border-emerald-500/40 transition-all duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-zinc-100 mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="px-4 sm:px-6 py-24 border-t border-zinc-800/60 bg-zinc-900/20">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-[0.2em]">How It Works</span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mt-3 text-zinc-100">Start Practicing in Minutes</h2>
            <p className="text-base text-zinc-500 mt-3 max-w-xl mx-auto">
              Five simple steps to interview readiness — with measurable results from day one.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-5 gap-6">
            {[
              { num: "1", title: "Create Account", desc: "Sign up free with email or Google. No payment needed." },
              { num: "2", title: "Choose Your Goal", desc: "Pick a company mode, role type, and interview format." },
              { num: "3", title: "Practice with AI", desc: "Speak, type, or code — AI interviews adapt to you in real time." },
              { num: "4", title: "Get Feedback", desc: "Instant scoring on 10 dimensions with specific improvement tips." },
              { num: "5", title: "Track Growth", desc: "Watch your scores climb as you practice daily." },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                  <span className="text-white text-xl font-bold">{step.num}</span>
                </div>
                <h3 className="text-base font-bold text-zinc-100 mb-1">{step.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-[180px] mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ALL FEATURES ─── */}
      <section className="px-4 sm:px-6 py-24 border-t border-zinc-800/60">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-[0.2em]">Everything Included</span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mt-3 text-zinc-100">15+ Career Tools at Your Fingertips</h2>
            <p className="text-base text-zinc-500 mt-3 max-w-xl mx-auto">From mock interviews to code review to career coaching — all powered by AI.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 6) * 0.05 }}
                onClick={() => navigate(f.path)}
                className="group relative p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 cursor-pointer"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-300 pointer-events-none" />
                <div className="relative">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-500 mb-3 uppercase tracking-wider">
                    {f.badge}
                  </span>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 group-hover:border-emerald-500/40 transition-all duration-300">
                      {f.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">{f.title}</h3>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed group-hover:text-zinc-400 transition-colors">{f.desc}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="px-4 sm:px-6 py-24 border-t border-zinc-800/60 bg-zinc-900/20">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-[0.2em]">Testimonials</span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mt-3 text-zinc-100">What Our Users Say</h2>
            <p className="text-base text-zinc-500 mt-3 max-w-xl mx-auto">Join thousands of engineers who have transformed their interview skills.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { quote: "This platform helped me go from nervous to confident. The AI feedback on my communication style was a game-changer.", name: "Priya S.", role: "Software Engineer @ Google" },
              { quote: "The coding interview with real-time evaluation is incredible. I cracked Amazon after 3 weeks of practice here.", name: "Rahul K.", role: "SDE II @ Amazon" },
              { quote: "I love the voice interview feature. Practicing aloud with AI feedback helped me land offers from 4 companies.", name: "Ananya M.", role: "Frontend Engineer @ Meta" },
              { quote: "The HR interview module and STAR builder completely changed how I tell my story. Highly recommend.", name: "Vikram J.", role: "Product Manager @ Microsoft" },
              { quote: "Best interview prep platform I have used. The roadmap feature helped me focus on the right topics.", name: "Neha G.", role: "Data Scientist @ Uber" },
              { quote: "From resume optimization to mock interviews to career coaching — everything I needed in one place.", name: "Arjun P.", role: "Full Stack @ Flipkart" },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <span key={j} className="text-emerald-500 text-xs">★</span>)}
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="px-4 sm:px-6 py-24 border-t border-zinc-800/60">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-[0.2em]">FAQ</span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mt-3 text-zinc-100">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer"
                >
                  <span className="text-sm font-semibold text-zinc-100">{faq.q}</span>
                  <svg
                    className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${expandedFaq === i ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {expandedFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-sm text-zinc-500 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRUSTED BY ─── */}
      <section className="px-4 sm:px-6 py-16 border-t border-zinc-800/60 bg-zinc-900/20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-5xl mx-auto text-center">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.2em]">Trusted by</span>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60">
            {["Google", "Amazon", "Microsoft", "Meta", "Uber", "Flipkart"].map((name) => (
              <div key={name} className="text-sm font-bold text-zinc-500 tracking-widest uppercase">
                {name}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-4 sm:px-6 py-24 border-t border-zinc-800/60">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/10 via-zinc-900 to-teal-500/10 border border-zinc-800 p-12 sm:p-16 text-center"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
          <div className="relative">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100">Ready to Level Up Your Prep?</h2>
            <p className="text-base text-zinc-500 mt-4 max-w-xl mx-auto">
              Join thousands of engineers using AI to practice, improve, and land offers at top tech companies.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="green" size="lg" onClick={() => navigate("/dashboard")} className="w-full sm:w-auto justify-center px-8 py-4 text-sm shadow-xl shadow-emerald-500/25">
                Start Free Practice →
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/pricing")} className="w-full sm:w-auto justify-center px-8 py-4 text-sm border-zinc-800 text-zinc-500">
                View Plans
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-zinc-800/60 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-base font-extrabold text-zinc-100 tracking-tight">AI Interview</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">AI-powered mock interview platform built by engineers to help you crack your dream job.</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Practice</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Mock Interview", path: "/interview" },
                  { label: "Coding Interview", path: "/coding" },
                  { label: "Voice Interview", path: "/voice" },
                  { label: "HR Interview", path: "/hr" },
                ].map((l) => (
                  <li key={l.label}>
                    <button onClick={() => navigate(l.path)} className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors">{l.label}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Tools</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Resume Tailor", path: "/resume" },
                  { label: "Code Review", path: "/code-review" },
                  { label: "GitHub Analysis", path: "/github" },
                  { label: "Career Coach", path: "/coach" },
                ].map((l) => (
                  <li key={l.label}>
                    <button onClick={() => navigate(l.path)} className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors">{l.label}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2.5">
                <li><button onClick={() => navigate("/pricing")} className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors">Pricing</button></li>
                <li><button onClick={() => navigate("/dashboard")} className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors">Dashboard</button></li>
                <li><span className="text-xs text-zinc-500">Contact: hello@aiinterview.dev</span></li>
                <li><span className="text-xs text-zinc-500">Built for engineers</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-500">2024 AI Interview Platform. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors cursor-pointer">Terms</span>
              <span className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors cursor-pointer">Privacy</span>
              <span className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors cursor-pointer">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const faqs = [
  { q: "How do I get started with mock interviews?", a: "Create a free account, choose your target company and role, and start a mock interview session. The AI will adapt questions based on your experience level and provide instant feedback after each answer." },
  { q: "What types of interviews are supported?", a: "We support technical interviews (with live coding), behavioral/HR interviews, voice-based interviews (speech-to-text feedback), and system design interviews with company-specific modes for Google, Amazon, Meta, Microsoft, and more." },
  { q: "How does the AI feedback work?", a: "After each interview, our AI evaluates your responses across 10 dimensions: communication, technical accuracy, problem-solving, confidence, clarity, relevance, depth, structure, STAR usage, and overall score. You get specific strengths, weaknesses, and an improvement plan." },
  { q: "Can I practice coding interviews?", a: "Yes! Our coding interview features a Monaco code editor with 10+ programming languages, real-time test case evaluation, and AI-generated problems tailored to your target company and difficulty level." },
  { q: "How much does it cost?", a: "We offer a free tier with limited mock interviews. Premium plans unlock unlimited interviews, detailed analytics, roadmap generation, code review, and all 15+ career tools. Check our Pricing page for details." },
  { q: "Are the interviews realistic?", a: "Our AI is trained on real interview patterns from top tech companies. It asks follow-up questions, drills deeper on weak areas, and adapts to your answers - just like a human interviewer. You can choose from 13 company modes and 7 interviewer personalities." },
];

const features = [
  { title: "Mock Interview", desc: "Real-time AI mock interviews with voice, video, and text feedback.", icon: "🎤", path: "/interview", badge: "Popular" },
  { title: "Voice Interview", desc: "Speech-to-text practice with filler word detection and clarity scoring.", icon: "🎙️", path: "/voice", badge: "New" },
  { title: "Coding Interview", desc: "Live coding with Monaco editor, test cases, and AI evaluation.", icon: "💻", path: "/coding", badge: "Pro" },
  { title: "HR Interview", desc: "Behavioral questions with STAR method analysis and competency assessment.", icon: "🤝", path: "/hr", badge: "Popular" },
  { title: "Resume Tailor", desc: "ATS score optimization with keyword gap analysis and bullet rewrites.", icon: "📄", path: "/resume", badge: "Tool" },
  { title: "Cover Letter", desc: "AI-generated cover letters tailored to specific job descriptions.", icon: "✉️", path: "/coverletter", badge: "Tool" },
  { title: "STAR Builder", desc: "Structure behavioral stories with per-component scoring.", icon: "🎯", path: "/star", badge: "Tool" },
  { title: "Code Review", desc: "Analyze code quality, complexity, security, and best practices.", icon: "🔍", path: "/code-review", badge: "Pro" },
  { title: "Daily Challenge", desc: "New coding or HR challenge every day with streak tracking.", icon: "🔥", path: "/challenge", badge: "New" },
  { title: "Learning Roadmap", desc: "Personalized 7/30/90-day study plans generated by AI.", icon: "🗺️", path: "/roadmap", badge: "New" },
  { title: "GitHub Analysis", desc: "Profile analysis with project-based interview questions.", icon: "🐙", path: "/github", badge: "Pro" },
  { title: "Portfolio Analysis", desc: "Score your portfolio on design, performance, SEO, and content.", icon: "🌐", path: "/portfolio", badge: "Pro" },
  { title: "Career Coach", desc: "Personalized advice, skill gap analysis, and job recommendations.", icon: "💡", path: "/coach", badge: "New" },
  { title: "Outreach Assistant", desc: "Generate cold recruiter messages and LinkedIn outreach.", icon: "📣", path: "/outreach", badge: "Tool" },
  { title: "Recruiter Dashboard", desc: "Send interview invites and track your candidate pipeline.", icon: "👔", path: "/recruiter", badge: "Tool" },
];

export default Home;
