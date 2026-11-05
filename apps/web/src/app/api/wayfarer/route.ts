import { db } from '@/services';
import { bookSeats, BookingError, rankingScore } from '@wayfer-assesment/db/wayfarer';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const category = url.searchParams.get('category');
    const sort = url.searchParams.get('sort') || 'top';

    if (id) {
      const [users, place] = await Promise.all([
        db.user.findMany({ orderBy: { name: 'asc' } }),
        db.place.findUnique({
          where: { id },
          include: {
            reviews: { include: { user: true }, orderBy: { createdAt: 'desc' } },
            slots: { include: { bookings: { select: { seats: true } } }, orderBy: { startsAt: 'asc' } },
          },
        }),
      ]);
      if (!place) return Response.json({ error: 'Place not found.' }, { status: 404 });
      const count = place.reviews.length;
      const average = count ? place.reviews.reduce((sum, review) => sum + review.rating, 0) / count : 0;
      const result = {
        ...place,
        average,
        count,
        score: rankingScore(average, count),
        slots: place.slots.map(({ bookings, ...slot }) => ({
          ...slot,
          remaining: slot.capacity - bookings.reduce((sum, booking) => sum + booking.seats, 0),
        })),
      };
      return Response.json({ users, place: result });
    }

    const [users, places] = await Promise.all([
      db.user.findMany({ orderBy: { name: 'asc' } }),
      db.place.findMany({
        where: category && category !== 'All' ? { category } : undefined,
        include: { reviews: { include: { user: true }, orderBy: { createdAt: 'desc' } }, slots: { include: { bookings: { select: { seats: true } } }, orderBy: { startsAt: 'asc' } } },
      }),
    ]);
    const result = places.map(place => {
      const count = place.reviews.length;
      const average = count ? place.reviews.reduce((sum, review) => sum + review.rating, 0) / count : 0;
      return { ...place, average, count, score: rankingScore(average, count), slots: place.slots.map(({ bookings, ...slot }) => ({ ...slot, remaining: slot.capacity - bookings.reduce((sum, booking) => sum + booking.seats, 0) })) };
    }).sort((a, b) => {
      if (sort === 'reviews') return b.count - a.count || b.average - a.average || a.name.localeCompare(b.name);
      if (sort === 'rating') return b.average - a.average || b.count - a.count || a.name.localeCompare(b.name);
      if (sort === 'name') return a.name.localeCompare(b.name);
      return b.score - a.score || a.name.localeCompare(b.name);
    });
    return Response.json({ users, places: result });
  } catch (error) {
    console.error('Could not load places', error);
    return Response.json({ error: 'Could not load places. Please try again.' }, { status: 500 });
  }
}
const actionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('review'), placeId: z.string().min(1), rating: z.number().int().min(1).max(5), body: z.string().trim().min(1).max(500) }),
  z.object({ type: z.literal('booking'), slotId: z.string().min(1), seats: z.number().int().min(1).max(100) }),
]);
export async function POST(request: Request) {
  try {
    const userId = request.headers.get('X-User-Id');
    if (!userId || !await db.user.findUnique({ where: { id: userId } })) return Response.json({ error: 'Please select a valid traveller.' }, { status: 400 });
    const result = actionSchema.safeParse(await request.json().catch(() => null));
    if (!result.success) return Response.json({ error: 'Please check your input and try again.' }, { status: 400 });
    const action = result.data;
    if (action.type === 'review') {
      if (!await db.place.findUnique({ where: { id: action.placeId } })) return Response.json({ error: 'Place not found.' }, { status: 404 });
      await db.review.upsert({ where: { placeId_userId: { placeId: action.placeId, userId } }, create: { placeId: action.placeId, userId, rating: action.rating, body: action.body }, update: { rating: action.rating, body: action.body } });
    } else await bookSeats(db, action.slotId, userId, action.seats);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof BookingError) return Response.json({ error: error.message }, { status: error.code === 'FULL' ? 409 : 404 });
    console.error('Could not save', error);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
