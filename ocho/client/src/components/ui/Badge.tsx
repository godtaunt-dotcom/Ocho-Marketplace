import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'verified' | 'warning' | 'category' | 'sold' | 'info' | 'coming-soon';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center gap-1.5 font-semibold rounded-full select-none';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
  }[size];

  const variantClasses = {
    default: 'bg-gray-100 text-brand-text-secondary border border-gray-200',
    verified: 'bg-brand-success-bg text-brand-success-text border border-emerald-200',
    warning: 'bg-brand-warning-bg text-brand-warning-text border border-amber-200',
    category: 'bg-brand-blue-tint text-brand-blue-dark border border-brand-blue-100',
    sold: 'bg-gray-200 text-gray-700 border border-gray-300',
    info: 'bg-blue-50 text-brand-blue-dark border border-blue-200',
    'coming-soon': 'bg-purple-50 text-brand-purple border border-purple-200',
  }[variant];

  return (
    <span className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`} {...props}>
      {variant === 'verified' && <CheckCircle2 className="w-3.5 h-3.5 text-brand-success-text" />}
      {variant === 'warning' && <AlertCircle className="w-3.5 h-3.5 text-brand-warning-text" />}
      {children}
    </span>
  );
};
