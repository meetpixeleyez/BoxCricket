import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, signAuthToken, COOKIE_NAME, normalizePhone } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otp, name, role = 'PLAYER', city = 'Surat' } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, message: 'Phone number and OTP are required.' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phone);

    // 1. Verify OTP code
    const otpVerification = verifyOTP(normalizedPhone, otp.toString());
    if (!otpVerification.success) {
      return NextResponse.json(
        { success: false, message: otpVerification.message },
        { status: 400 }
      );
    }

    // 2. Check if user already exists
    let user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
      include: {
        playerProfile: true,
        grounds: true,
      },
    });

    if (!user) {
      // If user does not exist and name wasn't provided yet, ask frontend to complete profile
      if (!name || name.trim().length === 0) {
        return NextResponse.json({
          success: true,
          isNewUser: true,
          phone: normalizedPhone,
          message: 'OTP verified. Please complete your registration name and role.',
        });
      }

      // Validating role
      const validRole = ['PLAYER', 'OWNER', 'ADMIN'].includes(role)
        ? (role as UserRole)
        : UserRole.PLAYER;

      // Calculate 3 months 0% platform fee trial for new owners
      const feeFreeUntil = new Date();
      feeFreeUntil.setMonth(feeFreeUntil.getMonth() + 3);

      // Create new user in PostgreSQL
      user = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          name: name.trim(),
          role: validRole,
          city: city || 'Surat',
          feeFreeUntil: validRole === UserRole.OWNER ? feeFreeUntil : null,
          playerProfile:
            validRole === UserRole.PLAYER
              ? {
                  create: {
                    playingRole: 'ALL_ROUNDER',
                    skillLevel: 'INTERMEDIATE',
                    homeArea: 'Adajan',
                  },
                }
              : undefined,
        },
        include: {
          playerProfile: true,
          grounds: true,
        },
      });
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { success: false, message: 'Your account is suspended. Please contact support.' },
        { status: 403 }
      );
    }

    // 3. Generate JWT Token
    const token = await signAuthToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name,
    });

    // 4. Create response and set secure httpOnly session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        city: user.city,
        photoUrl: user.photoUrl,
        playerProfile: user.playerProfile,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Error in verify-otp route:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during verification. Please try again.' },
      { status: 500 }
    );
  }
}
