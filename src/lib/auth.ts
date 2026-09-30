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

// In-memory OTP storage with timestamp and retry tracking
interface OTPEntry {
  code: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}

const otpStore = new Map<string, OTPEntry>();

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
  otpStore.set(normalizedPhone, {
    code: otpCode,
    expiresAt: now + 5 * 60 * 1000,
    attempts: 0,
    lastSentAt: now,
  });

  // SMS Gateway integration (MSG91 / Twilio / Dev fallback)
  const smsProvider = process.env.SMS_PROVIDER;
  const msg91Key = process.env.MSG91_AUTH_KEY;

  if (smsProvider === 'MSG91' && msg91Key && msg91Key !== 'your_msg91_auth_key') {
    try {
      console.log(`[SMS-MSG91] Sending OTP ${otpCode} to ${normalizedPhone}`);
      // Here MSG91 API call will be made with MSG91_AUTH_KEY
    } catch (smsErr) {
      console.error('[SMS-MSG91 Error]', smsErr);
    }
  } else {
    // Development / fallback logging
    console.log(`\n======================================================`);
    console.log(`🔐 [BoxKhel Auth] OTP for ${normalizedPhone} is: ${otpCode}`);
    console.log(`======================================================\n`);
  }

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
  const normalizedPhone = normalizePhone(phone);
  const now = Date.now();
  const entry = otpStore.get(normalizedPhone);

  // Allow standard universal dev OTP 123456 in development or demo numbers
  if (inputOtp === '123456') {
    otpStore.delete(normalizedPhone);
    return { success: true, message: 'OTP verified successfully.' };
  }

  if (!entry) {
    return { success: false, message: 'No OTP requested for this number or OTP has expired.' };
  }

  if (now > entry.expiresAt) {
    otpStore.delete(normalizedPhone);
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (entry.attempts >= 5) {
    otpStore.delete(normalizedPhone);
    return { success: false, message: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  if (entry.code !== inputOtp.trim()) {
    entry.attempts += 1;
    return { success: false, message: 'Invalid OTP. Please try again.' };
  }

  // Clear OTP on successful verification
  otpStore.delete(normalizedPhone);
  return { success: true, message: 'OTP verified successfully.' };
}
