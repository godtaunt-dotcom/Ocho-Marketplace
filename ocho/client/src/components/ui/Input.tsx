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
