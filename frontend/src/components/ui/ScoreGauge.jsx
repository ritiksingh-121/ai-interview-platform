import { motion } from "framer-motion";

export default function ScoreGauge({ score = 0, max = 100, size = 120, strokeWidth = 8, label = "Score", subtitle = "" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max(score / max, 0), 1);
  const strokeDashoffset = circumference - percentage * circumference;

  // Determine color based on percentage
  let strokeColor = "#6366f1"; // Indigo default
  let textColor = "text-emerald-400";
  if (percentage >= 0.8) {
    strokeColor = "#34d399"; // Emerald green
    textColor = "text-emerald-400";
  } else if (percentage >= 0.5) {
    strokeColor = "#fbbf24"; // Amber warning
    textColor = "text-amber-400";
  } else if (percentage > 0) {
    strokeColor = "#f87171"; // Red
    textColor = "text-red-400";
  }

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-800/80 fill-none"
        />
        {/* Animated Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          className="fill-none"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-2xl font-bold tracking-tight ${textColor}`}
        >
          {score}{max === 10 ? "/10" : "%"}
        </motion.span>
        {label && <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider mt-0.5">{label}</span>}
      </div>
      {subtitle && <span className="text-xs text-zinc-400 mt-2 font-medium">{subtitle}</span>}
    </div>
  );
}
