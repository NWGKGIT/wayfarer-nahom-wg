import type { Database } from './index';

// Five prior reviews at 3.5 stars dampen scores backed by little evidence.
export function rankingScore(average: number, count: number) {
  return (count * average + 5 * 3.5) / (count + 5);
}

export class BookingError extends Error {
  constructor(public code: 'FULL' | 'NOT_FOUND', message: string) { super(message); }
}

export async function bookSeats(db: Database, slotId: string, userId: string, seats: number) {
  if (!Number.isInteger(seats) || seats < 1 || seats > 100) throw new Error('Choose between 1 and 100 seats.');
  return db.$transaction(async tx => {
    const slots = await tx.$queryRaw<{ id: string; capacity: number }[]>`SELECT id, capacity FROM "TourSlot" WHERE id = ${slotId} FOR UPDATE`;
    const slot = slots[0];
    if (!slot) throw new BookingError('NOT_FOUND', 'Tour slot not found.');
    const booked = await tx.booking.aggregate({ where: { slotId }, _sum: { seats: true } });
    if (slot.capacity - (booked._sum.seats ?? 0) < seats) throw new BookingError('FULL', 'Not enough seats remaining for this tour.');
    return tx.booking.create({ data: { slotId, userId, seats } });
  }, { timeout: 20000 });
}

export async function createPlace(
  db: Database,
  data: { id: string; name: string; category: string; description: string; openingHours: string; imageUrl?: string | null }
) {
  return db.place.create({ data });
}

export async function deletePlace(db: Database, id: string) {
  return db.place.delete({ where: { id } });
}

export async function createTourSlot(
  db: Database,
  data: { id: string; placeId: string; startsAt: Date; capacity: number }
) {
  if (data.capacity < 1 || data.capacity > 100) throw new Error('Capacity must be between 1 and 100.');
  return db.tourSlot.create({ data });
}

export async function deleteTourSlot(db: Database, id: string) {
  return db.tourSlot.delete({ where: { id } });
}

export async function createUser(db: Database, data: { id: string; name: string }) {
  const cleanId = data.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  return db.user.create({ data: { id: cleanId, name: data.name.trim() } });
}

export async function deleteUser(db: Database, id: string) {
  if (id === 'admin') throw new Error('Cannot delete the admin persona.');
  return db.user.delete({ where: { id } });
}
