import { createPrismaClient } from '../src/index';
const db = createPrismaClient({ DATABASE_URL: process.env.DATABASE_URL! });
const users = [{ id: 'sara', name: 'Sara' }, { id: 'abel', name: 'Abel' }, { id: 'liya', name: 'Liya' }];
const places = [
  ['national-museum','National Museum of Ethiopia','History','Discover Ethiopia’s remarkable history and the story of Lucy.','09:00–17:30','/places/national-museum.jpg'],
  ['holy-trinity','Holy Trinity Cathedral','History','A landmark cathedral known for its architecture and history.','08:00–17:00','/places/holy-trinity.jpg'],
  ['entoto-park','Entoto Park','Nature','Woodland trails and sweeping views above the city.','09:00–18:00','/places/entoto-park.jpg'],
  ['tomoca','Tomoca Coffee','Food','A classic stop for Ethiopian coffee in the heart of Addis.','07:30–19:00','/places/tomoca.jpg'],
  ['merkato','Addis Merkato','Food','Explore a vast market filled with spices, crafts and local life.','08:00–18:00','/places/merkato.jpg'],
  ['unity-park','Unity Park','Nature','Gardens, heritage and wildlife within the Grand Palace grounds.','09:00–17:00','/places/unity-park.jpg'],
  ['red-terror','Red Terror Martyrs Memorial Museum','History','A thoughtful museum remembering a difficult chapter of Ethiopian history.','08:00–18:00','/places/red-terror.jpg'],
  ['friendship-park','Friendship Park','Nature','An inviting green space for a quiet walk.','09:00–18:00','/places/friendship-park.jpg'],
  ['yod-abyssinia','Yod Abyssinia','Food','Ethiopian dishes and traditional music in a lively setting.','12:00–23:00','/places/yod-abyssinia.jpg'],
  ['new-coffee','New Coffee House','Food','A small neighbourhood coffee stop.','08:00–18:00','/places/new-coffee.jpg'],
] as const;
try {
  for (const user of users) await db.user.upsert({ where: { id: user.id }, create: user, update: {} });
  for (const [i, [id, name, category, description, openingHours, imageUrl]] of places.entries()) {
    await db.place.upsert({ where: { id }, create: { id, name, category, description, openingHours, imageUrl }, update: { imageUrl } });
    for (const [j, user] of users.slice(0, i === 9 ? 1 : 3).entries()) {
      await db.review.upsert({ where: { placeId_userId: { placeId: id, userId: user.id } }, create: { placeId: id, userId: user.id, rating: i === 9 ? 5 : (j === 2 ? 4 : 5), body: ['A memorable visit and a great introduction to the city.','Worth taking your time to explore.','A lovely stop on our trip.'][j]! }, update: {} });
    }
    if (i < 6) {
      for (let j = 0; j < 2; j++) {
        const slotId = `${id}-tour-${j}`;
        const startsAt = new Date(); startsAt.setUTCDate(startsAt.getUTCDate() + 7 + j); startsAt.setUTCHours(6 + j * 2, 0, 0, 0);
        await db.tourSlot.upsert({ where: { id: slotId }, create: { id: slotId, placeId: id, startsAt, capacity: 10 }, update: {} });
      }
    }
  }
  console.log('Seed complete. Existing reviews and bookings were preserved.');
} finally { await db.$disconnect(); }
