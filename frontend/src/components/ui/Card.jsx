export default function Card({ variant = "default", hover = false, clickable = false, children, className = "", ...props }) {
  const base = "rounded-xl transition-all duration-200";

  const variants = {
    default: "bg-zinc-900 border border-zinc-800",
    glass: "glass",
    elevated: "bg-zinc-900 border border-zinc-700/50 shadow-xl shadow-black/30",
    gradient: "bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-800",
  };

  const hoverStyles = hover ? "hover:bg-zinc-800 hover:border-zinc-600" : "";
  const clickableStyles = clickable ? "cursor-pointer" : "";

  return (
    <div
      className={`${base} ${variants[variant] || variants.default} ${hoverStyles} ${clickableStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
