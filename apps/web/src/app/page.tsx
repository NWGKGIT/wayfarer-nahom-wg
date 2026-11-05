'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PlaceCard, type PlaceData } from '@/components/PlaceCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { useUser } from '@/components/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

const CATEGORIES = ['All', 'History', 'Food', 'Nature'];

export default function HomePage() {
  const { userId } = useUser();
  const [places, setPlaces] = useState<PlaceData[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'top' | 'reviews'>('top');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/wayfarer?category=${encodeURIComponent(category)}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load places.');
      setPlaces(data.places || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not connect to service.');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // Filter by local search term
  const filteredPlaces = places
    .filter(p => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === 'reviews') {
        return b.count - a.count || b.average - a.average;
      }
      // default is Bayesian honest ranking score from backend
      return (b.score ?? 0) - (a.score ?? 0) || a.name.localeCompare(b.name);
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* City Catalog Header & Filters Bar */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              City Guide • Addis Ababa
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Places to Explore
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Curated historical landmarks, lush parks, and authentic Ethiopian coffee houses.
          </p>
        </div>

        {/* Search Input */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search places, coffee..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-xs transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xs">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as 'top' | 'reviews')}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="top">Top Rated (Honest Ranking)</option>
              <option value="reviews">Most Reviewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills & Count indicator */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => {
            const isActive = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 shadow-xs cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-blue-500/20'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span>
            {loading ? 'Updating catalog...' : `${filteredPlaces.length} places available`}
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={fetchPlaces}
            className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Places Grid or Skeleton */}
      <div className="mt-8">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredPlaces.length > 0 ? (
          <motion.div
            layout
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {filteredPlaces.map((place, idx) => (
                <PlaceCard key={place.id} place={place} index={idx} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">No places found</h3>
            <p className="mt-1 text-xs text-slate-500">
              Try selecting a different category or clearing your search term.
            </p>
            <button
              onClick={() => {
                setCategory('All');
                setSearch('');
              }}
              className="mt-4 rounded-xl bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
