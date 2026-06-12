import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
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

  async function handleSignup(e) {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = userCredential.user;

      // Save user details
      await setDoc(doc(db, "users", user.uid), {
        name: form.name,
        email: form.email,
        role: "user"
      });

      navigate("/service");
    } catch (err) {
      setError(err.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-darkbg flex flex-col md:flex-row text-white pt-16">
      {/* LEFT SIDE - TECHNICAL BRANDING */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-gradient-to-br from-darkbg via-[#0b0a0e] to-accent-950/20 border-r border-white/5 relative overflow-hidden min-h-[30vh] md:min-h-screen">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-accent-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="max-w-md space-y-6 text-center md:text-left relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-accent-500 flex items-center justify-center mx-auto md:mx-0 shadow-lg shadow-brand-500/10">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Practice smarter.<br />Crack interviews faster.
          </h1>
          <p className="text-sm text-white/50 leading-relaxed max-w-sm">
            Simulate realistic live sessions, review vocal and code syntax assessments, and map out your path to big-tech offers.
          </p>

          {/* Micro Terminal Mockup */}
          <div className="hidden md:block rounded-xl border border-white/5 bg-black/40 p-4 font-mono text-xs text-white/40 space-y-1.5 shadow-inner">
            <p className="text-accent-400">$ init ai-interview --role="frontend"</p>
            <p className="text-white/60">● Loading simulation environment...</p>
            <p className="text-brand-400">● AI Interviewer active: "Let's begin."</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - SIGNUP FORM */}
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
              <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
              <p className="text-sm text-white/50 mt-1.5">Join and start practicing today</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <Input
                label="Full Name"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />

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
                helperText="Must be at least 6 characters"
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
                Sign Up
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-white/50">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-accent-400 hover:text-accent-300 font-semibold cursor-pointer transition-colors"
              >
                Login
              </span>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}