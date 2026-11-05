import React from 'react';
import Link from 'next/link';

export function Logo({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 40 : 32;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 font-bold tracking-tight text-slate-900 group transition-opacity hover:opacity-95 ${className}`}
      aria-label="Wayfarer Home"
    >
      <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 p-2 text-white shadow-md shadow-blue-500/20 transition-transform duration-300 group-hover:scale-105">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          {/* Stylized Modern Wayfinder Compass */}
          <circle cx="12" cy="12" r="9.5" strokeOpacity="0.4" />
          <polygon
            points="12,3 15,11 12,9 9,11"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
          />
          <polygon
            points="12,21 9,13 12,15 15,13"
            fill="white"
            fillOpacity="0.3"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className={`font-serif tracking-tight text-slate-900 ${textSize}`}>
          wayfarer<span className="text-blue-600">.</span>
        </span>
      </div>
    </Link>
  );
}

