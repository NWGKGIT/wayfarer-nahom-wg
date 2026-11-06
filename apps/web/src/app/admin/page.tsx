'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/UserContext';
import { motion, AnimatePresence } from 'framer-motion';

type PlaceItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  openingHours: string;
  imageUrl: string;
  reviewCount: number;
  average: number;
  slotCount: number;
};

type SlotBooking = {
  id: string;
  userName: string;
  userId: string;
  seats: number;
  createdAt: string;
};

type SlotItem = {
  id: string;
  placeId: string;
  placeName: string;
  startsAt: string;
  capacity: number;
  bookedSeats: number;
  remainingSeats: number;
  bookings: SlotBooking[];
};

type UserItem = {
  id: string;
  name: string;
  reviewCount: number;
  bookingCount: number;
  totalSeatsBooked: number;
  isSystemAdmin: boolean;
};

type AdminData = {
  places: PlaceItem[];
  users: UserItem[];
  slots: SlotItem[];
  stats: {
    totalPlaces: number;
    totalPersonas: number;
    totalTours: number;
    totalBookings: number;
  };
};

const CATEGORY_PRESETS = ['History', 'Food', 'Nature', 'Art', 'Culture'];

export default function AdminDashboardPage() {
  const { userId, isAdmin, refreshUsers } = useUser();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'places' | 'tours' | 'personas'>('places');
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Place form state
  const [placeName, setPlaceName] = useState('');
  const [placeCategory, setPlaceCategory] = useState('History');
  const [placeHours, setPlaceHours] = useState('09:00–18:00');
  const [placeDesc, setPlaceDesc] = useState('');
  const [placeImage, setPlaceImage] = useState('/places/national-museum.jpg');

  // Tour slot form state
  const [slotPlaceId, setSlotPlaceId] = useState('');
  const [slotDate, setSlotDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(9, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [slotCapacity, setSlotCapacity] = useState(10);

  // Persona form state
  const [personaName, setPersonaName] = useState('');

  const loadData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin', {
        headers: { 'X-User-Id': 'admin' },
        cache: 'no-store',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load admin data.');
      setData(json);
      if (json.places?.length > 0 && !slotPlaceId) {
        setSlotPlaceId(json.places[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading admin dashboard.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, slotPlaceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function submitAdminAction(payload: object, successMessage: string) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'admin',
        },
        body: JSON.stringify(payload),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Admin action failed.');
      setNotice(successMessage);
      await loadData();
      await refreshUsers();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  // Handle Place Creation
  async function handleCreatePlace(e: React.FormEvent) {
    e.preventDefault();
    const success = await submitAdminAction(
      {
        action: 'create-place',
        name: placeName,
        category: placeCategory,
        openingHours: placeHours,
        description: placeDesc,
        imageUrl: placeImage || undefined,
      },
      `Successfully added "${placeName}" to the city catalog.`
    );
    if (success) {
      setPlaceName('');
      setPlaceDesc('');
    }
  }

  // Handle Place Deletion
  async function handleDeletePlace(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This will delete all its guided tours and reviews.`)) {
      return;
    }
    await submitAdminAction(
      { action: 'delete-place', id },
      `Deleted "${name}" from the city catalog.`
    );
  }

  // Handle Slot Creation
  async function handleCreateSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!slotPlaceId) {
      setError('Please select a place for the tour slot.');
      return;
    }
    const isoString = new Date(slotDate).toISOString();
    const success = await submitAdminAction(
      {
        action: 'create-slot',
        placeId: slotPlaceId,
        startsAt: isoString,
        capacity: Number(slotCapacity),
      },
      'Successfully scheduled a new guided tour slot.'
    );
    if (success) {
      // Advance slot date by 1 day for convenience
      const next = new Date(slotDate);
      next.setDate(next.getDate() + 1);
      setSlotDate(next.toISOString().slice(0, 16));
    }
  }

  // Handle Slot Deletion
  async function handleDeleteSlot(id: string) {
    if (!confirm('Are you sure you want to cancel this tour slot?')) return;
    await submitAdminAction(
      { action: 'delete-slot', id },
      'Cancelled guided tour slot.'
    );
  }

  // Handle Persona Creation
  async function handleCreatePersona(e: React.FormEvent) {
    e.preventDefault();
    const success = await submitAdminAction(
      { action: 'create-persona', name: personaName },
      `Created new traveller persona "${personaName}".`
    );
    if (success) {
      setPersonaName('');
    }
  }

  // Handle Persona Deletion
  async function handleDeletePersona(id: string, name: string) {
    if (id === 'admin') {
      alert('The Admin persona cannot be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to delete persona "${name}"? This will purge their submitted reviews and bookings.`)) {
      return;
    }
    await submitAdminAction(
      { action: 'delete-persona', id },
      `Removed persona "${name}".`
    );
  }

  // Non-Admin Guard
  if (!isAdmin) {
    return (
      <div className="admin-container" style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div className="eyebrow" style={{ color: 'var(--blue)', marginBottom: '8px' }}>
          RESTRICTED ACCESS
        </div>
        <h2 style={{ fontFamily: 'DM Serif Display', fontSize: '32px', margin: '0 0 12px', color: 'var(--ink)' }}>
          Curator Identity Required
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '480px', margin: '0 auto 24px' }}>
          This administration dashboard requires the <strong>Admin</strong> persona. Please switch to the Admin identity in the account picker to manage places, tours, and personas.
        </p>
        <Link href="/account" className="account-card-btn" style={{ display: 'inline-block', width: 'auto', padding: '10px 24px' }}>
          Switch to Admin Persona
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Top Header */}
      <div className="admin-header">
        <div>
          <div className="eyebrow" style={{ color: 'var(--blue)', marginBottom: '6px' }}>
            ADDIS ABABA CITY GUIDE
          </div>
          <h1 className="admin-title">Curator Control Room</h1>
          <p className="admin-subtitle">
            Manage places, schedule guided tours with real-time seat capacities, and create or remove traveller personas.
          </p>
        </div>

        <Link href="/" className="btn-back">
          Back to city guide
        </Link>
      </div>

      {/* KPI Stats Bar */}
      {data && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="admin-stat-num">{data.stats.totalPlaces}</span>
            <span className="admin-stat-label">Landmark Places</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-num">{data.stats.totalTours}</span>
            <span className="admin-stat-label">Guided Tours</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-num">{data.stats.totalPersonas}</span>
            <span className="admin-stat-label">Traveller Personas</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-num">{data.stats.totalBookings}</span>
            <span className="admin-stat-label">Seats Reserved</span>
          </div>
        </div>
      )}

      {/* Messages */}
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

      {/* Tab Switcher */}
      <div className="admin-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'places'}
          className={`admin-tab-btn ${activeTab === 'places' ? 'active' : ''}`}
          onClick={() => setActiveTab('places')}
        >
          Places & Attractions ({data?.places.length ?? 0})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'tours'}
          className={`admin-tab-btn ${activeTab === 'tours' ? 'active' : ''}`}
          onClick={() => setActiveTab('tours')}
        >
          Guided Tours & Slots ({data?.slots.length ?? 0})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'personas'}
          className={`admin-tab-btn ${activeTab === 'personas' ? 'active' : ''}`}
          onClick={() => setActiveTab('personas')}
        >
          Traveller Personas ({data?.users.length ?? 0})
        </button>
      </div>

      {loading && !data ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          Loading curator dashboard…
        </div>
      ) : (
        <div style={{ marginTop: '24px' }}>
          {/* TAB 1: PLACES */}
          {activeTab === 'places' && (
            <div className="admin-grid-layout">
              {/* Add Place Form */}
              <div className="admin-card">
                <div className="block-heading">
                  <div className="eyebrow">NEW ATTRACTION</div>
                  <h3>Add a place</h3>
                </div>
                <p className="helper">Add a landmark or local favorite to the Addis Ababa guide.</p>

                <form onSubmit={handleCreatePlace} className="admin-form">
                  <label className="admin-label">
                    Place Name
                    <input
                      type="text"
                      required
                      placeholder="e.g. National Museum of Ethiopia"
                      value={placeName}
                      onChange={e => setPlaceName(e.target.value)}
                      className="admin-input"
                    />
                  </label>

                  <div className="admin-form-row">
                    <label className="admin-label">
                      Category
                      <select
                        value={placeCategory}
                        onChange={e => setPlaceCategory(e.target.value)}
                        className="admin-input"
                      >
                        {CATEGORY_PRESETS.map(c => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="admin-label">
                      Opening Hours
                      <input
                        type="text"
                        required
                        placeholder="e.g. 09:00–17:30"
                        value={placeHours}
                        onChange={e => setPlaceHours(e.target.value)}
                        className="admin-input"
                      />
                    </label>
                  </div>

                  <label className="admin-label">
                    Description
                    <textarea
                      required
                      rows={3}
                      placeholder="Discover Ethiopia’s remarkable history and the story of Lucy…"
                      value={placeDesc}
                      onChange={e => setPlaceDesc(e.target.value)}
                      className="admin-input"
                    />
                  </label>

                  <label className="admin-label">
                    Image Asset
                    <input
                      type="text"
                      placeholder="/places/national-museum.jpg or image URL"
                      value={placeImage}
                      onChange={e => setPlaceImage(e.target.value)}
                      className="admin-input"
                    />
                  </label>

                  <button type="submit" disabled={busy} className="admin-submit-btn">
                    {busy ? 'Saving…' : 'Publish Place'}
                  </button>
                </form>
              </div>

              {/* Places List */}
              <div className="admin-card">
                <div className="block-heading">
                  <div className="eyebrow">CURRENT CATALOG</div>
                  <h3>All Places ({data?.places.length})</h3>
                </div>

                <div className="admin-items-list">
                  {data?.places.map(p => (
                    <div key={p.id} className="admin-item-row">
                      <div className="admin-item-info">
                        <img src={p.imageUrl} alt={p.name} className="admin-item-thumb" />
                        <div>
                          <strong>{p.name}</strong>
                          <div className="admin-item-meta">
                            <span>{p.category}</span>
                            <span>•</span>
                            <span>{p.openingHours}</span>
                            <span>•</span>
                            <span style={{ color: 'var(--amber)', fontWeight: 700 }}>
                              ★ {p.average.toFixed(1)} ({p.reviewCount})
                            </span>
                            <span>•</span>
                            <span>{p.slotCount} tours</span>
                          </div>
                        </div>
                      </div>

                      <div className="admin-item-actions">
                        <Link href={`/places/${p.id}`} className="admin-action-btn view">
                          View
                        </Link>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleDeletePlace(p.id, p.name)}
                          className="admin-action-btn delete"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GUIDED TOURS */}
          {activeTab === 'tours' && (
            <div className="admin-grid-layout">
              {/* Schedule Tour Form */}
              <div className="admin-card">
                <div className="block-heading">
                  <div className="eyebrow">MAKE A LITTLE TIME</div>
                  <h3>Schedule a tour</h3>
                </div>
                <p className="helper">Create a new tour slot with seats for travellers to book.</p>

                <form onSubmit={handleCreateSlot} className="admin-form">
                  <label className="admin-label">
                    Select Place
                    <select
                      value={slotPlaceId}
                      onChange={e => setSlotPlaceId(e.target.value)}
                      className="admin-input"
                      required
                    >
                      {data?.places.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.category})
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="admin-form-row">
                    <label className="admin-label">
                      Date & Time (Addis Ababa Time)
                      <input
                        type="datetime-local"
                        required
                        value={slotDate}
                        onChange={e => setSlotDate(e.target.value)}
                        className="admin-input"
                      />
                    </label>

                    <label className="admin-label">
                      Seats Capacity
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={slotCapacity}
                        onChange={e => setSlotCapacity(Number(e.target.value))}
                        className="admin-input"
                      />
                    </label>
                  </div>

                  <button type="submit" disabled={busy || !slotPlaceId} className="admin-submit-btn">
                    {busy ? 'Scheduling…' : 'Schedule Tour Slot'}
                  </button>
                </form>
              </div>

              {/* Guided Tours List */}
              <div className="admin-card">
                <div className="block-heading">
                  <div className="eyebrow">SCHEDULED TOURS</div>
                  <h3>Active Tour Slots ({data?.slots.length})</h3>
                </div>

                <div className="admin-items-list">
                  {data?.slots.map(s => {
                    const formattedDate = new Intl.DateTimeFormat('en', {
                      timeZone: 'Africa/Addis_Ababa',
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    }).format(new Date(s.startsAt));

                    return (
                      <div key={s.id} className="admin-item-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ fontSize: '15px' }}>{s.placeName}</strong>
                            <div className="admin-item-meta" style={{ marginTop: '2px' }}>
                              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{formattedDate}</span>
                              <span>•</span>
                              <span>Addis Ababa time</span>
                              <span>•</span>
                              <span className={s.remainingSeats > 0 ? 'availability' : 'full'}>
                                {s.remainingSeats > 0 ? `${s.remainingSeats} of ${s.capacity} seats left` : 'Fully booked'}
                              </span>
                            </div>
                          </div>

                          <div className="admin-item-actions">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleDeleteSlot(s.id)}
                              className="admin-action-btn delete"
                            >
                              Cancel slot
                            </button>
                          </div>
                        </div>

                        {/* Bookings sub-list if any */}
                        {s.bookings.length > 0 && (
                          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b' }}>
                            <span style={{ fontWeight: 600, color: '#475569' }}>Reserved by:</span>{' '}
                            {s.bookings.map((b, i) => (
                              <span key={b.id}>
                                {i > 0 && ', '}
                                <strong>{b.userName}</strong> ({b.seats} {b.seats === 1 ? 'seat' : 'seats'})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PERSONAS */}
          {activeTab === 'personas' && (
            <div className="admin-grid-layout">
              {/* Create Persona Form */}
              <div className="admin-card">
                <div className="block-heading">
                  <div className="eyebrow">NEW IDENTITIES</div>
                  <h3>Create persona</h3>
                </div>
                <p className="helper">Add a new traveller identity for discovering Addis Ababa and reviewing places.</p>

                <form onSubmit={handleCreatePersona} className="admin-form">
                  <label className="admin-label">
                    Traveller Name
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dawit, Bethlehem, Robel"
                      value={personaName}
                      onChange={e => setPersonaName(e.target.value)}
                      className="admin-input"
                    />
                  </label>

                  <button type="submit" disabled={busy || !personaName.trim()} className="admin-submit-btn">
                    {busy ? 'Creating…' : 'Create Traveller'}
                  </button>
                </form>
              </div>

              {/* Persona List */}
              <div className="admin-card">
                <div className="block-heading">
                  <div className="eyebrow">REGISTERED PERSONAS</div>
                  <h3>Travellers ({data?.users.length})</h3>
                </div>

                <div className="admin-items-list">
                  {data?.users.map(u => (
                    <div key={u.id} className="admin-item-row">
                      <div className="admin-item-info">
                        <div className={`account-card-avatar ${u.isSystemAdmin ? 'admin-avatar' : ''}`} style={{ width: '38px', height: '38px', fontSize: '15px' }}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong>{u.name}</strong>
                            {u.isSystemAdmin && <span className="admin-tag-small">System Admin</span>}
                          </div>
                          <div className="admin-item-meta">
                            <span>ID: {u.id}</span>
                            <span>•</span>
                            <span>{u.reviewCount} {u.reviewCount === 1 ? 'review' : 'reviews'}</span>
                            <span>•</span>
                            <span>{u.totalSeatsBooked} seats booked</span>
                          </div>
                        </div>
                      </div>

                      <div className="admin-item-actions">
                        {!u.isSystemAdmin ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleDeletePersona(u.id, u.name)}
                            className="admin-action-btn delete"
                          >
                            Delete
                          </button>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>Protected</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

