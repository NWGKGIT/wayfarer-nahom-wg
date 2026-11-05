'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SEEDED_USERS } from '@/components/UserContext';
import Link from 'next/link';

const PERSONA_INFO: Record<string, { role: string; bio: string }> = {
  sara: {
    role: 'Cultural & History Enthusiast',
    bio: 'Fascinated by Ethiopia’s ancient heritage, landmark cathedrals, and national history museums.',
  },
  abel: {
    role: 'Coffee & Culinary Explorer',
    bio: 'Passionate about traditional Ethiopian coffee ceremonies, roasts, and authentic local cuisine.',
  },
  liya: {
    role: 'Nature & High-Altitude Adventurer',
    bio: 'Loves woodland mountain trails, Entoto scenic overlooks, and peaceful city gardens.',
  },
};

export default function AccountPickerPage() {
  const { userId, setUserId } = useUser();
  const router = useRouter();

  const handleSelect = (id: string) => {
    setUserId(id);
    router.push('/');
  };

  return (
    <div className="account-container">
      <div className="eyebrow" style={{ color: 'var(--blue)', marginBottom: '8px' }}>
        TRAVELLER IDENTITIES
      </div>
      <h1
        style={{
          font: '38px/1.15 DM Serif Display, serif',
          margin: '0 0 12px',
          color: 'var(--ink)',
          letterSpacing: '-0.8px',
        }}
      >
        Choose your persona
      </h1>
      <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '520px', margin: '0 auto' }}>
        Select a seeded traveller persona to explore places in Addis Ababa, leave reviews, and book guided tours.
      </p>

      <div className="account-cards">
        {SEEDED_USERS.map(user => {
          const info = PERSONA_INFO[user.id] || {
            role: 'Traveller',
            bio: 'Exploring the best spots in Addis Ababa.',
          };
          const isSelected = userId === user.id;

          return (
            <div
              key={user.id}
              className={`account-card ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelect(user.id)}
            >
              <div className="account-card-header">
                <div className="account-card-avatar">{user.name.charAt(0)}</div>
                <div>
                  <h3 className="account-card-title">{user.name}</h3>
                  <span className="account-card-role">{info.role}</span>
                </div>
              </div>

              <p className="account-card-bio">{info.bio}</p>

              <button
                type="button"
                className="account-card-btn"
                onClick={e => {
                  e.stopPropagation();
                  handleSelect(user.id);
                }}
              >
                {isSelected ? 'Continue exploring →' : `Select ${user.name} →`}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '36px' }}>
        <Link
          href="/"
          style={{
            fontSize: '12px',
            color: 'var(--blue)',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Browse as guest instead →
        </Link>
      </div>
    </div>
  );
}
