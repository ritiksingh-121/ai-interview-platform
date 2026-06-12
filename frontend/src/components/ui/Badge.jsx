export default function Badge({ variant = "neutral", children, className = "" }) {
  const base = "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full select-none";

  const variants = {
    neutral: "bg-zinc-800 text-zinc-300 border border-zinc-700/50",
    primary: "bg-pink-500/15 text-pink-300 border border-pink-500/25",
    accent: "bg-purple-500/15 text-purple-300 border border-purple-500/25",
    success: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
    warning: "bg-amber-500/15 text-amber-300 border border-amber-500/25",
    error: "bg-red-500/15 text-red-300 border border-red-500/25",
    gradient: "bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 border border-pink-500/20",
  };

  return (
    <span className={`${base} ${variants[variant] || variants.neutral} ${className}`}>
      {children}
    </span>
  );
}
