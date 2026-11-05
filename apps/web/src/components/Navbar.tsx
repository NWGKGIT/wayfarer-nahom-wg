'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from './UserContext';

export function Navbar() {
  const { currentUser, signOut } = useUser();
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.push('/account');
  };

  return (
    <header className="topbar">
      <Link href="/" className="brand" aria-label="Wayfarer Home">
        wayfarer<span className="brand-dot">.</span>
      </Link>

      <div className="top-location">
        A LITTLE GUIDE TO <strong>ADDIS ABABA, ETHIOPIA</strong>
      </div>

      <div className="top-nav">
        {currentUser ? (
          <>
            <div className="user-badge">
              <span className="user-avatar-small">{currentUser.name.charAt(0)}</span>
              <span>
                Exploring as <strong>{currentUser.name}</strong>
              </span>
            </div>
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
