import { motion } from "framer-motion";

export default function AudioWaveform({ active = false, label = "Voice Activity" }) {
  const barHeights = [40, 75, 50, 90, 60, 100, 45, 80, 55, 35];

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 w-full">
      <div className="flex items-center justify-center gap-1.5 h-10 w-full px-4">
        {barHeights.map((h, i) => (
          <motion.span
            key={i}
            className={`w-1 rounded-full ${
              active
                ? "bg-gradient-to-t from-emerald-500 to-indigo-400 glow-cyan"
                : "bg-zinc-700/60"
            }`}
            animate={
              active
                ? {
                    height: [`${Math.max(15, h * 0.3)}%`, `${h}%`, `${Math.max(15, h * 0.2)}%`],
                  }
                : { height: "20%" }
            }
            transition={
              active
                ? {
                    duration: 0.6 + (i % 4) * 0.15,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }
                : { duration: 0.3 }
            }
          />
        ))}
      </div>
      <span className="text-[11px] font-medium text-zinc-400 tracking-wider uppercase mt-2 flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            active ? "bg-cyan-400 animate-ping" : "bg-zinc-600"
          }`}
        />
        {active ? "Listening for speech..." : label}
      </span>
    </div>
  );
}
