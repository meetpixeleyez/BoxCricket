"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  CheckCircle2, 
  Edit3, 
  Phone, 
  MessageSquare, 
  Sun, 
  Zap, 
  Calendar, 
  ShieldCheck, 
  Sparkles,
  Camera,
  Plus
} from 'lucide-react';

export default function OwnerGroundRegistrationPage() {
  const { currentUser, grounds } = useApp();

  const [currentStep, setCurrentStep] = useState(2);
  const [pitchName, setPitchName] = useState('Box A (Main Floodlight Pitch)');
  const [enclosureType, setEnclosureType] = useState('360_NET');
  const [widthFt, setWidthFt] = useState('45');
  const [lengthFt, setLengthFt] = useState('75');
  const [squadFormat, setSquadFormat] = useState('7v7');

  // Pricing
  const [dayRate, setDayRate] = useState('700');
  const [primeRate, setPrimeRate] = useState('900');
  const [weekendRate, setWeekendRate] = useState('1000');
  const [slotDuration, setSlotDuration] = useState('60');

  // Advance UPI
  const [requireAdvance, setRequireAdvance] = useState(true);
  const [advancePercent, setAdvancePercent] = useState('30');
  const [upiId, setUpiId] = useState('royalboxcricket@okhdfcbank');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleNext = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      alert('Step 2 saved! Proceeding to Step 3: Facility & Amenities.');
    }, 1000);
  };

  return (
    <div className="p-4 space-y-5 pb-28">
      
      {/* 1. Stepper Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
            <span className="w-5 h-5 rounded-full bg-[#065f46] text-white flex items-center justify-center text-[11px] font-black">
              2
            </span>
            <span>Step 2 of 5</span>
          </div>
          <span className="text-xs font-bold text-[#ff6813]">
            ૪૦% પૂર્ણ (40% Complete)
          </span>
        </div>

        <div>
          <h1 className="text-lg font-black text-slate-900 leading-tight">
            Ground & Pitch Setup
          </h1>
          <p className="text-xs text-slate-400">ગ્રાઉન્ડ અને પીચ વિગતો</p>
        </div>

        {/* 5 Step Pills */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          <div className="h-1.5 rounded-full bg-emerald-600" title="1. Info" />
          <div className="h-1.5 rounded-full bg-[#ff6813]" title="2. Pitches" />
          <div className="h-1.5 rounded-full bg-slate-200" title="3. Facility" />
          <div className="h-1.5 rounded-full bg-slate-200" title="4. Photos" />
          <div className="h-1.5 rounded-full bg-slate-200" title="5. UPI" />
        </div>

        <div className="flex justify-between text-[10px] font-bold text-slate-400">
          <span className="text-emerald-700">1. Info ✓</span>
          <span className="text-[#ff6813]">2. Pitches</span>
          <span>3. Facility</span>
          <span>4. Photos</span>
          <span>5. UPI</span>
        </div>
      </div>

      {/* 2. Draft Ground Summary Card */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-bold">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Draft Ground</span>
            </span>
            <span className="text-slate-400">ID: SR-9402</span>
          </div>
          <h3 className="text-sm font-black text-slate-900 mt-1">
            Royal Turf & Box Cricket Arena
          </h3>
          <div className="text-[11px] text-slate-500 mt-0.5">
            📍 Mota Varachha, Surat • +91 98254 XXXXX
          </div>
        </div>

        <button className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Box & Pitch Specifications */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-sm">
              🏏
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Box & Pitch Specifications</h3>
              <p className="text-[10px] text-slate-400">પીચ પ્રકાર અને ક્ષમતા (Court Specs)</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
            Pitch #1
          </span>
        </div>

        {/* Box Name */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-900">Box / Pitch Name *</label>
            <span className="text-[10px] text-slate-400">બોક્સનું નામ</span>
          </div>
          <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 focus-within:border-emerald-600 focus-within:bg-white transition-all">
            <input
              type="text"
              value={pitchName}
              onChange={(e) => setPitchName(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
            />
            <Check className="w-4 h-4 text-emerald-600 ml-2" />
          </div>
        </div>

        {/* Pitch Enclosure Type */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-900">Pitch Enclosure Type</label>
            <span className="text-[10px] text-slate-400">પીચ કવરેજ</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '360_NET', title: '360° Netting', sub: 'Closed Box' },
              { id: 'OPEN', title: 'Open Turf', sub: 'ખુલ્લા ટર્ફ' },
              { id: 'ROOF', title: 'Covered Roof', sub: 'શેડ વાળું' },
            ].map((t) => {
              const isSelected = enclosureType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEnclosureType(t.id)}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'bg-[#065f46] text-white border-[#065f46] shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">{t.title}</div>
                  <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                    {t.sub}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-900">Dimensions (In Feet)</label>
            <span className="text-[10px] text-slate-400">માપ (ફૂટ માં)</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Width (પહોળાઈ)</div>
                <input
                  type="number"
                  value={widthFt}
                  onChange={(e) => setWidthFt(e.target.value)}
                  className="bg-transparent text-sm font-black text-slate-900 w-16 focus:outline-none"
                />
              </div>
              <span className="text-xs font-bold text-slate-400">ft</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Length (લંબાઈ)</div>
                <input
                  type="number"
                  value={lengthFt}
                  onChange={(e) => setLengthFt(e.target.value)}
                  className="bg-transparent text-sm font-black text-slate-900 w-16 focus:outline-none"
                />
              </div>
              <span className="text-xs font-bold text-slate-400">ft</span>
            </div>
          </div>
        </div>

        {/* Ideal Squad Format */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-900">Ideal Squad Format</label>
            <span className="text-[10px] text-slate-400">ખેલાડી ક્ષમતા</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '6v6', title: '6 vs 6', sub: '(12 Players)' },
              { id: '7v7', title: '7 vs 7', sub: '(14 Recommended)' },
              { id: '8v8', title: '8 vs 8', sub: '(16 Players)' },
            ].map((f) => {
              const isSelected = squadFormat === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSquadFormat(f.id)}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'bg-[#065f46] text-white border-[#065f46] shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">{f.title}</div>
                  <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                    {f.sub}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4. Hourly Pricing & Duration */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center text-sm">
            ₹
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">Hourly Pricing & Duration</h3>
            <p className="text-[10px] text-slate-400">દર કલાકનો ભાવ અને સમયગાળો</p>
          </div>
        </div>

        {/* Daytime */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Sun className="w-4 h-4 text-amber-500" />
            <div>
              <div className="text-xs font-bold text-slate-900">Daytime Rate</div>
              <div className="text-[10px] text-slate-400">6:00 AM - 6:00 PM</div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-sm font-black text-slate-900">₹</span>
            <input
              type="number"
              value={dayRate}
              onChange={(e) => setDayRate(e.target.value)}
              className="w-16 p-1 rounded-lg bg-white border border-slate-200 text-sm font-black text-slate-900 text-center"
            />
            <span className="text-[10px] text-slate-400">/hr</span>
          </div>
        </div>

        {/* Prime Floodlight */}
        <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-200 flex items-center justify-between relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#ff6813]" />
          <div className="flex items-center space-x-2.5">
            <Zap className="w-4 h-4 text-[#ff6813]" />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-slate-900">Prime Floodlight</span>
                <span className="px-1.5 py-0.2 rounded bg-orange-200 text-orange-900 text-[9px] font-bold">
                  રાત્રિ લાઈટ
                </span>
              </div>
              <div className="text-[10px] text-slate-500">6:00 PM - 12:00 AM</div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-sm font-black text-[#ff6813]">₹</span>
            <input
              type="number"
              value={primeRate}
              onChange={(e) => setPrimeRate(e.target.value)}
              className="w-16 p-1 rounded-lg bg-white border border-orange-300 text-sm font-black text-[#ff6813] text-center"
            />
            <span className="text-[10px] text-slate-400">/hr</span>
          </div>
        </div>

        {/* Weekend Rate */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Calendar className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-xs font-bold text-slate-900">Weekend Rate</div>
              <div className="text-[10px] text-slate-400">શનિ & રવિ (Sat & Sun)</div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-sm font-black text-slate-900">₹</span>
            <input
              type="number"
              value={weekendRate}
              onChange={(e) => setWeekendRate(e.target.value)}
              className="w-16 p-1 rounded-lg bg-white border border-slate-200 text-sm font-black text-slate-900 text-center"
            />
            <span className="text-[10px] text-slate-400">/hr</span>
          </div>
        </div>

        {/* Booking Slot Duration */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-900">Booking Slot Duration</label>
            <span className="text-[10px] text-slate-400">સ્લોટ સમયગાળો</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['60', '90', '120'].map((dur) => {
              const isSelected = slotDuration === dur;
              return (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setSlotDuration(dur)}
                  className={`py-2.5 rounded-2xl text-xs font-bold text-center border transition-all ${
                    isSelected
                      ? 'bg-[#065f46] text-white border-[#065f46] shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {dur} min {isSelected && '✓'}
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-500 mt-2">
            💡 Most Surat turfs prefer 60-minute recurring slots for seamless scheduling.
          </p>
        </div>

      </div>

      {/* 5. Advance UPI Collection */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm">
            💳
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">Advance UPI Collection</h3>
            <p className="text-[10px] text-slate-400">એડવાન્સ પેમેન્ટ સેટિંગ્સ</p>
          </div>
        </div>

        {/* Toggle */}
        <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-900">Require Advance via UPI</div>
            <div className="text-[10px] text-slate-500">નો-શો બચાવવા માટે એડવાન્સ જરૂરી છે</div>
          </div>

          <button
            type="button"
            onClick={() => setRequireAdvance(!requireAdvance)}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
              requireAdvance ? 'bg-[#065f46]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                requireAdvance ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Minimum Advance Required */}
        {requireAdvance && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900">Minimum Advance Required</label>
              <span className="text-[10px] text-slate-400">કેટલા ટકા એડવાન્સ?</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { val: '20', price: '₹180 / slot' },
                { val: '30', price: '★ Recommended', isRec: true },
                { val: '50', price: '₹450 / slot' },
              ].map((adv) => {
                const isSelected = advancePercent === adv.val;
                return (
                  <button
                    key={adv.val}
                    type="button"
                    onClick={() => setAdvancePercent(adv.val)}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-[#065f46] text-white border-[#065f46] shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-sm font-black">{adv.val}%</div>
                    <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                      {adv.price}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* UPI ID */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-900">Payout UPI ID (Instant Ground Settlement)</label>
            <span className="text-[10px] text-slate-400">તમારો UPI ID</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm">📱</span>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none w-48"
              />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center space-x-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Verified</span>
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Direct bank transfer on match completion. Zero commission on first 50 bookings.</span>
          </div>
        </div>

      </div>

      {/* 6. Current Pitch Snapshots */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-black text-slate-900">Current Pitch Snapshots</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">2 uploaded</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="relative h-24 rounded-2xl overflow-hidden border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400"
              alt="Box A Turf"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">
              Box A Turf
            </span>
          </div>

          <div className="relative h-24 rounded-2xl overflow-hidden border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1531415074868-036b1c5f53ec?w=400"
              alt="Floodlights View"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">
              Floodlights View
            </span>
          </div>
        </div>
      </div>

      {/* 7. Surat Onboarding Support Banner */}
      <div className="p-4 rounded-3xl bg-blue-50/80 border border-blue-100 shadow-sm space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-[#ff6813] text-white flex items-center justify-center text-sm flex-shrink-0">
            🏟️
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">
              સુરત ઓનબોર્ડિંગ સહાયતા (Need Help?)
            </h4>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Call our Surat ground team or WhatsApp <strong className="text-slate-900">+91 98250 12345</strong>. We visit your ground in Mota Varachha, Adajan, or Vesu for <strong className="text-emerald-800">free HD photography & slot setup!</strong>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <a
            href="tel:+919825012345"
            className="py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <Phone className="w-3.5 h-3.5 text-slate-600" />
            <span>Call Team</span>
          </a>

          <a
            href="https://wa.me/919825012345"
            target="_blank"
            rel="noreferrer"
            className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* 8. Bottom Action Buttons */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <Link
          href="/"
          className="py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs text-center flex items-center justify-center space-x-1 hover:bg-slate-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Link>

        <button
          onClick={handleNext}
          className="col-span-2 py-3.5 stitch-btn-orange text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-md"
        >
          <span>Save & Next: Amenities</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
