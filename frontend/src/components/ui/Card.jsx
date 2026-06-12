import { forwardRef } from 'react';

/**
 * Card - Premium card component with variants
 * @param {string} variant - 'default' | 'glass' | 'elevated'
 * @param {boolean} hover - Enable hover effects
 * @param {boolean} clickable - Add cursor and scale on active
 */
const Card = forwardRef(function Card(
  {
    children,
    variant = 'default',
    hover = false,
    clickable = false,
    className = '',
    ...props
  },
  ref
) {
  const baseClasses = 'rounded-2xl overflow-hidden transition-all duration-300 card-shine';

  const variantClasses = {
    default: 'bg-darkbg-card border border-white/5 shadow-medium',
    glass: 'bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-medium',
    elevated: 'bg-darkbg-elevated border border-white/10 shadow-heavy',
  };

  const hoverClasses = hover
    ? 'hover:border-white/15 hover:shadow-glow-sm hover:-translate-y-1 glow-border-hover'
    : '';

  const clickableClasses = clickable ? 'cursor-pointer active:scale-[0.99] select-none' : '';

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${clickableClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

export default Card;