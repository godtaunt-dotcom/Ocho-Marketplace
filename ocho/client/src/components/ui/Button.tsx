import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  // Variants meeting WCAG AA contrast guidelines
  const variantClasses = {
    // Primary: Brand Orange with high contrast styling
    primary:
      'bg-[#D86213] hover:bg-[#C0540C] active:bg-[#A94707] text-white shadow-sm focus:ring-[#FA8232]',
    // Secondary: Darker brand blue for excellent text contrast on white (>= 4.5:1)
    secondary:
      'bg-brand-blue-600 hover:bg-brand-blue-700 active:bg-brand-blue-dark text-white shadow-sm focus:ring-brand-blue',
    // Outline: Clean border with accessible dark blue text
    outline:
      'bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-700 hover:border-brand-blue-600 hover:bg-brand-blue-50 dark:hover:bg-slate-800 text-brand-blue-600 dark:text-brand-blue-400 focus:ring-brand-blue',
    // Ghost: Subtle background on hover
    ghost:
      'bg-transparent hover:bg-brand-blue-tint dark:hover:bg-slate-800 text-brand-text-primary dark:text-slate-200 hover:text-brand-blue-600 dark:hover:text-brand-blue-400 focus:ring-brand-blue',
    // Danger: For destructive actions
    danger:
      'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm focus:ring-red-500',
  }[variant];

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 font-medium',
    md: 'text-sm px-4 py-2.5 gap-2 font-semibold',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  }[size];

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
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
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
