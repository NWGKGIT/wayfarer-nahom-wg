'use client';

import React, { useCallback, useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/UserContext';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Info,
  Send,
} from 'lucide-react';

type User = { id: string; name: string };
type Review = { id: string; userId: string; rating: number; body: string; createdAt: string; user: User };
type Slot = { id: string; startsAt: string; capacity: number; remaining: number };
type Place = {
  id: string;
  name: string;
  category: string;
  description: string;
  openingHours: string;
  imageUrl?: string | null;
  average: number;
  count: number;
  score?: number;
  reviews: Review[];
  slots: Slot[];
};

export default function PlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const placeId = resolvedParams.id;
  const router = useRouter();
  const { userId, currentUser } = useUser();

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busySlotId, setBusySlotId] = useState<string | null>(null);
  const [busyReview, setBusyReview] = useState(false);

  // Booking state
  const [seats, setSeats] = useState(1);

  // Review form state
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');

  const loadPlace = useCallback(async () => {
    try {
      const res = await fetch(`/api/wayfarer?id=${encodeURIComponent(placeId)}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not load place details.');
      setPlace(data.place);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading details.');
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  useEffect(() => {
    loadPlace();
  }, [loadPlace]);

  // Pre-fill existing review if current persona already submitted one
  useEffect(() => {
    if (place && userId) {
      const existing = place.reviews.find(r => r.userId === userId);
      if (existing) {
        setRating(existing.rating);
        setBody(existing.body);
      } else {
        setRating(5);
        setBody('');
      }
    }
  }, [place, userId]);

  async function handleBookTour(slotId: string) {
    if (!userId) {
      router.push('/account');
      return;
    }

    setBusySlotId(slotId);
    setError('');
    setNotice('');

    try {
      const res = await fetch('/api/wayfarer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({ type: 'booking', slotId, seats }),
      });
      const data = await res.json();
      if (!res.ok) {
        await loadPlace();
        throw new Error(data.error || 'Could not complete booking.');
      }
      await loadPlace();
      setNotice(`Successfully reserved ${seats} ${seats === 1 ? 'seat' : 'seats'}! Enjoy your tour.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed.');
    } finally {
      setBusySlotId(null);
    }
  }

  async function handleSaveReview(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      router.push('/account');
      return;
    }

    setBusyReview(true);
    setError('');
    setNotice('');

    try {
      const res = await fetch('/api/wayfarer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({ type: 'review', placeId, rating, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save review.');
      await loadPlace();
      setNotice('Your review has been published. Thank you!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review submission failed.');
    } finally {
      setBusyReview(false);
    }
  }

  const defaultImage =
    'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1200&q=80';

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-slate-500">Loading place details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Place not found</h2>
        <p className="mt-2 text-sm text-slate-500">The requested place could not be located.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Places</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Navigation Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 text-slate-500" />
          <span>All Places</span>
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 text-blue-600" />
          <span>Addis Ababa City Guide</span>
        </div>
      </div>

      {/* Hero Visual Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="relative aspect-21/9 w-full bg-slate-900 sm:aspect-21/8">
          <img
            src={place.imageUrl || defaultImage}
            alt={place.name}
            className="h-full w-full object-cover"
            onError={e => {
              (e.target as HTMLImageElement).src = defaultImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

          {/* Floating Category Tag */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
              {place.category}
            </span>
          </div>

          {/* Place Title & Rating Overlay */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              {place.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-200">
              <div className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 font-semibold text-white backdrop-blur-md">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{place.average.toFixed(1)}</span>
                <span className="text-white/80">({place.count} {place.count === 1 ? 'review' : 'reviews'})</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-blue-300" />
                <span>Open {place.openingHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Place Description */}
        <div className="p-6 sm:p-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">About this place</h2>
          <p className="mt-2 text-base leading-relaxed text-slate-700 sm:text-lg">
            {place.description}
          </p>
        </div>
      </motion.div>

      {/* Notice & Error Alerts */}
      {notice && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-xs"
        >
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{notice}</span>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-xs"
        >
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </motion.div>
      )}

      {/* Guest Mode Notice */}
      {!userId && (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-blue-900">
            <Info className="h-5 w-5 text-blue-600 shrink-0" />
            <span>
              You are exploring as Guest. Select a traveller persona (Sara, Abel, or Liya) to reserve guided tours and submit reviews.
            </span>
          </div>
          <Link
            href="/account"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
          >
            Select Persona
          </Link>
        </div>
      )}

      {/* Main Grid: Guided Tours & Reviews */}
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Left Column: Guided Tours (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Guided Experience</span>
                <h2 className="text-xl font-bold text-slate-900">Available Tour Slots</h2>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500">Seats to book:</label>
                <select
                  value={seats}
                  onChange={e => setSeats(Number(e.target.value))}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-hidden"
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'seat' : 'seats'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {place.slots.length > 0 ? (
              <div className="mt-5 space-y-3.5">
                {place.slots.map(slot => {
                  const isFull = slot.remaining <= 0;
                  const isBusy = busySlotId === slot.id;
                  const percentLeft = Math.round((slot.remaining / slot.capacity) * 100);

                  const formattedDate = new Intl.DateTimeFormat('en', {
                    timeZone: 'Africa/Addis_Ababa',
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  }).format(new Date(slot.startsAt));

                  return (
                    <div
                      key={slot.id}
                      className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4.5 transition-all duration-200 ${
                        isFull
                          ? 'border-slate-200 bg-slate-50/70 opacity-80'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <strong className="text-sm font-bold text-slate-900">{formattedDate}</strong>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>Addis Ababa time (EAT, UTC+3)</span>
                        </div>

                        {/* Availability Progress */}
                        <div className="mt-2 flex items-center gap-2.5">
                          <div className="h-1.5 w-24 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isFull
                                  ? 'bg-rose-500 w-full'
                                  : slot.remaining <= 2
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${isFull ? 100 : percentLeft}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-semibold ${
                              isFull
                                ? 'text-rose-600 font-bold'
                                : slot.remaining <= 2
                                ? 'text-amber-700'
                                : 'text-emerald-700'
                            }`}
                          >
                            {isFull ? 'Fully booked' : `${slot.remaining} of ${slot.capacity} seats left`}
                          </span>
                        </div>
                      </div>

                      <button
                        disabled={isFull || isBusy}
                        onClick={() => handleBookTour(slot.id)}
                        className={`flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                          isFull
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg'
                        }`}
                      >
                        {isBusy ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Reserving...</span>
                          </>
                        ) : isFull ? (
                          <span>Full</span>
                        ) : (
                          <span>Book Tour</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-6 text-center text-sm text-slate-500">
                No guided tours currently scheduled for this location.
              </p>
            )}
          </div>

          {/* Reviews List */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Community</span>
                <h2 className="text-xl font-bold text-slate-900">
                  Reviews ({place.reviews.length})
                </h2>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                <span>{place.average.toFixed(1)} average</span>
              </div>
            </div>

            {place.reviews.length > 0 ? (
              <div className="mt-5 space-y-4 divide-y divide-slate-100">
                {place.reviews.map(review => (
                  <div key={review.id} className="pt-4 first:pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-xs">
                          {review.user.name.charAt(0)}
                        </div>
                        <div>
                          <strong className="text-sm font-bold text-slate-900">{review.user.name}</strong>
                          <div className="flex items-center gap-1 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-slate-100 text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(
                          new Date(review.createdAt)
                        )}
                      </span>
                    </div>
                    <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600 pl-11">
                      {review.body}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-center text-sm text-slate-500">
                No reviews yet. Be the first traveller to leave a review!
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Leave a Review Form (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 text-blue-600">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Honest Ratings</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Leave Your Mark</h2>
            <p className="mt-1 text-xs text-slate-500">
              Visited this place? Share what made it memorable for other travellers.
            </p>

            <form onSubmit={handleSaveReview} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Rating</label>
                <div className="mt-1.5 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="rounded-lg p-1 transition-transform hover:scale-110 active:scale-95 focus:outline-hidden"
                      aria-label={`${star} Stars`}
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-100 text-slate-300 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-slate-700">{rating} of 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Your Review</label>
                <textarea
                  required
                  maxLength={500}
                  rows={4}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Tell us about the atmosphere, the guide, or helpful tips..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="mt-1 block text-right text-[11px] text-slate-400">
                  {body.length}/500
                </span>
              </div>

              <button
                type="submit"
                disabled={busyReview}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 px-4 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-lg active:scale-95 disabled:opacity-60"
              >
                {busyReview ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving review...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>{currentUser ? `Save Review as ${currentUser.name}` : 'Sign In & Save Review'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
