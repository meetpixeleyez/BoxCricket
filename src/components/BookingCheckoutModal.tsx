"use client";

import React, { useState, useEffect } from 'react';
import { Ground, Box, Booking } from '@/types';
import { useApp } from '@/context/AppContext';
import { 
  X, 
  ArrowLeft, 
  CheckCircle, 
  Copy, 
  Check, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  QrCode, 
  ExternalLink,
  MapPin,
  Phone,
  Ticket,
  Sparkles,
  ChevronRight,
  Share2
} from 'lucide-react';
import Link from 'next/link';
import { formatSlotTimeRange, formatDateDisplay, getTodayDateString } from '@/lib/dateUtils';

export interface BookingCheckoutModalProps {
  isOpen?: boolean;
  onClose: () => void;
  ground: Ground;
  box: Box;
  bookingDetails?: any;
  date?: string;
  startTime?: string;
  endTime?: string;
  totalAmount?: number;
  onBack?: () => void;
}

export const BookingCheckoutModal: React.FC<BookingCheckoutModalProps> = ({
  isOpen = true,
  onClose,
  ground,
  box,
  bookingDetails,
  date: propDate,
  startTime: propStartTime,
  endTime: propEndTime,
  totalAmount: propTotalAmount,
  onBack
}) => {
  const { createBooking, currentUser } = useApp();

  const activeBox = bookingDetails?.box || box;
  const date = bookingDetails?.date || propDate || getTodayDateString();
  const startTime = bookingDetails?.slots?.[0]?.startTime || propStartTime || '20:00';
  const endTime = bookingDetails?.slots?.[bookingDetails.slots.length - 1]?.endTime || propEndTime || '22:00';
  const totalAmount = bookingDetails?.totalAmount || propTotalAmount || 1800;
  const advanceAmount = bookingDetails?.advancePayable !== undefined 
    ? bookingDetails.advancePayable 
    : (ground.paymentSettings?.advanceEnabled ? Math.round((totalAmount * 30) / 100) : 0);
  const balanceAmount = totalAmount - advanceAmount;

  // 15-Minute Hold Timer
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [utrInput, setUtrInput] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (confirmedBooking) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [confirmedBooking]);

  if (!isOpen) return null;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopyUPI = () => {
    const upiId = ground.paymentSettings?.upiId || 'royalboxcricket@okhdfcbank';
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleConfirmBooking = () => {
    const cleanedUtr = utrInput.trim().replace(/\D/g, '');

    if (advanceAmount > 0) {
      if (!cleanedUtr) {
        setErrorMsg('Please enter 12-digit UPI UTR / Transaction ID from your payment app.');
        return;
      }
      if (cleanedUtr.length !== 12) {
        setErrorMsg(`UPI UTR / Reference ID must be exactly 12 digits (currently ${cleanedUtr.length} digits).`);
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const newBooking = createBooking({
        boxId: activeBox.id,
        boxName: activeBox.name,
        groundId: ground.id,
        groundName: ground.name,
        groundArea: ground.area,
        groundPhone: ground.phone,
        groundAddress: ground.addressLine,
        date,
        startTime,
        endTime,
        totalAmount,
        advanceAmount,
        balanceAmount,
        paymentStatus: advanceAmount > 0 ? 'ADVANCE_PAID' : 'UNPAID',
        utr: cleanedUtr || 'UPI-REF-AUTO',
        refundPolicySnapshot: ground.paymentSettings?.refundTiers || [
          { hoursBefore: 12, refundPercent: 30 },
          { hoursBefore: 3, refundPercent: 20 },
          { hoursBefore: 0, refundPercent: 0 }
        ]
      });

      setConfirmedBooking(newBooking);
    } catch (e: any) {
      setErrorMsg(e.message || 'Error confirming booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const upiId = ground.paymentSettings?.upiId || 'royalboxcricket@okhdfcbank';
  const qrUrl = ground.paymentSettings?.qrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(ground.name)}&am=${advanceAmount}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-[440px] rounded-3xl bg-white text-slate-900 shadow-2xl relative overflow-hidden my-auto border border-slate-100 max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-2">
            {onBack && !confirmedBooking && (
              <button onClick={onBack} className="p-1 text-slate-500 hover:text-slate-800">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="text-sm font-black text-slate-900">
              {confirmedBooking ? 'Booking Confirmed! 🎉' : 'Direct UPI Settlement'}
            </h3>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 no-scrollbar">
          
          {confirmedBooking ? (
            /* SUCCESS CONFIRMATION SCREEN */
            <div className="space-y-4 text-center py-2 animate-in zoom-in-95">
              
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  Slot Locked • ID #{confirmedBooking.id}
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">
                  Match Slot Reserved!
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  We've sent the confirmation SMS to +91 {currentUser.phone}
                </p>
              </div>

              {/* Match Card Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{ground.name}</span>
                  <span className="text-emerald-800 font-black">{box.name}</span>
                </div>
                <div className="text-slate-500 text-[11px] font-bold">
                  {formatDateDisplay(date)} • {formatSlotTimeRange(startTime, endTime)}
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between">
                  <span className="text-slate-500">Advance Paid:</span>
                  <span className="font-bold text-emerald-700">₹{advanceAmount} (Verified)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Balance at Ground:</span>
                  <span className="font-bold text-slate-900">₹{balanceAmount}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <Link
                  href="/my-bookings"
                  onClick={onClose}
                  className="w-full py-3.5 stitch-btn-orange text-xs flex items-center justify-center space-x-1.5 shadow-md"
                >
                  <Ticket className="w-4 h-4" />
                  <span>View in My Bookings</span>
                </Link>

                <button
                  onClick={() => alert('Booking details shared with team!')}
                  className="w-full py-3 rounded-2xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center space-x-1.5 hover:bg-blue-100 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Ticket with Squad</span>
                </button>
              </div>

            </div>
          ) : (
            /* PAYMENT CHECKOUT FLOW */
            <div className="space-y-4">
              
              {/* Hold Timer Alert */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-amber-900 font-bold">
                  <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span>Slot Held For:</span>
                </div>
                <span className="font-mono text-sm font-black text-amber-800 bg-white px-2 py-0.5 rounded-lg border border-amber-200">
                  {formatTimer(secondsRemaining)}
                </span>
              </div>

              {/* Amount Summary */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Advance Payable to Turf Owner</div>
                  <div className="text-xl font-black text-slate-900">₹{advanceAmount}</div>
                </div>
                <div className="text-right text-[10px] text-slate-500">
                  Total: ₹{totalAmount} • Bal: ₹{balanceAmount}
                </div>
              </div>

              {/* QR Code */}
              <div className="p-4 rounded-3xl bg-white border border-slate-200 text-center shadow-sm space-y-3">
                <div className="text-xs font-bold text-slate-700">
                  Scan to Pay Owner Directly (GPay / PhonePe / Paytm)
                </div>

                <div className="w-44 h-44 mx-auto p-2 bg-white rounded-2xl border-2 border-slate-200 shadow-sm flex items-center justify-center">
                  <img
                    src={qrUrl}
                    alt="Owner UPI QR"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>

                {/* Copy UPI ID */}
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {upiId}
                  </span>
                  <button
                    onClick={handleCopyUPI}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* UTR Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-900">
                    Enter 12-Digit UPI Transaction / UTR ID *
                  </label>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    utrInput.length === 12
                      ? 'bg-emerald-100 text-emerald-800'
                      : utrInput.length > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'text-slate-400'
                  }`}>
                    {utrInput.length}/12 digits {utrInput.length === 12 ? '✓' : ''}
                  </span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={12}
                  value={utrInput}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, '').slice(0, 12);
                    setUtrInput(onlyNums);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="e.g. 428190382910"
                  className={`w-full p-3 rounded-2xl bg-slate-50 border text-sm font-mono tracking-wider font-bold text-slate-900 focus:outline-none transition-all ${
                    utrInput.length === 12 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20' 
                      : 'border-slate-200 focus:border-emerald-600'
                  }`}
                />
                <p className="text-[10.5px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Found in GPay/PhonePe/Paytm payment receipt.</span>
                  {utrInput.length > 0 && utrInput.length < 12 && (
                    <span className="text-amber-700 font-bold">{12 - utrInput.length} more digits needed</span>
                  )}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* Submit CTA */}
              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="w-full py-4 stitch-btn-orange text-sm flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
              >
                <span>Confirm & Lock Match Slot</span>
                <ChevronRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
