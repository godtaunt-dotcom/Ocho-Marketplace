# UI Components

Full source code of shared UI primitives in Ocho.

## Button (`ocho/client/src/components/ui/Button.tsx`)
```tsx
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
      'bg-white border border-brand-border hover:border-brand-blue-600 hover:bg-brand-blue-50 text-brand-blue-600 focus:ring-brand-blue',
    // Ghost: Subtle background on hover
    ghost:
      'bg-transparent hover:bg-brand-blue-tint text-brand-text-primary hover:text-brand-blue-600 focus:ring-brand-blue',
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
```

## Input & RupiahInput (`ocho/client/src/components/ui/Input.tsx`)
```tsx
import React, { useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-brand-text-primary tracking-wide"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-brand-text-secondary">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-brand-text-primary placeholder:text-brand-text-secondary/60 transition-all duration-150 focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:cursor-not-allowed ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                : 'border-brand-inputBorder focus:border-brand-blue-600 focus:ring-brand-blue-100'
            } ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-brand-text-secondary">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-brand-text-secondary">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface RupiahInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value?: number;
  onChange?: (val: number) => void;
}

export const RupiahInput: React.FC<RupiahInputProps> = ({
  value = 0,
  onChange,
  ...props
}) => {
  const formattedValue = value ? new Intl.NumberFormat('id-ID').format(value) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/[^0-9]/g, '');
    const num = rawDigits ? parseInt(rawDigits, 10) : 0;
    onChange?.(num);
  };

  return (
    <Input
      {...props}
      leftIcon={<span className="text-xs font-bold text-brand-text-secondary select-none">Rp</span>}
      value={formattedValue}
      onChange={handleChange}
      placeholder="0"
    />
  );
};
```

## Badge (`ocho/client/src/components/ui/Badge.tsx`)
```tsx
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
```

## Card (`ocho/client/src/components/ui/Card.tsx`)
```tsx
import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-brand-border shadow-card transition-all duration-200 overflow-hidden ${
        hoverable ? 'hover:shadow-soft hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-5 pb-3 border-b border-brand-border/60 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <h3
      className={`font-display text-lg font-bold text-brand-text-primary tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <p className={`text-xs text-brand-text-secondary mt-1 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`p-5 pt-3 border-t border-brand-border/60 bg-gray-50/50 flex items-center justify-between ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
```

## Modal (`ocho/client/src/components/ui/Modal.tsx`)
```tsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-text-primary/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidthClasses} bg-white rounded-2xl border border-brand-border shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-brand-border">
          <div>
            {title && (
              <h3 className="font-display text-lg font-bold text-brand-text-primary">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-brand-text-secondary mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-text-secondary hover:text-brand-text-primary hover:bg-gray-100 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-4 px-5 bg-gray-50 border-t border-brand-border flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
```

## Alert (`ocho/client/src/components/ui/Alert.tsx`)
```tsx
import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface AlertProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
}) => {
  const styles = {
    success: {
      bg: 'bg-brand-success-bg border-emerald-200 text-brand-success-text',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-brand-warning-bg border-amber-300 text-brand-warning-text',
      icon: <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />,
    },
    error: {
      bg: 'bg-red-50 border-red-200 text-red-800',
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-brand-blue-dark',
      icon: <Info className="w-5 h-5 text-brand-blue-600 shrink-0 mt-0.5" />,
    },
  }[type];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${styles.bg} ${className}`}
      role="alert"
    >
      {styles.icon}
      <div className="flex-1 text-sm">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <div className="text-xs leading-relaxed opacity-95">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Tutup pemberitahuan"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
```
