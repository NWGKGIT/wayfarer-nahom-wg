'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Clock, ChevronRight, Compass } from 'lucide-react';

export type PlaceData = {
  id: string;
  name: string;
  category: string;
  description: string;
  openingHours: string;
  imageUrl?: string | null;
  average: number;
  count: number;
  score?: number;
  slots?: Array<{
    id: string;
    startsAt: string;
    capacity: number;
    remaining: number;
  }>;
};

const CATEGORY_COLORS: Record<string, string> = {
  History: 'bg-amber-100/90 text-amber-800 border-amber-200',
  Food: 'bg-rose-100/90 text-rose-800 border-rose-200',
  Nature: 'bg-emerald-100/90 text-emerald-800 border-emerald-200',
};

export function PlaceCard({ place, index }: { place: PlaceData; index: number }) {
  const categoryBadgeClass =
    CATEGORY_COLORS[place.category] || 'bg-blue-100/90 text-blue-800 border-blue-200';

  const defaultImage =
    'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=800&q=80';
  const displayImage = place.imageUrl || defaultImage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-xl"
    >
      {/* Image Banner */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <img
          src={displayImage}
          alt={place.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md shadow-xs ${categoryBadgeClass}`}
          >
            {place.category}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-800 shadow-md backdrop-blur-md">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
          <span>{place.average.toFixed(1)}</span>
          <span className="text-slate-400 font-normal">
            ({place.count} {place.count === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {place.name}
          </h3>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Open {place.openingHours}</span>
          </div>

          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
            {place.description}
          </p>
        </div>

        {/* Card Footer with Tours available count & CTA */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Compass className="h-3.5 w-3.5 text-blue-600" />
            {place.slots?.length
              ? `${place.slots.length} ${place.slots.length === 1 ? 'tour slot' : 'tour slots'}`
              : 'Tours available'}
          </span>

          <Link
            href={`/places/${place.id}`}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white"
          >
            <span>Explore</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
