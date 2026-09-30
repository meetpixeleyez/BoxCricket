"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  Calendar, 
  MapPin, 
  Navigation, 
  Phone, 
  Share2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download, 
  RotateCcw, 
  Star, 
  ChevronRight,
  Flag,
  ArrowRight
} from 'lucide-react';

export default function MyBookingsPage() {
  const { bookings, grounds } = useApp();

  // Tabs: 'UPCOMING' | 'COMPLETED' | 'CANCELLED'
  const [tab, setTab] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');
  const [selectedFilter, setSelectedFilter] = useState('All Turfs');

  const upcomingCount = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'HELD').length || 1;
  const completedCount = 4;
  const cancelledCount = 1;

  return (
    <div className="p-4 space-y-4 pb-24">
      
      {/* 1. Status Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/70 rounded-2xl">
        <button
          onClick={() => setTab('UPCOMING')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            tab === 'UPCOMING'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Upcoming</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${tab === 'UPCOMING' ? 'bg-orange-100 text-orange-800' : 'bg-slate-300 text-slate-700'}`}>
            {upcomingCount}
          </span>
        </button>

        <button
          onClick={() => setTab('COMPLETED')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            tab === 'COMPLETED'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Completed</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${tab === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300 text-slate-700'}`}>
            {completedCount}
          </span>
        </button>

        <button
          onClick={() => setTab('CANCELLED')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            tab === 'CANCELLED'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Cancelled</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${tab === 'CANCELLED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-300 text-slate-700'}`}>
            {cancelledCount}
          </span>
        </button>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
        {[
          { label: 'All Turfs', icon: CheckCircle2 },
          { label: 'This Month', icon: Calendar },
          { label: 'Adajan', icon: Navigation },
          { label: 'Vesu', icon: null },
        ].map((item) => {
          const isSelected = selectedFilter === item.label;
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => setSelectedFilter(item.label)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#065f46] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5 mr-0.5" />}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Content */}
      {tab === 'UPCOMING' && (
        <div className="space-y-4">
          
          {/* Confirmed Match Card */}
          <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
            
            {/* Top Status Header */}
            <div className="p-3.5 bg-[#065f46] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#ff6813] animate-ping" />
                <span className="text-[11px] font-black uppercase tracking-wider">
                  UPCOMING MATCH
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-800 text-[10px] font-bold text-emerald-200 flex items-center space-x-1 border border-emerald-600/50">
                <CheckCircle2 className="w-3 h-3" />
                <span>Confirmed</span>
              </span>
            </div>

            {/* Match Info */}
            <div className="p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=300"
                    alt="Turf"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1 px-1 rounded bg-black/60 text-[9px] font-black text-amber-400">
                    ★ 4.9
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    Striker Box Arena - Pitch 1
                  </h3>
                  <div className="flex items-center space-x-1 text-xs text-slate-700 font-bold mt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tonight, 18 Oct • 9:00 - 10:00 PM</span>
                  </div>
                  <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>Near LP Savani School, Pal, Surat</span>
                  </div>
                </div>
              </div>

              {/* Payment Advance Row */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-800 font-bold flex items-center">
                    💳 Advance Paid (UPI)
                  </span>
                  <span className="text-emerald-900 font-black">
                    ₹300 Paid • UTR #839210
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-100">
                  <span className="text-slate-500">Balance Due at Venue</span>
                  <span className="text-slate-900 font-black text-sm">₹650</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions</span>
                </a>

                <a
                  href="tel:+919876543211"
                  className="py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Owner</span>
                </a>

                <button
                  onClick={() => alert('Booking link copied to clipboard to share with squad!')}
                  className="py-2.5 rounded-xl stitch-btn-orange text-xs flex items-center justify-center space-x-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Team</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {tab === 'COMPLETED' && (
        <div className="space-y-4">
          
          {/* Completed Card 1 */}
          <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1531415074868-036b1c5f53ec?w=200"
                  alt="Kings Box"
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-sm font-black text-slate-900 leading-tight">Kings Box Cricket...</h4>
                  <p className="text-[11px] text-slate-500">Opposite Green City, A...</p>
                  <div className="text-[11px] font-bold text-slate-700 mt-1 flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Yesterday, 17 Oct • 8:00 - 10:00 PM (2 hrs)</span>
                  </div>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Completed</span>
              </span>
            </div>

            {/* Scorecard Banner */}
            <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Flag className="w-4 h-4 text-amber-700" />
                <div>
                  <div className="font-bold text-slate-900">Match Scorecard</div>
                  <div className="text-[10px] text-slate-500">Won by 14 runs vs Surat Strikers</div>
                </div>
              </div>
              <span className="text-amber-800 font-bold text-[11px] flex items-center">
                View <ChevronRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>

            {/* Total Paid & Receipt */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <div>
                <div className="text-[10px] text-slate-400">Total Paid</div>
                <div className="text-base font-black text-slate-900">₹1,800</div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-500">Paid via UPI (₹540) + Venue (₹1,260)</div>
                <button className="text-emerald-700 font-bold text-[11px] flex items-center justify-end hover:underline mt-0.5">
                  <Download className="w-3 h-3 mr-1" /> Download Receipt
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button className="py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center space-x-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Rated 4.8</span>
              </button>
              <Link
                href="/ground/ground_1"
                className="py-2.5 rounded-xl stitch-btn-orange text-xs flex items-center justify-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Book Again</span>
              </Link>
            </div>
          </div>

          {/* Completed Card 2 */}
          <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=200"
                  alt="Turf 11"
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-sm font-black text-slate-900 leading-tight">Turf 11 Arena, Vesu</h4>
                  <p className="text-[11px] text-slate-500">VIP Road, Near Vesu Can...</p>
                  <div className="text-[11px] font-bold text-slate-700 mt-1">
                    12 Oct • 7:00 - 8:00 PM
                  </div>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                ✓ Completed
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <span className="text-xs text-slate-500">Total: </span>
                <span className="text-sm font-black text-slate-900">₹850</span>
              </div>
              <Link
                href="/ground/ground_1"
                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center space-x-1 hover:bg-blue-100"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Re-book Same Slot</span>
              </Link>
            </div>
          </div>

        </div>
      )}

      {tab === 'CANCELLED' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-400 flex items-center justify-center text-lg border border-blue-100">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Prime Box Arena, Katargam</h4>
                  <p className="text-[11px] text-slate-500">Dhanmora Cross Roads, ... • 05 Oct • 6:00 PM</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                ⊘ Cancelled
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center space-x-2 text-xs">
              <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                ₹
              </span>
              <div>
                <div className="font-black text-emerald-950">₹270 Refunded to UPI</div>
                <div className="text-[10px] text-emerald-800">Processed via PhonePe • Ref: CR77291</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
