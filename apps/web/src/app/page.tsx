'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = { id: string; name: string };
type Review = { id: string; userId: string; rating: number; body: string; user: User };
type Slot = { id: string; startsAt: string; capacity: number; remaining: number };
type Place = { id: string; name: string; category: string; description: string; openingHours: string; average: number; count: number; reviews: Review[]; slots: Slot[] };
type Data = { users: User[]; places: Place[] };

export default function Home({ initialPlace = '' }: { initialPlace?: string }) {
  const router = useRouter();
  const [data, setData] = useState<Data | null>(null);
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(initialPlace);
  const [userId, setUserId] = useState('');
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const load = useCallback(async () => {
    const response = await fetch(`/api/wayfarer?category=${encodeURIComponent(category)}`, { cache: 'no-store' });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error);
    setData(payload);
    setSelected(current => payload.places.some((p: Place) => p.id === current) ? current : payload.places[0]?.id ?? '');
    setUserId(current => payload.users.some((u: User) => u.id === current) ? current : payload.users[0]?.id ?? '');
  }, [category]);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    load().catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [load]);
  const place = data?.places.find(p => p.id === selected);
  useEffect(() => {
    const review = place?.reviews.find(r => r.userId === userId);
    setRating(review?.rating ?? 5); setBody(review?.body ?? ''); setNotice('');
  }, [selected, userId]); // Preserve draft when refreshed after a different action.
  async function submit(action: object, success: string) {
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/wayfarer', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-User-Id': userId }, body: JSON.stringify(action) });
      const result = await response.json();
      if (!response.ok) { await load(); throw new Error(result.error); }
      await load(); setNotice(success);
    } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong.'); }
    finally { setBusy(false); }
  }
  return <main>
    <header className="topbar"><div className="brand"><span className="brand-icon">✳</span> wayfarer<span className="brand-dot">.</span></div><div className="top-location">A LITTLE GUIDE TO <strong>ADDIS ABABA</strong></div><label className="user-select">Exploring as <select value={userId} onChange={e => setUserId(e.target.value)} aria-label="Acting as">{data?.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label></header>
    <div className="intro"><div><div className="eyebrow">YOUR CITY, WELL EXPLORED <span>✳</span></div><h1>Find your kind of <em>Addis.</em></h1><p>Good places, honest reviews, and a little more room for discovery.</p></div><div className="intro-mark">ADDIS ABABA<br/><span>9°01′ N &nbsp; 38°45′ E</span></div></div>
    <div className="content"><aside className="listing"><div className="section-heading"><div><div className="eyebrow">THE CITY GUIDE</div><h2>Places to explore <span>↗</span></h2></div></div><div className="filters" aria-label="Filter by category">{['All','History','Food','Nature'].map(c => <button className={category === c ? 'active' : ''} onClick={() => setCategory(c)} key={c}>{c}</button>)}</div><div className="list-caption"><span>{data?.places.length ?? 0} PLACES</span><span>TOP RATED ↓</span></div>
    {loading ? <p className="state">Finding places…</p> : data?.places.length ? data.places.map((p, i) => <button key={p.id} className={`place-row ${selected === p.id ? 'selected' : ''}`} onClick={() => { setSelected(p.id); router.push(`/places/${p.id}`); setError(''); }}><span className="row-num">{String(i+1).padStart(2,'0')}</span><span className="row-main"><strong>{p.name}</strong><small>{p.category} <span>•</span> {p.count} {p.count === 1 ? 'review' : 'reviews'}</small></span><span className="row-rating">★ {p.average.toFixed(1)}</span><span className="row-arrow">↗</span></button>) : <p className="state">No places in this category yet.</p>}</aside>
    <section className="detail">{place ? <><div className="detail-top"><span className="tag">{place.category}</span><span className="detail-index">ADDIS ABABA &nbsp; / &nbsp; CITY GUIDE</span></div><h2>{place.name}</h2><div className="meta"><span className="stars">★</span> <strong>{place.average.toFixed(1)}</strong> <span>({place.count} {place.count === 1 ? 'review' : 'reviews'})</span><span className="dot">•</span><span>Open {place.openingHours}</span></div><p className="description">{place.description}</p>
    {error && <div className="message error" role="alert">{error}</div>}{notice && <div className="message success" role="status">{notice}</div>}
    <div className="divider"/><div className="block-heading"><div><div className="eyebrow">MAKE A LITTLE TIME</div><h3>Guided tours</h3></div><span className="heading-icon">↗</span></div><p className="helper">See the city with someone who knows it.</p>{place.slots.length ? <><label className="seat-label">Seats <input type="number" min="1" max="100" value={seats} onChange={e => setSeats(Number(e.target.value))}/></label><div className="slots">{place.slots.map(slot => <div className="slot" key={slot.id}><div><strong>{new Intl.DateTimeFormat('en', { timeZone: 'Africa/Addis_Ababa', weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(slot.startsAt))}</strong><small>Addis Ababa time</small></div><span className={slot.remaining ? 'availability' : 'full'}>{slot.remaining ? `${slot.remaining} of ${slot.capacity} seats left` : 'Fully booked'}</span><button disabled={!slot.remaining || busy || !userId} onClick={() => submit({ type:'booking', slotId: slot.id, seats }, 'Your seats are booked. Enjoy your tour!')}>{slot.remaining ? 'Book tour ↗' : 'Full'}</button></div>)}</div></> : <p className="empty">No guided tours available here yet.</p>}
    <div className="divider"/><div className="block-heading"><div><div className="eyebrow">FROM FELLOW TRAVELLERS</div><h3>Reviews <span className="review-count">{place.count}</span></h3></div></div><div className="reviews">{place.reviews.map(review => <div className="review" key={review.id}><div className="avatar">{review.user.name.charAt(0)}</div><div><strong>{review.user.name}</strong><div className="review-stars">{'★'.repeat(review.rating)}<span>{'★'.repeat(5-review.rating)}</span></div><p>{review.body}</p></div></div>)}</div>
    <form className="review-form" onSubmit={e => { e.preventDefault(); submit({ type:'review', placeId:place.id, rating, body }, 'Your review has been saved.'); }}><h4>Leave your mark</h4><p>Visited? Share what made it memorable.</p><label>Your rating <select value={rating} onChange={e => setRating(Number(e.target.value))}>{[5,4,3,2,1].map(n => <option value={n} key={n}>{n} {n === 1 ? 'star' : 'stars'}</option>)}</select></label><label className="review-label">Your review <textarea required maxLength={500} value={body} onChange={e => setBody(e.target.value)} placeholder="Tell us a little about your visit…"/></label><button disabled={busy || !userId} type="submit">Save review ↗</button></form>
    </> : <div className="state">{error || (loading ? 'Loading your city guide…' : 'Choose a place to explore.')}</div>}</section></div><footer>WAYFARER <span>MADE FOR CURIOUS TRAVELLERS &nbsp; ✳ &nbsp; ADDIS ABABA</span></footer>
  </main>;
}
