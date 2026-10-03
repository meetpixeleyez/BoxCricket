"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronLeft,
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Info,
  Zap,
  X
} from 'lucide-react';
import { SlotPickerModal } from '@/components/SlotPickerModal';
import { BookingCheckoutModal } from '@/components/BookingCheckoutModal';
import { GroundMiniMap } from '@/components/GroundMiniMap';
import { Box, TurfType } from '@/types';
import { normalizeAmenity } from '@/lib/mockData';

// Map registered amenities to visual icons with intelligent fallbacks
const AMENITY_ICON_MAP: Record<string, string> = {
  'Night Floodlights': '💡',
  'Air-Cooled Dugout': '❄️',
  'Dedicated Car & Bike Parking': '🚗',
  'Dedicated Car Parking': '🚗',
  'Chilled RO Drinking Water': '💧',
  'RO Drinking Water': '💧',
  'Changing Rooms & Clean Restroom': '🚻',
  'Changing Rooms': '🚻',
  'Live Scoreboard Screen': '📺',
  'Bat & Ball Rental Included': '🏏',
  'Canteen & Refreshments': '☕',
  'Power Generator Backup': '⚡',
  'First Aid Kit': '🩹',
};

const getAmenityIcon = (name: string): string => {
  if (AMENITY_ICON_MAP[name]) return AMENITY_ICON_MAP[name];
  const lower = name.toLowerCase();
  if (lower.includes('floodlight') || lower.includes('light')) return '💡';
  if (lower.includes('water') || lower.includes('ro')) return '💧';
  if (lower.includes('park')) return '🚗';
  if (lower.includes('room') || lower.includes('washroom') || lower.includes('restroom')) return '🚻';
  if (lower.includes('score') || lower.includes('screen') || lower.includes('tv')) return '📺';
  if (lower.includes('bat') || lower.includes('ball') || lower.includes('kit') || lower.includes('equipment')) return '🏏';
  if (lower.includes('dugout') || lower.includes('pavilion') || lower.includes('seat')) return '❄️';
  if (lower.includes('canteen') || lower.includes('snack') || lower.includes('refresh')) return '☕';
  if (lower.includes('power') || lower.includes('generator')) return '⚡';
  if (lower.includes('aid') || lower.includes('medical') || lower.includes('safety')) return '🩹';
  return '✓';
};

// Format 24-hour time string ("06:00", "00:00", "02:00") into 12-hour AM/PM format ("06:00 AM", "12:00 AM", "02:00 AM")
const formatTimeAMPM = (timeStr?: string): string => {
  if (!timeStr) return '';
  const clean = timeStr.trim();
  const parts = clean.split(':');
  if (parts.length < 2) return timeStr;
  
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1] || '00';
  if (isNaN(hours)) return timeStr;
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  
  const paddedHours = hours < 10 ? `0${hours}` : `${hours}`;
  return `${paddedHours}:${minutes} ${ampm}`;
};

