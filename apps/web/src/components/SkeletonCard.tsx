import React from 'react';

export function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-xs animate-pulse">
      {/* Shimmer Image */}
      <div className="aspect-16/10 w-full bg-slate-200" />

      {/* Shimmer Body */}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 rounded-full bg-slate-200" />
          <div className="h-4 w-12 rounded-full bg-slate-200" />
        </div>
        <div className="h-6 w-3/4 rounded-md bg-slate-200" />
        <div className="h-4 w-1/2 rounded-md bg-slate-200" />
        <div className="mt-2 space-y-2">
          <div className="h-3 w-full rounded-md bg-slate-200" />
          <div className="h-3 w-4/5 rounded-md bg-slate-200" />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="h-4 w-20 rounded-md bg-slate-200" />
          <div className="h-7 w-20 rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
