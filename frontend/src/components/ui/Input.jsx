export default function Input({ label, error, className = "", ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</label>
      )}
      <input
        className={`w-full px-4 py-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-100 text-sm placeholder:text-zinc-500 outline-none transition-all duration-200 focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 focus:bg-zinc-900 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
