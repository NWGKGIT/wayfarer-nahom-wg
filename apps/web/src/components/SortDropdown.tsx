'use client';

import React, { useState, useRef, useEffect } from 'react';

export type SortOption = 'top' | 'reviews' | 'rating' | 'name';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SORT_LABELS: Record<SortOption, string> = {
  top: 'Top rated',
  reviews: 'Most reviewed',
  rating: 'Highest average',
  name: 'Name (A–Z)',
};

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (opt: SortOption) => {
    onChange(opt);
    setOpen(false);
  };

  return (
    <div className="sort-container" ref={ref}>
      <button
        type="button"
        className="sort-trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>Sort:</span>
        <strong style={{ color: 'var(--ink)' }}>{SORT_LABELS[value]}</strong>
        <span style={{ fontSize: '10px', color: '#64748b', marginLeft: '2px' }}>
          {open ? '▲' : '▾'}
        </span>
      </button>

      {open && (
        <div className="sort-menu" role="listbox">
          {(Object.keys(SORT_LABELS) as SortOption[]).map(key => {
            const isSelected = value === key;
            return (
              <button
                key={key}
                type="button"
                className={`sort-item ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelect(key)}
                role="option"
                aria-selected={isSelected}
              >
                <span>{SORT_LABELS[key]}</span>
                {isSelected && <span style={{ color: 'var(--blue)', fontWeight: 700 }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
