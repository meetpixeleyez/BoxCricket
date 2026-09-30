"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Star, 
  MapPin, 
  Phone, 
  Map, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Users, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Info
} from 'lucide-react';
import { SlotPickerModal } from '@/components/SlotPickerModal';
import { BookingCheckoutModal } from '@/components/BookingCheckoutModal';
import { Box } from '@/types';

export default function GroundDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { grounds } = useApp();

  const ground = grounds.find((g) => g.id === id) || grounds[0];

  const [selectedBox, setSelectedBox] = useState<Box>(ground.boxes[0]);
  const [isSlotPickerOpen, setIsSlotPickerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  const handleOpenSlots = (box?: Box) => {
    if (box) setSelectedBox(box);
    setIsSlotPickerOpen(true);
  };

  const handleSlotConfirm = (details: any) => {
    setBookingDetails(details);
    setIsSlotPickerOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="pb-28">
      
      {/* 1. Hero Turf Image Carousel Header */}
      <div className="relative h-64 w-full bg-slate-900">
        <img
          src={ground.images[0] || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800"}
          alt={ground.name}
          className="w-full h-full object-cover"
        />
        
        {/* Verified Badge */}
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-emerald-800 font-extrabold text-xs flex items-center space-x-1.5 shadow-md">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified Turf</span>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 font-extrabold text-xs flex items-center space-x-1 shadow-md">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{ground.avgRating}</span>
          <span className="text-slate-400 font-normal">({ground.totalReviews})</span>
        </div>

        {/* Location Tag */}
        <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white font-bold text-xs">
          {ground.area}, Surat
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 right-4 flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-white" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
        </div>
      </div>

      <div className="p-4 space-y-5">
        
        {/* 2. Ground Title & Location */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {ground.name}
          </h1>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{ground.addressLine} • 1.8 km</span>
          </div>
        </div>

        {/* 3. Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ground.name + ' ' + ground.area + ' Surat')}`}
            target="_blank"
            rel="noreferrer"
            className="py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center space-x-2 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Map className="w-4 h-4 text-emerald-700" />
            <span>Open in Maps</span>
          </a>

          <a
            href={`tel:${ground.phone}`}
            className="py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center space-x-2 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Phone className="w-4 h-4 text-emerald-700" />
            <span>Call Owner</span>
          </a>
        </div>

        {/* 4. Pitch & Turf Specs */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-black text-slate-900">Pitch & Turf Specs</h3>
            <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
              TOURNAMENT READY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            
            <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
              <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xs mb-1">
                📐
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Pitch Dimensions</div>
              <div className="text-sm font-black text-slate-900">60 × 40 ft</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs mb-1">
                🌿
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Turf Surface</div>
              <div className="text-sm font-black text-slate-900">Monofilament Pro</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
              <div className="w-7 h-7 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center text-xs mb-1">
                🏏
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Equipment Provided</div>
              <div className="text-sm font-black text-slate-900">Bats & Stumps (Free)</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
              <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xs mb-1">
                ☀️
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Illumination</div>
              <div className="text-sm font-black text-slate-900">Pro LED Floodlights</div>
            </div>

          </div>
        </div>

        {/* 5. Ground Amenities */}
        <div>
          <h3 className="text-sm font-black text-slate-900 mb-2.5">Ground Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: '🅿', label: 'Free Parking' },
              { icon: '☕', label: 'Water & Snacks' },
              { icon: '🚻', label: 'Clean Washrooms' },
              { icon: '🛖', label: 'Covered Dugout' },
              { icon: '🕸️', label: '360° Netting' },
              { icon: '📢', label: 'Sound System' },
            ].map((amenity, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-sm"
              >
                <span>{amenity.icon}</span>
                <span>{amenity.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Available Boxes */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-black text-slate-900">Available Boxes</h3>
            <span className="text-[11px] text-slate-400 font-medium">
              {ground.boxes.length} pitches on site
            </span>
          </div>

          <div className="space-y-3">
            {ground.boxes.map((box, idx) => (
              <div
                key={box.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 font-black text-base flex items-center justify-center border border-emerald-200">
                      {box.name.charAt(box.name.length - 1)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-black text-slate-900">{box.name}</span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-bold text-blue-700">
                          {idx === 0 ? 'Fast Pitch' : 'High Ceiling'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {box.type === 'THREE_SIXTY' ? '360° Net Turf' : 'Open Box'} • Ideal for {box.maxPlayers / 2}v{box.maxPlayers / 2}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-emerald-800">
                      ₹{box.basePrice}<span className="text-[10px] font-normal text-slate-400">/hr</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenSlots(box)}
                  className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>View Slots for {box.name}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Location & Traffic Map */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black text-slate-900">Location</h3>
            <span className="text-xs text-slate-500">Opposite Green City, {ground.area}</span>
          </div>

          <div className="h-32 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ground.name + ' ' + ground.area + ' Surat')}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-emerald-800 font-bold text-xs flex items-center space-x-2 shadow-sm hover:bg-slate-50 transition-all"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Tap to get live traffic directions</span>
            </a>
          </div>
        </div>

        {/* 8. Cancellation Policy */}
        <div>
          <h3 className="text-sm font-black text-slate-900 mb-2.5">Cancellation Policy</h3>
          
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-700">
              <Info className="w-4 h-4 text-amber-600" />
              <span>Tiered Refund Structure</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-base font-black text-emerald-700">30%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">&gt;12 hrs prior</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-base font-black text-blue-700">20%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">3 - 12 hrs</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-base font-black text-rose-700">0%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">&lt;3 hrs prior</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Refunds reflect directly to your source UPI within 2 hours of slot cancellation.
            </p>
          </div>
        </div>

        {/* 9. Surat Cricketers Reviews */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-black text-slate-900">Surat Cricketers Reviews</h3>
            <span className="flex items-center text-xs font-bold text-slate-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
              {ground.avgRating}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-800 font-bold text-xs flex items-center justify-center border border-blue-200">
                  SV
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Smit V. (Varachha Strikers)</div>
                  <div className="text-[10px] text-slate-400">Played 2 days ago</div>
                </div>
              </div>
              <div className="flex text-amber-400 text-xs">
                ★★★★★
              </div>
            </div>
            <p className="text-xs text-slate-600 italic leading-relaxed pt-1">
              "Best bounce in Adajan! Good lighting for night matches and pitch speed is uniform. Dugout fan kept our squad cool."
            </p>
          </div>
        </div>

      </div>

      {/* 10. Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between z-40 shadow-2xl safe-area-bottom">
        <div>
          <div className="text-[10px] text-slate-400 font-medium">Starting from</div>
          <div className="text-lg font-black text-slate-900">
            ₹{ground.boxes[0]?.basePrice || 800} <span className="text-xs font-normal text-slate-400">/hour</span>
          </div>
        </div>

        <button
          onClick={() => handleOpenSlots()}
          className="px-6 py-3.5 stitch-btn-orange text-sm flex items-center space-x-2 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Select Date & Book</span>
        </button>
      </div>

      {/* Slot Picker Modal */}
      <SlotPickerModal
        isOpen={isSlotPickerOpen}
        onClose={() => setIsSlotPickerOpen(false)}
        ground={ground}
        box={selectedBox}
        onConfirm={handleSlotConfirm}
      />

      {/* Booking Checkout Modal */}
      {bookingDetails && (
        <BookingCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          ground={ground}
          box={selectedBox}
          bookingDetails={bookingDetails}
        />
      )}

    </div>
  );
}
