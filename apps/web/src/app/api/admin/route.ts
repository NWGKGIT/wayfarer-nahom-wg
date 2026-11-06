import { db } from '@/services';
import {
  createPlace,
  deletePlace,
  createTourSlot,
  deleteTourSlot,
  createUser,
  deleteUser,
} from '@wayfer-assesment/db/wayfarer';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

function checkAdmin(request: Request) {
  const userId = request.headers.get('X-User-Id');
  return userId === 'admin';
}

export async function GET(request: Request) {
  try {
    if (!checkAdmin(request)) {
      return Response.json({ error: 'Admin identity required (X-User-Id: admin).' }, { status: 403 });
    }

    const [places, users, tourSlots] = await Promise.all([
      db.place.findMany({
        include: {
          reviews: { select: { id: true, rating: true } },
          slots: {
            include: {
              bookings: { select: { id: true, seats: true } },
            },
            orderBy: { startsAt: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      }),
      db.user.findMany({
        include: {
          reviews: { select: { id: true } },
          bookings: { select: { id: true, seats: true } },
        },
        orderBy: { name: 'asc' },
      }),
      db.tourSlot.findMany({
        include: {
          place: { select: { id: true, name: true } },
          bookings: {
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { startsAt: 'asc' },
      }),
    ]);

    const formattedPlaces = places.map(p => {
      const reviewCount = p.reviews.length;
      const average = reviewCount
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description,
        openingHours: p.openingHours,
        imageUrl: p.imageUrl || `/places/${p.id}.jpg`,
        reviewCount,
        average,
        slotCount: p.slots.length,
      };
    });

    const formattedUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      reviewCount: u.reviews.length,
      bookingCount: u.bookings.length,
      totalSeatsBooked: u.bookings.reduce((sum, b) => sum + b.seats, 0),
      isSystemAdmin: u.id === 'admin',
    }));

    const formattedSlots = tourSlots.map(s => {
      const bookedSeats = s.bookings.reduce((sum, b) => sum + b.seats, 0);
      return {
        id: s.id,
        placeId: s.placeId,
        placeName: s.place.name,
        startsAt: s.startsAt.toISOString(),
        capacity: s.capacity,
        bookedSeats,
        remainingSeats: s.capacity - bookedSeats,
        bookings: s.bookings.map(b => ({
          id: b.id,
          userName: b.user.name,
          userId: b.user.id,
          seats: b.seats,
          createdAt: b.createdAt.toISOString(),
        })),
      };
    });

    return Response.json({
      places: formattedPlaces,
      users: formattedUsers,
      slots: formattedSlots,
      stats: {
        totalPlaces: places.length,
        totalPersonas: users.length,
        totalTours: tourSlots.length,
        totalBookings: tourSlots.reduce(
          (sum, s) => sum + s.bookings.reduce((bSum, b) => bSum + b.seats, 0),
          0
        ),
      },
    });
  } catch (error) {
    console.error('Failed to load admin data:', error);
    return Response.json({ error: 'Could not load admin data.' }, { status: 500 });
  }
}

const adminActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('create-place'),
    id: z.string().trim().min(2).optional(),
    name: z.string().trim().min(2).max(100),
    category: z.string().trim().min(2).max(50),
    description: z.string().trim().min(5).max(500),
    openingHours: z.string().trim().min(2).max(50),
    imageUrl: z.string().trim().optional().nullable(),
  }),
  z.object({
    action: z.literal('delete-place'),
    id: z.string().min(1),
  }),
  z.object({
    action: z.literal('create-slot'),
    placeId: z.string().min(1),
    startsAt: z.string().datetime({ offset: true }).or(z.string().min(10)),
    capacity: z.number().int().min(1).max(100),
  }),
  z.object({
    action: z.literal('delete-slot'),
    id: z.string().min(1),
  }),
  z.object({
    action: z.literal('create-persona'),
    name: z.string().trim().min(2).max(50),
    id: z.string().trim().min(2).max(50).optional(),
  }),
  z.object({
    action: z.literal('delete-persona'),
    id: z.string().min(1),
  }),
]);

export async function POST(request: Request) {
  try {
    if (!checkAdmin(request)) {
      return Response.json({ error: 'Admin identity required (X-User-Id: admin).' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const parsed = adminActionSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || 'Invalid input data.';
      return Response.json({ error: issue }, { status: 400 });
    }

    const data = parsed.data;

    switch (data.action) {
      case 'create-place': {
        const slug =
          data.id?.trim() ||
          data.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const existing = await db.place.findUnique({ where: { id: slug } });
        if (existing) {
          return Response.json({ error: `A place with ID "${slug}" already exists.` }, { status: 409 });
        }

        const place = await createPlace(db, {
          id: slug,
          name: data.name,
          category: data.category,
          description: data.description,
          openingHours: data.openingHours,
          imageUrl: data.imageUrl || `/places/${slug}.jpg`,
        });

        return Response.json({ ok: true, place });
      }

      case 'delete-place': {
        await deletePlace(db, data.id);
        return Response.json({ ok: true });
      }

      case 'create-slot': {
        const place = await db.place.findUnique({ where: { id: data.placeId } });
        if (!place) {
          return Response.json({ error: 'Place not found.' }, { status: 404 });
        }

        const startsAt = new Date(data.startsAt);
        if (isNaN(startsAt.getTime())) {
          return Response.json({ error: 'Invalid tour start date or time.' }, { status: 400 });
        }

        const slotId = `${data.placeId}-tour-${Date.now().toString(36)}`;
        const slot = await createTourSlot(db, {
          id: slotId,
          placeId: data.placeId,
          startsAt,
          capacity: data.capacity,
        });

        return Response.json({ ok: true, slot });
      }

      case 'delete-slot': {
        await deleteTourSlot(db, data.id);
        return Response.json({ ok: true });
      }

      case 'create-persona': {
        const slug =
          data.id?.trim() ||
          data.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const existing = await db.user.findUnique({ where: { id: slug } });
        if (existing) {
          return Response.json({ error: `A persona with ID "${slug}" already exists.` }, { status: 409 });
        }

        const user = await createUser(db, {
          id: slug,
          name: data.name,
        });

        return Response.json({ ok: true, user });
      }

      case 'delete-persona': {
        if (data.id === 'admin') {
          return Response.json({ error: 'The Admin persona cannot be deleted.' }, { status: 400 });
        }

        await deleteUser(db, data.id);
        return Response.json({ ok: true });
      }
    }
  } catch (error) {
    console.error('Admin operation failed:', error);
    const message = error instanceof Error ? error.message : 'Operation failed.';
    return Response.json({ error: message }, { status: 500 });
  }
}
