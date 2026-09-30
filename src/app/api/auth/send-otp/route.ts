import { NextRequest, NextResponse } from 'next/server';
import { generateAndSendOTP, normalizePhone } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone || typeof phone !== 'string' || phone.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: 'Valid 10-digit mobile number is required.' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phone);

    // Check if user already exists in DB
    const existingUser = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
      select: { id: true, name: true, role: true, isBlocked: true },
    });

    if (existingUser && existingUser.isBlocked) {
      return NextResponse.json(
        { success: false, message: 'This account is suspended. Please contact support.' },
        { status: 403 }
      );
    }

    const otpResult = await generateAndSendOTP(normalizedPhone);

    if (!otpResult.success) {
      return NextResponse.json(
        { success: false, message: otpResult.message, cooldownRemaining: otpResult.cooldownRemaining },
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      isExistingUser: !!existingUser,
      existingUserRole: existingUser?.role || null,
      existingUserName: existingUser?.name || null,
      devOtp: otpResult.devOtp, // For quick testing & UX
    });
  } catch (error: any) {
    console.error('Error in send-otp route:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while sending OTP. Please try again.' },
      { status: 500 }
    );
  }
}
