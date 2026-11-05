import React from 'react';
import Link from 'next/link';

export function Logo({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 36 : 26;
  const textSize = size === 'sm' ? '22px' : size === 'lg' ? '34px' : '28px';

  return (
    <Link
      href="/"
      className={`brand ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
      }}
      aria-label="Wayfarer Home"
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #38bdf8 100%)',
          padding: '6px',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(29, 78, 216, 0.25)',
          flexShrink: 0,
        }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
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
            fillOpacity="0.35"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </div>
      <span
        style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: textSize,
          letterSpacing: '-0.8px',
          color: 'var(--ink)',
        }}
      >
        wayfarer<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}

