'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/UserContext';
import { Logo } from '@/components/Logo';
import { motion } from 'framer-motion';

export default function AccountPickerPage() {
  const { userId, setUserId, users } = useUser();
  const router = useRouter();

  useEffect(() => {
    document.title = 'Choose your persona · Wayfarer';
  }, []);

  const handleSelect = (id: string) => {
    setUserId(id);
    if (id === 'admin') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="account-container">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <Logo size="lg" />
      </div>
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
        Select a traveller persona to browse Addis Ababa, submit reviews, and reserve guided tours, or enter as Administrator to curate the city catalog.
      </p>

      <div className="account-cards">
        {users.map((user, idx) => {
          const isSelected = userId === user.id;
          const isAdmin = user.id === 'admin';

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.3 }}
              className={`account-card ${isSelected ? 'selected' : ''} ${isAdmin ? 'account-card-admin' : ''}`}
              onClick={() => handleSelect(user.id)}
            >
              <div className="account-card-header">
                <div className={`account-card-avatar ${isAdmin ? 'admin-avatar' : ''}`}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 className="account-card-title">{user.name}</h3>
                    {isAdmin && <span className="admin-tag-small">Curator</span>}
                  </div>
                  <span className="account-card-role">{user.role || (isAdmin ? 'System & City Curator' : 'Traveller')}</span>
                </div>
              </div>

              <p className="account-card-bio">{user.bio || 'Exploring places in Addis Ababa.'}</p>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="account-card-btn"
                  onClick={e => {
                    e.stopPropagation();
                    handleSelect(user.id);
                  }}
                >
                  {isSelected
                    ? (isAdmin ? 'Go to Admin Dashboard' : 'Continue exploring')
                    : (isAdmin ? 'Curate as Admin' : `Select ${user.name}`)}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ marginTop: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => {
            setUserId(null);
            router.push('/');
          }}
          className="btn-guest"
        >
          Browse as guest instead
        </button>

        {userId === 'admin' && (
          <Link href="/admin" className="btn-guest" style={{ background: 'var(--blue)', color: '#ffffff', borderColor: 'var(--blue)' }}>
            Open Admin Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
