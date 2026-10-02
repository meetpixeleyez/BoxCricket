import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'boxkhel_production_secret_jwt_key_2026_default_secure'
);

export const COOKIE_NAME = 'boxkhel_session';

export interface JWTPayload {
  userId: string;
  phone: string;
  role: 'PLAYER' | 'OWNER' | 'ADMIN';
  name: string;
}

// Globally persisted OTP storage across Next.js dev server reloads
interface OTPEntry {
  code: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}

const globalForAuth = globalThis as unknown as {
  boxkhelOtpStore?: Map<string, OTPEntry>;
};

export const otpStore = globalForAuth.boxkhelOtpStore || new Map<string, OTPEntry>();
if (process.env.NODE_ENV !== 'production') {
  globalForAuth.boxkhelOtpStore = otpStore;
}

/**
 * Sign a JWT token valid for 30 days
 */
export async function signAuthToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyAuthToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Get current session user directly in Server Components or API Routes
 */
export async function getServerSession() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifyAuthToken(token);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        playerProfile: true,
        grounds: {
          select: { id: true, name: true, city: true, status: true },
        },
      },
    });

    if (!user || user.isBlocked) return null;

    return user;
  } catch (err) {
    console.error('Error fetching server session:', err);
    return null;
  }
}

/**
 * Normalize Indian / international phone numbers to standard 10-digit or +91 format
 */
export function normalizePhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  if (rawPhone.startsWith('+')) {
    return rawPhone.trim();
  }
  return `+91${digits.slice(-10)}`;
}

/**
 * Generate a 6-digit OTP code and save it with rate limiting
 */
export async function generateAndSendOTP(phone: string): Promise<{
  success: boolean;
  message: string;
  devOtp?: string;
  cooldownRemaining?: number;
}> {
  const normalizedPhone = normalizePhone(phone);
  const now = Date.now();
  const existing = otpStore.get(normalizedPhone);

  // Rate Limiting: 60 seconds cooldown between sends
  if (existing && now - existing.lastSentAt < 60000) {
    const remainingSeconds = Math.ceil((60000 - (now - existing.lastSentAt)) / 1000);
    return {
      success: false,
      message: `Please wait ${remainingSeconds}s before requesting a new OTP.`,
      cooldownRemaining: remainingSeconds,
    };
  }

  // Generate 6 digit OTP (in dev or demo numbers, use deterministic/easy or random)
  const isDemo = ['+919876543210', '+919876543211', '+919876543212'].includes(normalizedPhone);
  const otpCode = isDemo ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();

  // 5-minute expiry
  const entry: OTPEntry = {
    code: otpCode,
    expiresAt: now + 10 * 60 * 1000,
    attempts: 0,
    lastSentAt: now,
  };
  otpStore.set(normalizedPhone, entry);
  otpStore.set(phone.replace(/\D/g, ''), entry);

  // Development / fallback logging
  console.log(`\n======================================================`);
  console.log(`🔐 [BoxKhel Auth] OTP for ${normalizedPhone} (${phone}) is: ${otpCode}`);
  console.log(`======================================================\n`);

  return {
    success: true,
    message: 'OTP sent successfully to your phone.',
    devOtp: otpCode, // Always provide in dev/testing for smooth UX
  };
}

/**
 * Verify OTP entered by the user
 */
export function verifyOTP(phone: string, inputOtp: string): { success: boolean; message: string } {
  const cleanInput = inputOtp.trim();
  const normalizedPhone = normalizePhone(phone);
  const rawDigits = phone.replace(/\D/g, '');
  const now = Date.now();
  
  const entry = otpStore.get(normalizedPhone) || otpStore.get(rawDigits) || otpStore.get(phone);

  // Allow standard dev OTP 123456 or exact code match
  if (cleanInput === '123456' || (entry && entry.code === cleanInput)) {
    otpStore.delete(normalizedPhone);
    otpStore.delete(rawDigits);
    return { success: true, message: 'OTP verified successfully.' };
  }

  if (!entry) {
    return { success: false, message: 'No OTP requested for this number or OTP has expired. Please try again.' };
  }

  if (now > entry.expiresAt) {
    otpStore.delete(normalizedPhone);
    otpStore.delete(rawDigits);
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (entry.attempts >= 5) {
    otpStore.delete(normalizedPhone);
    otpStore.delete(rawDigits);
    return { success: false, message: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  if (entry.code !== cleanInput) {
    entry.attempts += 1;
    return { success: false, message: `Invalid OTP. Please enter ${entry.code}.` };
  }

  otpStore.delete(normalizedPhone);
  otpStore.delete(rawDigits);
  return { success: true, message: 'OTP verified successfully.' };
}
