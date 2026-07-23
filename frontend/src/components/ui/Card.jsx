export default function Card({ variant = "default", hover = false, clickable = false, children, className = "", ...props }) {
  const base = "rounded-xl transition-all duration-300 relative overflow-hidden";

  const variants = {
    default: "bg-zinc-900/90 border border-zinc-800/80 shadow-lg shadow-black/40",
    glass: "glass shadow-xl shadow-black/30",
    elevated: "bg-zinc-900/95 border border-zinc-700/60 shadow-2xl shadow-black/50",
    gradient: "bg-gradient-to-br from-zinc-900 via-zinc-900/80 to-zinc-950 border border-zinc-800",
    highlight: "bg-gradient-to-b from-indigo-950/40 via-zinc-900 to-zinc-950 border border-indigo-500/40 glow-accent",
    live: "bg-zinc-900/95 border border-cyan-500/40 glow-cyan",
  };

  const hoverStyles = hover ? "hover:border-zinc-600 hover:-translate-y-1 hover:shadow-2xl" : "";
  const clickableStyles = clickable ? "cursor-pointer active:translate-y-0" : "";

  return (
    <div
      className={`${base} ${variants[variant] || variants.default} ${hoverStyles} ${clickableStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
