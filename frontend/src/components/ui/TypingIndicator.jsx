import { motion } from "framer-motion";

export default function TypingIndicator({ label = "AI Interviewer is thinking..." }) {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -6 },
  };

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.15,
        repeat: Infinity,
        repeatType: "reverse",
        duration: 0.6,
      },
    },
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 w-fit text-zinc-400 text-xs shadow-lg">
      <span className="font-medium text-zinc-400">{label}</span>
      <motion.div
        className="flex items-center gap-1"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.span
          variants={dotVariants}
          className="w-1.5 h-1.5 rounded-full bg-cyan-400"
        />
        <motion.span
          variants={dotVariants}
          className="w-1.5 h-1.5 rounded-full bg-indigo-400"
        />
        <motion.span
          variants={dotVariants}
          className="w-1.5 h-1.5 rounded-full bg-purple-400"
        />
      </motion.div>
    </div>
  );
}
