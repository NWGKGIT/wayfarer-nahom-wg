'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from './Logo';
import { useUser } from './UserContext';
import { LogOut, User as UserIcon, MapPin } from 'lucide-react';

export function Navbar() {
  const { currentUser, signOut } = useUser();
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.push('/account');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Logo />
          <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1 text-xs font-medium text-slate-600 sm:flex">
            <MapPin className="h-3.5 w-3.5 text-blue-600" />
            <span>ADDIS ABABA</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400 font-mono text-[11px]">9°01′ N 38°45′ E</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 rounded-full border border-blue-100 bg-blue-50/80 py-1.5 pl-2 pr-3.5 text-xs text-blue-900 shadow-xs">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shadow-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <span>
                  Exploring as <strong className="font-semibold text-blue-950">{currentUser.name}</strong>
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
                title="Switch or sign out of account"
              >
                <LogOut className="h-3.5 w-3.5 text-slate-500" />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/account"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Select Persona</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
