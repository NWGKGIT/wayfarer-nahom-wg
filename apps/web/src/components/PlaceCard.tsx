'use client';

import React from 'react';
import Link from 'next/link';

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

export function PlaceCard({ place, index }: { place: PlaceData; index: number }) {
  const defaultImage =
    'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=800&q=80';
  const displayImage = place.imageUrl || defaultImage;

  return (
    <Link href={`/places/${place.id}`} className="place-card">
      <div className="place-card-image-wrap">
        <img
          src={displayImage}
          alt={place.name}
          className="place-card-image"
          loading="lazy"
          onError={e => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        <span className="place-card-category">{place.category}</span>
      </div>

      <div className="place-card-content">
        <div
          className="place-card-meta"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
            fontSize: '12px',
            color: '#64748b',
            marginBottom: '10px',
            flexWrap: 'nowrap',
          }}
        >
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="place-card-dot">•</span>
          <span className="place-card-stars" style={{ color: 'var(--amber)', fontWeight: 700 }}>
            ★ {place.average.toFixed(1)}
          </span>
          <span style={{ color: '#94a3b8' }}>
            ({place.count} {place.count === 1 ? 'review' : 'reviews'})
          </span>
          <span className="place-card-dot">•</span>
          <span>Open {place.openingHours}</span>
        </div>

        <h3 className="place-card-title">{place.name}</h3>

        <p className="place-card-desc">{place.description}</p>

        <div className="place-card-footer" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
          <span>
            {place.slots && place.slots.length > 0
              ? `${place.slots.length} ${place.slots.length === 1 ? 'guided tour available' : 'guided tours available'}`
              : 'Open for visits'}
          </span>
        </div>
      </div>
    </Link>
  );
}
