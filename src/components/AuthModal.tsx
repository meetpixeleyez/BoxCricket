"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  X, 
  Loader2, 
  CheckCircle2, 
  User, 
  Building2, 
  Trophy, 
  RefreshCw,
  AlertCircle,
  MessageSquare,
  Shield,
  Check,
  Award,
  Zap
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'SIGN_IN' | 'SIGN_UP';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialMode = 'SIGN_IN'
}) => {
  const { setCurrentUser } = useApp();

  // Mode: 'SIGN_IN' | 'SIGN_UP' | 'OTP'
  const [mode, setMode] = useState<'SIGN_IN' | 'SIGN_UP' | 'OTP'>('SIGN_IN');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('PLAYER');
  const [preferredArea, setPreferredArea] = useState('Mota Varachha');
  const [agreeTerms, setAgreeTerms] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setDevOtpHint(null);
      setOtp(['', '', '', '', '', '']);
    }
  }, [isOpen, initialMode]);

  // Resend OTP countdown timer
  useEffect(() => {
    let interval: any = null;
    if (mode === 'OTP' && timer > 0) {
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
  }, [mode, timer]);

  if (!isOpen) return null;

  // Handle Send OTP
  const handleSendOtp = async (phoneToUse?: string) => {
    const targetPhone = (phoneToUse || phone).trim();
    if (!targetPhone || targetPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (mode === 'SIGN_UP' && !name.trim()) {
      setError('Please enter your Full Name');
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
      setMode('OTP');
      setTimer(60);
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

  // Handle 6-digit OTP Box Changes
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

  // Handle Verify OTP
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
          name: name.trim() || undefined,
          role,
          city: 'Surat',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Invalid OTP code.');
        setLoading(false);
        return;
      }

      if (data.isNewUser && !name.trim()) {
        setMode('SIGN_UP');
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
          homeArea: profile?.homeArea || preferredArea,
          createdAt: new Date().toISOString(),
        });
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Verification error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-[420px] rounded-3xl bg-white text-slate-900 shadow-2xl relative overflow-hidden my-6 border border-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ----------------- SCREEN 1: SIGN IN ----------------- */}
        {mode === 'SIGN_IN' && (
          <div className="p-5 sm:p-6 space-y-4">
            
            {/* Top Green Hero Banner */}
            <div className="rounded-2xl bg-[#065f46] p-4 text-white relative overflow-hidden shadow-md">
              <div className="relative z-10">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200 block mb-1">
                  MOTA VARACHHA • VESU • ADAJAN
                </span>
                <h3 className="text-lg font-black leading-tight">
                  Night Box Match Ready?
                </h3>
                <p className="text-xs text-emerald-100/90 mt-1">
                  Book premium floodlit turfs in 60 seconds.
                </p>
              </div>
              <div className="absolute right-3 top-3 w-14 h-14 rounded-2xl bg-emerald-700/60 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner">
                🏏
              </div>
            </div>

            {/* Sign In Header */}
            <div className="flex items-center space-x-3 pt-1">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 text-xl shadow-sm">
                🏏
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Sign in to BoxKhel</h2>
                <p className="text-xs text-slate-500">Enter your registered mobile number to continue</p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Mobile Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Mobile Phone Number
                </label>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                  <Zap className="w-3 h-3 mr-1" /> Instant SMS / OTP
                </span>
              </div>
              
              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50/70 focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all overflow-hidden">
                <div className="flex items-center space-x-1 px-3.5 py-3 bg-slate-100/80 border-r border-slate-200 text-xs font-bold text-slate-700 select-none">
                  <span>🇮🇳 +91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  placeholder="98765 43210"
                  className="w-full bg-transparent px-3.5 py-3 text-slate-900 text-base font-bold placeholder:text-slate-400 focus:outline-none tracking-wider"
                  autoFocus
                />
              </div>
            </div>

            {/* Get OTP Button */}
            <button
              onClick={() => handleSendOtp()}
              disabled={loading || phone.length < 10}
              className="w-full py-3.5 stitch-btn-orange text-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Code...</span>
                </>
              ) : (
                <>
                  <span>Get OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* WhatsApp Alternative Button */}
            <button
              onClick={() => handleSendOtp()}
              disabled={loading || phone.length < 10}
              className="w-full py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-emerald-700 font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Sign in with WhatsApp</span>
            </button>

            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant OTP verification via SMS or WhatsApp</span>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-1 border-t border-slate-100">
              <span className="text-xs text-slate-500">Don't have an account? </span>
              <button
                onClick={() => { setMode('SIGN_UP'); setError(null); }}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Sign Up
              </button>
            </div>

            {/* Quick Demo Test Logins */}
            <div className="pt-2">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 text-center">
                Quick 1-Click Demo Accounts
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => { setPhone('9876543210'); handleSendOtp('9876543210'); }}
                  className="p-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-center transition-all text-xs"
                >
                  <div className="font-bold text-slate-800">Hardik</div>
                  <div className="text-[10px] text-emerald-600 font-medium">🏏 Player</div>
                </button>
                <button
                  type="button"
                  onClick={() => { setPhone('9876543211'); handleSendOtp('9876543211'); }}
                  className="p-1.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 text-center transition-all text-xs"
                >
                  <div className="font-bold text-slate-800">Rajesh</div>
                  <div className="text-[10px] text-amber-600 font-medium">🏟️ Owner</div>
                </button>
                <button
                  type="button"
                  onClick={() => { setPhone('9876543212'); handleSendOtp('9876543212'); }}
                  className="p-1.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 text-center transition-all text-xs"
                >
                  <div className="font-bold text-slate-800">Admin</div>
                  <div className="text-[10px] text-rose-600 font-medium">🛡️ Admin</div>
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-around text-center">
              <div>
                <div className="text-sm font-black text-slate-900">120+</div>
                <div className="text-[10px] text-slate-500 font-medium">Surat Turfs</div>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div>
                <div className="text-sm font-black text-slate-900">25k+</div>
                <div className="text-[10px] text-slate-500 font-medium">Box Matches</div>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div>
                <div className="text-sm font-black text-slate-900 flex items-center justify-center">
                  4.9 <span className="text-amber-500 ml-0.5">★</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Player Rating</div>
              </div>
            </div>

          </div>
        )}

        {/* ----------------- SCREEN 2: SIGN UP ----------------- */}
        {mode === 'SIGN_UP' && (
          <div className="p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar">
            
            {/* Top Green Banner */}
            <div className="rounded-2xl bg-[#065f46] p-4 text-white relative overflow-hidden shadow-md">
              <div className="relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-700/60 px-2 py-0.5 rounded-full text-emerald-200 inline-block mb-1">
                  Surat Turf Network
                </span>
                <h3 className="text-lg font-black leading-tight">
                  Join BoxKhel
                </h3>
                <p className="text-xs text-emerald-100/90 mt-1">
                  Create your account to book box cricket turfs and find players across Surat.
                </p>
              </div>
              <div className="absolute right-3 top-3 w-14 h-14 rounded-2xl bg-emerald-700/60 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner">
                🏏
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Select Role */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-900">Select Your Role</label>
                <span className="text-[11px] text-slate-400">તમારો રોલ પસંદ કરો</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('PLAYER')}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    role === 'PLAYER'
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {role === 'PLAYER' && (
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-2">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-900">I am a Player</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Book slots & join matches</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('OWNER')}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    role === 'OWNER'
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {role === 'OWNER' && (
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 mb-2">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-900">I own a Turf</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">List ground & manage slots</div>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Full Name
              </label>
              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50/70 focus-within:border-emerald-600 focus-within:bg-white transition-all px-3.5 py-2.5">
                <User className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hardik Patel"
                  className="w-full bg-transparent text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-900">Mobile Number</label>
                <span className="text-[10px] text-slate-500">For SMS OTP Verification</span>
              </div>
              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50/70 focus-within:border-emerald-600 focus-within:bg-white transition-all overflow-hidden">
                <div className="px-3.5 py-2.5 bg-slate-100/80 border-r border-slate-200 text-xs font-bold text-slate-700 select-none">
                  🇮🇳 +91
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  className="w-full bg-transparent px-3.5 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Preferred Surat Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-900">Preferred Surat Area</label>
                <span className="text-[10px] text-emerald-600 font-semibold">✈ Surat Local</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Mota Varachha', 'Adajan', 'Vesu', 'Katargam', 'Pal'].map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setPreferredArea(area)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      preferredArea === area
                        ? 'bg-[#065f46] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Perk Banner */}
            <div className="p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">Surat Box League 2026</div>
                  <div className="text-[10px] text-slate-500">Get early player registration perk</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-200/80 text-[10px] font-black text-amber-900 uppercase">
                FREE PASS
              </span>
            </div>

            {/* Checkbox Terms */}
            <label className="flex items-start space-x-2 text-[11px] text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                By signing up, you agree to BoxKhel <strong className="text-emerald-700 underline">Fair Play Terms</strong> & <strong className="text-emerald-700 underline">Privacy Policy</strong>.
              </span>
            </label>

            {/* Create Account CTA */}
            <button
              onClick={() => handleSendOtp()}
              disabled={loading || phone.length < 10 || !name.trim() || !agreeTerms}
              className="w-full py-3.5 stitch-btn-orange text-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Code...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Get OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Back to Sign In Link */}
            <div className="text-center pt-1 border-t border-slate-100">
              <span className="text-xs text-slate-500">Already have an account? </span>
              <button
                onClick={() => { setMode('SIGN_IN'); setError(null); }}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Sign In
              </button>
            </div>

            {/* Help Registering Ground Banner */}
            <div className="p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">Need help registering ground?</div>
                  <div className="text-[10px] text-slate-500">WhatsApp: +91 98250 84721</div>
                </div>
              </div>
              <a
                href="https://wa.me/919825084721"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-xl bg-white text-emerald-700 font-bold text-[11px] border border-emerald-200 hover:bg-emerald-50 shadow-sm"
              >
                Chat ↗
              </a>
            </div>

          </div>
        )}

        {/* ----------------- SCREEN 3: OTP VERIFICATION ----------------- */}
        {mode === 'OTP' && (
          <div className="p-5 sm:p-6 space-y-4 animate-in fade-in">
            
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 text-xl shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Enter 6-Digit OTP</h2>
                <p className="text-xs text-slate-500">Sent to +91 {phone}</p>
              </div>
            </div>

            {devOtpHint && (
              <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                <span>Dev Test Code: <strong className="font-mono text-emerald-950 font-bold text-sm ml-1">{devOtpHint}</strong></span>
                <button
                  onClick={() => {
                    const digits = devOtpHint.split('');
                    setOtp(digits);
                    otpInputRefs.current[5]?.focus();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider"
                >
                  Auto Fill
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 6 OTP Boxes */}
            <div className="flex justify-between gap-2">
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
                  className="w-12 h-14 rounded-2xl bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-center text-xl font-black text-slate-900 focus:outline-none transition-all shadow-sm"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setMode('SIGN_IN')}
                className="text-slate-500 hover:text-slate-900 transition-colors"
              >
                Change Phone Number
              </button>

              {canResend ? (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="text-emerald-700 font-bold hover:underline flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend OTP</span>
                </button>
              ) : (
                <span className="text-slate-400 font-medium">
                  Resend in {timer}s
                </span>
              )}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-3.5 stitch-btn-orange text-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Proceed</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
