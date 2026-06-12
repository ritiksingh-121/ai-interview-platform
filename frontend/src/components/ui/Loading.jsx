export function LoadingSpinner({ size = "md", className = "" }) {
  const s = { sm: "h-5 w-5", md: "h-8 w-8", lg: "h-12 w-12", xl: "h-16 w-16" };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg className={`animate-spin ${s[size]} text-pink-400`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-15" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" />
        <path className="opacity-95" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

export function Skeleton({ className = "", count = 1 }) {
  return Array.from({ length: count }).map((_, i) => <div key={i} className={`animate-pulse bg-zinc-800/60 rounded ${className}`} />);
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`animate-pulse bg-zinc-800/60 rounded ${i === lines - 1 ? "w-3/4" : "w-full"}`} style={{ height: "1.1em" }} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`space-y-5 p-6 rounded-xl bg-zinc-900/80 border border-zinc-800 ${className}`}>
      <Skeleton className="h-8 w-1/3" />
      <SkeletonText lines={3} />
      <Skeleton className="h-10 w-1/4 rounded" />
    </div>
  );
}

export default function Loading({ fullScreen = false, text = "Loading...", className = "" }) {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <LoadingSpinner size="lg" />
      <p className="text-zinc-400 text-xs font-medium">{text}</p>
    </div>
  );
  if (fullScreen) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950">{content}</div>;
  return content;
}
