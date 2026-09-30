"use client";

import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { SlotPickerModal } from '@/components/SlotPickerModal';
import { BookingCheckoutModal } from '@/components/BookingCheckoutModal';
import { Ground, Box } from '@/types';

export default function HomePage() {
  const { grounds, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('All Surat');
  const [selectedDistance, setSelectedDistance] = useState('5 km');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Booking Modal Flow State
  const [selectedGround, setSelectedGround] = useState<Ground | null>(null);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [isSlotPickerOpen, setIsSlotPickerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // Filter grounds by area and search query
  const filteredGrounds = grounds.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.area.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = selectedArea === 'All Surat' || g.area.toLowerCase() === selectedArea.toLowerCase();
    return matchesSearch && matchesArea;
  });

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

  return (
    <div className="space-y-4 px-4 pt-3 pb-6">
      
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
        </div>

        {/* Distance Pill */}
        <button 
          onClick={() => {
            const next = selectedDistance === '5 km' ? '10 km' : selectedDistance === '10 km' ? '15 km' : '5 km';
            setSelectedDistance(next);
          }}
          className="flex items-center space-x-1 px-3 py-2.5 bg-blue-50/80 border border-blue-100 rounded-2xl text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors shadow-sm"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>{selectedDistance}</span>
        </button>

        {/* Filter Button */}
        <button
          onClick={() => setShowFilterModal(!showFilterModal)}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl text-slate-700 transition-colors shadow-sm"
          title="Filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Surat Area Horizontal Scroll Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
        {['All Surat', 'Mota Varachha', 'Adajan', 'Vesu', 'Katargam', 'Pal'].map((area) => {
          const isSelected = selectedArea === area;
          return (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#065f46] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {area}
            </button>
          );
        })}
      </div>

      {/* 3. Three Quick Action Tiles */}
      <div className="grid grid-cols-3 gap-2.5">
        
        {/* Tile 1: Book a Slot */}
        <button
          onClick={() => filteredGrounds[0] && handleOpenBooking(filteredGrounds[0])}
          className="p-3 rounded-2xl bg-[#ecfdf5] border border-emerald-100 text-left flex flex-col justify-between hover:shadow-md transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100/90 flex items-center justify-center text-emerald-800 text-base mb-2 group-hover:scale-105 transition-transform">
            🏏
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 leading-tight">Book a Slot</div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Instant Turf</div>
          </div>
        </button>

        {/* Tile 2: Find Players */}
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

        {/* Tile 3: Challenge */}
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

      {/* 4. Urgent Squad Call Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#ff6813]" />
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff6813] animate-ping" />
            <span className="text-[10px] font-black tracking-wider uppercase text-[#ff6813]">
              URGENT CALL • LIVE IN SURAT
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-orange-50 text-[11px] font-bold text-orange-800 border border-orange-200">
            ₹120/player
          </span>
        </div>

        <div className="flex items-start space-x-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center font-black text-blue-900 text-xs flex-shrink-0">
            VS
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-1">
              <span className="text-sm font-black text-slate-900">Varachha Strikers</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xs font-bold text-slate-700 mt-0.5">
              Need <strong className="text-slate-950 underline">2 Batsmen</strong> tonight at 9:00 PM
            </p>
            <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>Kings Turf, Adajan • Hard Tennis Ball</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center -space-x-1.5">
            {['P1', 'P2', 'P3'].map((p, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white text-[9px] font-bold flex items-center justify-center text-slate-700">
                {p}
              </div>
            ))}
            <div className="w-6 h-6 rounded-full bg-orange-100 border-2 border-white text-[9px] font-bold flex items-center justify-center text-orange-800">
              +6
            </div>
          </div>

          <Link
            href="/find-players"
            className="px-4 py-2 stitch-btn-orange text-xs flex items-center space-x-1.5"
          >
            <span>Join Squad</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 5. Open Today Evening Slots Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-3.5 bg-emerald-600 rounded-full" />
              <h3 className="text-sm font-black text-slate-900">Open Today Evening</h3>
            </div>
            <p className="text-[11px] text-slate-500 ml-3">Instant night-floodlight bookable slots</p>
          </div>
          <Link href="/ground/ground_1" className="text-xs font-bold text-[#065f46] hover:underline flex items-center">
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar py-1">
          
          {/* Quick Slot Card 1 */}
          <div className="w-[200px] flex-shrink-0 rounded-2xl bg-white border border-slate-200 p-3.5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Available</span>
              <span className="text-slate-400">Tonight</span>
            </div>
            <div>
              <div className="text-base font-black text-slate-900">7:00 PM <span className="text-[10px] font-semibold text-slate-400">60 min</span></div>
              <div className="text-xs font-bold text-slate-700 truncate">Kings Box Cricket</div>
              <div className="text-[10px] text-slate-400">Adajan • 1.8 km</div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-sm font-black text-slate-900">₹800</span>
              <button 
                onClick={() => filteredGrounds[0] && handleOpenBooking(filteredGrounds[0])}
                className="px-3.5 py-1.5 stitch-btn-green text-xs"
              >
                Book
              </button>
            </div>
          </div>

          {/* Quick Slot Card 2 */}
          <div className="w-[200px] flex-shrink-0 rounded-2xl bg-white border border-slate-200 p-3.5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">Fast Filling</span>
              <span className="text-slate-400">Tonight</span>
            </div>
            <div>
              <div className="text-base font-black text-slate-900">8:30 PM <span className="text-[10px] font-semibold text-slate-400">60 min</span></div>
              <div className="text-xs font-bold text-slate-700 truncate">Striker Arena</div>
              <div className="text-[10px] text-slate-400">Mota Varachha • 2.4 km</div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-sm font-black text-slate-900">₹950</span>
              <button 
                onClick={() => filteredGrounds[1] ? handleOpenBooking(filteredGrounds[1]) : filteredGrounds[0] && handleOpenBooking(filteredGrounds[0])}
                className="px-3.5 py-1.5 stitch-btn-green text-xs"
              >
                Book
              </button>
            </div>
          </div>

          {/* Quick Slot Card 3 */}
          <div className="w-[200px] flex-shrink-0 rounded-2xl bg-white border border-slate-200 p-3.5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Available</span>
              <span className="text-slate-400">Tonight</span>
            </div>
            <div>
              <div className="text-base font-black text-slate-900">10:00 PM <span className="text-[10px] font-semibold text-slate-400">60 min</span></div>
              <div className="text-xs font-bold text-slate-700 truncate">Turf 11 Arena</div>
              <div className="text-[10px] text-slate-400">Vesu • 3.1 km</div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-sm font-black text-slate-900">₹850</span>
              <button 
                onClick={() => filteredGrounds[0] && handleOpenBooking(filteredGrounds[0])}
                className="px-3.5 py-1.5 stitch-btn-green text-xs"
              >
                Book
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 6. Nearby Box Cricket Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <div className="w-1.5 h-3.5 bg-emerald-600 rounded-full" />
            <h3 className="text-sm font-black text-slate-900">Nearby Box Cricket</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[11px] font-bold text-blue-700 border border-blue-100">
            {filteredGrounds.length} Nearby
          </span>
        </div>

        <div className="space-y-4">
          {filteredGrounds.map((ground) => (
            <div key={ground.id} className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
              
              {/* Photo & Badges */}
              <div className="relative h-44 w-full">
                <img
                  src={ground.images[0] || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800"}
                  alt={ground.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Rating Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 font-extrabold text-xs flex items-center space-x-1 shadow-md">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{ground.avgRating}</span>
                  <span className="text-slate-400 font-normal">({ground.totalReviews})</span>
                </div>

                {/* Location Badge */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-xs shadow-md">
                  {ground.area} • 1.8 km
                </div>

                {/* Open Status Tag */}
                <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-300 font-bold text-[11px] flex items-center space-x-1.5 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
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
                      {ground.addressLine}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-emerald-800">
                      ₹{ground.boxes[0]?.basePrice || 800}<span className="text-[10px] font-normal text-slate-400">/hr</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
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

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href={`/ground/${ground.id}`}
                    className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center transition-colors"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleOpenBooking(ground)}
                    className="py-2.5 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Slot</span>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
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
