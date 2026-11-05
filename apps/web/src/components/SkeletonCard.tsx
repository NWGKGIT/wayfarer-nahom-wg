import React from 'react';

export function SkeletonCard() {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--line)',
        borderRadius: '10px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ width: '100%', height: '190px', background: '#e2e8f0' }} />
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ height: '12px', width: '40%', background: '#f1f5f9', borderRadius: '4px' }} />
        <div style={{ height: '22px', width: '70%', background: '#e2e8f0', borderRadius: '4px' }} />
        <div style={{ height: '14px', width: '100%', background: '#f1f5f9', borderRadius: '4px' }} />
        <div style={{ height: '14px', width: '85%', background: '#f1f5f9', borderRadius: '4px' }} />
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f8fafc', height: '14px', width: '30%', background: '#f1f5f9', borderRadius: '4px' }} />
      </div>
    </div>
  );
}
