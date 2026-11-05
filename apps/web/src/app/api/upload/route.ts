import { NextResponse } from 'next/server';
import { uploadToStorage } from '@/lib/storage';
import { db } from '@/services';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const placeId = formData.get('placeId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop() || 'jpg';
    const key = `places/${placeId || 'misc'}-${Date.now()}.${ext}`;

    const uploaded = await uploadToStorage(key, buffer, file.type || 'image/jpeg');

    if (!uploaded) {
      return NextResponse.json(
        {
          error:
            'Neon Object Storage is not configured. Please set AWS_ENDPOINT_URL_S3, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.',
        },
        { status: 503 }
      );
    }

    if (placeId) {
      await db.place.update({
        where: { id: placeId },
        data: { imageUrl: uploaded.url },
      });
    }

    return NextResponse.json({ url: uploaded.url, key: uploaded.key });
  } catch (err) {
    console.error('Failed to upload image:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
