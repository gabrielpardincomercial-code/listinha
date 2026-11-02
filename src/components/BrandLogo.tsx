import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showBadge = false }) => {
  const containerClasses =
    size === 'sm'
      ? 'w-9 h-9 rounded-2xl'
      : size === 'lg'
      ? 'w-18 h-18 rounded-3xl'
      : 'w-14 h-14 rounded-2xl';

  const svgClasses =
    size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';

  return (
    <div className="relative inline-flex flex-shrink-0">
      <div
        className={`${containerClasses} bg-[#111827] border border-white/15 shadow-lg shadow-black/40 flex items-center justify-center`}
      >
        <svg
          viewBox="0 0 512 512"
          className={svgClasses}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M 92 128 H 148 L 188 352 H 370"
            fill="none"
            stroke="#FFD60A"
            strokeWidth="36"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 155 166 H 404 C 419 166 430 180 426 195 L 398 286 C 394 299 382 308 368 308 H 180 L 155 166 Z"
            fill="#FFD60A"
          />
          <rect x="230" y="198" width="22" height="72" rx="11" fill="#111827" />
          <rect x="286" y="198" width="22" height="72" rx="11" fill="#111827" />
          <rect x="342" y="198" width="22" height="72" rx="11" fill="#111827" />
          <circle cx="208" cy="410" r="32" fill="#FFD60A" />
          <circle cx="348" cy="410" r="32" fill="#FFD60A" />
        </svg>
      </div>

      {showBadge && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#090b10] flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-75" />
        </div>
      )}
    </div>
  );
};
