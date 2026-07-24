import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName: name });
      await setDoc(doc(db, "users", res.user.uid), { name, email, createdAt: new Date().toISOString() });
      navigate("/dashboard");
    } catch {
      setError("Account creation failed. Email may already be registered.");
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
            <Badge variant="live" className="px-3 py-1 uppercase tracking-wider text-[10px]">
              ★ Free Registration
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Start Your AI Interview Preparation Journey
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
              Create your account to access real-time AI mock interviews, vocal analysis, and career acceleration tools.
            </p>
          </div>

          <div className="space-y-3 pt-8 relative z-10 text-xs text-zinc-300 font-medium">
            <div className="flex items-center gap-2.5">
              <span className="text-emerald-400">✓</span> 5 free daily interview sessions
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-emerald-400">✓</span> Full role selector (Frontend, Backend, System Design)
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-emerald-400">✓</span> Instant feedback on spoken answers
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-zinc-950/60">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-xs text-zinc-400">Enter your details to get started immediately</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label htmlFor="name" className="text-xs font-semibold text-zinc-300 block mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="Jane Doe"
              />
            </div>

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
                placeholder="you@company.com"
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
                placeholder="•••••••• (min 6 characters)"
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
              Create Free Account
            </Button>
          </form>

          <p className="text-center text-xs text-zinc-400 mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-400 font-semibold transition-colors">
              Sign In Here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
