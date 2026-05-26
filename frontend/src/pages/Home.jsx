import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">

      {/* 🔥 HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center h-screen px-6">
        
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-500 to-violet-600 bg-clip-text text-transparent"
        >
          Crack Interviews with AI 
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-gray-400 max-w-xl"
        >
          Practice real interview questions, get instant feedback, and level up faster than everyone else.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 px-6 py-3 rounded-lg font-bold 
          bg-gradient-to-r from-red-500 to-violet-600 
          shadow-[0_0_25px_rgba(255,0,60,0.7)]"
        >
          Get Started
        </motion.button>
      </section>

      {/* 💎 FEATURES SECTION */}
      <section className="px-10 py-20 grid md:grid-cols-3 gap-8">

        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: [0, 0, 0], y: [0, -50, 0] }}
            whileInView={{ opacity: 1, y: 0 }}
             transition={{ repeat: Infinity, duration: 5 }}
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl 
            border border-white/10 
            shadow-[0_0_30px_rgba(138,43,226,0.3)]"
          >
            <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
            <p className="text-gray-400">{f.desc}</p>
          </motion.div>
        ))}

      </section>

      {/* ⚡ CTA SECTION */}
      <section className="text-center py-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-3xl font-bold"
        >
          Ready to Level Up? 💀
        </motion.h2>

        <motion.button
          whileHover={{ scale: 1.1 }}
          className="mt-6 px-8 py-3 rounded-lg 
          bg-gradient-to-r from-red-500 to-violet-600"
        >
          Start Practicing
        </motion.button>
      </section>

    </div>
  );
}

const features = [
  {
    title: "AI Mock Interviews",
    desc: "Practice with realistic AI-driven interview simulations."
  },
  {
    title: "Instant Feedback",
    desc: "Get real-time suggestions to improve your answers."
  },
  {
    title: "Track Progress",
    desc: "Analyze your performance and improve daily."
  }
];