export default function Button({ variant = "primary", size = "md", loading = false, disabled = false, children, className = "", ...props }) {
  const base = "inline-flex items-center gap-2 font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none select-none active:scale-[0.98]";

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-md",
    md: "px-5 py-2.5 text-sm rounded-lg",
    lg: "px-6 py-3 text-sm rounded-xl font-semibold tracking-wide",
  };

  const variants = {
    primary:
      "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 border border-white/10",
    secondary:
      "bg-zinc-900/80 hover:bg-zinc-800 text-zinc-100 border border-zinc-700/80 hover:border-zinc-500/80 shadow-md",
    outline:
      "bg-transparent border border-zinc-800 text-zinc-300 hover:bg-zinc-800/60 hover:text-white hover:border-zinc-600",
    ghost:
      "bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]",
    gradient:
      "bg-gradient-to-r from-emerald-500 to-teal-500 text-white glow-green hover:opacity-95 border border-white/10",
    green:
      "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 glow-green hover:from-emerald-400 hover:to-teal-400 border border-emerald-300/20",
    "outline-green":
      "bg-transparent border-2 border-emerald-500/60 text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-400",
    live:
      "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 glow-cyan hover:from-cyan-400 hover:to-indigo-500 border border-cyan-300/20",
    danger:
      "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50",
  };

  return (
    <button
      className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" />
          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
