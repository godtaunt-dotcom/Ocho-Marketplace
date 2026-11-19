import React from 'react';
import { Icon } from './Icon';

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
    default: 'bg-gray-100 dark:bg-slate-800 text-brand-text-secondary dark:text-slate-300 border border-gray-200 dark:border-slate-700',
    verified: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    category: 'bg-brand-blue-50 dark:bg-brand-blue-950/70 text-brand-blue-700 dark:text-brand-blue-300 border border-brand-blue-200 dark:border-brand-blue-800',
    sold: 'bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-700',
    info: 'bg-blue-50 dark:bg-blue-950/60 text-brand-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    'coming-soon': 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
  }[variant];

  return (
    <span className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`} {...props}>
      {variant === 'verified' && <Icon name="CheckCircle" size={16} weight="fill" className="text-brand-success-text" />}
      {variant === 'warning' && <Icon name="WarningCircle" size={16} className="text-brand-warning-text" />}
      {children}
    </span>
  );
};
