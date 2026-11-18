import React from 'react';
import { Icon } from './Icon';

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
      icon: <Icon name="CheckCircle" size={20} className="text-emerald-600 mt-0.5" />,
    },
    warning: {
      bg: 'bg-brand-warning-bg border-amber-300 text-brand-warning-text',
      icon: <Icon name="Warning" size={20} className="text-amber-700 mt-0.5" />,
    },
    error: {
      bg: 'bg-red-50 border-red-200 text-red-800',
      icon: <Icon name="WarningCircle" size={20} className="text-red-600 mt-0.5" />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-brand-blue-dark',
      icon: <Icon name="Info" size={20} className="text-brand-blue-600 mt-0.5" />,
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
          <Icon name="X" size={16} ariaHidden />
        </button>
      )}
    </div>
  );
};
