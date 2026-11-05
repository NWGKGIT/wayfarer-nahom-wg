'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SEEDED_USERS } from '@/components/UserContext';
import { Logo } from '@/components/Logo';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Compass, Coffee, Mountain, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const PERSONA_DETAILS: Record<string, { role: string; icon: typeof Compass; color: string; badge: string }> = {
  sara: {
    role: 'Cultural & History Enthusiast',
    icon: Compass,
    color: 'from-blue-600 to-indigo-700',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  abel: {
    role: 'Coffee & Culinary Explorer',
    icon: Coffee,
    color: 'from-amber-600 to-rose-700',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  liya: {
    role: 'Nature & Hiking Adventurer',
    icon: Mountain,
    color: 'from-emerald-600 to-teal-700',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
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
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-slate-50/60 py-16 px-4 sm:px-6 lg:px-8">
      {/* Ambient background blur */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="inline-flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Choose Your Traveller Persona
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600">
            Wayfarer uses seeded personas to test honest reviews and concurrency-safe tour bookings. Select who you want to explore Addis Ababa as:
          </p>
        </motion.div>

        {/* Persona Cards Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5, staggerChildren: 0.1 }}
          className="mt-12 grid gap-6 sm:grid-cols-3"
        >
          {SEEDED_USERS.map((user, idx) => {
            const meta = PERSONA_DETAILS[user.id] || {
              role: 'Traveller',
              icon: Compass,
              color: 'from-blue-600 to-blue-800',
              badge: 'bg-blue-100 text-blue-800 border-blue-200',
            };
            const Icon = meta.icon;
            const isSelected = userId === user.id;

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx, duration: 0.4 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`relative flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-600/30'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {isSelected && (
                  <span className="absolute -top-3 right-6 flex items-center gap-1 rounded-full bg-blue-600 px-3 py-0.5 text-[11px] font-semibold text-white shadow-xs">
                    <Check className="h-3 w-3 stroke-[3]" /> Active Persona
                  </span>
                )}

                <div>
                  <div
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr ${meta.color} text-xl font-bold text-white shadow-md`}
                  >
                    {user.name.charAt(0)}
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-slate-900">{user.name}</h3>

                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${meta.badge}`}
                    >
                      <Icon className="h-3 w-3" />
                      {meta.role}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{user.bio}</p>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => handleSelect(user.id)}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-200 shadow-sm active:scale-95 ${
                      isSelected
                        ? 'bg-blue-700 text-white hover:bg-blue-800'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
                    }`}
                  >
                    <span>{isSelected ? 'Continue Exploring' : `Select ${user.name}`}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Guest Mode footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>No passwords required • Identity passed as standard X-User-Id header</span>
          </div>
          <div className="mt-3">
            <Link
              href="/"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              Skip for now and browse as Guest →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
