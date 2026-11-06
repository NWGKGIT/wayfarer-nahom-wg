import React from 'react';

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-shimmer" style={{ width: '100%', height: '190px' }} />
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="skeleton-shimmer" style={{ height: '12px', width: '40%', borderRadius: '4px' }} />
        <div className="skeleton-shimmer" style={{ height: '22px', width: '70%', borderRadius: '4px' }} />
        <div className="skeleton-shimmer" style={{ height: '14px', width: '100%', borderRadius: '4px' }} />
        <div className="skeleton-shimmer" style={{ height: '14px', width: '85%', borderRadius: '4px' }} />
        <div className="skeleton-shimmer" style={{ marginTop: '12px', height: '14px', width: '30%', borderRadius: '4px' }} />
      </div>
    </div>
  );
}
