"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  Search, 
  SlidersHorizontal, 
  Navigation, 
  MapPin, 
  Star, 
  ChevronRight, 
  Zap, 
  Trophy, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2,
  Sparkles,
  X,
  RotateCcw,
  Compass,
  Check,
  Filter
} from 'lucide-react';
import { SlotPickerModal } from '@/components/SlotPickerModal';
import { BookingCheckoutModal } from '@/components/BookingCheckoutModal';
import { HomeMatchmakingCarousel } from '@/components/HomeMatchmakingCarousel';
import { Ground, Box, TurfType } from '@/types';
import { AMENITY_OPTIONS, normalizeAmenity } from '@/lib/mockData';

// Haversine formula to calculate accurate distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 1.8;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

const TURF_TYPE_FILTERS = [
  { key: 'ALL', label: 'All Types', icon: '🏏' },
  { key: 'THREE_SIXTY', label: '360° Net Turf', icon: '🕸️' },
  { key: 'CLOSED', label: 'Covered Roof Turf', icon: '🏠' },
  { key: 'OPEN', label: 'Open Sky Box', icon: '🌤️' },
];

export default function HomePage() {
  const { grounds, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('All Surat');

  // ── Radius / Distance State ──────────────────────────────────────────────
  const [selectedRadius, setSelectedRadius] = useState<number | null>(5); // 5km default
  const [showRadiusModal, setShowRadiusModal] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: 21.2450, // Default Surat Mota Varachha
    lng: 72.8890,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('Surat Center (Default)');

  // ── Filter Modal State ───────────────────────────────────────────────────
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTurfType, setSelectedTurfType] = useState<string>('ALL');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'DISTANCE' | 'RATING' | 'PRICE_LOW' | 'PRICE_HIGH'>('DISTANCE');

  // Booking Modal Flow State
  const [selectedGround, setSelectedGround] = useState<Ground | null>(null);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [isSlotPickerOpen, setIsSlotPickerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // ── 1. Grounds with calculated distance from user ────────────────────────
  const groundsWithDistance = useMemo(() => {
    return grounds.map((g) => {
      const distance = calculateDistanceKm(
        userCoords.lat,
        userCoords.lng,
        g.lat || 21.2450,
        g.lng || 72.8890
      );
      return { ...g, distanceKm: distance };
    });
  }, [grounds, userCoords]);

  // Grounds filtered by active radius distance
  const groundsInRadius = useMemo(() => {
    return groundsWithDistance.filter((g) => {
      if (selectedRadius === null) return true;
      return g.distanceKm <= selectedRadius;
    });
  }, [groundsWithDistance, selectedRadius]);

  // ── 2. Extract ONLY Localities that have available boxes WITHIN active radius ───
  const existingLocalities = useMemo(() => {
    const areaMap = new Map<string, number>();
    groundsInRadius.forEach((g) => {
      if (g.area && g.area.trim()) {
        const key = g.area.trim();
        areaMap.set(key, (areaMap.get(key) || 0) + 1);
      }
    });
    return Array.from(areaMap.entries()).map(([name, count]) => ({ name, count }));
  }, [groundsInRadius]);

  // Auto-reset selectedArea if it falls outside the active radius
  React.useEffect(() => {
    if (selectedArea !== 'All Surat') {
      const exists = existingLocalities.some(
        (loc) => loc.name.toLowerCase() === selectedArea.toLowerCase()
      );
      if (!exists) {
        setSelectedArea('All Surat');
      }
    }
  }, [existingLocalities, selectedArea]);

  // ── 3. Request User GPS Location ─────────────────────────────────────────
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationStatus('Live GPS Detected 📍');
        setIsLocating(false);
      },
      (err) => {
        console.warn('GPS location error:', err.message);
        setLocationStatus('GPS unavailable, using Surat default');
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // ── 4. Filter and Sort Grounds ───────────────────────────────────────────
  const filteredGrounds = useMemo(() => {
    return groundsWithDistance
      .filter((g) => {
        // Search query
        const matchesSearch =
          !searchQuery.trim() ||
          g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.addressLine.toLowerCase().includes(searchQuery.toLowerCase());

        // Area filter
        const matchesArea =
          selectedArea === 'All Surat' ||
          g.area.toLowerCase() === selectedArea.toLowerCase();

        // Radius filter
        const matchesRadius =
          selectedRadius === null || g.distanceKm <= selectedRadius;

        // Turf Type filter (supports ALL, THREE_SIXTY, CLOSED, OPEN)
        const matchesType =
          selectedTurfType === 'ALL' ||
          g.boxes.some((b) => b.type === selectedTurfType);

        // Amenities filter (normalized against AMENITY_OPTIONS)
        const matchesAmenities =
          selectedAmenities.length === 0 ||
          selectedAmenities.every((amenityId) =>
            g.amenities.some((a) => {
              const normA = normalizeAmenity(a).toLowerCase();
              const normFilter = normalizeAmenity(amenityId).toLowerCase();
              return normA === normFilter || a.toLowerCase().includes(amenityId.toLowerCase());
            })
          );

        return (
          matchesSearch &&
          matchesArea &&
          matchesRadius &&
          matchesType &&
          matchesAmenities
        );
      })
      .sort((a, b) => {
        if (sortBy === 'DISTANCE') return a.distanceKm - b.distanceKm;
        if (sortBy === 'RATING') return b.avgRating - a.avgRating;
        if (sortBy === 'PRICE_LOW') {
          const aPrice = Math.min(...a.boxes.map((b) => b.basePrice || 800));
          const bPrice = Math.min(...b.boxes.map((b) => b.basePrice || 800));
          return aPrice - bPrice;
        }
        if (sortBy === 'PRICE_HIGH') {
          const aPrice = Math.min(...a.boxes.map((b) => b.basePrice || 800));
          const bPrice = Math.min(...b.boxes.map((b) => b.basePrice || 800));
          return bPrice - aPrice;
        }
        return 0;
      });
  }, [
    grounds,
    searchQuery,
    selectedArea,
    selectedRadius,
    userCoords,
    selectedTurfType,
    selectedAmenities,
    sortBy,
  ]);

  // Count active filters (for badge)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedTurfType !== 'ALL') count++;
    if (selectedAmenities.length > 0) count += selectedAmenities.length;
    if (sortBy !== 'DISTANCE') count++;
    return count;
  }, [selectedTurfType, selectedAmenities, sortBy]);

  const resetAllFilters = () => {
    setSelectedTurfType('ALL');
    setSelectedAmenities([]);
    setSortBy('DISTANCE');
  };

  // Dynamic Section Title & Subtitle based on active filters
  const sectionTitle = useMemo(() => {
    if (searchQuery.trim()) {
      return `Search Results for "${searchQuery.trim()}"`;
    }
    if (selectedArea !== 'All Surat') {
      return `Box Cricket in ${selectedArea}`;
    }
    if (selectedRadius !== null) {
      return `Nearby Box Cricket`;
    }
    return 'All Box Cricket in Surat';
  }, [searchQuery, selectedArea, selectedRadius]);

  const sectionSubtitle = useMemo(() => {
    if (searchQuery.trim()) {
      return `${filteredGrounds.length} matching grounds found`;
    }
    if (selectedArea !== 'All Surat') {
      return `Verified cricket turfs located in ${selectedArea}`;
    }
    if (selectedRadius !== null) {
      return `Within ${selectedRadius} km from your location`;
    }
    return 'All verified box cricket arenas across Surat';
  }, [searchQuery, selectedArea, selectedRadius, filteredGrounds.length]);

  const handleOpenBooking = (ground: Ground, box?: Box) => {
    setSelectedGround(ground);
    setSelectedBox(box || ground.boxes[0]);
    setIsSlotPickerOpen(true);
  };

  const handleSlotConfirm = (details: any) => {
    setBookingDetails(details);
    setIsSlotPickerOpen(false);
    setIsCheckoutOpen(true);
  };

  const getTurfTypeName = (type: TurfType) => {
    switch (type) {
      case 'THREE_SIXTY':
        return '360° Net Turf';
      case 'CLOSED':
        return 'Covered Roof Turf';
      case 'OPEN':
        return 'Open Sky Box';
      default:
        return 'Turf Box';
    }
  };

  return (
    <div className="space-y-4 px-4 pt-3 pb-8">
      
      {/* 1. Search Bar & Distance Filter */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 shadow-sm focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search turf, area, or team..."
            className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 text-xs px-1">
              ✕
            </button>
          )}
        </div>

        {/* Distance Range Pill Button */}
        <button 
          onClick={() => setShowRadiusModal(true)}
          className={`flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl text-xs font-black transition-all shadow-sm flex-shrink-0 cursor-pointer ${
            selectedRadius !== null 
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
              : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
          title="Change radius range"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
          <span>{selectedRadius !== null ? `${selectedRadius} km` : 'All km'}</span>
        </button>

        {/* Filter Button with Active Count Badge */}
        <button
          onClick={() => setShowFilterModal(true)}
          className={`relative p-2.5 rounded-2xl transition-all shadow-sm flex-shrink-0 cursor-pointer ${
            activeFiltersCount > 0
              ? 'bg-[#065f46] text-white border border-[#047857]'
              : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700'
          }`}
          title="Filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff6813] text-white text-[9px] font-black flex items-center justify-center shadow">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. Surat Area Horizontal Scroll Pills (ONLY from registered grounds) */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
        {/* All Surat Pill */}
        <button
          onClick={() => setSelectedArea('All Surat')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 flex-shrink-0 cursor-pointer ${
            selectedArea === 'All Surat'
              ? 'bg-[#065f46] text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>All Surat</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            selectedArea === 'All Surat' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-600'
          }`}>
            {groundsInRadius.length}
          </span>
        </button>

        {/* Dynamic Registered Locality Pills (Strictly inside selected radius) */}
        {existingLocalities.map((loc) => {
          const isSelected = selectedArea.toLowerCase() === loc.name.toLowerCase();
          return (
            <button
              key={loc.name}
              onClick={() => setSelectedArea(loc.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 flex-shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-[#065f46] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{loc.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {loc.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Quick Action Tiles */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Tile 1: Find Players */}
        <Link
          href="/find-players"
          className="p-3 rounded-2xl bg-[#fff7ed] border border-orange-100 text-left flex flex-col justify-between hover:shadow-md transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-100/90 flex items-center justify-center text-orange-700 mb-2 group-hover:scale-105 transition-transform">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 leading-tight">Find Players</div>
            <div className="text-[10px] text-orange-700 font-semibold mt-0.5">Join Local Match</div>
          </div>
        </Link>

        {/* Tile 2: Challenge */}
        <Link
          href="/teams"
          className="p-3 rounded-2xl bg-[#1e293b] text-white text-left flex flex-col justify-between hover:shadow-md transition-all group shadow-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-105 transition-transform">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-white leading-tight">Challenge</div>
            <div className="text-[10px] text-slate-300 font-medium mt-0.5">Team vs Team</div>
          </div>
        </Link>
      </div>

      {/* 4. Live Local Matchmaking Carousel Slider (Solo Players & Team Requirements) */}
      <HomeMatchmakingCarousel selectedArea={selectedArea} />

      {/* 5. Box Cricket Grounds Listing (Dynamic Contextual Title) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
            <div>
              <h3 className="text-sm font-black text-slate-900">{sectionTitle}</h3>
              <p className="text-[10px] text-slate-400">{sectionSubtitle}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[11px] font-black text-emerald-800 border border-emerald-200">
            {filteredGrounds.length} Grounds
          </span>
        </div>

        {/* Empty State */}
        {filteredGrounds.length === 0 ? (
          <div className="rounded-3xl bg-white border border-slate-200 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center text-xl mx-auto">
              📍
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">No Box Cricket Found</h4>
              <p className="text-xs text-slate-500 mt-1">
                Try increasing your radius range (e.g. 10 km) or select "All Surat".
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedRadius(null);
                  setSelectedArea('All Surat');
                  resetAllFilters();
                }}
                className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                Reset Filters & Show All
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGrounds.map((ground) => (
              <div key={ground.id} className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                
                {/* Photo & Badges */}
                <div className="relative h-44 w-full">
                  <img
                    src={ground.images[0] || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800"}
                    alt={ground.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Rating Badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 font-black text-xs flex items-center space-x-1 shadow-md">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{ground.avgRating}</span>
                    <span className="text-slate-400 font-normal">({ground.totalReviews})</span>
                  </div>

                  {/* Accurate Real Distance Badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white font-bold text-xs shadow-md flex items-center space-x-1">
                    <Navigation className="w-3 h-3 text-emerald-400" />
                    <span>{ground.area} • {ground.distanceKm} km</span>
                  </div>

                  {/* Open Status Tag */}
                  <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-emerald-950/85 backdrop-blur-md text-emerald-300 font-bold text-[11px] flex items-center space-x-1.5 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Open for play</span>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/ground/${ground.id}`}>
                        <h4 className="text-base font-black text-slate-900 hover:text-emerald-700 transition-colors">
                          {ground.name}
                        </h4>
                      </Link>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {ground.addressLine}, {ground.area}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-emerald-800">
                        ₹{ground.boxes[0]?.basePrice || 800}<span className="text-[10px] font-normal text-slate-400">/hr</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Tags based on ground's registered box types */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {Array.from(new Set(ground.boxes.map((b) => b.type))).map((type) => {
                      const tagLabel =
                        type === 'THREE_SIXTY'
                          ? '360° Net'
                          : type === 'CLOSED'
                          ? 'Covered Roof'
                          : 'Open Box';
                      return (
                        <span
                          key={type}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-700"
                        >
                          {tagLabel}
                        </span>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href={`/ground/${ground.id}`}
                      className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center transition-colors cursor-pointer"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleOpenBooking(ground)}
                      className="py-2.5 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Slot</span>
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. Need a Bowler Promo Banner */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 text-lg flex-shrink-0">
            🏏
          </div>
          <div>
            <div className="text-xs font-black text-slate-900">Need a 6th or 7th bowler?</div>
            <div className="text-[10px] text-slate-500">Post a request in under 30 seconds for your game.</div>
          </div>
        </div>

        <Link
          href="/find-players"
          className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 flex-shrink-0 shadow-sm"
        >
          Post Free
        </Link>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          RADIUS / DISTANCE RANGE MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showRadiusModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4 animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Navigation className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Select Distance Range</h3>
                  <p className="text-[10px] text-slate-500">{locationStatus}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRadiusModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* GPS Detection Action */}
            <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-900">Detect Current GPS Location</span>
              </div>
              <button
                onClick={handleDetectGPS}
                disabled={isLocating}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-[11px] font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1"
              >
                {isLocating ? (
                  <span>Locating...</span>
                ) : (
                  <>
                    <MapPin className="w-3 h-3" />
                    <span>Detect</span>
                  </>
                )}
              </button>
            </div>

            {/* Preset Distance Range Buttons */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Maximum Radius from You:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { value: 3, label: '3 km', desc: 'Walking / Nearby' },
                  { value: 5, label: '5 km', desc: 'Popular / Quick Drive' },
                  { value: 10, label: '10 km', desc: 'Surat City Area' },
                  { value: 15, label: '15 km', desc: 'Greater Surat' },
                  { value: 25, label: '25 km', desc: 'Outskirts & Highway' },
                  { value: null, label: 'All Surat', desc: 'No Distance Limit' },
                ].map((item) => {
                  const isSelected = selectedRadius === item.value;
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        setSelectedRadius(item.value);
                        setShowRadiusModal(false);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-slate-900">{item.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Close / Apply */}
            <div className="pt-2">
              <button
                onClick={() => setShowRadiusModal(false)}
                className="w-full py-3 bg-[#065f46] hover:bg-[#047857] text-white font-bold text-xs rounded-2xl transition-all shadow-md"
              >
                Apply Range ({selectedRadius !== null ? `${selectedRadius} km` : 'All Surat'})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CLEAN & COMPREHENSIVE FILTER MODAL (Synced with Global Enums)
      ══════════════════════════════════════════════════════════════════════ */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4 animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Filter className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Filter Box Cricket</h3>
                  <p className="text-[10px] text-slate-500">Find the perfect pitch in Surat</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFilterModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Sort By */}
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1.5">
                Sort By <span className="text-[10px] font-normal text-slate-400">ક્રમ ગોઠવો</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'DISTANCE', label: '📍 Nearest Distance' },
                  { key: 'RATING', label: '⭐ Highest Rated' },
                  { key: 'PRICE_LOW', label: '💰 Price: Low to High' },
                  { key: 'PRICE_HIGH', label: '💎 Price: High to Low' },
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSortBy(s.key as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                      sortBy === s.key
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Turf / Box Type (All 3 Enum Types: 360°, Covered, Open) */}
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1.5">
                Turf Type <span className="text-[10px] font-normal text-slate-400">ટર્ફ પ્રકાર</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TURF_TYPE_FILTERS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setSelectedTurfType(t.key)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      selectedTurfType === t.key
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span>{t.icon}</span>
                      <span className="truncate">{t.label}</span>
                    </div>
                    {selectedTurfType === t.key && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3] flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Must-Have Amenities (100% Synced with Global Catalog AMENITY_OPTIONS) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-900">
                  Must-Have Amenities <span className="text-[10px] font-normal text-slate-400">સુવિધાઓ ({AMENITY_OPTIONS.length})</span>
                </label>
                {selectedAmenities.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedAmenities([])}
                    className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {AMENITY_OPTIONS.map((am) => {
                  const isChecked = selectedAmenities.includes(am.id);
                  return (
                    <button
                      key={am.id}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setSelectedAmenities(selectedAmenities.filter((a) => a !== am.id));
                        } else {
                          setSelectedAmenities([...selectedAmenities, am.id]);
                        }
                      }}
                      className={`p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500 shadow-xs'
                          : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="text-base flex-shrink-0">{am.icon}</span>
                        <div className="truncate">
                          <div className="text-xs font-bold truncate leading-tight">{am.name}</div>
                          <div className="text-[9px] text-slate-400 font-medium truncate">{am.guj}</div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 ml-1.5 border transition-colors ${
                        isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center space-x-3">
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-4 py-3 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="flex-1 py-3 bg-[#065f46] hover:bg-[#047857] text-white font-bold text-xs rounded-2xl transition-all shadow-md text-center cursor-pointer"
              >
                Show {filteredGrounds.length} Grounds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slot Picker Modal */}
      {selectedGround && selectedBox && (
        <SlotPickerModal
          isOpen={isSlotPickerOpen}
          onClose={() => setIsSlotPickerOpen(false)}
          ground={selectedGround}
          box={selectedBox}
          onConfirm={handleSlotConfirm}
        />
      )}

      {/* Booking Checkout Modal */}
      {selectedGround && selectedBox && bookingDetails && (
        <BookingCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          ground={selectedGround}
          box={selectedBox}
          bookingDetails={bookingDetails}
        />
      )}

    </div>
  );
}
