import { forwardRef } from 'react';

/**
 * Input - Premium form input with validation states
 * @param {string} label - Input label
 * @param {string} error - Error message
 * @param {string} helperText - Helper text below input
 * @param {string} className - Additional classes
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    className = '',
    id,
    ...props
  },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-3 rounded-lg bg-darkbg-input border text-white placeholder-white/25 transition-all duration-300
            focus:outline-none focus:ring-2
            ${
              error
                ? 'border-error-500/50 focus:border-error-500 focus:ring-error-500/10'
                : 'border-white/10 focus:border-accent-500/40 focus:ring-accent-500/15 hover:border-white/20'
            }`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-xs text-error-light flex items-center gap-1.5 animate-fade-in">
          <svg className="w-4 h-4 shrink-0 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-xs text-white/40">{helperText}</p>
      )}
    </div>
  );
});

export default Input;