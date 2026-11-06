'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { PlaceCard, type PlaceData } from '@/components/PlaceCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { SortDropdown, type SortOption } from '@/components/SortDropdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';

const CATEGORIES = ['All', 'History', 'Food', 'Nature'];

export default function HomePage() {
  const [places, setPlaces] = useState<PlaceData[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
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

  // Client-side search filtering across title, description, and category
  const filteredPlaces = useMemo(() => {
    if (!search.trim()) return places;
    const q = search.toLowerCase().trim();
    return places.filter(place =>
      place.name.toLowerCase().includes(q) ||
      place.description.toLowerCase().includes(q) ||
      place.category.toLowerCase().includes(q)
    );
  }, [places, search]);

  return (
    <div style={{ maxWidth: '1216px', margin: '36px auto 60px', padding: '0 24px' }}>
      {/* Editorial Header */}
      <div className="section-heading">
        <div className="eyebrow">THE CITY GUIDE</div>
        <h2>Places to explore</h2>
      </div>

      {/* Controls Bar: Category Filter Pills + Search Box */}
      <div className="catalog-toolbar">
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

        <div className="search-box">
          <Search className="search-box-icon" size={15} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search places, coffee, history…"
            className="search-box-input"
            aria-label="Search places"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="search-box-clear"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* List Caption with Sort Selector */}
      <div className="list-caption">
        <span>
          {search.trim()
            ? `SHOWING ${filteredPlaces.length} OF ${places.length} PLACES IN ADDIS ABABA`
            : `${places.length} PLACES IN ADDIS ABABA`}
        </span>
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

      {/* Places Grid with Skeleton or Framer Motion Stagger */}
      {loading ? (
        <div className="places-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredPlaces.length > 0 ? (
        <motion.div
          layout
          className="places-grid"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.04,
              },
            },
          }}
        >
          <AnimatePresence mode="popLayout">
            {filteredPlaces.map((place, idx) => (
              <motion.div
                key={place.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <PlaceCard place={place} index={idx} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="empty-catalog-state">
          <div className="empty-catalog-icon">
            <Search size={22} />
          </div>
          <h3>No places found</h3>
          <p>
            {search.trim()
              ? `We couldn’t find any places matching "${search}".`
              : 'No places available in this category.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setCategory('All');
            }}
            className="empty-catalog-btn"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
}
