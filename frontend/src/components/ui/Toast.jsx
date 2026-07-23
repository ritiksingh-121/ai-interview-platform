import { motion, AnimatePresence } from "framer-motion";

export default function Toast({ show = false, message = "", type = "success" }) {
  if (!show) return null;

  const bgColors = {
    success: "bg-emerald-950/90 border-emerald-500/30 text-emerald-300",
    error: "bg-red-950/90 border-red-500/30 text-red-300",
    info: "bg-indigo-950/90 border-indigo-500/30 text-emerald-400",
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl ${bgColors[type] || bgColors.info}`}
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-xs font-bold">
          {icons[type]}
        </span>
        <span className="text-xs font-medium tracking-wide">{message}</span>
      </motion.div>
    </AnimatePresence>
  );
}
