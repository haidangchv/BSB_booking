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
  // Brand Colors from guidelines:
  // Primary Navy: #11385E
  // Secondary: #647A82, #676F84, #A0AEBC
  const mainColor = variant === 'light' ? '#FFFFFF' : '#11385E';
  const subtitleColor = variant === 'light' ? '#E2E8F0' : '#11385E';

  const scale = size === 'sm' ? 0.7 : size === 'md' ? 1 : size === 'lg' ? 1.4 : 1.8;

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        width={140 * scale}
        height={50 * scale}
        viewBox="0 0 280 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-200"
      >
        {/* Letter B1 - 3 parallel strokes */}
        <g stroke={mainColor} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer stroke */}
          <path d="M12 12 H 48 C 64 12, 72 20, 72 32 C 72 42, 65 48, 52 48 C 68 48, 76 56, 76 68 C 76 82, 64 88, 48 88 H 12 Z" />
          {/* Middle stroke */}
          <path d="M22 22 H 46 C 56 22, 62 26, 62 33 C 62 40, 56 44, 46 44 H 22 V 54 H 48 C 60 54, 66 60, 66 68 C 66 76, 58 78, 46 78 H 22 Z" />
          {/* Inner stroke */}
          <path d="M32 30 H 42 C 48 30, 52 32, 52 36 C 52 40, 48 41, 42 41 H 32 V 58 H 44 C 50 58, 56 61, 56 66 C 56 71, 50 72, 44 72 H 32 Z" />
        </g>

        {/* Letter S - 3 parallel strokes */}
        <g stroke={mainColor} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer stroke */}
          <path d="M174 24 C 168 15, 155 12, 138 12 H 112 C 95 12, 88 22, 88 34 C 88 48, 100 52, 120 55 C 150 58, 176 64, 176 76 C 176 90, 160 90, 142 90 H 114 C 98 90, 88 82, 86 70" />
          {/* Middle stroke */}
          <path d="M166 32 C 160 25, 150 22, 138 22 H 114 C 104 22, 98 28, 98 34 C 98 42, 106 45, 124 48 C 154 52, 166 60, 166 74 C 166 80, 156 82, 140 82 H 116 C 104 82, 98 76, 96 68" />
          {/* Inner stroke */}
          <path d="M156 38 C 150 33, 144 31, 136 31 H 118 C 112 31, 108 33, 108 36 C 108 40, 114 41, 126 43 C 148 46, 156 52, 156 68 C 156 73, 150 74, 138 74 H 120 C 112 74, 108 71, 106 66" />
        </g>

        {/* Letter B2 - 3 parallel strokes */}
        <g stroke={mainColor} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer stroke */}
          <path d="M196 12 H 232 C 248 12, 256 20, 256 32 C 256 42, 249 48, 236 48 C 252 48, 260 56, 260 68 C 260 82, 248 88, 232 88 H 196 Z" />
          {/* Middle stroke */}
          <path d="M206 22 H 230 C 240 22, 246 26, 246 33 C 246 40, 240 44, 230 44 H 206 V 54 H 232 C 244 54, 250 60, 250 68 C 250 76, 242 78, 230 78 H 206 Z" />
          {/* Inner stroke */}
          <path d="M216 30 H 226 C 232 30, 236 32, 236 36 C 236 40, 232 41, 226 41 H 216 V 58 H 228 C 234 58, 240 61, 240 66 C 240 71, 234 72, 228 72 H 216 Z" />
        </g>
      </svg>

      {showSubtitle && (
        <span
          style={{ color: subtitleColor }}
          className="font-extrabold tracking-[0.28em] text-[10px] md:text-[11px] uppercase mt-1 transition-colors"
        >
          PICKLEBALL CLUB
        </span>
      )}
    </div>
  );
};
