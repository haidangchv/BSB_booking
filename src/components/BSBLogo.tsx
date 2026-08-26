import React from 'react';

interface BSBLogoProps {
  variant?: 'light' | 'dark' | 'navy';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const BSBLogo: React.FC<BSBLogoProps> = ({
  variant = 'navy',
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-11 sm:h-12',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24'
  };

  const logoSrc = variant === 'light' ? '/bsb-logo-white.png' : '/bsb-logo.png';

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <img
        src={logoSrc}
        alt="BSB Pickleball Club"
        className={`${sizeClasses[size] || 'h-10'} w-auto object-contain transition-transform duration-200 hover:scale-[1.02]`}
        loading="eager"
      />
    </div>
  );
};
