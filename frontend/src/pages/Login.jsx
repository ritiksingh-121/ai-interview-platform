import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleLogin(e) {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    if (!form.email.includes("@")) {
      setError("Enter a valid email address");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate("/service");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-darkbg flex flex-col md:flex-row text-white pt-16">
      {/* LEFT SIDE - TECHNICAL BRANDING */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-gradient-to-br from-darkbg via-[#0b0a0e] to-[#0c1824]/20 border-r border-white/5 relative overflow-hidden min-h-[30vh] md:min-h-screen">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-accent-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="max-w-md space-y-6 text-center md:text-left relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-accent-500 flex items-center justify-center mx-auto md:mx-0 shadow-lg shadow-brand-500/10">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Practice smarter.<br />Crack interviews faster.
          </h1>
          <p className="text-sm text-white/50 leading-relaxed max-w-sm">
            Experience real-time AI simulations, review code optimizations, and get professional behavioral scoring instantly.
          </p>

          {/* Micro Terminal Mockup */}
          <div className="hidden md:block rounded-xl border border-white/5 bg-black/40 p-4 font-mono text-xs text-white/40 space-y-1.5 shadow-inner">
            <p className="text-accent-400">$ login ai-interview</p>
            <p className="text-white/60">● Authenticating session tokens...</p>
            <p className="text-brand-400">● Session established. Redirecting...</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="flex-1 flex justify-center items-center p-6 sm:p-12 md:p-20 relative">
        <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md z-10"
        >
          <Card variant="glass" className="p-8 sm:p-10 shadow-2xl relative">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
              <p className="text-sm text-white/50 mt-1.5">Login to access your dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <Input
                label="Email address"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />

              {error && (
                <div className="p-3 rounded-lg bg-error-500/10 border border-error-500/20 text-xs text-error-light flex items-start gap-2 animate-fade-in">
                  <svg className="w-4 h-4 shrink-0 text-error mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full mt-4"
              >
                Login
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-white/50">
              Don’t have an account?{" "}
              <span
                onClick={() => navigate("/signup")}
                className="text-accent-400 hover:text-accent-300 font-semibold cursor-pointer transition-colors"
              >
                Sign up
              </span>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}