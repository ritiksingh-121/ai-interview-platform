import { forwardRef } from 'react';

/**
 * Button - Premium button component with multiple variants
 * @param {string} variant - 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} loading - Show loading state
 * @param {boolean} disabled - Disable the button
 * @param {ReactNode} children - Button content
 * @param {string} className - Additional classes
 */
const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    ...props
  },
  ref
) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg cursor-pointer select-none';

  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs rounded-md',
    md: 'px-5 py-2.5 text-sm rounded-lg',
    lg: 'px-7 py-3 text-base rounded-xl font-semibold',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-brand-500 via-pink-500 to-accent-500 text-white shadow-lg shadow-brand-500/15 hover:shadow-brand-500/25 hover:from-brand-400 hover:to-accent-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
    secondary:
      'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
    outline:
      'border border-white/15 text-white bg-transparent hover:bg-white/5 hover:border-white/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
    ghost:
      'text-white/60 hover:text-white hover:bg-white/5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
    danger:
      'bg-error-500/10 text-error-light border border-error-500/20 hover:bg-error-500/20 hover:border-error-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
});

export default Button;