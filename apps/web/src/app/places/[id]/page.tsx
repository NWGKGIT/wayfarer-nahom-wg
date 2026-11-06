'use client';

import React, { useCallback, useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/UserContext';
import { motion } from 'framer-motion';

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
  const { userId } = useUser();

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Tour booking seats
  const [seats, setSeats] = useState(1);

  // Review form state (starts completely blank, never prefilled)
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

  async function submitAction(action: object, successMessage: string, isReview = false) {
    if (!userId) {
      router.push('/account');
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');

    try {
      const res = await fetch('/api/wayfarer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify(action),
      });
      const data = await res.json();
      if (!res.ok) {
        await loadPlace();
        throw new Error(data.error || 'Something went wrong.');
      }
      await loadPlace();
      setNotice(successMessage);

      // Clear review form fields after sending
      if (isReview) {
        setBody('');
        setRating(5);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="detail-container">
        <div style={{ height: '20px', width: '120px', borderRadius: '4px', marginBottom: '8px' }} className="skeleton-shimmer" />
        <div className="detail-hero-card">
          <div style={{ height: '18px', width: '90px', borderRadius: '4px', marginBottom: '14px' }} className="skeleton-shimmer" />
          <div style={{ height: '36px', width: '55%', borderRadius: '6px', marginBottom: '16px' }} className="skeleton-shimmer" />
          <div style={{ height: '16px', width: '220px', borderRadius: '4px', marginBottom: '20px' }} className="skeleton-shimmer" />
          <div style={{ width: '100%', height: '340px', borderRadius: '8px', marginBottom: '20px' }} className="skeleton-shimmer" />
          <div style={{ height: '16px', width: '90%', borderRadius: '4px', marginBottom: '8px' }} className="skeleton-shimmer" />
          <div style={{ height: '16px', width: '70%', borderRadius: '4px' }} className="skeleton-shimmer" />
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="detail-container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <h2 style={{ fontFamily: 'DM Serif Display', fontSize: '28px' }}>Place not found</h2>
        <Link href="/" className="btn-back" style={{ marginTop: '16px' }}>
          Back to places
        </Link>
      </div>
    );
  }

  const fallbackImage = `/places/${place.id}.jpg`;
  const displayImage = place.imageUrl && !place.imageUrl.includes('unsplash') ? place.imageUrl : fallbackImage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="detail-container"
    >
      <Link href="/" className="btn-back">
        Back to places
      </Link>

      {/* Hero Overview Card */}
      <div className="detail-hero-card">
        <div className="detail-top">
          <span className="tag">{place.category}</span>
          <span className="detail-index">ADDIS ABABA / CITY GUIDE</span>
        </div>

        <h1 className="detail-title">{place.name}</h1>

        <div className="detail-meta">
          <span style={{ color: 'var(--amber)', fontWeight: 700 }}>★ {place.average.toFixed(1)}</span>
          <span>({place.count} {place.count === 1 ? 'review' : 'reviews'})</span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span>Open {place.openingHours}</span>
        </div>

        <img
          src={displayImage}
          alt={place.name}
          className="detail-hero-image"
          onError={e => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />

        <p className="detail-desc">{place.description}</p>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="message error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="message success" role="status">
          {notice}
        </div>
      )}

      {/* Guided Tours Card */}
      <div className="detail-section-card">
        <div className="block-heading">
          <div className="eyebrow">MAKE A LITTLE TIME</div>
          <h3>Guided tours</h3>
        </div>
        <p className="helper">See the city with someone who knows it.</p>

        {place.slots.length > 0 ? (
          <>
            <label className="seat-label">
              Seats to book
              <input
                type="number"
                min="1"
                max="10"
                value={seats}
                onChange={e => setSeats(Math.max(1, Math.min(10, Number(e.target.value))))}
              />
            </label>

            <div className="slots">
              {place.slots.map(slot => {
                const formattedDate = new Intl.DateTimeFormat('en', {
                  timeZone: 'Africa/Addis_Ababa',
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                }).format(new Date(slot.startsAt));

                return (
                  <div className="slot" key={slot.id}>
                    <div>
                      <strong>{formattedDate}</strong>
                      <small>Addis Ababa time</small>
                    </div>

                    <span className={slot.remaining > 0 ? 'availability' : 'full'}>
                      {slot.remaining > 0
                        ? `${slot.remaining} of ${slot.capacity} seats left`
                        : 'Fully booked'}
                    </span>

                    <button
                      disabled={!slot.remaining || busy || !userId}
                      onClick={() =>
                        submitAction(
                          { type: 'booking', slotId: slot.id, seats },
                          'Your seats are booked. Enjoy your tour!'
                        )
                      }
                    >
                      {slot.remaining > 0 ? 'Book tour' : 'Full'}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="helper" style={{ padding: '8px 0', margin: 0 }}>
            No guided tours currently scheduled for this location.
          </p>
        )}
      </div>

      {/* Reviews Card Section (Distinct Cards) */}
      <div className="detail-section-card">
        <div className="block-heading">
          <div className="eyebrow">FROM FELLOW TRAVELLERS</div>
          <h3>
            Reviews <span className="review-count">({place.reviews.length})</span>
          </h3>
        </div>

        {place.reviews.length > 0 ? (
          <div className="review-cards-grid">
            {place.reviews.map(review => (
              <div className="review-card" key={review.id}>
                <div className="review-card-header">
                  <div className="review-card-avatar">{review.user.name.charAt(0)}</div>
                  <div className="review-card-meta">
                    <strong className="review-card-author">{review.user.name}</strong>
                    <div className="review-card-stars">
                      {'★'.repeat(review.rating)}
                      <span>{'★'.repeat(5 - review.rating)}</span>
                    </div>
                  </div>
                </div>
                <p className="review-card-body">{review.body}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="helper" style={{ padding: '8px 0', margin: 0 }}>
            No reviews yet. Be the first traveller to leave a review!
          </p>
        )}
      </div>

      {/* Leave Your Mark Form (Standalone Card) */}
      <form
        className="review-form"
        onSubmit={e => {
          e.preventDefault();
          submitAction(
            { type: 'review', placeId: place.id, rating, body },
            'Your review has been saved.',
            true
          );
        }}
      >
        <h4>Leave your mark</h4>
        <p>Visited? Share what made it memorable.</p>

        <label>
          Your rating
          <select
            value={rating}
            onChange={e => setRating(Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map(n => (
              <option value={n} key={n}>
                {n} {n === 1 ? 'star' : 'stars'}
              </option>
            ))}
          </select>
        </label>

        <label className="review-label">
          Your review
          <textarea
            required
            maxLength={500}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Tell us a little about your visit…"
          />
        </label>

        <button disabled={busy || !userId} type="submit">
          {userId ? 'Save review' : 'Select persona to review'}
        </button>
      </form>
    </motion.div>
  );
}
