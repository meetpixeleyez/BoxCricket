"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  ArrowRight, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Building2, 
  Check, 
  ArrowLeft, 
  RefreshCw,
  Phone,
  MapPin
} from 'lucide-react';
import { UserRole } from '@/types';

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCurrentUser, isAuthenticated } = useApp();

  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [role, setRole] = useState<UserRole>('PLAYER');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [address, setAddress] = useState('Mota Varachha');
  const [city, setCity] = useState('Surat');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

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

  const handleSendOtp = async () => {
    if (!name.trim()) {
      setError('Please enter your Full Name');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!agreeTerms) {
      setError('Please accept the Fair Play Terms to continue.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to send OTP.');
        setLoading(false);
        return;
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
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleVerifyAndRegister = async () => {
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
          name: name.trim(),
          role,
          city: city.trim() || 'Surat',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Registration failed.');
        setLoading(false);
        return;
      }

      if (data.user) {
        const profile = data.user.playerProfile;
        setCurrentUser({
          id: data.user.id,
          phone: data.user.phone,
          name: data.user.name,
          role: data.user.role as UserRole,
          city: data.user.city || 'Surat',
          photoUrl: data.user.photoUrl || undefined,
          isBlocked: false,
          playingRole: profile?.playingRole || 'ALL_ROUNDER',
          skillLevel: profile?.skillLevel || 'INTERMEDIATE',
          homeArea: profile?.homeArea || address,
          createdAt: new Date().toISOString(),
        });
      }

      router.push('/');
    } catch (err) {
      setError('Registration error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between max-w-md mx-auto relative overflow-hidden">
      
      {/* ----------------- SCREEN: SIGN UP FORM ----------------- */}
      {step === 'FORM' && (
        <div className="flex flex-col flex-1 px-6 pt-6 pb-8 animate-in fade-in duration-200 justify-between">
          
          <div>
            {/* Top Navigation Bar with Back Arrow and Centered Logo */}
            <div className="flex items-center justify-between pb-4">
              <Link
                href="/login"
                className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>

              <div className="flex flex-col items-center">
                <div className="flex items-center text-[#065f46]">
                  <span className="text-xl font-black tracking-tight">Box</span>
                  <span className="text-xl font-black text-emerald-600">Khel</span>
                  <span className="ml-1 text-base">🏏</span>
                </div>
                <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                  PLAY • CONNECT • ENJOY
                </div>
              </div>

              <div className="w-8" />
            </div>

            {/* Heading */}
            <div className="mt-2 mb-4 space-y-1">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Your Account</h1>
              <p className="text-xs text-slate-500 font-medium">
                Fill in your details to get started and join the BoxKhel community.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Form Fields Stack */}
            <div className="space-y-3">
              
              {/* Field 1: Player Name */}
              <div className="flex items-center rounded-2xl border border-slate-200 bg-white focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/15 transition-all overflow-hidden shadow-sm">
                <div className="pl-4 pr-3 text-slate-400 flex items-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="py-2.5 pr-4 flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Player Name</div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-transparent text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* Field 2: Mobile Number */}
              <div className="flex items-center rounded-2xl border border-slate-200 bg-white focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/15 transition-all overflow-hidden shadow-sm">
                <div className="pl-4 pr-2 text-slate-400 flex items-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="py-2.5 pr-4 flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm font-bold text-slate-700">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10 digit mobile number"
                      className="w-full bg-transparent text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none tracking-wide"
                    />
                  </div>
                </div>
              </div>

              {/* Field 3: Address / Area */}
              <div className="flex items-center rounded-2xl border border-slate-200 bg-white focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/15 transition-all overflow-hidden shadow-sm">
                <div className="pl-4 pr-3 text-slate-400 flex items-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="py-2.5 pr-4 flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address / Area</div>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House / Building / Street / Area"
                    className="w-full bg-transparent text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Field 4: City */}
              <div className="flex items-center rounded-2xl border border-slate-200 bg-white focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/15 transition-all overflow-hidden shadow-sm">
                <div className="pl-4 pr-3 text-slate-400 flex items-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="py-2.5 pr-4 flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">City</div>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter your city"
                    className="w-full bg-transparent text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Role Selection: Our 2 Distinct Cards */}
              <div className="pt-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Role</div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole('PLAYER')}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      role === 'PLAYER'
                        ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {role === 'PLAYER' && (
                      <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-1.5">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-black text-slate-900">Player</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Book slots & matches</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('OWNER')}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      role === 'OWNER'
                        ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {role === 'OWNER' && (
                      <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 mb-1.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-black text-slate-900">Turf Owner</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-medium">List ground & slots</div>
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start space-x-2 text-[11px] text-slate-600 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-600 accent-[#065f46]"
                />
                <span>
                  I agree to BoxKhel <strong className="text-emerald-700 underline">Fair Play Terms</strong> & <strong className="text-emerald-700 underline">Privacy Policy</strong>.
                </span>
              </label>

            </div>
          </div>

          {/* Bottom Actions */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleSendOtp}
              disabled={loading || phone.length < 10 || !name.trim() || !agreeTerms}
              className="w-full py-4 rounded-2xl bg-[#065f46] hover:bg-[#044e3a] active:scale-[0.99] text-white text-sm font-bold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-emerald-900/20 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Code...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center">
              <span className="text-xs text-slate-500 font-medium">Already have an account? </span>
              <Link href="/login" className="text-xs font-black text-emerald-700 hover:underline ml-1">
                Sign In
              </Link>
            </div>
          </div>

        </div>
      )}

      {/* ----------------- SCREEN: OTP VERIFICATION (SCREEN 3) ----------------- */}
      {step === 'OTP' && (
        <div className="flex flex-col flex-1 px-6 pt-6 pb-8 animate-in fade-in duration-200 justify-between">
          
          <div>
            {/* Top Bar with Back Arrow and Centered Logo */}
            <div className="flex items-center justify-between pb-6">
              <button
                onClick={() => setStep('FORM')}
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
              onClick={handleVerifyAndRegister}
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-4 rounded-2xl bg-[#065f46] hover:bg-[#044e3a] active:scale-[0.99] text-white text-sm font-bold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-emerald-900/20 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
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
              onClick={() => setStep('FORM')}
              className="w-full py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Change Details
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Loading...</div>}>
      <SignUpContent />
    </Suspense>
  );
}
