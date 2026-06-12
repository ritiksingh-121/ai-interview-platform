import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName: name });
      await setDoc(doc(db, "users", res.user.uid), { name, email, createdAt: new Date().toISOString() });
      navigate("/dashboard");
    } catch {
      setError("Account creation failed. Email may already be in use.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4 py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <Card variant="glass" className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Create account</h1>
            <p className="text-sm text-zinc-400">Start your interview preparation journey</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label htmlFor="name" className="text-xs text-zinc-400 block mb-1.5">Full name</label>
              <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 focus:bg-zinc-900 transition-all" placeholder="Jane Doe" />
            </div>

            <div>
              <label htmlFor="email" className="text-xs text-zinc-400 block mb-1.5">Email address</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 focus:bg-zinc-900 transition-all" placeholder="you@company.com" />
            </div>

            <div>
              <label htmlFor="password" className="text-xs text-zinc-400 block mb-1.5">Password</label>
              <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 focus:bg-zinc-900 transition-all" placeholder="•••••••• min 6 chars" />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <Button type="submit" variant="gradient" className="w-full justify-center">Create account</Button>
          </form>

          <p className="text-center text-sm text-zinc-400 mt-6">
            Have an account?{" "}
            <Link to="/login" className="text-pink-400 hover:text-pink-300 font-medium transition-colors">Sign in</Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
