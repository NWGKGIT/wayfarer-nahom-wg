'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from './UserContext';
import { Logo } from './Logo';

export function Navbar() {
  const { currentUser, signOut, isAdmin } = useUser();
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.push('/account');
  };

  return (
    <header className="topbar">
      <Logo />

      <div className="top-location">
        A LITTLE GUIDE TO <strong>ADDIS ABABA, ETHIOPIA</strong>
      </div>

      <div className="top-nav">
        {currentUser ? (
          <>
            <div className={`user-badge ${isAdmin ? 'admin-badge' : ''}`}>
              <span className={`user-avatar-small ${isAdmin ? 'admin-avatar-small' : ''}`}>
                {currentUser.name.charAt(0)}
              </span>
              <span>
                Exploring as <strong>{currentUser.name}</strong>
                {isAdmin && <span className="admin-tag-small">Curator</span>}
              </span>
            </div>

            {isAdmin && (
              <Link href="/admin" className="btn-admin-nav">
                Admin Panel
              </Link>
            )}

            <button onClick={handleSignOut} className="btn-signout">
              Sign out
            </button>
          </>
        ) : (
          <Link href="/account" className="btn-signin">
            Select persona
          </Link>
        )}
      </div>
    </header>
  );
}
