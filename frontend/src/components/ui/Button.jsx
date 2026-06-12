export default function Button({ variant = "primary", size = "md", loading = false, disabled = false, children, className = "", ...props }) {
  const base = "inline-flex items-center gap-2 font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none select-none";

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-md",
    md: "px-5 py-2.5 text-sm rounded-lg",
    lg: "px-6 py-3 text-sm rounded-lg",
  };

  const variants = {
    primary:
      "bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-400 hover:to-purple-400 active:from-pink-600 active:to-purple-600 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30",
    secondary:
      "glass text-zinc-100 hover:bg-white/[0.06] active:bg-white/[0.1]",
    outline:
      "bg-transparent border border-zinc-800 text-zinc-300 hover:bg-zinc-800/40 hover:border-zinc-600 active:bg-zinc-800/60",
    ghost:
      "bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]",
    gradient:
      "bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-400 hover:to-purple-400 active:from-pink-600 active:to-purple-600 glow-accent",
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
