/**
 * Loading - Full-page loading state with skeleton and spinner variants
 */
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        className={`animate-spin ${sizeClasses[size]} text-accent-500`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-15"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        <path
          className="opacity-95"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export function Skeleton({ className = '', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-white/[0.04] border border-white/[0.02] rounded-lg ${className}`}
        />
      ))}
    </>
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-white/[0.04] border border-white/[0.02] rounded ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
          style={{ height: '1.1em' }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`space-y-5 p-6 rounded-2xl bg-darkbg-card border border-white/5 ${className}`}>
      <Skeleton className="h-8 w-1/3" />
      <SkeletonText lines={3} />
      <Skeleton className="h-10 w-1/4 rounded-lg" />
    </div>
  );
}

export default function Loading({ fullScreen = false, text = 'Loading...', className = '' }) {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Glow backdrop behind spinner */}
        <div className="absolute inset-0 bg-accent-500/10 blur-xl rounded-full" />
        <LoadingSpinner size="lg" />
      </div>
      <p className="text-white/60 text-sm font-semibold tracking-wide animate-pulse">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in">
        {content}
      </div>
    );
  }

  return content;
}