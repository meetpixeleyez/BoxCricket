"use client";

import React, { useState, useMemo } from 'react';
import { 
  X, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  RotateCcw, 
  Info,
  Calendar,
  MapPin,
  Sparkles
} from 'lucide-react';
import { Booking } from '@/types';
import { useApp } from '@/context/AppContext';
import { formatSlotTimeRange, formatDateDisplay } from '@/lib/dateUtils';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSuccess?: () => void;
}

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSuccess
}) => {
  const { cancelBooking } = useApp();

  const [selectedReason, setSelectedReason] = useState('Team members unavailable');
  const [customReason, setCustomReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancellationResult, setCancellationResult] = useState<{ refundAmount: number; refundPercent: number } | null>(null);

  // Cancellation reasons
  const reasons = [
    '👥 Team members unavailable',
    '⏰ Timing / Schedule conflict',
    '🌧️ Bad weather / Rain expected',
    '🎯 Booked wrong turf / date',
    '✏️ Other reason'
  ];

  // Calculate refund preview based on policy
  const refundPreview = useMemo(() => {
    if (!booking) return { refundAmount: 0, refundPercent: 100, diffHours: 24 };

    try {
      const matchDateTime = new Date(`${booking.date}T${booking.startTime}:00`);
      const now = new Date();
      const diffHours = (matchDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      let refundPercent = 100; // Default to 100% if > 4 hours
      const sortedTiers = [...(booking.refundPolicySnapshot || [
        { hoursBefore: 12, refundPercent: 100 },
        { hoursBefore: 4, refundPercent: 100 },
        { hoursBefore: 0, refundPercent: 0 }
      ])].sort((a, b) => b.hoursBefore - a.hoursBefore);

      for (const tier of sortedTiers) {
        if (diffHours >= tier.hoursBefore) {
          refundPercent = tier.refundPercent;
          break;
        }
      }

      const refundAmount = Math.round(((booking.advanceAmount || 0) * refundPercent) / 100);
      return { refundAmount, refundPercent, diffHours: Math.max(0, Math.round(diffHours)) };
    } catch (e) {
      return { refundAmount: booking.advanceAmount || 0, refundPercent: 100, diffHours: 12 };
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  const handleConfirmCancel = () => {
    setIsProcessing(true);
    const finalReason = selectedReason.includes('Other') && customReason.trim() 
      ? customReason.trim() 
      : selectedReason;

    setTimeout(() => {
      const res = cancelBooking(booking.id, finalReason);
      setCancellationResult(res);
      setIsProcessing(false);
      if (onSuccess) {
        onSuccess();
      }
    }, 400);
  };

  const handleClose = () => {
    setCancellationResult(null);
    setSelectedReason('Team members unavailable');
    setCustomReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      
      {/* Backdrop */}
      <div className="absolute inset-0 z-0" onClick={handleClose} />

      {/* Modal Container */}
      <div className="w-full max-w-[440px] bg-white text-slate-900 rounded-t-[32px] sm:rounded-3xl shadow-2xl relative z-10 overflow-hidden max-h-[92vh] flex flex-col border border-slate-100 animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-20">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-tight">
                {cancellationResult ? 'Booking Cancelled' : 'Cancel Match Booking'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                ID #{booking.id}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 no-scrollbar">
          
          {cancellationResult ? (
            /* SUCCESS CANCELLATION SCREEN */
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Cancellation Successful
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Your slot has been released back to the turf.
                </p>
              </div>

              {/* Refund Summary Card */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-left space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span>Refund Initiated:</span>
                  <span className="text-base font-black text-emerald-700">₹{cancellationResult.refundAmount}</span>
                </div>
                <div className="text-[11px] text-emerald-800">
                  {cancellationResult.refundPercent}% refund ({cancellationResult.refundPercent}% refund policy applied).
                </div>
                <div className="pt-2 border-t border-emerald-200 text-[10.5px] text-emerald-700 font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Amount will be refunded back to your original UPI account.</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-md hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close & View Bookings
              </button>
            </div>
          ) : (
            /* CANCELLATION CONFIRMATION FORM */
            <div className="space-y-4">
              
              {/* Match Card Snapshot */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900">
                      {booking.groundName}
                    </h4>
                    <p className="text-[11px] font-bold text-emerald-800 mt-0.5">
                      {booking.boxName}
                    </p>
                  </div>
                  <span className="text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                    Total: ₹{booking.totalAmount}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-slate-700 font-bold pt-1.5 border-t border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{formatDateDisplay(booking.date)} • {formatSlotTimeRange(booking.startTime, booking.endTime)}</span>
                </div>
              </div>

              {/* Refund Policy Calculation Box */}
              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-900 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    Refund Amount to UPI
                  </span>
                  <span className="text-base font-black text-blue-950">
                    ₹{refundPreview.refundAmount}
                  </span>
                </div>

                <div className="text-[11px] text-blue-800 leading-tight">
                  You paid <strong>₹{booking.advanceAmount} advance</strong>. Based on venue cancellation rules ({refundPreview.diffHours}h before start), you are eligible for <strong>{refundPreview.refundPercent}% refund (₹{refundPreview.refundAmount})</strong>.
                </div>
              </div>

              {/* Reason Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2">
                  Select Reason for Cancellation *
                </label>
                
                <div className="space-y-1.5">
                  {reasons.map((r) => {
                    const isSelected = selectedReason === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedReason(r)}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50/70 border-rose-400 text-rose-950 font-bold ring-2 ring-rose-300/30'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{r}</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-rose-600 bg-rose-600' : 'border-slate-300'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedReason.includes('Other') && (
                  <div className="mt-2 animate-in fade-in">
                    <textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Please specify reason..."
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                      rows={2}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Keep Booking
                </button>

                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs shadow-md shadow-rose-600/30 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <span>Processing...</span>
                  ) : (
                    <span>Cancel & Refund ₹{refundPreview.refundAmount}</span>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
