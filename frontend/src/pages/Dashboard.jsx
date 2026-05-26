import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setUserData(snap.data());
      }
    });

    return () => unsubscribe();
  }, []);

  if (!userData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">

      {/* 🔥 HERO */}
      <section className="flex flex-col items-center justify-center text-center h-[80vh] px-6">

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-500 to-violet-600 bg-clip-text text-transparent"
        >
          Welcome back, {userData.name} 👋
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-6 text-gray-400 max-w-xl"
        >
          Continue your AI-powered interview journey and level up your skills.
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/interview")}
          className="mt-8 px-6 py-3 rounded-lg font-bold 
          bg-gradient-to-r from-red-500 to-violet-600 
          shadow-[0_0_25px_rgba(255,0,60,0.5)]"
        >
          Start Interview 🎤
        </motion.button>
      </section>

      {/* 💎 FEATURES */}
      <section className="px-6 md:px-10 py-16 grid md:grid-cols-3 gap-6">

        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ scale: 1.04 }}
            className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl 
            border border-white/10 
            shadow-[0_0_25px_rgba(138,43,226,0.2)] cursor-pointer"
            onClick={() => f.action(navigate)}
          >
            <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
            <p className="text-gray-400">{f.desc}</p>
          </motion.div>
        ))}

      </section>

      {/* ⚡ CTA */}
      <section className="text-center py-16">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold"
        >
          Keep pushing, you’re getting better 💀
        </motion.h2>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/interview")}
          className="mt-6 px-8 py-3 rounded-lg 
          bg-gradient-to-r from-red-500 to-violet-600"
        >
          Practice Now
        </motion.button>
      </section>

    </div>
  );
}

const features = [
  {
    title: "🎤 Start Interview",
    desc: "Practice with AI-driven interview questions.",
    action: (nav) => nav("/interview")
  },
  {
    title: "📊 Progress",
    desc: "Track your performance and growth.",
    action: () => alert("Coming soon")
  },
  {
    title: "⚙️ Profile",
    desc: "Manage your account settings.",
    action: () => alert("Coming soon")
  }
];