/**
 * Badge - Status badge component
 */
export default function Badge({ children, variant = 'primary', className = '' }) {
  const variantClasses = {
    primary: 'bg-brand-500/10 text-brand-300 border-brand-500/20',
    accent: 'bg-accent-500/10 text-accent-300 border-accent-500/20',
    success: 'bg-success/10 text-success-light border-success/20',
    warning: 'bg-warning/10 text-warning-light border-warning/20',
    error: 'bg-error-500/10 text-error-light border-error-500/20',
    neutral: 'bg-white/5 text-white/70 border-white/10',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border select-none ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}