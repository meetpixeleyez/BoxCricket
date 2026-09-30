"use client";

import React, { useState, useMemo } from 'react';
import { 
  X, 
  ChevronRight, 
  Clock, 
  Calendar, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Lock, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';
import { Ground, Box } from '@/types';
import { useApp } from '@/context/AppContext';

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
  tagType?: 'standard' | 'prime' | 'popular' | 'late' | 'booked';
  isBooked?: boolean;
  bookedBy?: string;
}

export const SlotPickerModal: React.FC<SlotPickerModalProps> = ({
  isOpen,
  onClose,
  ground,
  box: initialBox,
  onConfirm,
}) => {
  const { bookings, offlineBlocks } = useApp();
  
  // Selected Box Tab (Box A vs Box B)
  const [activeBoxId, setActiveBoxId] = useState<string>(initialBox.id);
  const activeBox = ground.boxes.find(b => b.id === activeBoxId) || initialBox;

  // Selected Date
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  // Selected Slots
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>(['slot_8pm', 'slot_9pm']);

  // Payment Preference: 'ADVANCE' | 'FULL'
  const [paymentPreference, setPaymentPreference] = useState<'ADVANCE' | 'FULL'>('ADVANCE');

  // Next 7 Days generator
  const dates = useMemo(() => {
    const list = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      list.push({
        dateStr: d.toISOString().split('T')[0],
        dayName: i === 0 ? 'Today' : days[d.getDay()],
        dayNumber: d.getDate(),
        monthName: months[d.getMonth()],
        subDay: days[d.getDay()],
        hasHighDemand: i === 3 || i === 4,
      });
    }
    return list;
  }, []);

  const selectedDate = dates[selectedDateIndex];

  // Base Slots definitions
  const slots: SlotItem[] = useMemo(() => {
    const basePrice = activeBox.basePrice;
    return [
      {
        id: 'slot_6pm',
        startTime: '18:00',
        endTime: '19:00',
        price: basePrice,
        label: '06:00 PM - 07:00 PM',
        tagType: 'booked',
        isBooked: true,
        bookedBy: 'Adajan Kings CC',
      },
      {
        id: 'slot_7pm',
        startTime: '19:00',
        endTime: '20:00',
        price: basePrice,
        label: '07:00 PM - 08:00 PM',
        tagType: 'standard',
      },
      {
        id: 'slot_8pm',
        startTime: '20:00',
        endTime: '21:00',
        price: basePrice + 100,
        label: '08:00 PM - 09:00 PM',
        tagType: 'prime',
      },
      {
        id: 'slot_9pm',
        startTime: '21:00',
        endTime: '22:00',
        price: basePrice + 100,
        label: '09:00 PM - 10:00 PM',
        tagType: 'prime',
      },
      {
        id: 'slot_10pm',
        startTime: '22:00',
        endTime: '23:00',
        price: basePrice + 100,
        label: '10:00 PM - 11:00 PM',
        tagType: 'popular',
      },
      {
        id: 'slot_11pm',
        startTime: '23:00',
        endTime: '00:00',
        price: basePrice + 50,
        label: '11:00 PM - 12:00 AM',
        tagType: 'late',
      },
    ];
  }, [activeBox]);

  if (!isOpen) return null;

  const toggleSlot = (slot: SlotItem) => {
    if (slot.isBooked) return;
    if (selectedSlotIds.includes(slot.id)) {
      setSelectedSlotIds(prev => prev.filter(id => id !== slot.id));
    } else {
      setSelectedSlotIds(prev => [...prev, slot.id]);
    }
  };

  const selectedSlotsList = slots.filter(s => selectedSlotIds.includes(s.id));
  const totalAmount = selectedSlotsList.reduce((acc, s) => acc + s.price, 0);
  const advancePercent = ground.paymentSettings?.advanceValue || 30;
  const advancePayable = Math.round((totalAmount * advancePercent) / 100);
  const balanceAmount = totalAmount - advancePayable;

  const handleProceed = () => {
    if (selectedSlotsList.length === 0) return;
    onConfirm({
      ground,
      box: activeBox,
      date: selectedDate.dateStr,
      dateDisplay: `${selectedDate.dayName}, ${selectedDate.dayNumber} ${selectedDate.monthName}`,
      slots: selectedSlotsList,
      totalHours: selectedSlotsList.length,
      totalAmount,
      advancePayable: paymentPreference === 'ADVANCE' ? advancePayable : totalAmount,
      balanceAmount: paymentPreference === 'ADVANCE' ? balanceAmount : 0,
      paymentPreference,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-[460px] rounded-3xl bg-white text-slate-900 shadow-2xl relative overflow-hidden my-auto border border-slate-100 max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-xs font-bold text-slate-900">Slot Booking Checkout</span>
            </div>

            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-emerald-600/30">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Ground Name & Floodlight Active */}
          <div className="mt-3 flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-1 text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>{ground.area}, SURAT</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                {ground.name}
              </h2>
            </div>
            
            <div className="text-right">
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold inline-flex items-center">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-1" />
                {ground.avgRating} (340+)
              </span>
              <div className="text-[10px] text-emerald-600 font-bold mt-1">
                Floodlights Active
              </div>
            </div>
          </div>

          {/* Box Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {ground.boxes.map((b) => {
              const isSelected = b.id === activeBoxId;
              return (
                <button
                  key={b.id}
                  onClick={() => setActiveBoxId(b.id)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                    <span>{b.name}</span>
                  </span>
                  <span className="text-[11px] font-black text-emerald-800">
                    ₹{b.basePrice}/hr
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 no-scrollbar">
          
          {/* Select Match Date */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900">Select Match Date</label>
              <span className="text-[11px] font-semibold text-emerald-700 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                {selectedDate.monthName} 2026
              </span>
            </div>

            <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
              {dates.map((d, idx) => {
                const isSelected = selectedDateIndex === idx;
                return (
                  <button
                    key={d.dateStr}
                    onClick={() => setSelectedDateIndex(idx)}
                    className={`flex-shrink-0 w-16 py-2.5 rounded-2xl text-center border transition-all relative ${
                      isSelected
                        ? 'bg-[#065f46] border-[#065f46] text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    {d.hasHighDemand && !isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#ff6813]" />
                    )}
                    <div className={`text-[10px] font-medium ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {d.dayName}
                    </div>
                    <div className="text-base font-black my-0.5">{d.dayNumber}</div>
                    <div className={`text-[10px] font-medium ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                      {d.subDay}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slot Legend */}
          <div className="flex items-center justify-between px-2 py-1 bg-slate-50 rounded-xl text-[10px] font-semibold text-slate-500">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full border border-slate-300 bg-white" />
              <span>Available</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#065f46]" />
              <span>Selected</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span>Booked</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Held</span>
            </span>
          </div>

          {/* Evening & Late Night Slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5 text-xs font-black text-slate-900">
                <span>🌅</span>
                <span>Evening & Late Night Slots</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-orange-50 text-[10px] font-bold text-orange-800 border border-orange-200">
                High Demand
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {slots.map((s) => {
                const isSelected = selectedSlotIds.includes(s.id);
                const isBooked = s.isBooked;

                if (isBooked) {
                  return (
                    <div
                      key={s.id}
                      className="p-3 rounded-2xl bg-slate-100/70 border border-slate-200 opacity-70 cursor-not-allowed select-none"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                        <span className="line-through">{s.label}</span>
                        <Lock className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200 text-[10px] text-slate-500">
                        <span>₹{s.price}</span>
                        <span className="truncate max-w-[80px]">{s.bookedBy}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSlot(s)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-[#065f46] border-[#065f46] text-white shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="truncate">{s.label}</span>
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-white text-[#065f46] flex items-center justify-center text-[10px] font-black">
                          ✓
                        </div>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/20">
                      <span className={`text-sm font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        ₹{s.price}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-emerald-700 text-emerald-100'
                          : s.tagType === 'prime'
                          ? 'bg-emerald-50 text-emerald-800'
                          : s.tagType === 'popular'
                          ? 'bg-orange-50 text-orange-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {s.tagType === 'prime' ? 'Prime Floodlight' : s.tagType === 'popular' ? 'Popular' : s.tagType === 'late' ? 'Late Night' : 'Standard'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Continuous Play Summary Card */}
          {selectedSlotsList.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#065f46]" />
              
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-black text-slate-900 flex items-center space-x-1">
                    <span>🏏</span>
                    <span>{selectedSlotsList.length} Hours Continuous Play</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {selectedDate.dayName}, {selectedDate.dayNumber} {selectedDate.monthName} • {selectedSlotsList[0]?.startTime} - {selectedSlotsList[selectedSlotsList.length - 1]?.endTime}
                  </div>
                </div>

                <div className="text-base font-black text-slate-900">
                  ₹{totalAmount}
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-bold bg-emerald-50/70 px-2 py-1 rounded-xl">
                <span className="flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Match Ball & Box Stumps Provided free</span>
                </span>
                <span className="text-[10px] uppercase font-black bg-white px-1.5 py-0.5 rounded text-emerald-800 border border-emerald-200">
                  Included
                </span>
              </div>
            </div>
          )}

          {/* Payment Preference */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900">Payment Preference</label>
              <span className="text-[10px] text-slate-500 font-semibold flex items-center">
                <ShieldCheck className="w-3 h-3 text-emerald-600 mr-1" />
                Guaranteed Slot
              </span>
            </div>

            <div className="space-y-2">
              
              {/* Option 1: Pay Advance 30% */}
              <button
                type="button"
                onClick={() => setPaymentPreference('ADVANCE')}
                className={`w-full p-3 rounded-2xl border text-left flex items-start justify-between transition-all ${
                  paymentPreference === 'ADVANCE'
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center ${
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
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Pay ₹{advancePayable} online now, balance ₹{balanceAmount} cash/UPI at turf
                    </div>
                  </div>
                </div>

                <div className="text-sm font-black text-slate-900">
                  ₹{advancePayable}
                </div>
              </button>

              {/* Option 2: Pay Full Amount */}
              <button
                type="button"
                onClick={() => setPaymentPreference('FULL')}
                className={`w-full p-3 rounded-2xl border text-left flex items-start justify-between transition-all ${
                  paymentPreference === 'FULL'
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                    paymentPreference === 'FULL'
                      ? 'border-emerald-600 bg-emerald-600'
                      : 'border-slate-300'
                  }`}>
                    {paymentPreference === 'FULL' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Pay Full Amount</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Quick seamless entry, no payments needed at ground
                    </div>
                  </div>
                </div>

                <div className="text-sm font-black text-slate-900">
                  ₹{totalAmount}
                </div>
              </button>

            </div>
          </div>

          {/* Cancellation Info Pill */}
          <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center space-x-2 text-xs text-blue-900">
            <span className="font-bold text-sm">₹</span>
            <span className="text-[11px] leading-tight">
              Free cancellation up to 4 hours before match time. Instant refund to your UPI.
            </span>
          </div>

        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between sticky bottom-0 z-20 shadow-lg">
          <div>
            <div className="text-[10px] text-slate-400 font-medium">
              Total: ₹{totalAmount} • {selectedSlotsList.length} Slots
            </div>
            <div className="text-lg font-black text-slate-900">
              ₹{paymentPreference === 'ADVANCE' ? advancePayable : totalAmount}{' '}
              <span className="text-xs font-normal text-slate-500">
                {paymentPreference === 'ADVANCE' ? 'Advance Payable' : 'Full Payment'}
              </span>
            </div>
          </div>

          <button
            onClick={handleProceed}
            disabled={selectedSlotsList.length === 0}
            className="px-7 py-3.5 stitch-btn-orange text-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Proceed</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
