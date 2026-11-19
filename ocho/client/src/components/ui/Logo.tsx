import React from 'react';

export interface LogoProps {
  variant?: 'color' | 'white';
  size?: 'sm' | 'md' | 'lg' | number;
  iconOnly?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'color',
  size = 'md',
  iconOnly = false,
  className = '',
}) => {
  const isWhite = variant === 'white';
  const oColor = isWhite ? '#FFFFFF' : '#5170FD';
  const pupilColor = isWhite ? '#3B4FD6' : '#191C1F';
  const gradientStart = isWhite ? '#FFFFFF' : '#5170FD';
  const gradientEnd = isWhite ? '#E8ECFF' : '#3A1FB0';

  const sizeClasses = typeof size === 'number'
    ? ''
    : {
        sm: iconOnly ? 'h-6 w-6' : 'h-7',
        md: iconOnly ? 'h-8 w-8' : 'h-9',
        lg: iconOnly ? 'h-12 w-12' : 'h-12',
      }[size];

  const customStyle = typeof size === 'number'
    ? { width: `${size}px`, height: `${size}px` }
    : undefined;

  if (iconOnly) {
    return (
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses} ${className}`}
        style={customStyle}
        aria-label="Ocho Icon"
      >
        <defs>
          <linearGradient id="smileGradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientStart} />
            <stop offset="100%" stopColor={gradientEnd} />
          </linearGradient>
        </defs>
        {/* Left eye 'o' */}
        <circle cx="10" cy="15" r="7" fill={oColor} />
        <circle cx="10" cy="15" r="3" fill={pupilColor} />

        {/* Right eye 'o' */}
        <circle cx="26" cy="15" r="7" fill={oColor} />
        <circle cx="26" cy="15" r="3" fill={pupilColor} />

        {/* Smile curve below */}
        <path
          d="M13 25C15 28 21 28 23 25"
          stroke="url(#smileGradIcon)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 130 42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses} w-auto`}
        style={customStyle}
        aria-label="Ocho Logo"
      >
        <defs>
          <linearGradient id="smileGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradientStart} />
            <stop offset="100%" stopColor={gradientEnd} />
          </linearGradient>
        </defs>

        {/* 1st 'o' (eye) */}
        <g transform="translate(4, 8)">
          <circle cx="13" cy="13" r="12" fill={oColor} />
          <circle cx="13" cy="13" r="5" fill={isWhite ? '#5170FD' : '#FFFFFF'} />
          <circle cx="13.5" cy="13.5" r="2.8" fill={pupilColor} />
        </g>

        {/* 'c' */}
        <text
          x="35"
          y="29"
          fill="currentColor"
          className={isWhite ? 'text-white' : 'text-[#191C1F] dark:text-white transition-colors'}
          fontFamily="'Fredoka', 'Baloo 2', sans-serif"
          fontSize="28"
          fontWeight="700"
          letterSpacing="-0.5"
        >
          c
        </text>

        {/* 'h' */}
        <text
          x="53"
          y="29"
          fill="currentColor"
          className={isWhite ? 'text-white' : 'text-[#191C1F] dark:text-white transition-colors'}
          fontFamily="'Fredoka', 'Baloo 2', sans-serif"
          fontSize="28"
          fontWeight="700"
          letterSpacing="-0.5"
        >
          h
        </text>

        {/* Smile curve under 'ch' only */}
        <path
          d="M40 34C48 40 64 40 70 34"
          stroke="url(#smileGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* 2nd 'o' (eye) */}
        <g transform="translate(76, 8)">
          <circle cx="13" cy="13" r="12" fill={oColor} />
          <circle cx="13" cy="13" r="5" fill={isWhite ? '#5170FD' : '#FFFFFF'} />
          <circle cx="13.5" cy="13.5" r="2.8" fill={pupilColor} />
        </g>
      </svg>
    </div>
  );
};

export const LogoIcon: React.FC<Omit<LogoProps, 'iconOnly'>> = (props) => (
  <Logo {...props} iconOnly />
);
