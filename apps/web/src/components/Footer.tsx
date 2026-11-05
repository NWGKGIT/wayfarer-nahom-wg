import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white/70 py-10 backdrop-blur-sm mt-auto">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-left sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold tracking-wide text-slate-800 uppercase">
            Wayfarer • Addis Ababa
          </p>
          <p className="text-xs text-slate-500">
            Honest ratings & fair tour bookings.
          </p>
        </div>

        <div className="text-xs text-slate-500">
          assessment for rago systems wayfarer, by{' '}
          <a
            href="https://nahomw.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 transition-colors hover:text-blue-800 hover:underline"
          >
            nahomw.tech
          </a>
        </div>
      </div>
    </footer>
  );
}

