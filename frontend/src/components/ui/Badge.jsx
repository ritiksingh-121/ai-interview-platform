export default function Badge({ variant = "neutral", children, className = "" }) {
  const base = "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full select-none tracking-wide";

  const variants = {
    neutral: "bg-zinc-800/80 text-zinc-300 border border-zinc-700/60",
    primary: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    accent: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    cyan: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    live: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40",
    success: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    error: "bg-red-500/15 text-red-300 border border-red-500/30",
    gradient: "bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 text-emerald-200 border border-emerald-500/30",
  };

  return (
    <span className={`${base} ${variants[variant] || variants.neutral} ${className}`}>
      {children}
    </span>
  );
}
