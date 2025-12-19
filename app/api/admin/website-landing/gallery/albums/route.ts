import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const albums = await db.album.findMany({
      include: {
        _count: {
          select: { galleries: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(albums);
  } catch (error) {
    console.error('Failed to fetch albums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    const album = await db.album.create({
      data: {
        name,
        description: description || null,
      },
    });

    return NextResponse.json(album, { status: 201 });
  } catch (error) {
    console.error('Failed to create album:', error);
    return NextResponse.json(
      { error: 'Failed to create album' },
      { status: 500 }
    );
  }
}
