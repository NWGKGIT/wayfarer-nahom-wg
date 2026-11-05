'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PlaceCard, type PlaceData } from '@/components/PlaceCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { SortDropdown, type SortOption } from '@/components/SortDropdown';

const CATEGORIES = ['All', 'History', 'Food', 'Nature'];

export default function HomePage() {
  const [places, setPlaces] = useState<PlaceData[]>([]);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<SortOption>('top');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `/api/wayfarer?category=${encodeURIComponent(category)}&sort=${encodeURIComponent(sort)}`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load places.');
      setPlaces(data.places || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load places.');
    } finally {
      setLoading(false);
    }
  }, [category, sort]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  return (
    <div style={{ maxWidth: '1216px', margin: '36px auto 60px', padding: '0 24px' }}>
      {/* Editorial Header */}
      <div className="section-heading">
        <div className="eyebrow">THE CITY GUIDE</div>
        <h2>Places to explore</h2>
      </div>

      {/* Category Filter Pills */}
      <div className="filters" aria-label="Filter by category">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={category === cat ? 'active' : ''}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List Caption with Sort Selector */}
      <div className="list-caption">
        <span>{places.length} PLACES IN ADDIS ABABA</span>
        <SortDropdown value={sort} onChange={setSort} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="message error" role="alert">
          {error}
          <button
            onClick={fetchPlaces}
            style={{
              marginLeft: '12px',
              textDecoration: 'underline',
              background: 'none',
              border: 0,
              padding: 0,
              color: 'inherit',
              fontWeight: 700,
            }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Places Grid */}
      {loading ? (
        <div className="places-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : places.length > 0 ? (
        <div className="places-grid">
          {places.map((place, idx) => (
            <PlaceCard key={place.id} place={place} index={idx} />
          ))}
        </div>
      ) : (
        <p className="state" style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
          No places found in this category.
        </p>
      )}
    </div>
  );
}
