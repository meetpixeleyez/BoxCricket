"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Ground, Box } from '@/types';
import { useApp } from '@/context/AppContext';
import { 
  Star, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Users, 
  Phone,
  CalendarCheck,
  Calendar
} from 'lucide-react';
import { SlotPickerModal } from './SlotPickerModal';
import { BookingCheckoutModal } from './BookingCheckoutModal';

interface GroundCardProps {
  ground: Ground;
}

export const GroundCard: React.FC<GroundCardProps> = ({ ground }) => {
  const { t } = useApp();
  const [showSlotPicker, setShowSlotPicker] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  const minPrice = Math.min(...ground.boxes.map(b => b.basePrice));
  const primaryImage = ground.images[0] || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800';

  const handleConfirmSlot = (details: any) => {
    setBookingDetails(details);
    setShowSlotPicker(false);
    setShowCheckout(true);
  };

  return (
    <>
      <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm flex flex-col group">
        
        {/* Image & Badges */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-900">
          <img
            src={primaryImage}
            alt={ground.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Rating Badge */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 font-extrabold text-xs flex items-center space-x-1 shadow-md">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{ground.avgRating}</span>
            <span className="text-slate-400 font-normal">({ground.totalReviews})</span>
          </div>

          {/* Area Tag */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-xs shadow-md">
            {ground.area} • 1.8 km
          </div>

          {/* Open Status */}
          <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-300 font-bold text-[11px] flex items-center space-x-1.5 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Open for play</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <Link href={`/ground/${ground.id}`}>
                  <h3 className="text-base font-black text-slate-900 hover:text-emerald-700 transition-colors">
                    {ground.name}
                  </h3>
                </Link>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                  {ground.addressLine}
                </p>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-emerald-800">
                  ₹{minPrice}<span className="text-[10px] font-normal text-slate-400">/hr</span>
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-700">
                360° Net
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-700">
                Floodlights
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-700">
                Open Box
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <Link
              href={`/ground/${ground.id}`}
              className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center transition-colors"
            >
              View Details
            </Link>

            <button
              onClick={() => setShowSlotPicker(true)}
              className="py-2.5 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Slot</span>
            </button>
          </div>

        </div>

      </div>

      {/* Slot Picker Modal */}
      {showSlotPicker && (
        <SlotPickerModal
          isOpen={showSlotPicker}
          ground={ground}
          box={ground.boxes[0]}
          onClose={() => setShowSlotPicker(false)}
          onConfirm={handleConfirmSlot}
        />
      )}

      {/* Checkout Modal */}
      {showCheckout && bookingDetails && (
        <BookingCheckoutModal
          isOpen={showCheckout}
          ground={ground}
          box={ground.boxes[0]}
          bookingDetails={bookingDetails}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </>
  );
};
