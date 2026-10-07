import React from 'react';

export default function BrandLogo({
  size = 'md',
  showText = true,
  showIcon = true,
  showSubtitle = false,
  className = ''
}) {
  const iconSizes = {
    xs: 'w-5 h-5 rounded-md',
    sm: 'w-6 h-6 rounded-md',
    md: 'w-8 h-8 rounded-lg',
    lg: 'w-10 h-10 rounded-xl',
    xl: 'w-12 h-12 rounded-xl',
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none group ${className}`}>
      {/* 1. Logo Icon: Deep dark fill container (#0f172a / bg-slate-900) with Zapier vibrant orange automation bolt */}
      {showIcon && (
        <div
          className={`relative flex items-center justify-center flex-shrink-0 ${
            iconSizes[size] || iconSizes.md
          } bg-slate-900 border border-slate-800 shadow-sm transition-transform duration-200 group-hover:scale-105`}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-[62%] h-[62%]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 2.5L4 13.5H11.5L10 21.5L19 10.5H12.5L13 2.5Z"
              fill="#ff4f00"
              stroke="#ff4f00"
              strokeWidth="0.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* 2. Brand Typography: _flowai in deep dark slate (text-slate-900) for maximum contrast against white navbar */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <span
            className={`font-black text-slate-900 tracking-tight transition-colors ${
              textSizes[size] || textSizes.md
            }`}
          >
            _flowai
          </span>
          {showSubtitle && (
            <span className="text-[9px] font-bold text-slate-500 tracking-[0.16em] uppercase mt-1">
              Workflow Automation
            </span>
          )}
        </div>
      )}
    </div>
  );
}
