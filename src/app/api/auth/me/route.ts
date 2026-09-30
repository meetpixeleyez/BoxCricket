import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, verifyAuthToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, authenticated: false, user: null },
        { status: 200 }
      );
    }

    const payload = await verifyAuthToken(token);
    if (!payload?.userId) {
      return NextResponse.json(
        { success: false, authenticated: false, user: null },
        { status: 200 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        playerProfile: true,
        grounds: {
          select: { id: true, name: true, city: true, status: true },
        },
      },
    });

    if (!user || user.isBlocked) {
      const res = NextResponse.json(
        { success: false, authenticated: false, user: null },
        { status: 200 }
      );
      res.cookies.delete(COOKIE_NAME);
      return res;
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        city: user.city,
        photoUrl: user.photoUrl,
        playerProfile: user.playerProfile,
        groundsCount: user.grounds?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching session in /api/auth/me:', error);
    return NextResponse.json(
      { success: false, authenticated: false, user: null },
      { status: 500 }
    );
  }
}
