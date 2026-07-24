import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password. Please check your credentials.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 sm:p-8 pt-24 pb-safe">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl grid md:grid-cols-2 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/80 shadow-2xl glow-accent"
      >
        {/* Left Branding Panel */}
        <div className="p-8 sm:p-12 bg-gradient-to-br from-indigo-950/60 via-zinc-900 to-cyan-950/40 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800 relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <Badge variant="cyan" className="px-3 py-1 uppercase tracking-wider text-[10px]">
              AI Mock Workspace
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Master Technical Q&A with Real-Time AI Coaching
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
              Join thousands of engineers using voice-driven mock interviews to land offers at top tech companies.
            </p>
          </div>

          <div className="space-y-3 pt-8 relative z-10 text-xs text-zinc-300 font-medium">
            <div className="flex items-center gap-2.5">
              <span className="text-emerald-400">✓</span> Real-time speech-to-text dialogue engine
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-emerald-400">✓</span> Scoring index (0-100) with detailed roadmaps
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-emerald-400">✓</span> ATS resume & behavioral STAR tools
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-zinc-950/60">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-xs text-zinc-400">Sign in to your AI Interview Candidate account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="text-xs font-semibold text-zinc-300 block mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="developer@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-semibold text-zinc-300 block mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="green"
              loading={loading}
              className="w-full justify-center uppercase tracking-wider text-xs py-3.5"
            >
              Sign In to Candidate Dashboard
            </Button>
          </form>

          <p className="text-center text-xs text-zinc-400 mt-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-emerald-400 hover:text-emerald-400 font-semibold transition-colors">
              Create Candidate Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
