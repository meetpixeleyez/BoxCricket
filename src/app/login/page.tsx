"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  ArrowRight, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  ArrowLeft,
  Phone,
  Check
} from 'lucide-react';
import { UserRole } from '@/types';

const DEMO_NAMES: Record<string, string> = {
  '9876543210': 'Hardik Patel',
  '9876543211': 'Rajesh Shah',
  '9876543212': 'Surat Admin',
};

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser, isAuthenticated } = useApp();

  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('9876543210');
  const [rememberMe, setRememberMe] = useState(true);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Resend Timer
  useEffect(() => {
    let interval: any = null;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  // Send OTP
  const handleSendOtp = async (phoneToUse?: string) => {
    const targetPhone = (phoneToUse || phone).trim();
    if (!targetPhone || targetPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: targetPhone }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to send OTP. Please try again.');
        setLoading(false);
        return;
      }

      if (phoneToUse) {
        setPhone(phoneToUse);
      }
      
      setDevOtpHint(data.devOtp || '123456');
      setStep('OTP');
      setTimer(45);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Box Changes
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      pastedDigits.forEach((digit, idx) => {
        if (idx < 6) newOtp[idx] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pastedDigits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          otp: fullOtp,
          name: DEMO_NAMES[phone] || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Invalid OTP code.');
        setLoading(false);
        return;
      }

      if (data.isNewUser) {
        router.push(`/signup?phone=${encodeURIComponent(phone)}`);
        return;
      }

      if (data.user) {
        const profile = data.user.playerProfile;
        setCurrentUser({
          id: data.user.id,
          phone: data.user.phone,
          name: data.user.name || DEMO_NAMES[phone] || 'Player',
          role: data.user.role as UserRole,
          city: data.user.city || 'Surat',
          photoUrl: data.user.photoUrl || undefined,
          isBlocked: false,
          playingRole: profile?.playingRole || 'ALL_ROUNDER',
          skillLevel: profile?.skillLevel || 'INTERMEDIATE',
          homeArea: profile?.homeArea || 'Adajan',
          createdAt: new Date().toISOString(),
        });
      }

      router.push('/');
    } catch (err) {
      setError('Verification error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between max-w-md mx-auto relative overflow-hidden">
      
      {/* ----------------- SCREEN: LOGIN / WELCOME BACK ----------------- */}
      {step === 'PHONE' && (
        <div className="flex flex-col flex-1 animate-in fade-in duration-200">
          
          {/* Top Emerald Wave Header with Logo & Batsman */}
          <div className="relative bg-[#065f46] pt-10 pb-14 px-6 text-white overflow-hidden rounded-b-[2.5rem] shadow-md">
            
            {/* Background Decorative Rings */}
            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-emerald-500/10 pointer-events-none" />
            <div className="absolute right-12 top-16 w-24 h-24 rounded-full bg-emerald-400/10 pointer-events-none" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                {/* Brand Logo */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-white">
                    <span className="text-2xl font-black tracking-tight">Box</span>
                    <span className="text-2xl font-black text-emerald-300">Khel</span>
                    <span className="ml-1.5 text-lg">🏏</span>
                  </div>
                </div>
                <div className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-200/90 mt-0.5">
                  PLAY • CONNECT • ENJOY
                </div>
              </div>

              {/* Batsman Silhouette Icon Art */}
              <div className="w-16 h-16 rounded-2xl bg-emerald-700/60 border border-emerald-500/30 flex items-center justify-center text-3xl shadow-inner shadow-emerald-950/40 transform -rotate-3">
                🏏
              </div>
            </div>
          </div>

          {/* Form Content Body */}
          <div className="px-6 -mt-6 relative z-20 flex-1 flex flex-col justify-between">
            <div className="space-y-4 bg-white pt-2">
              
              {/* Heading */}
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back!</h1>
                <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                  Log in to continue your BoxKhel journey and get back to the game.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {/* Input 1: Mobile Phone Number */}
              <div className="space-y-1.5">
                <div className="flex items-center rounded-2xl border border-slate-200 bg-white focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/15 transition-all overflow-hidden shadow-sm">
                  <div className="pl-4 pr-2 text-slate-400 flex items-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="py-3.5 pr-2 font-bold text-xs text-slate-700 select-none">
                    +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    placeholder="Enter mobile number"
                    className="w-full bg-transparent py-3.5 pr-4 text-slate-900 text-sm font-bold placeholder:text-slate-400 focus:outline-none tracking-wide"
                    autoFocus
                  />
                </div>
              </div>

              {/* Remember Me & Forgot row */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center space-x-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 accent-[#065f46]"
                  />
                  <span className="font-semibold text-slate-700">Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  Forgot number?
                </button>
              </div>

              {/* Log In Button */}
              <button
                onClick={() => handleSendOtp()}
                disabled={loading || phone.length < 10}
                className="w-full py-4 rounded-2xl bg-[#065f46] hover:bg-[#044e3a] active:scale-[0.99] text-white text-sm font-bold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-emerald-900/20 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center pt-2">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
                  OR
                </span>
              </div>

              {/* Quick 1-Click Demo Accounts */}
              <div className="pt-2">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setPhone('9876543210'); handleSendOtp('9876543210'); }}
                    className="p-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-300 text-center transition-all group"
                  >
                    <div className="font-black text-slate-900 group-hover:text-emerald-800 text-xs">Hardik</div>
                    <div className="text-[10px] text-emerald-700 font-bold mt-0.5">🏏 Player</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setPhone('9876543211'); handleSendOtp('9876543211'); }}
                    className="p-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-amber-50 hover:border-amber-300 text-center transition-all group"
                  >
                    <div className="font-black text-slate-900 group-hover:text-amber-800 text-xs">Rajesh</div>
                    <div className="text-[10px] text-amber-700 font-bold mt-0.5">🏟️ Owner</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setPhone('9876543212'); handleSendOtp('9876543212'); }}
                    className="p-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-rose-50 hover:border-rose-300 text-center transition-all group"
                  >
                    <div className="font-black text-slate-900 group-hover:text-rose-800 text-xs">Admin</div>
                    <div className="text-[10px] text-rose-700 font-bold mt-0.5">🛡️ Admin</div>
                  </button>
                </div>
              </div>

              {/* Don't have account footer link */}
              <div className="text-center pt-2 pb-6">
                <span className="text-xs text-slate-500 font-medium">Don't have an account? </span>
                <Link
                  href="/signup"
                  className="text-xs font-black text-emerald-700 hover:underline ml-1"
                >
                  Sign Up
                </Link>
              </div>

            </div>

            {/* Bottom Graphic Mint Brush Stroke */}
            <div className="w-24 h-24 rounded-full bg-emerald-100/50 absolute -bottom-10 -right-10 pointer-events-none blur-xl" />
          </div>

        </div>
      )}

      {/* ----------------- SCREEN: OTP VERIFICATION ----------------- */}
      {step === 'OTP' && (
        <div className="flex flex-col flex-1 px-6 pt-6 pb-8 animate-in fade-in duration-200 justify-between">
          
          <div>
            {/* Top Bar with Back Arrow and Centered Logo */}
            <div className="flex items-center justify-between pb-6">
              <button
                onClick={() => setStep('PHONE')}
                className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center text-[#065f46]">
                <span className="text-xl font-black tracking-tight">Box</span>
                <span className="text-xl font-black text-emerald-600">Khel</span>
                <span className="ml-1 text-base">🏏</span>
              </div>

              <div className="w-8" />
            </div>

            {/* Shield Check Illustration Card */}
            <div className="flex flex-col items-center justify-center my-4 relative">
              <div className="w-32 h-32 rounded-full bg-emerald-100/60 absolute blur-lg -z-10" />
              
              <div className="w-20 h-28 rounded-3xl bg-white border-2 border-emerald-600/30 flex items-center justify-center shadow-lg relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="absolute top-1.5 w-6 h-1 bg-slate-200 rounded-full" />
                <div className="absolute bottom-2 w-3 h-3 rounded-full border border-slate-200" />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center space-y-1.5 mt-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Verify Your Mobile Number
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                We've sent a 6 digit OTP to <span className="font-bold text-slate-800">+91 {phone}</span>
              </p>
            </div>

            {/* Dev Auto Fill Banner */}
            {devOtpHint && (
              <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-sm">
                <span>Dev Test OTP: <strong className="font-mono text-emerald-950 font-bold text-sm ml-1">{devOtpHint}</strong></span>
                <button
                  onClick={() => {
                    const digits = devOtpHint.split('');
                    setOtp(digits);
                    otpInputRefs.current[5]?.focus();
                  }}
                  className="px-3 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                >
                  Auto Fill
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* 6 OTP Boxes */}
            <div className="flex justify-between gap-2 py-6">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { otpInputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className={`w-12 h-14 rounded-2xl bg-white border text-center text-xl font-black text-slate-900 focus:outline-none transition-all shadow-sm ${
                    digit ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/20' : 'border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                />
              ))}
            </div>

            {/* Resend OTP Timer */}
            <div className="text-center text-xs">
              {canResend ? (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="text-emerald-700 font-bold hover:underline inline-flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend OTP</span>
                </button>
              ) : (
                <span className="text-slate-400 font-semibold">
                  Resend OTP in <span className="text-slate-700 font-bold">00:{timer < 10 ? `0${timer}` : timer}</span>
                </span>
              )}
            </div>

          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-6">
            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-4 rounded-2xl bg-[#065f46] hover:bg-[#044e3a] active:scale-[0.99] text-white text-sm font-bold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-emerald-900/20 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('PHONE')}
              className="w-full py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Change Number
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