export default function GroundDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { grounds } = useApp();

  const ground = grounds.find((g) => g.id === id) || grounds[0];

  const [selectedBox, setSelectedBox] = useState<Box>(ground.boxes[0]);
  const [isSlotPickerOpen, setIsSlotPickerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // Group boxes under their Turf Type Tag (e.g. 360° Turf Arena -> Box 1, Box 2 | Open Sky Box -> Box 3, Box 4)
  const groupedBoxes = useMemo(() => {
    const groups: Record<string, { type: TurfType; title: string; icon: string; desc: string; boxes: Box[] }> = {};

    ground.boxes.forEach((box) => {
      const typeKey = box.type || 'THREE_SIXTY';
      if (!groups[typeKey]) {
        let title = '360° Net Turf Arena';
        let icon = '🕸️';
        let desc = 'Full 360° enclosed heavy-duty netting arena for maximum action';
        if (typeKey === 'OPEN') {
          title = 'Open Sky Box';
          icon = '🌤️';
          desc = 'Open-to-sky spacious box cricket pitch with natural airflow';
        } else if (typeKey === 'CLOSED') {
          title = 'Covered Roof Turf';
          icon = '🏠';
          desc = 'All-weather indoor covered roof turf arena with ventilation';
        }
        groups[typeKey] = {
          type: typeKey,
          title,
          icon,
          desc,
          boxes: [],
        };
      }
      groups[typeKey].boxes.push(box);
    });

    return Object.values(groups);
  }, [ground.boxes]);

  // Hero Image Carousel State
  const images = (ground?.images && ground.images.length > 0)
    ? ground.images
    : ["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800"];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Auto-scrolling image carousel every 3.5 seconds
  useEffect(() => {
    if (!isAutoScrolling || images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isAutoScrolling, images.length]);

  // Keyboard navigation for image lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      else if (e.key === 'ArrowLeft') handlePrevImage();
      else if (e.key === 'ArrowRight') handleNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, images.length]);

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setIsAutoScrolling(false);
    setTimeout(() => setIsAutoScrolling(true), 6000);
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setIsAutoScrolling(false);
    setTimeout(() => setIsAutoScrolling(true), 6000);
  };

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsAutoScrolling(false);
    setTimeout(() => setIsAutoScrolling(true), 6000);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setIsAutoScrolling(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchEndX !== null) {
      const diff = touchStartX - touchEndX;
      if (diff > 45) {
        handleNextImage();
      } else if (diff < -45) {
        handlePrevImage();
      }
    }
    setTouchStartX(null);
    setTouchEndX(null);
    setTimeout(() => setIsAutoScrolling(true), 6000);
  };

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
      <div 
        className="relative h-64 sm:h-72 w-full bg-slate-900 group select-none overflow-hidden cursor-pointer"
        onMouseEnter={() => setIsAutoScrolling(false)}
        onMouseLeave={() => setIsAutoScrolling(true)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setIsLightboxOpen(true)}
      >
        {/* Layered Images with smooth cross-fade animation */}
        <div className="relative w-full h-full">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${ground.name} - Photo ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                idx === currentImageIndex 
                  ? 'opacity-100 scale-100 z-10' 
                  : 'opacity-0 scale-105 pointer-events-none z-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 z-10 pointer-events-none" />
        </div>
        
        {/* Verified Badge */}
        <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-emerald-800 font-extrabold text-xs flex items-center space-x-1.5 shadow-md">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified Turf</span>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 font-extrabold text-xs flex items-center space-x-1 shadow-md">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{ground.avgRating}</span>
          <span className="text-slate-400 font-normal">({ground.totalReviews})</span>
        </div>

        {/* Location Tag */}
        <div className="absolute bottom-4 left-4 z-20 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white font-bold text-xs flex items-center space-x-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>{ground.area}, Surat</span>
        </div>

        {/* Previous Image Chevron */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrevImage}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 backdrop-blur-sm transition-all cursor-pointer shadow-md opacity-0 group-hover:opacity-100"
            aria-label="Previous photo"
            title="Previous Photo"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Next Image Chevron */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNextImage}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 backdrop-blur-sm transition-all cursor-pointer shadow-md opacity-0 group-hover:opacity-100"
            aria-label="Next photo"
            title="Next Photo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Working Clickable Dots Indicator (Clean . . .) */}
        {images.length > 1 && (
          <div 
            className="absolute bottom-4 right-4 z-20 flex items-center space-x-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/20 shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleDotClick(i)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  i === currentImageIndex
                    ? 'bg-white scale-125 shadow-sm ring-1 ring-white/60'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${i + 1}`}
                title={`View photo ${i + 1}`}
              />
            ))}
          </div>
        )}
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
            href={
              ground.lat && ground.lng && !(ground.lat === 21.1702 && ground.lng === 72.8311)
                ? `https://www.google.com/maps?q=${ground.lat},${ground.lng}&z=17`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ground.name + ' ' + ground.area + ' Surat')}`
            }
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

        {/* 4. Available Pitches Grouped by Turf Type */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
              <div>
                <h3 className="text-sm font-black text-slate-900">Available Pitches & Turf Types</h3>
                <p className="text-[10px] text-slate-400">
                  {ground.boxes.length} {ground.boxes.length === 1 ? 'Pitch on site' : 'Pitches on site'} across {groupedBoxes.length} {groupedBoxes.length === 1 ? 'Turf Type' : 'Turf Types'}
                </p>
              </div>
            </div>
          </div>

          {/* Grouped Turf Types List */}
          <div className="space-y-4">
            {groupedBoxes.map((group) => (
              <div
                key={group.type}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-3"
              >
                {/* Turf Type Category Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-800 text-lg flex items-center justify-center border border-emerald-200/80 shadow-2xs flex-shrink-0">
                      {group.icon}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="text-xs font-black text-slate-900">
                          {group.title}
                        </span>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {group.boxes.length} {group.boxes.length === 1 ? 'Pitch' : 'Pitches'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{group.desc}</p>
                    </div>
                  </div>
                </div>

                {/* Individual Pitches in this category */}
                <div className="space-y-2.5">
                  {group.boxes.map((box, boxIdx) => (
                    <div
                      key={box.id}
                      className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start space-x-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-emerald-800 font-black text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                            {box.name.replace(/\D/g, '') ? `#${box.name.replace(/\D/g, '')}` : `#${boxIdx + 1}`}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-black text-slate-900 truncate">
                                {box.name}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-white text-[9px] font-mono font-bold text-slate-700 border border-slate-200">
                                {box.widthFt} × {box.heightFt} ft
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-0.5">
                              <span>👥 Ideal {box.maxPlayers / 2}v{box.maxPlayers / 2} ({box.maxPlayers} Players)</span>
                              <span>•</span>
                              <span>⏰ {formatTimeAMPM(box.schedules?.[0]?.openTime || '06:00')} - {formatTimeAMPM(box.schedules?.[0]?.closeTime || '02:00')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-black text-emerald-800">
                            ₹{box.basePrice}<span className="text-[9px] font-normal text-slate-400">/hr</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button for this specific Pitch */}
                      <button
                        type="button"
                        onClick={() => handleOpenSlots(box)}
                        className="w-full py-2.5 rounded-xl bg-[#065f46] hover:bg-[#047857] active:scale-98 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>View Slots for {box.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* 5. Ground Amenities (Dynamic from Owner Registration) */}
        {(() => {
          const displayAmenities = Array.from(
            new Set((ground.amenities || []).map(normalizeAmenity).filter(Boolean))
          );

          return (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-black text-slate-900">Ground Amenities</h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {displayAmenities.length} features registered
                </span>
              </div>

              {displayAmenities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {displayAmenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-sm"
                    >
                      <span>{getAmenityIcon(amenity)}</span>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-white border border-slate-100 text-xs text-slate-400 font-medium">
                  No specific amenities registered by turf owner.
                </div>
              )}
            </div>
          );
        })()}

        {/* 7. Location & Traffic Map */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <h3 className="text-sm font-black text-slate-900">Ground Location</h3>
              <p className="text-[11px] text-slate-500 font-medium">{ground.addressLine}, {ground.area}</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Pin
            </span>
          </div>

          <GroundMiniMap
            lat={ground.lat}
            lng={ground.lng}
            groundName={ground.name}
            addressLine={ground.addressLine}
            area={ground.area}
            height="h-60"
          />
        </div>

        {/* 8. Cancellation Policy (From Registration Step 5) */}
        <div>
          <h3 className="text-sm font-black text-slate-900 mb-2.5">Cancellation Policy</h3>
          
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
              <Info className="w-4 h-4 text-emerald-700" />
              <span>Owner Refund Policy</span>
            </div>

            {ground.paymentSettings?.refundTiers && ground.paymentSettings.refundTiers.length > 0 ? (
              <div className={`grid gap-2 ${ground.paymentSettings.refundTiers.length <= 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                {ground.paymentSettings.refundTiers.map((tier, tIdx) => (
                  <div key={tIdx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div className="text-base font-black text-emerald-700">{tier.refundPercent}%</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {tier.hoursBefore === 0 ? '< Next slot' : `>${tier.hoursBefore}h prior`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500">Non-refundable policy configured by turf owner.</div>
            )}

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

      {/* Fullscreen Photo Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-lg w-full flex flex-col items-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between text-white px-1">
              <span className="text-xs font-bold text-slate-300">
                {ground.name}
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Preview with Nav */}
            <div className="relative w-full flex items-center justify-center">
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 backdrop-blur-sm transition-all cursor-pointer shadow-lg"
                  aria-label="Previous Photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              <div className="max-h-[70vh] max-w-full overflow-hidden rounded-3xl border border-white/15 bg-black/40 flex items-center justify-center shadow-2xl">
                <img
                  src={images[currentImageIndex]}
                  alt={`${ground.name} Photo ${currentImageIndex + 1}`}
                  className="max-h-[70vh] w-auto max-w-full object-contain select-none"
                />
              </div>

              {images.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 backdrop-blur-sm transition-all cursor-pointer shadow-lg"
                  aria-label="Next Photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Thumbnail dots in lightbox (. . .) */}
            {images.length > 1 && (
              <div className="flex items-center space-x-1.5 pt-1">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleDotClick(i)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      i === currentImageIndex
                        ? 'bg-emerald-400 scale-125 shadow-sm'
                        : 'bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Go to photo ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
