"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  Clock, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Lock, 
  Check, 
  Sparkles,
  Info,
  Sun,
  Sunset,
  Moon,
  Flame,
  Layers,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { Ground, Box, TurfType } from '@/types';
import { useApp } from '@/context/AppContext';
import { formatSlotTimeRange } from '@/lib/dateUtils';

interface SlotPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ground: Ground;
  box: Box;
  onConfirm: (bookingDetails: any) => void;
}

interface SlotItem {
  id: string;
  startTime: string;
  endTime: string;
  price: number;
  label: string;
  category: 'morning' | 'afternoon' | 'evening' | 'night';
  tagType?: 'standard' | 'prime' | 'popular' | 'late' | 'discount';
  tagLabel?: string;
  isBooked?: boolean;
  bookedBy?: string;
  isPast?: boolean;
}

export const SlotPickerModal: React.FC<SlotPickerModalProps> = ({
  isOpen,
  onClose,
  ground,
  box: initialBox,
  onConfirm,
}) => {
  const { bookings, offlineBlocks } = useApp();
  
  // Selected Box Tab
  const [activeBoxId, setActiveBoxId] = useState<string>(initialBox?.id || ground.boxes[0]?.id);

  // Sync activeBoxId whenever initialBox changes
  useEffect(() => {
    if (initialBox?.id) {
      setActiveBoxId(initialBox.id);
    }
  }, [initialBox?.id]);

  const activeBox = ground.boxes.find(b => b.id === activeBoxId) || ground.boxes[0] || initialBox;

  // Selected Date
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  // Slot Filter Category: 'ALL' | 'morning' | 'afternoon' | 'evening' | 'night'
  const [slotCategoryFilter, setSlotCategoryFilter] = useState<'ALL' | 'morning' | 'afternoon' | 'evening' | 'night'>('evening');

  // Selected Slots (Starts clean/empty)
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);

  // Clear slot selections on date or pitch change
  useEffect(() => {
    setSelectedSlotIds([]);
  }, [selectedDateIndex, activeBoxId]);

  // Payment Preference: 'ADVANCE' | 'FULL'
  const [paymentPreference, setPaymentPreference] = useState<'ADVANCE' | 'FULL'>('ADVANCE');

  // Next 7 Days generator with consistent local date strings (YYYY-MM-DD)
  const dates = useMemo(() => {
    const list = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const currentMonthIdx = today.getMonth();
    
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      const isNewMonth = d.getMonth() !== currentMonthIdx;

      const dayOfWeek = d.getDay();
      list.push({
        dateStr,
        dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[dayOfWeek],
        dayNumber: d.getDate(),
        monthName: months[d.getMonth()],
        monthIndex: d.getMonth(),
        year: y,
        subDay: isNewMonth && i > 1 ? `${months[d.getMonth()]} • ${days[dayOfWeek]}` : days[dayOfWeek],
        isNewMonth,
      });
    }
    return list;
  }, []);

  const selectedDate = dates[selectedDateIndex] || dates[0];

  // Dynamic Full Day Slots generator for active box & selected date
  const slots: SlotItem[] = useMemo(() => {
    const basePrice = activeBox?.basePrice || 800;
    const dateStr = selectedDate.dateStr;

    // Helper to check if slot time is in the past for today or past dates
    const isSlotPastTime = (slotId: string, startTime: string) => {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const todayStr = `${y}-${m}-${d}`;

      if (dateStr < todayStr) return true;
      if (dateStr > todayStr) return false;

      // Date is today - check current time in minutes
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [sh, sm] = startTime.split(':').map(Number);
      let slotStartMinutes = (sh || 0) * 60 + (sm || 0);

      // Midnight end-of-day slot (00:00 - 01:00 AM) operates after 23:00 (11 PM)
      if (slotId === 'slot_00_01' || (startTime === '00:00' && sh === 0)) {
        slotStartMinutes = 24 * 60;
      }

      return slotStartMinutes <= currentMinutes;
    };

    // Helper to check if slot is booked in live context state
    const isSlotBooked = (start: string, end: string) => {
      // Check existing bookings in context
      const hasBooking = bookings.some(b => 
        (b.boxId === activeBox.id || (b.groundId === ground.id && (b.boxName === activeBox.name || ground.boxes.length === 1))) && 
        b.date === dateStr && 
        b.status !== 'CANCELLED' &&
        (start < b.endTime && end > b.startTime)
      );
      if (hasBooking) {
        const bInfo = bookings.find(b => 
          (b.boxId === activeBox.id || (b.groundId === ground.id && (b.boxName === activeBox.name || ground.boxes.length === 1))) && 
          b.date === dateStr &&
          b.status !== 'CANCELLED' &&
          (start < b.endTime && end > b.startTime)
        );
        return { isBooked: true, bookedBy: bInfo?.playerName || 'Reserved' };
      }

      // Check offline blocks
      const hasBlock = offlineBlocks.some(ob => 
        (ob.boxId === activeBox.id || (ob.groundId === ground.id && ground.boxes.length === 1)) && 
        ob.date === dateStr &&
        (start < ob.endTime && end > ob.startTime)
      );
      if (hasBlock) {
        const obInfo = offlineBlocks.find(ob => 
          (ob.boxId === activeBox.id || (ob.groundId === ground.id && ground.boxes.length === 1)) && 
          ob.date === dateStr &&
          (start < ob.endTime && end > ob.startTime)
        );
        return { isBooked: true, bookedBy: obInfo?.reason || 'Maintenance' };
      }

      return { isBooked: false, bookedBy: undefined };
    };

    // Full schedule template
    const rawSlots: Omit<SlotItem, 'isBooked' | 'bookedBy' | 'isPast'>[] = [
      // Morning (06:00 - 12:00)
      { id: 'slot_06_07', startTime: '06:00', endTime: '07:00', price: basePrice - 100, label: '06:00 AM - 07:00 AM', category: 'morning', tagType: 'discount', tagLabel: 'Early Bird' },
      { id: 'slot_07_08', startTime: '07:00', endTime: '08:00', price: basePrice, label: '07:00 AM - 08:00 AM', category: 'morning', tagType: 'standard', tagLabel: 'Morning' },
      { id: 'slot_08_09', startTime: '08:00', endTime: '09:00', price: basePrice, label: '08:00 AM - 09:00 AM', category: 'morning', tagType: 'standard', tagLabel: 'Morning' },
      { id: 'slot_09_10', startTime: '09:00', endTime: '10:00', price: basePrice, label: '09:00 AM - 10:00 AM', category: 'morning', tagType: 'standard', tagLabel: 'Standard' },
      { id: 'slot_10_11', startTime: '10:00', endTime: '11:00', price: basePrice, label: '10:00 AM - 11:00 AM', category: 'morning', tagType: 'standard', tagLabel: 'Standard' },
      { id: 'slot_11_12', startTime: '11:00', endTime: '12:00', price: basePrice, label: '11:00 AM - 12:00 PM', category: 'morning', tagType: 'standard', tagLabel: 'Standard' },

      // Afternoon (12:00 - 17:00)
      { id: 'slot_12_13', startTime: '12:00', endTime: '13:00', price: basePrice - 150, label: '12:00 PM - 01:00 PM', category: 'afternoon', tagType: 'discount', tagLabel: 'Hot Deal' },
      { id: 'slot_13_14', startTime: '13:00', endTime: '14:00', price: basePrice - 150, label: '01:00 PM - 02:00 PM', category: 'afternoon', tagType: 'discount', tagLabel: 'Hot Deal' },
      { id: 'slot_14_15', startTime: '14:00', endTime: '15:00', price: basePrice - 100, label: '02:00 PM - 03:00 PM', category: 'afternoon', tagType: 'discount', tagLabel: 'Afternoon' },
      { id: 'slot_15_16', startTime: '15:00', endTime: '16:00', price: basePrice, label: '03:00 PM - 04:00 PM', category: 'afternoon', tagType: 'standard', tagLabel: 'Standard' },
      { id: 'slot_16_17', startTime: '16:00', endTime: '17:00', price: basePrice, label: '04:00 PM - 05:00 PM', category: 'afternoon', tagType: 'standard', tagLabel: 'Standard' },

      // Evening (17:00 - 21:00)
      { id: 'slot_17_18', startTime: '17:00', endTime: '18:00', price: basePrice + 50, label: '05:00 PM - 06:00 PM', category: 'evening', tagType: 'popular', tagLabel: 'Popular' },
      { id: 'slot_18_19', startTime: '18:00', endTime: '19:00', price: basePrice + 100, label: '06:00 PM - 07:00 PM', category: 'evening', tagType: 'prime', tagLabel: 'Floodlight' },
      { id: 'slot_19_20', startTime: '19:00', endTime: '20:00', price: basePrice + 100, label: '07:00 PM - 08:00 PM', category: 'evening', tagType: 'prime', tagLabel: 'Prime Floodlight' },
      { id: 'slot_20_21', startTime: '20:00', endTime: '21:00', price: basePrice + 150, label: '08:00 PM - 09:00 PM', category: 'evening', tagType: 'prime', tagLabel: 'Prime Floodlight' },

      // Night / Late Night (21:00 - 01:00)
      { id: 'slot_21_22', startTime: '21:00', endTime: '22:00', price: basePrice + 150, label: '09:00 PM - 10:00 PM', category: 'night', tagType: 'prime', tagLabel: 'Prime Floodlight' },
      { id: 'slot_22_23', startTime: '22:00', endTime: '23:00', price: basePrice + 100, label: '10:00 PM - 11:00 PM', category: 'night', tagType: 'popular', tagLabel: 'Night League' },
      { id: 'slot_23_00', startTime: '23:00', endTime: '00:00', price: basePrice + 50, label: '11:00 PM - 12:00 AM', category: 'night', tagType: 'late', tagLabel: 'Late Night' },
      { id: 'slot_00_01', startTime: '00:00', endTime: '01:00', price: basePrice, label: '12:00 AM - 01:00 AM', category: 'night', tagType: 'late', tagLabel: 'Midnight' },
    ];

    return rawSlots.map(s => {
      const { isBooked, bookedBy } = isSlotBooked(s.startTime, s.endTime);
      const isPast = isSlotPastTime(s.id, s.startTime);
      return { ...s, isBooked, bookedBy, isPast };
    });
  }, [activeBox, selectedDate, bookings, offlineBlocks]);

  // Filtered Slots based on active category tab
  const visibleSlots = useMemo(() => {
    if (slotCategoryFilter === 'ALL') return slots;
    return slots.filter(s => s.category === slotCategoryFilter);
  }, [slots, slotCategoryFilter]);

  const refundTiers = useMemo(() => {
    if (ground.paymentSettings?.refundTiers && ground.paymentSettings.refundTiers.length > 0) {
      return [...ground.paymentSettings.refundTiers].sort((a, b) => b.hoursBefore - a.hoursBefore);
    }
    return [
      { hoursBefore: 12, refundPercent: 30 },
      { hoursBefore: 3, refundPercent: 20 },
      { hoursBefore: 0, refundPercent: 0 }
    ];
  }, [ground.paymentSettings?.refundTiers]);

  if (!isOpen) return null;

  const toggleSlot = (slot: SlotItem) => {
    if (slot.isBooked || slot.isPast) return;
    if (selectedSlotIds.includes(slot.id)) {
      setSelectedSlotIds(prev => prev.filter(id => id !== slot.id));
    } else {
      setSelectedSlotIds(prev => [...prev, slot.id]);
    }
  };

  const selectedSlotsList = slots.filter(s => selectedSlotIds.includes(s.id) && !s.isBooked && !s.isPast);
  const totalAmount = selectedSlotsList.reduce((acc, s) => acc + s.price, 0);
  const advancePercent = ground.paymentSettings?.advanceValue || 30;
  const advancePayable = Math.round((totalAmount * advancePercent) / 100);
  const balanceAmount = totalAmount - advancePayable;

  const handleProceed = () => {
    if (selectedSlotsList.length === 0) return;
    
    // Sort slots by time
    const sortedSlots = [...selectedSlotsList].sort((a, b) => a.startTime.localeCompare(b.startTime));

    onConfirm({
      ground,
      box: activeBox,
      date: selectedDate.dateStr,
      dateDisplay: `${selectedDate.dayName}, ${selectedDate.dayNumber} ${selectedDate.monthName}`,
      slots: sortedSlots,
      totalHours: sortedSlots.length,
      totalAmount,
      advancePayable: paymentPreference === 'ADVANCE' ? advancePayable : totalAmount,
      balanceAmount: paymentPreference === 'ADVANCE' ? balanceAmount : 0,
      paymentPreference,
    });
  };

  const getTurfTypeName = (type: TurfType) => {
    switch (type) {
      case 'OPEN': return 'Open Sky Box';
      case 'CLOSED': return 'Covered Roof';
      case 'THREE_SIXTY': return '360° Arena';
      default: return 'Cricket Turf';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      
      {/* Click outside to close backdrop */}
      <div className="absolute inset-0 z-0" onClick={onClose} />

      {/* Main Bottom Sheet / Modal Card */}
      <div className="w-full max-w-[480px] bg-white text-slate-900 rounded-t-[32px] sm:rounded-3xl shadow-2xl relative z-10 overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col border border-slate-100 animate-in slide-in-from-bottom-6 duration-300">
        
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <span className="text-xs font-black text-slate-900 block leading-tight">
                  Slot Booking Checkout
                </span>
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Live Match Slots
                </span>
              </div>
            </div>
          </div>

          {/* Ground Name & Address info */}
          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <div className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                • {ground.area}, SURAT
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate max-w-[280px]">
                {ground.name}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold block">Pitches Available</span>
              <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                {ground.boxes.length} {ground.boxes.length === 1 ? 'Box' : 'Boxes'}
              </span>
            </div>
          </div>

          {/* Horizontal Pitches Selector Strip (Clean & Compact) */}
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                Select Pitch / Box
              </span>
              <span className="text-[10px] text-emerald-700 font-bold">
                {getTurfTypeName(activeBox.type)}
              </span>
            </div>

            <div 
              className="flex space-x-2 overflow-x-auto no-scrollbar pb-1"
              onWheel={(e) => {
                if (e.deltaY !== 0) {
                  e.currentTarget.scrollLeft += e.deltaY;
                }
              }}
            >
              {ground.boxes.map((b) => {
                const isSelected = b.id === activeBoxId;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setActiveBoxId(b.id)}
                    className={`flex-shrink-0 px-3 py-2 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-2 ${
                      isSelected
                        ? 'bg-[#065f46] text-white border-[#065f46] shadow-sm ring-2 ring-emerald-600/30'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isSelected ? 'bg-emerald-300 animate-pulse' : 'bg-slate-400'}`} />
                    <div>
                      <div className="text-xs font-black leading-tight truncate">
                        {b.name}
                      </div>
                      <div className={`text-[10px] font-medium leading-tight mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                        ₹{b.basePrice}/hr • {b.type === 'OPEN' ? 'Open' : '360°'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 no-scrollbar">
          
          {/* 1. Date Selector Strip */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                Select Match Date
              </label>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 shadow-2xs">
                {selectedDate.monthName} {selectedDate.year}
              </span>
            </div>

            <div 
              className="flex space-x-2 overflow-x-auto no-scrollbar pb-1"
              onWheel={(e) => {
                if (e.deltaY !== 0) {
                  e.currentTarget.scrollLeft += e.deltaY;
                }
              }}
            >
              {dates.map((d, idx) => {
                const isSelected = selectedDateIndex === idx;
                return (
                  <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => setSelectedDateIndex(idx)}
                    className={`flex-shrink-0 w-16 py-2.5 rounded-2xl text-center border transition-all relative cursor-pointer ${
                      isSelected
                        ? 'bg-[#065f46] border-[#065f46] text-white shadow-md ring-2 ring-emerald-600/20'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`text-[10px] font-semibold ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {d.dayName}
                    </div>
                    <div className="text-base font-black my-0.5">{d.dayNumber}</div>
                    <div className={`text-[10px] font-bold ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                      {d.subDay}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Slot Legend & Time Filter Tabs */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                Select Available Timing
              </div>
              <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300" /> Booked
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400/60" /> Passed
                </span>
              </div>
            </div>

            {/* Time Filter Pills: All / Morning / Afternoon / Evening / Night */}
            <div 
              className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1"
              onWheel={(e) => {
                if (e.deltaY !== 0) {
                  e.currentTarget.scrollLeft += e.deltaY;
                }
              }}
            >
              {[
                { key: 'ALL', label: 'All Slots', icon: null },
                { key: 'morning', label: 'Morning', icon: Sun },
                { key: 'afternoon', label: 'Afternoon', icon: Sun },
                { key: 'evening', label: 'Evening', icon: Sunset },
                { key: 'night', label: 'Night 🌙', icon: Moon },
              ].map(tab => {
                const isActive = slotCategoryFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSlotCategoryFilter(tab.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 flex-shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Slot Grid (2 Columns) */}
          <div className="grid grid-cols-2 gap-2.5">
            {visibleSlots.map((s) => {
              const isSelected = selectedSlotIds.includes(s.id);
              const isBooked = s.isBooked;
              const isPast = s.isPast;

              if (isPast) {
                return (
                  <div
                    key={s.id}
                    className="p-3 rounded-2xl bg-slate-100/60 border border-slate-200/70 opacity-50 cursor-not-allowed select-none flex flex-col justify-between"
                    title="This match timing has already passed for today"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span className="line-through">{s.label}</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-slate-200/80 text-[10px] font-bold text-slate-400">
                      <span className="line-through">₹{s.price}</span>
                      <span className="bg-slate-200 px-2 py-0.5 rounded text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                        Passed
                      </span>
                    </div>
                  </div>
                );
              }

              if (isBooked) {
                return (
                  <div
                    key={s.id}
                    className="p-3 rounded-2xl bg-slate-100 border border-slate-200/80 opacity-60 cursor-not-allowed select-none flex flex-col justify-between"
                    title="This slot has already been booked"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span className="line-through">{s.label}</span>
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-slate-200 text-[10px] font-bold text-slate-500">
                      <span>₹{s.price}</span>
                      <span className="truncate max-w-[85px] bg-slate-200 px-1.5 py-0.5 rounded text-[9px] text-slate-600">
                        {s.bookedBy || 'Booked'}
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSlot(s)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                    isSelected
                      ? 'bg-[#065f46] border-[#065f46] text-white shadow-md ring-2 ring-emerald-600/30'
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="truncate">{s.label}</span>
                    {isSelected ? (
                      <div className="w-4 h-4 rounded-full bg-white text-[#065f46] flex items-center justify-center text-[10px] font-black">
                        ✓
                      </div>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </div>

                  <div className={`flex items-center justify-between mt-2.5 pt-1.5 border-t ${isSelected ? 'border-emerald-700' : 'border-slate-100'}`}>
                    <span className={`text-sm font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      ₹{s.price}
                    </span>
                    <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-emerald-700 text-emerald-100'
                        : s.tagType === 'prime'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : s.tagType === 'popular'
                        ? 'bg-orange-50 text-orange-800 border border-orange-200'
                        : s.tagType === 'discount'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {s.tagLabel || 'Standard'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 4. Continuous Play Summary Card */}
          {selectedSlotsList.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#065f46]" />
              
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-black text-slate-900 flex items-center space-x-1.5">
                    <span>🏏</span>
                    <span>{selectedSlotsList.length} Hour{selectedSlotsList.length > 1 ? 's' : ''} Match Booking</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {selectedDate.dayName}, {selectedDate.dayNumber} {selectedDate.monthName} • {formatSlotTimeRange(selectedSlotsList[0]?.startTime, selectedSlotsList[selectedSlotsList.length - 1]?.endTime)}
                  </div>
                </div>

                <div className="text-base font-black text-slate-900">
                  ₹{totalAmount}
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-800 font-bold bg-emerald-50/80 px-2.5 py-1.5 rounded-xl">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Match Ball & Stumps Provided Free</span>
                </span>
                <span className="text-[9.5px] uppercase font-black bg-white px-2 py-0.5 rounded text-emerald-800 border border-emerald-200 shadow-2xs">
                  Included
                </span>
              </div>
            </div>
          )}

          {/* 5. Payment Preference (Advance vs Full) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900">Payment Preference</label>
              <span className="text-[10.5px] text-emerald-700 font-bold flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Guaranteed Slot Lock
              </span>
            </div>

            <div className="space-y-2">
              {/* Option 1: Pay Advance */}
              <button
                type="button"
                onClick={() => setPaymentPreference('ADVANCE')}
                className={`w-full p-3 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                  paymentPreference === 'ADVANCE'
                    ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                    paymentPreference === 'ADVANCE'
                      ? 'border-emerald-600 bg-emerald-600'
                      : 'border-slate-300'
                  }`}>
                    {paymentPreference === 'ADVANCE' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">Pay Advance ({advancePercent}%)</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase">
                        Most Popular
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      Pay ₹{advancePayable} online now, balance ₹{balanceAmount} cash/UPI at ground
                    </div>
                  </div>
                </div>

                <div className="text-sm font-black text-slate-900 flex-shrink-0 ml-2">
                  ₹{advancePayable}
                </div>
              </button>

              {/* Option 2: Pay Full */}
              <button
                type="button"
                onClick={() => setPaymentPreference('FULL')}
                className={`w-full p-3 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                  paymentPreference === 'FULL'
                    ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                    paymentPreference === 'FULL'
                      ? 'border-emerald-600 bg-emerald-600'
                      : 'border-slate-300'
                  }`}>
                    {paymentPreference === 'FULL' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Pay Full Amount</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      Cashless quick check-in with complete digital invoice
                    </div>
                  </div>
                </div>

                <div className="text-sm font-black text-slate-900 flex-shrink-0 ml-2">
                  ₹{totalAmount}
                </div>
              </button>
            </div>
          </div>

          {/* 6. Dynamic Venue Cancellation & Refund Policy */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                Cancellation & Refund Policy
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200/60">
                Instant UPI Refund
              </span>
            </div>

            {/* Dynamic Refund Tiers Breakdown */}
            <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-slate-200/70">
              {refundTiers.map((tier, idx) => {
                const nextTier = refundTiers[idx - 1];
                let timeText = '';
                if (idx === 0) {
                  timeText = `More than ${tier.hoursBefore}h before match start`;
                } else if (tier.hoursBefore === 0) {
                  const prevTierHours = nextTier ? nextTier.hoursBefore : 1;
                  timeText = `Less than ${prevTierHours}h before match start`;
                } else {
                  timeText = `${tier.hoursBefore}h to ${nextTier ? nextTier.hoursBefore : 12}h before match start`;
                }

                return (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${tier.refundPercent > 0 ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                      {timeText}
                    </span>
                    <span className={`font-bold ${tier.refundPercent > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {tier.refundPercent > 0 ? `${tier.refundPercent}% Refund` : 'No Refund'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Refund is calculated on advance paid and credited back instantly to your UPI account.</span>
            </div>
          </div>

        </div>

        {/* Fixed Sticky Bottom Action Bar (Clear & High Z-Index, No Overlap) */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between sticky bottom-0 z-40 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] pb-6 sm:pb-4 flex-shrink-0">
          <div>
            <div className="text-[10.5px] text-slate-500 font-medium">
              Total: <span className="font-bold text-slate-700">₹{totalAmount}</span> • {selectedSlotsList.length} Slot{selectedSlotsList.length === 1 ? '' : 's'}
            </div>
            <div className="text-lg font-black text-slate-900 leading-tight">
              ₹{paymentPreference === 'ADVANCE' ? advancePayable : totalAmount}{' '}
              <span className="text-xs font-bold text-emerald-700">
                {paymentPreference === 'ADVANCE' ? 'Advance' : 'Total'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleProceed}
            disabled={selectedSlotsList.length === 0}
            className="px-6 py-3.5 stitch-btn-orange text-sm flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-orange-500/25"
          >
            <span>Proceed</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
