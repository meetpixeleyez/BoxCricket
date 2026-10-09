"use client";

import React, { useState, useMemo } from 'react';
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
  ArrowRight,
  Ticket,
  Plus,
  AlertCircle,
  Search,
  X,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Check,
  CalendarDays
} from 'lucide-react';
import { Booking } from '@/types';
import { formatSlotTimeRange, formatDateDisplay, getTodayDateString } from '@/lib/dateUtils';
import { CancelBookingModal } from '@/components/CancelBookingModal';

export default function MyBookingsPage() {
  const { bookings, grounds, cancelBooking } = useApp();

  // 1. Status Tabs: 'UPCOMING' | 'COMPLETED' | 'CANCELLED'
  const [tab, setTab] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');
  
  // 2. Search Query (Box name, Turf name, Area, UTR, Booking ID)
  const [searchQuery, setSearchQuery] = useState('');

  // 3. Selected Locality / Area Filter
  const [selectedArea, setSelectedArea] = useState<string>('ALL');

  // 4. Date Range Filter State (Dropdown Popover)
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [datePreset, setDatePreset] = useState<'ALL_TIME' | 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH' | 'CUSTOM'>('ALL_TIME');
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');

  // Cancel Modal State
  const [cancelTargetBooking, setCancelTargetBooking] = useState<Booking | null>(null);

  // Dynamic available areas from grounds & bookings
  const availableAreas = useMemo(() => {
    const areasSet = new Set<string>();
    grounds.forEach(g => { if (g.area) areasSet.add(g.area); });
    bookings.forEach(b => { if (b.groundArea) areasSet.add(b.groundArea); });
    return Array.from(areasSet).sort();
  }, [grounds, bookings]);

  // Tab counts
  const upcomingCount = useMemo(() => bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'HELD').length, [bookings]);
  const completedCount = useMemo(() => bookings.filter(b => b.status === 'COMPLETED').length, [bookings]);
  const cancelledCount = useMemo(() => bookings.filter(b => b.status === 'CANCELLED').length, [bookings]);

  // Helper date matchers
  const isFilterActive = searchQuery.trim() !== '' || selectedArea !== 'ALL' || datePreset !== 'ALL_TIME';

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedArea('ALL');
    setDatePreset('ALL_TIME');
    setCustomFromDate('');
    setCustomToDate('');
    setIsDatePopoverOpen(false);
  };

  const getDateFilterLabel = () => {
    switch (datePreset) {
      case 'ALL_TIME': return 'All Time Range';
      case 'TODAY': return 'Today Only';
      case 'LAST_7_DAYS': return 'Last 7 Days';
      case 'LAST_30_DAYS': return 'Last 30 Days';
      case 'THIS_MONTH': return 'This Current Month';
      case 'CUSTOM': 
        if (customFromDate && customToDate) return `${customFromDate} to ${customToDate}`;
        if (customFromDate) return `From ${customFromDate}`;
        if (customToDate) return `Up to ${customToDate}`;
        return 'Custom Range';
      default: return 'All Time Range';
    }
  };

  // Filtered List calculation
  const currentList = useMemo(() => {
    // 1. Tab filter
    let list = bookings.filter(b => {
      if (tab === 'UPCOMING') return b.status === 'CONFIRMED' || b.status === 'HELD';
      if (tab === 'COMPLETED') return b.status === 'COMPLETED';
      if (tab === 'CANCELLED') return b.status === 'CANCELLED';
      return true;
    });

    // 2. Locality / Area Filter
    if (selectedArea !== 'ALL') {
      list = list.filter(b => 
        (b.groundArea && b.groundArea.toLowerCase() === selectedArea.toLowerCase()) ||
        (b.groundAddress && b.groundAddress.toLowerCase().includes(selectedArea.toLowerCase()))
      );
    }

    // 3. Date Range Filter
    if (datePreset !== 'ALL_TIME') {
      const today = new Date();
      const todayStr = getTodayDateString(0);
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      list = list.filter(b => {
        if (!b.date) return false;
        
        if (datePreset === 'TODAY') {
          return b.date === todayStr;
        }

        if (datePreset === 'LAST_7_DAYS') {
          try {
            const [by, bm, bd] = b.date.split('-').map(Number);
            const bDateMs = new Date(by, bm - 1, bd).getTime();
            const diffDays = (bDateMs - todayStart) / (1000 * 60 * 60 * 24);
            return diffDays >= -7 && diffDays <= 7;
          } catch {
            return false;
          }
        }

        if (datePreset === 'LAST_30_DAYS') {
          try {
            const [by, bm, bd] = b.date.split('-').map(Number);
            const bDateMs = new Date(by, bm - 1, bd).getTime();
            const diffDays = (bDateMs - todayStart) / (1000 * 60 * 60 * 24);
            return diffDays >= -30 && diffDays <= 30;
          } catch {
            return false;
          }
        }

        if (datePreset === 'THIS_MONTH') {
          try {
            const [by, bm] = b.date.split('-').map(Number);
            return (bm - 1) === currentMonth && by === currentYear;
          } catch {
            return false;
          }
        }

        if (datePreset === 'CUSTOM') {
          if (customFromDate && b.date < customFromDate) return false;
          if (customToDate && b.date > customToDate) return false;
          return true;
        }

        return true;
      });
    }

    // 4. Flexible Search Query (Ground Name, Box Name, Area, ID, UTR)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(b => 
        (b.groundName && b.groundName.toLowerCase().includes(q)) ||
        (b.boxName && b.boxName.toLowerCase().includes(q)) ||
        (b.groundArea && b.groundArea.toLowerCase().includes(q)) ||
        (b.groundAddress && b.groundAddress.toLowerCase().includes(q)) ||
        (b.id && b.id.toLowerCase().includes(q)) ||
        (b.utr && b.utr.toLowerCase().includes(q)) ||
        (b.playerName && b.playerName.toLowerCase().includes(q))
      );
    }

    return list;
  }, [tab, bookings, selectedArea, datePreset, customFromDate, customToDate, searchQuery]);

  const handleShareBooking = (b: Booking) => {
    const text = `🏏 Match Scheduled!\nVenue: ${b.groundName} (${b.boxName})\nDate: ${formatDateDisplay(b.date)}\nTime: ${formatSlotTimeRange(b.startTime, b.endTime)}\nAddress: ${b.groundAddress || b.groundArea}, Surat\nBooked via BoxKhel`;
    if (navigator.share) {
      navigator.share({ title: `Match at ${b.groundName}`, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Match details copied to clipboard! Share with your cricket squad.');
    }
  };

  const handleCancelClick = (b: Booking) => {
    setCancelTargetBooking(b);
  };

  return (
    <div className="p-4 space-y-4 pb-28">
      
      {/* 1. Status Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/70 rounded-2xl">
        <button
          onClick={() => setTab('UPCOMING')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            tab === 'UPCOMING'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Upcoming</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            tab === 'UPCOMING' ? 'bg-orange-100 text-orange-800' : 'bg-slate-300 text-slate-700'
          }`}>
            {upcomingCount}
          </span>
        </button>

        <button
          onClick={() => setTab('COMPLETED')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            tab === 'COMPLETED'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Completed</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            tab === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300 text-slate-700'
          }`}>
            {completedCount}
          </span>
        </button>

        <button
          onClick={() => setTab('CANCELLED')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            tab === 'CANCELLED'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Cancelled</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            tab === 'CANCELLED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-300 text-slate-700'
          }`}>
            {cancelledCount}
          </span>
        </button>
      </div>

      {/* 2. Flexible Search Bar (Turf, Box, Area, UTR, ID) */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search turf, box, area, booking ID or UTR..."
          className="w-full bg-white border border-slate-200 text-slate-900 pl-10 pr-9 py-2.5 rounded-2xl text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 3. Horizontally Scrollable Locality / Area Strip */}
      <div 
        className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5"
        onWheel={(e) => {
          if (e.deltaY !== 0) {
            e.currentTarget.scrollLeft += e.deltaY;
          }
        }}
      >
        <button
          onClick={() => setSelectedArea('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
            selectedArea === 'ALL'
              ? 'bg-[#065f46] text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" />
          <span>All Areas</span>
        </button>

        {availableAreas.map((area) => {
          const isSelected = selectedArea.toLowerCase() === area.toLowerCase();
          return (
            <button
              key={area}
              onClick={() => setSelectedArea(isSelected ? 'ALL' : area)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                isSelected
                  ? 'bg-[#065f46] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 mr-0.5 text-emerald-700" />
              <span>{area}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Date Range Filter Popover & Reset Controls (BoxKhel Brand Theme) */}
      <div className="relative z-30">
        <div className="flex items-center justify-between gap-2">
          {/* Reset / Adjustments Button */}
          {isFilterActive ? (
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-3 py-2 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200/80 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
              <span>Reset Filters</span>
            </button>
          ) : (
            <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
              <span>Filter Bookings</span>
            </div>
          )}

          {/* Date Range Dropdown Trigger Button */}
          <button
            type="button"
            onClick={() => setIsDatePopoverOpen(prev => !prev)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all border cursor-pointer ${
              datePreset !== 'ALL_TIME' || isDatePopoverOpen
                ? 'bg-[#065f46] text-white border-[#065f46] shadow-sm ring-2 ring-emerald-600/20'
                : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <Calendar className={`w-3.5 h-3.5 ${datePreset !== 'ALL_TIME' || isDatePopoverOpen ? 'text-emerald-200' : 'text-emerald-700'}`} />
            <span className="truncate max-w-[170px]">{getDateFilterLabel()}</span>
            {isDatePopoverOpen ? (
              <ChevronUp className={`w-3.5 h-3.5 ${datePreset !== 'ALL_TIME' || isDatePopoverOpen ? 'text-emerald-200' : 'text-slate-400'} ml-0.5`} />
            ) : (
              <ChevronDown className={`w-3.5 h-3.5 ${datePreset !== 'ALL_TIME' || isDatePopoverOpen ? 'text-emerald-200' : 'text-slate-400'} ml-0.5`} />
            )}
          </button>
        </div>

        {/* Popover Dropdown Card (Clean BoxKhel Theme) */}
        {isDatePopoverOpen && (
          <>
            {/* Click backdrop to close */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsDatePopoverOpen(false)} 
            />

            <div className="absolute right-0 top-full mt-2 w-full max-w-[320px] bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-900/15 p-4 z-50 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5">
              
              {/* Popover Header */}
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Filter By Date Range
                </span>
                {datePreset !== 'ALL_TIME' && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                    Active
                  </span>
                )}
              </div>

              {/* Preset Items List */}
              <div className="space-y-1">
                {[
                  { key: 'ALL_TIME', label: 'All Time History' },
                  { key: 'TODAY', label: 'Today Only' },
                  { key: 'LAST_7_DAYS', label: 'Last 7 Days' },
                  { key: 'LAST_30_DAYS', label: 'Last 30 Days' },
                  { key: 'THIS_MONTH', label: 'This Current Month' },
                ].map((item) => {
                  const isSelected = datePreset === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setDatePreset(item.key as any);
                        setIsDatePopoverOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#065f46] text-white shadow-sm ring-1 ring-emerald-700'
                          : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-900'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 my-3" />

              {/* Custom Date Range Section */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-emerald-800 flex items-center space-x-1.5 px-0.5">
                  <CalendarDays className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Custom Date Range</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={customFromDate}
                      onChange={(e) => setCustomFromDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={customToDate}
                      onChange={(e) => setCustomToDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
                    />
                  </div>
                </div>

                {/* Apply Custom Range Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (customFromDate || customToDate) {
                      setDatePreset('CUSTOM');
                      setIsDatePopoverOpen(false);
                    }
                  }}
                  disabled={!customFromDate && !customToDate}
                  className="w-full py-2.5 stitch-btn-orange text-xs flex items-center justify-center font-bold shadow-md shadow-orange-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Apply Custom Range
                </button>
              </div>

            </div>
          </>
        )}
      </div>

      {/* 3. Dynamic Bookings Content */}
      <div className="space-y-4">
        {currentList.length === 0 ? (
          /* Empty State */
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 my-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <Ticket className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              {isFilterActive ? 'No matching bookings found' : `No ${tab.toLowerCase()} bookings found`}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {isFilterActive 
                ? 'Try adjusting your search query, area selection, or date range filter.'
                : tab === 'UPCOMING'
                ? 'Ready for a cricket match? Book top verified floodlit turfs in Surat now.'
                : `You do not have any ${tab.toLowerCase()} match bookings.`}
            </p>
            {isFilterActive ? (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 text-white text-xs rounded-xl shadow-md font-bold mt-2 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            ) : tab === 'UPCOMING' ? (
              <Link
                href="/"
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 stitch-btn-orange text-xs rounded-xl shadow-md font-bold mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Book a Cricket Box</span>
              </Link>
            ) : null}
          </div>
        ) : (
          /* Dynamic Cards List */
          currentList.map((b) => {
            const ground = grounds.find(g => g.id === b.groundId);
            const groundImage = ground?.images?.[0] || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400';
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${ground?.lat || 21.2450},${ground?.lng || 72.8890}`;
            const isConfirmed = b.status === 'CONFIRMED' || b.status === 'HELD';
            const isCompleted = b.status === 'COMPLETED';
            const isCancelled = b.status === 'CANCELLED';

            return (
              <div 
                key={b.id}
                className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm transition-all hover:shadow-md"
              >
                {/* Top Status Header */}
                <div className={`p-3.5 text-white flex items-center justify-between ${
                  isConfirmed ? 'bg-[#065f46]' : isCompleted ? 'bg-slate-800' : 'bg-rose-800'
                }`}>
                  <div className="flex items-center space-x-2">
                    {isConfirmed && <span className="w-2 h-2 rounded-full bg-[#ff6813] animate-ping" />}
                    <span className="text-[11px] font-black uppercase tracking-wider">
                      {isConfirmed ? 'UPCOMING MATCH' : isCompleted ? 'COMPLETED MATCH' : 'CANCELLED MATCH'}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-200 opacity-80">
                      • #{b.id}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 border ${
                    isConfirmed 
                      ? 'bg-emerald-800 text-emerald-200 border-emerald-600/50' 
                      : isCompleted
                      ? 'bg-slate-700 text-slate-200 border-slate-600'
                      : 'bg-rose-900 text-rose-200 border-rose-700'
                  }`}>
                    {isConfirmed && <CheckCircle2 className="w-3 h-3" />}
                    {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                    {isCancelled && <XCircle className="w-3 h-3" />}
                    <span>{b.status}</span>
                  </span>
                </div>

                {/* Match Info Body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-200">
                      <img
                        src={groundImage}
                        alt={b.groundName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 left-1 px-1 rounded bg-black/60 text-[9px] font-black text-amber-400">
                        ★ {ground?.avgRating || '4.8'}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-900 leading-tight truncate">
                          {b.groundName}
                        </h3>
                      </div>
                      <div className="text-[11px] font-bold text-emerald-800 mt-0.5">
                        {b.boxName}
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-slate-700 font-bold mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{formatDateDisplay(b.date)} • {formatSlotTimeRange(b.startTime, b.endTime)}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{b.groundAddress || b.groundArea}, Surat</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Advance Breakdown Card */}
                  <div className={`p-3 rounded-2xl border space-y-1.5 ${
                    isCancelled ? 'bg-rose-50/70 border-rose-100' : 'bg-emerald-50/70 border-emerald-100'
                  }`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-800 font-bold flex items-center">
                        💳 Advance Paid (UPI)
                      </span>
                      <span className="text-emerald-950 font-black">
                        ₹{b.advanceAmount} Paid • UTR #{b.utr || 'VERIFIED'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-emerald-100/80">
                      <span className="text-slate-500 font-medium">Balance Due at Venue</span>
                      <span className="text-slate-900 font-black text-sm">
                        ₹{b.balanceAmount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10.5px] text-slate-400 pt-0.5">
                      <span>Total Booking Value:</span>
                      <span className="font-bold text-slate-600">₹{b.totalAmount}</span>
                    </div>
                  </div>

                  {/* Action Buttons for Confirmed/Upcoming Match */}
                  {isConfirmed && (
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Directions</span>
                      </a>

                      <a
                        href={`tel:${b.groundPhone || ground?.phone || '+919876543210'}`}
                        className="py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Owner</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleShareBooking(b)}
                        className="py-2.5 rounded-xl stitch-btn-orange text-xs flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share Squad</span>
                      </button>
                    </div>
                  )}

                  {/* Re-book / Cancel Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={() => handleCancelClick(b)}
                        className="text-rose-600 hover:text-rose-800 font-bold text-[11px] flex items-center transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        <span>Cancel Booking</span>
                      </button>
                    )}

                    <Link
                      href={`/ground/${b.groundId || 'ground_1'}`}
                      className="text-emerald-700 hover:text-emerald-900 font-black text-[11px] flex items-center ml-auto transition-colors"
                    >
                      <span>View Ground Details</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </Link>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>
 
      {/* Custom Cancel Booking Confirmation Modal */}
      <CancelBookingModal
        isOpen={!!cancelTargetBooking}
        booking={cancelTargetBooking}
        onClose={() => setCancelTargetBooking(null)}
      />

    </div>
  );
}
