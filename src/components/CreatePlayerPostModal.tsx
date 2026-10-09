"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Radio, 
  ChevronRight,
  ChevronDown,
  Send,
  Zap,
  Phone,
  Search,
  AlertCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PlayingRole } from '@/types';
import { 
  getTodayDateString, 
  isTimeInPastForDate, 
  isTimeWindowInPastForDate,
  suggestEndTime,
  isSameOrInvalidTimeRange
} from '@/lib/dateUtils';

interface CreatePlayerPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode: 'NEED_TEAM' | 'NEED_PLAYERS';
}

const TIME_SLOTS_12H = [
  '12:00 AM', '12:30 AM', '01:00 AM', '01:30 AM', '02:00 AM', '02:30 AM',
  '03:00 AM', '03:30 AM', '04:00 AM', '04:30 AM', '05:00 AM', '05:30 AM',
  '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
  '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM'
];

const cleanPhoneNumber = (ph?: string) => {
  if (!ph) return '';
  const digits = ph.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  return digits.slice(-10);
};

export const CreatePlayerPostModal: React.FC<CreatePlayerPostModalProps> = ({
  isOpen,
  onClose,
  defaultMode
}) => {
  const { 
    currentUser, 
    grounds, 
    teams, 
    createAvailabilityPost, 
    createTeamPost 
  } = useApp();

  const [mode, setMode] = useState<'NEED_TEAM' | 'NEED_PLAYERS'>(defaultMode);

  // Sync mode whenever modal is opened or defaultMode changes
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);

  // Dynamically extract ONLY unique localities that have active registered box cricket turfs
  const registeredBoxAreas = useMemo(() => {
    const areaSet = new Set<string>();
    grounds.forEach(g => {
      if (g.area && g.area.trim()) {
        areaSet.add(g.area.trim());
      }
    });
    const list = Array.from(areaSet);
    return list.length > 0 ? list.sort() : ['Mota Varachha', 'Adajan', 'Vesu', 'Katargam', 'Pal'];
  }, [grounds]);

  // Contact Phone State (Prefilled with clean 10-digit number without +91)
  const [contactPhone, setContactPhone] = useState<string>(() => cleanPhoneNumber(currentUser.phone));

  // Form State for Solo Player Availability
  const [playerRole, setPlayerRole] = useState<PlayingRole>('ALL_ROUNDER');
  const [centerArea, setCenterArea] = useState<string>(() => {
    if (currentUser.homeArea && registeredBoxAreas.includes(currentUser.homeArea)) {
      return currentUser.homeArea;
    }
    const firstGroundArea = grounds.find(g => g.area && g.area.trim())?.area;
    return firstGroundArea || registeredBoxAreas[0] || 'Mota Varachha';
  });
  
  const todayStr = useMemo(() => getTodayDateString(), []);

  // Custom Date & Time Range
  const [date, setDate] = useState<string>(() => getTodayDateString());
  const [fromTime, setFromTime] = useState('08:00 PM');
  const [toTime, setToTime] = useState('11:00 PM');

  // Searchable Area Dropdown State
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [areaSearchQuery, setAreaSearchQuery] = useState('');

  // Form State for Team Requirement
  const [teamName, setTeamName] = useState<string>('');
  const [selectedGroundId, setSelectedGroundId] = useState<string>(grounds[0]?.id || '');
  const [isGroundDropdownOpen, setIsGroundDropdownOpen] = useState(false);
  const [groundSearchQuery, setGroundSearchQuery] = useState('');
  
  const [neededPlayers, setNeededPlayers] = useState(2);
  const [teamDate, setTeamDate] = useState<string>(() => getTodayDateString());
  const [teamFromTime, setTeamFromTime] = useState('09:00 PM');
  const [teamToTime, setTeamToTime] = useState('11:00 PM');

  const [isSuccess, setIsSuccess] = useState(false);

  // Validation: Check if the currently selected time window has passed
  const isTimeExpired = useMemo(() => {
    if (mode === 'NEED_TEAM') {
      return isTimeWindowInPastForDate(date, fromTime, toTime);
    } else {
      return isTimeWindowInPastForDate(teamDate, teamFromTime, teamToTime);
    }
  }, [mode, date, fromTime, toTime, teamDate, teamFromTime, teamToTime]);

  const isSameTime = useMemo(() => {
    if (mode === 'NEED_TEAM') {
      return fromTime.trim() === toTime.trim();
    } else {
      return teamFromTime.trim() === teamToTime.trim();
    }
  }, [mode, fromTime, toTime, teamFromTime, teamToTime]);

  const timeRangeError = useMemo(() => {
    if (mode === 'NEED_TEAM') {
      return isSameOrInvalidTimeRange(fromTime, toTime);
    } else {
      return isSameOrInvalidTimeRange(teamFromTime, teamToTime);
    }
  }, [mode, fromTime, toTime, teamFromTime, teamToTime]);

  const hasTimingError = isTimeExpired || isSameTime || timeRangeError.isInvalid;

  const handleSoloFromTimeChange = (newFrom: string) => {
    setFromTime(newFrom);
    if (toTime === newFrom || isSameOrInvalidTimeRange(newFrom, toTime).isInvalid) {
      setToTime(suggestEndTime(newFrom, 2));
    }
  };

  const handleTeamFromTimeChange = (newFrom: string) => {
    setTeamFromTime(newFrom);
    if (teamToTime === newFrom || isSameOrInvalidTimeRange(newFrom, teamToTime).isInvalid) {
      setTeamToTime(suggestEndTime(newFrom, 2));
    }
  };

  // Sync contact phone if user object loads or modal reopens
  useEffect(() => {
    if (isOpen && currentUser.phone) {
      setContactPhone(prev => prev.trim() ? prev : cleanPhoneNumber(currentUser.phone));
    }
  }, [isOpen, currentUser.phone]);

  // Selected Ground object
  const selectedGround = useMemo(() => {
    return grounds.find(g => g.id === selectedGroundId) || grounds[0];
  }, [grounds, selectedGroundId]);

  // Filtered Grounds for Searchable Dropdown
  const filteredGroundsList = useMemo(() => {
    if (!groundSearchQuery.trim()) return grounds;
    const q = groundSearchQuery.toLowerCase().trim();
    return grounds.filter(g => 
      g.name.toLowerCase().includes(q) ||
      g.area.toLowerCase().includes(q) ||
      g.addressLine.toLowerCase().includes(q)
    );
  }, [grounds, groundSearchQuery]);

  // Filtered Localities for Searchable Dropdown (Only registered boxes)
  const filteredLocalities = useMemo(() => {
    if (!areaSearchQuery.trim()) return registeredBoxAreas;
    return registeredBoxAreas.filter(loc => loc.toLowerCase().includes(areaSearchQuery.toLowerCase().trim()));
  }, [registeredBoxAreas, areaSearchQuery]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasTimingError) return;

    const finalPhone = contactPhone.trim() || currentUser.phone;

    if (mode === 'NEED_TEAM') {
      const formattedTimeWindow = `${fromTime} - ${toTime}`;
      createAvailabilityPost({
        role: playerRole,
        date,
        timeWindow: formattedTimeWindow,
        centerArea,
        lat: 21.2412,
        lng: 72.8834,
        playerPhone: finalPhone
      });
    } else {
      const formattedTeamTime = `${teamFromTime} - ${teamToTime}`;
      const finalTeamName = teamName.trim() || `${currentUser.name}'s Squad`;
      const ground = selectedGround || grounds[0];

      createTeamPost({
        teamId: teams[0]?.id || `team_${Date.now()}`,
        teamName: finalTeamName,
        groundName: ground?.name || 'Box Cricket Arena',
        area: ground?.area || 'Mota Varachha',
        lat: ground?.lat || 21.2450,
        lng: ground?.lng || 72.8890,
        neededPlayers: Number(neededPlayers),
        date: teamDate,
        time: formattedTeamTime,
        captainPhone: finalPhone
      });
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
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
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white sticky top-0 z-30 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs font-black text-slate-900 block leading-tight">
                {mode === 'NEED_TEAM' ? 'Post Player Availability' : 'Post Team Requirement'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Live Matchmaking
              </span>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10.5px] font-bold">
            Instant Match
          </div>
        </div>

        {/* Mode Selector Toggle */}
        <div className="px-4 pt-3 pb-1 bg-slate-50 border-b border-slate-100">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/80 rounded-2xl">
            <button
              type="button"
              onClick={() => setMode('NEED_TEAM')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                mode === 'NEED_TEAM'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🙋 Solo Player</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('NEED_PLAYERS')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                mode === 'NEED_PLAYERS'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🛡️ Team Requirement</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 no-scrollbar">
          
          {isSuccess ? (
            <div className="py-12 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl font-black shadow-inner">
                ✓
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Post Published Live!
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {mode === 'NEED_TEAM' 
                  ? 'Captains in your area can now view your card and invite you for matches.' 
                  : 'Your team requirement is now active. Nearby players will be notified.'}
              </p>
            </div>
          ) : mode === 'NEED_TEAM' ? (
            /* Mode 1: Solo Player Availability Form */
            <>
              {/* Playing Role */}
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1.5">
                  Your Primary Playing Role *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'ALL_ROUNDER', label: '🏏 All-Rounder' },
                    { key: 'BATSMAN', label: '🏏 Batsman' },
                    { key: 'BOWLER', label: '⚡ Fast / Spin Bowler' },
                    { key: 'WICKET_KEEPER', label: '🧤 Wicket Keeper' },
                  ].map(r => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setPlayerRole(r.key as PlayingRole)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        playerRole === r.key
                          ? 'bg-[#065f46] text-white border-[#065f46] shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date & Timing Selection (From - To) */}
              <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    Available Date & Timing Window *
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Match Date
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      From Time
                    </label>
                    <select
                      value={fromTime}
                      onChange={(e) => handleSoloFromTimeChange(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 cursor-pointer"
                    >
                      {TIME_SLOTS_12H.map(slot => {
                        const isPast = isTimeInPastForDate(date, slot);
                        return (
                          <option 
                            key={slot} 
                            value={slot}
                            disabled={isPast}
                            className={isPast ? 'text-slate-400 bg-slate-100' : ''}
                          >
                            {slot}{isPast ? ' (Passed)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      To Time
                    </label>
                    <select
                      value={toTime}
                      onChange={(e) => setToTime(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 cursor-pointer"
                    >
                      {TIME_SLOTS_12H.map(slot => {
                        const isPast = isTimeInPastForDate(date, slot);
                        const isSame = slot === fromTime;
                        const isDisabled = isPast || isSame;
                        return (
                          <option 
                            key={slot} 
                            value={slot}
                            disabled={isDisabled}
                            className={isDisabled ? 'text-slate-400 bg-slate-100' : ''}
                          >
                            {slot}{isPast ? ' (Passed)' : isSame ? ' (Same as start)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center space-x-1.5 pt-1 overflow-x-auto no-scrollbar">
                  {[
                    { label: 'Night (8 - 11 PM)', from: '08:00 PM', to: '11:00 PM' },
                    { label: 'Late Night (11 PM - 2 AM)', from: '11:00 PM', to: '02:00 AM' },
                    { label: 'Overnight (2 - 5 AM)', from: '02:00 AM', to: '05:00 AM' },
                    { label: 'Morning (6 - 9 AM)', from: '06:00 AM', to: '09:00 AM' },
                    { label: 'Evening (5 - 8 PM)', from: '05:00 PM', to: '08:00 PM' },
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setFromTime(p.from);
                        setToTime(p.to);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10.5px] font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex-shrink-0 cursor-pointer transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Timing Warning / Error Alert */}
                {hasTimingError && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">
                        {isSameTime 
                          ? 'Invalid Time Duration' 
                          : (isTimeExpired ? 'Match Timing Expired' : 'Invalid Match Timing')}
                      </div>
                      <div className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                        {isSameTime
                          ? 'Start time and End time cannot be identical (e.g. 10:30 AM to 10:30 AM). Please select an end time that gives at least 1 hour of playing time.'
                          : isTimeExpired
                          ? `The selected time window (${fromTime} - ${toTime}) has already passed for ${date === todayStr ? 'Today' : date}. Please choose an upcoming timing above to publish live.`
                          : (timeRangeError.errorMsg || 'Please select a valid time range for your match.')}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Searchable Area Dropdown */}
              <div className="relative">
                <label className="text-xs font-bold text-slate-900 block mb-1.5">
                  Your Home / Preferred Area *
                </label>
                
                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsAreaDropdownOpen(prev => !prev)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 flex items-center justify-between transition-all cursor-pointer shadow-2xs"
                >
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{centerArea}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isAreaDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu with Searchbar */}
                {isAreaDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 z-40 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        autoFocus
                        value={areaSearchQuery}
                        onChange={(e) => setAreaSearchQuery(e.target.value)}
                        placeholder="Search area (e.g. Mota Varachha, Adajan, Vesu)..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                      {areaSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setAreaSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="max-h-48 overflow-y-auto no-scrollbar space-y-1 pt-1">
                      {filteredLocalities.length === 0 ? (
                        <div className="text-center py-4 text-xs text-slate-400">
                          No area found matching "{areaSearchQuery}"
                        </div>
                      ) : (
                        filteredLocalities.map(loc => {
                          const isSelected = centerArea.toLowerCase() === loc.toLowerCase();
                          return (
                            <button
                              key={loc}
                              type="button"
                              onClick={() => {
                                setCenterArea(loc);
                                setIsAreaDropdownOpen(false);
                                setAreaSearchQuery('');
                              }}
                              className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#065f46] text-white'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span>{loc}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Mode 2: Team Requirement Form */
            <>
              {/* Team / Squad Name (Optional) */}
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">
                  Team / Squad Name <span className="text-[10.5px] text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder={`e.g. ${currentUser.name}'s Squad`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                />
              </div>

              {/* Turf / Box Arena Selection with Exact Location & Address */}
              <div className="relative space-y-1.5">
                <label className="text-xs font-bold text-slate-900 block">
                  Select Box Cricket Ground / Turf *
                </label>
                
                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsGroundDropdownOpen(prev => !prev)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 flex items-center justify-between transition-all cursor-pointer shadow-2xs text-left"
                >
                  <div className="flex items-start space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm flex-shrink-0 mt-0.5">
                      🏟️
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-slate-900 text-xs truncate">
                        {selectedGround?.name || 'Select Ground'}
                      </div>
                      <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-emerald-700 flex-shrink-0" />
                        <span>{selectedGround?.area}, Surat</span>
                        <span className="text-slate-400 font-normal truncate">• {selectedGround?.addressLine}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ml-2 ${isGroundDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Ground Searchable Dropdown */}
                {isGroundDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 z-40 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        autoFocus
                        value={groundSearchQuery}
                        onChange={(e) => setGroundSearchQuery(e.target.value)}
                        placeholder="Search ground name, area, or address..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                      {groundSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setGroundSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="max-h-52 overflow-y-auto no-scrollbar space-y-1 pt-1">
                      {filteredGroundsList.length === 0 ? (
                        <div className="text-center py-4 text-xs text-slate-400">
                          No registered grounds found matching "{groundSearchQuery}"
                        </div>
                      ) : (
                        filteredGroundsList.map(g => {
                          const isSelected = selectedGround?.id === g.id;
                          return (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => {
                                setSelectedGroundId(g.id);
                                setIsGroundDropdownOpen(false);
                                setGroundSearchQuery('');
                              }}
                              className={`w-full p-2.5 rounded-xl text-xs text-left flex items-start justify-between transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-50 border border-emerald-300'
                                  : 'hover:bg-slate-50 border border-transparent'
                              }`}
                            >
                              <div className="min-w-0 flex-1 pr-2">
                                <div className="font-black text-slate-900 text-xs truncate">{g.name}</div>
                                <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-emerald-700 flex-shrink-0" />
                                  <span>{g.area}, Surat</span>
                                </div>
                                <div className="text-[10px] text-slate-500 truncate mt-0.5">{g.addressLine}</div>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-1" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Players Needed Counter & Stepper */}
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1.5">
                  Players Needed *
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setNeededPlayers(prev => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-sm text-slate-800 cursor-pointer shadow-2xs transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={22}
                      value={neededPlayers}
                      onChange={(e) => setNeededPlayers(Math.max(1, Math.min(22, Number(e.target.value) || 1)))}
                      className="w-14 text-center font-black text-slate-900 bg-transparent py-1 text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setNeededPlayers(prev => Math.min(22, prev + 1))}
                      className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-sm text-slate-800 cursor-pointer shadow-2xs transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-xs font-bold text-slate-700">
                    {neededPlayers === 1 ? '1 Player' : `${neededPlayers} Players Needed`}
                  </span>
                </div>
              </div>

              {/* Match Date & Time Window */}
              <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Match Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={teamDate}
                    onChange={(e) => setTeamDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      From Time
                    </label>
                    <select
                      value={teamFromTime}
                      onChange={(e) => handleTeamFromTimeChange(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 cursor-pointer"
                    >
                      {TIME_SLOTS_12H.map(s => {
                        const isPast = isTimeInPastForDate(teamDate, s);
                        return (
                          <option 
                            key={s} 
                            value={s}
                            disabled={isPast}
                            className={isPast ? 'text-slate-400 bg-slate-100' : ''}
                          >
                            {s}{isPast ? ' (Passed)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      To Time
                    </label>
                    <select
                      value={teamToTime}
                      onChange={(e) => setTeamToTime(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 cursor-pointer"
                    >
                      {TIME_SLOTS_12H.map(s => {
                        const isPast = isTimeInPastForDate(teamDate, s);
                        const isSame = s === teamFromTime;
                        const isDisabled = isPast || isSame;
                        return (
                          <option 
                            key={s} 
                            value={s}
                            disabled={isDisabled}
                            className={isDisabled ? 'text-slate-400 bg-slate-100' : ''}
                          >
                            {s}{isPast ? ' (Passed)' : isSame ? ' (Same as start)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center space-x-1.5 pt-1 overflow-x-auto no-scrollbar">
                  {[
                    { label: 'Night (8 - 11 PM)', from: '08:00 PM', to: '11:00 PM' },
                    { label: 'Late Night (11 PM - 2 AM)', from: '11:00 PM', to: '02:00 AM' },
                    { label: 'Overnight (2 - 5 AM)', from: '02:00 AM', to: '05:00 AM' },
                    { label: 'Morning (6 - 9 AM)', from: '06:00 AM', to: '09:00 AM' },
                    { label: 'Evening (5 - 8 PM)', from: '05:00 PM', to: '08:00 PM' },
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setTeamFromTime(p.from);
                        setTeamToTime(p.to);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10.5px] font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex-shrink-0 cursor-pointer transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Expired / Timing Warning Card for Team Requirement */}
                {hasTimingError && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">
                        {isSameTime 
                          ? 'Invalid Time Duration' 
                          : (isTimeExpired ? 'Match Timing Expired' : 'Invalid Match Timing')}
                      </div>
                      <div className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                        {isSameTime
                          ? 'Start time and End time cannot be identical (e.g. 10:30 AM to 10:30 AM). Please select an end time that gives at least 1 hour of playing time.'
                          : isTimeExpired
                          ? `The selected time window (${teamFromTime} - ${teamToTime}) has already passed for ${teamDate === todayStr ? 'Today' : teamDate}. Please choose an upcoming timing above to publish live.`
                          : (timeRangeError.errorMsg || 'Please select a valid time range for your match.')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Contact Phone Number Input (User can specify own or friend's calling number) */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>Contact / Calling Number *</span>
              </label>
              {contactPhone !== cleanPhoneNumber(currentUser.phone) && (
                <button
                  type="button"
                  onClick={() => setContactPhone(cleanPhoneNumber(currentUser.phone))}
                  className="text-[10px] text-emerald-800 hover:text-emerald-950 font-bold underline cursor-pointer"
                >
                  Reset to my number
                </button>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
              />
            </div>

            <p className="text-[10.5px] text-slate-500 leading-snug">
              {mode === 'NEED_TEAM' 
                ? 'Other team players will contact you on this number for match coordination.' 
                : 'Interested players will contact you on this number to join your team.'}
            </p>
          </div>

          {/* Submit Action Button */}
          {!isSuccess && (
            <button
              type="submit"
              disabled={hasTimingError}
              className="w-full py-3.5 stitch-btn-orange text-xs flex items-center justify-center space-x-2 font-bold shadow-lg shadow-orange-500/25 cursor-pointer mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSameTime 
                  ? 'Select Different End Time'
                  : isTimeExpired 
                  ? 'Select Upcoming Timing to Publish' 
                  : (mode === 'NEED_TEAM' ? 'Publish Availability Post' : 'Publish Team Requirement')}
              </span>
            </button>
          )}

        </form>

      </div>
    </div>
  );
};
