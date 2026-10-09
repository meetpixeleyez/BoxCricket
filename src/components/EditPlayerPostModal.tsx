"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  Check, 
  Plus, 
  Minus,
  Save,
  Search,
  Phone,
  ChevronDown,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AvailabilityPost, TeamPost, PlayingRole } from '@/types';
import { 
  getTodayDateString, 
  isTimeInPastForDate, 
  isTimeWindowInPastForDate,
  isSameOrInvalidTimeRange,
  suggestEndTime,
  TIME_SLOTS_12H
} from '@/lib/dateUtils';

interface EditPlayerPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postType: 'SOLO' | 'TEAM';
  soloPost?: AvailabilityPost | null;
  teamPost?: TeamPost | null;
}

const cleanPhoneNumber = (ph?: string) => {
  if (!ph) return '';
  const digits = ph.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  return digits.slice(-10);
};

export const EditPlayerPostModal: React.FC<EditPlayerPostModalProps> = ({
  isOpen,
  onClose,
  postType,
  soloPost,
  teamPost
}) => {
  const { currentUser, grounds, updateAvailabilityPost, updateTeamPost } = useApp();

  // Dynamically extract unique localities with active registered box grounds
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

  // Shared Contact Calling Phone (Clean 10-digit number without +91)
  const [contactPhone, setContactPhone] = useState('');

  // Team Form State
  const [teamName, setTeamName] = useState('');
  const [neededPlayers, setNeededPlayers] = useState(1);
  const [selectedGroundId, setSelectedGroundId] = useState('');
  const [teamDate, setTeamDate] = useState('');
  const [teamFromTime, setTeamFromTime] = useState('09:00 PM');
  const [teamToTime, setTeamToTime] = useState('11:00 PM');
  const [isGroundDropdownOpen, setIsGroundDropdownOpen] = useState(false);
  const [groundSearchQuery, setGroundSearchQuery] = useState('');

  // Solo Form State
  const [playerRole, setPlayerRole] = useState<PlayingRole>('ALL_ROUNDER');
  const [centerArea, setCenterArea] = useState('Mota Varachha');
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [areaSearchQuery, setAreaSearchQuery] = useState('');
  const [soloDate, setSoloDate] = useState('');
  const [soloFromTime, setSoloFromTime] = useState('08:00 PM');
  const [soloToTime, setSoloToTime] = useState('11:00 PM');

  const todayStr = useMemo(() => getTodayDateString(), []);

  const [isSaved, setIsSaved] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const currentToday = getTodayDateString();

    if (postType === 'TEAM' && teamPost) {
      setTeamName(teamPost.teamName || '');
      setNeededPlayers(teamPost.neededPlayers || 1);
      const matchGround = grounds.find(g => g.name.toLowerCase() === teamPost.groundName.toLowerCase());
      setSelectedGroundId(matchGround ? matchGround.id : grounds[0]?.id || '');
      
      // If date is in past, default to today
      const validDate = teamPost.date && teamPost.date >= currentToday ? teamPost.date : currentToday;
      setTeamDate(validDate);
      setContactPhone(cleanPhoneNumber(teamPost.captainPhone || currentUser.phone));

      if (teamPost.time && teamPost.time.includes('-')) {
        const parts = teamPost.time.split('-').map(s => s.trim());
        const from = parts[0] || '09:00 PM';
        let to = parts[1] || '11:00 PM';
        if (from === to || isSameOrInvalidTimeRange(from, to).isInvalid) {
          to = suggestEndTime(from, 2);
        }
        setTeamFromTime(from);
        setTeamToTime(to);
      }
    } else if (postType === 'SOLO' && soloPost) {
      setPlayerRole(soloPost.role || 'ALL_ROUNDER');
      setCenterArea(soloPost.centerArea || 'Mota Varachha');
      
      // If date is in past, default to today
      const validDate = soloPost.date && soloPost.date >= currentToday ? soloPost.date : currentToday;
      setSoloDate(validDate);
      setContactPhone(cleanPhoneNumber(soloPost.playerPhone || currentUser.phone));

      if (soloPost.timeWindow && soloPost.timeWindow.includes('-')) {
        const parts = soloPost.timeWindow.split('-').map(s => s.trim());
        const from = parts[0] || '08:00 PM';
        let to = parts[1] || '11:00 PM';
        if (from === to || isSameOrInvalidTimeRange(from, to).isInvalid) {
          to = suggestEndTime(from, 2);
        }
        setSoloFromTime(from);
        setSoloToTime(to);
      }
    }
  }, [isOpen, postType, soloPost, teamPost, grounds, currentUser.phone]);

  const selectedGround = useMemo(() => {
    return grounds.find(g => g.id === selectedGroundId) || grounds[0];
  }, [grounds, selectedGroundId]);

  const filteredGroundsList = useMemo(() => {
    if (!groundSearchQuery.trim()) return grounds;
    const q = groundSearchQuery.toLowerCase().trim();
    return grounds.filter(g => 
      g.name.toLowerCase().includes(q) ||
      g.area.toLowerCase().includes(q) ||
      g.addressLine.toLowerCase().includes(q)
    );
  }, [grounds, groundSearchQuery]);

  const filteredLocalities = useMemo(() => {
    if (!areaSearchQuery.trim()) return registeredBoxAreas;
    return registeredBoxAreas.filter(loc => loc.toLowerCase().includes(areaSearchQuery.toLowerCase().trim()));
  }, [registeredBoxAreas, areaSearchQuery]);

  // Validation: Check if the currently selected time window has passed or is invalid
  const isTimeExpired = useMemo(() => {
    if (postType === 'TEAM') {
      return isTimeWindowInPastForDate(teamDate, teamFromTime, teamToTime);
    } else {
      return isTimeWindowInPastForDate(soloDate, soloFromTime, soloToTime);
    }
  }, [postType, teamDate, teamFromTime, teamToTime, soloDate, soloFromTime, soloToTime]);

  const isSameTime = useMemo(() => {
    if (postType === 'TEAM') {
      return teamFromTime.trim() === teamToTime.trim();
    } else {
      return soloFromTime.trim() === soloToTime.trim();
    }
  }, [postType, teamFromTime, teamToTime, soloFromTime, soloToTime]);

  const timeRangeError = useMemo(() => {
    if (postType === 'TEAM') {
      return isSameOrInvalidTimeRange(teamFromTime, teamToTime);
    } else {
      return isSameOrInvalidTimeRange(soloFromTime, soloToTime);
    }
  }, [postType, teamFromTime, teamToTime, soloFromTime, soloToTime]);

  const hasTimingError = isTimeExpired || isSameTime || timeRangeError.isInvalid;

  const handleSoloFromTimeChange = (newFrom: string) => {
    setSoloFromTime(newFrom);
    if (soloToTime === newFrom || isSameOrInvalidTimeRange(newFrom, soloToTime).isInvalid) {
      setSoloToTime(suggestEndTime(newFrom, 2));
    }
  };

  const handleTeamFromTimeChange = (newFrom: string) => {
    setTeamFromTime(newFrom);
    if (teamToTime === newFrom || isSameOrInvalidTimeRange(newFrom, teamToTime).isInvalid) {
      setTeamToTime(suggestEndTime(newFrom, 2));
    }
  };

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasTimingError) return;

    const finalPhone = contactPhone.trim() || currentUser.phone;

    if (postType === 'TEAM' && teamPost) {
      const formattedTime = `${teamFromTime} - ${teamToTime}`;
      const ground = selectedGround || grounds[0];

      updateTeamPost(teamPost.id, {
        teamName: teamName.trim() || teamPost.teamName,
        neededPlayers: Math.max(0, Number(neededPlayers)),
        groundName: ground?.name || teamPost.groundName,
        area: ground?.area || teamPost.area,
        lat: ground?.lat || teamPost.lat,
        lng: ground?.lng || teamPost.lng,
        date: teamDate,
        time: formattedTime,
        captainPhone: finalPhone
      });
    } else if (postType === 'SOLO' && soloPost) {
      const formattedTimeWindow = `${soloFromTime} - ${soloToTime}`;

      updateAvailabilityPost(soloPost.id, {
        role: playerRole,
        date: soloDate,
        timeWindow: formattedTimeWindow,
        centerArea: centerArea,
        playerPhone: finalPhone
      });
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      
      {/* Click outside to close backdrop */}
      <div className="absolute inset-0 z-0" onClick={onClose} />

      {/* Main Modal Card */}
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
                {postType === 'TEAM' ? 'Update Team Requirement' : 'Update Solo Player Post'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                Changes will sync live to matchmaking feed
              </span>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-800 border border-orange-200 text-[10.5px] font-bold">
            Live Edit
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 no-scrollbar">
          
          {isSaved ? (
            <div className="py-12 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl font-black shadow-inner">
                ✓
              </div>
              <h3 className="text-base font-black text-slate-900">
                Post Updated Successfully!
              </h3>
              <p className="text-xs text-slate-500">
                Your live requirements are now updated in Surat matchmaking feeds.
              </p>
            </div>
          ) : (
            <>
              {/* ─── TEAM EDIT FORM ─── */}
              {postType === 'TEAM' && (
                <div className="space-y-4">
                  {/* 1. Needed Players Stepper (e.g. 5 to 2) */}
                  <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-2">
                    <label className="text-xs font-black text-slate-900 block">
                      Players Needed *
                    </label>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600 font-medium">
                        Adjust remaining count:
                      </span>
                      <div className="flex items-center space-x-2 bg-white p-1 rounded-2xl border border-orange-300 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setNeededPlayers(prev => Math.max(0, prev - 1))}
                          className="w-8 h-8 rounded-xl bg-orange-100 text-orange-900 flex items-center justify-center font-black hover:bg-orange-200 transition-colors cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={22}
                          value={neededPlayers}
                          onChange={(e) => setNeededPlayers(Math.max(0, Math.min(22, Number(e.target.value) || 0)))}
                          className="w-10 text-center font-black text-slate-900 bg-transparent py-1 text-sm focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setNeededPlayers(prev => Math.min(22, prev + 1))}
                          className="w-8 h-8 rounded-xl bg-orange-100 text-orange-900 flex items-center justify-center font-black hover:bg-orange-200 transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2. Team Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Team / Squad Name
                    </label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. Varachha Super Kings"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                    />
                  </div>

                  {/* 3. Turf Ground Selector with Search & Locality */}
                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-bold text-slate-700 block">
                      Turf Ground & Locality *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsGroundDropdownOpen(prev => !prev)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 rounded-2xl text-xs font-bold flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer text-left"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="block text-slate-900 truncate">{selectedGround?.name}</span>
                        <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-700 flex-shrink-0" />
                          <span>{selectedGround?.area}, Surat</span>
                          <span className="text-slate-400 font-normal truncate">• {selectedGround?.addressLine}</span>
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isGroundDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isGroundDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2.5 max-h-56 overflow-y-auto no-scrollbar space-y-1">
                        <div className="relative mb-2">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search turf ground or area..."
                            value={groundSearchQuery}
                            onChange={(e) => setGroundSearchQuery(e.target.value)}
                            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                        {filteredGroundsList.map(g => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => {
                              setSelectedGroundId(g.id);
                              setIsGroundDropdownOpen(false);
                              setGroundSearchQuery('');
                            }}
                            className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between hover:bg-emerald-50 ${selectedGroundId === g.id ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700'}`}
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-bold block truncate">{g.name}</span>
                              <span className="text-[10.5px] text-emerald-800 font-medium">{g.area} • {g.addressLine}</span>
                            </div>
                            {selectedGroundId === g.id && <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 4. Match Date & Time Range */}
                  <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        Match Date *
                      </label>
                      <input
                        type="date"
                        min={todayStr}
                        value={teamDate}
                        onChange={(e) => setTeamDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-900 p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600"
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
                          className="w-full bg-white border border-slate-200 text-slate-900 p-2 rounded-xl text-[11px] font-semibold focus:outline-none focus:border-emerald-600 cursor-pointer"
                        >
                          {TIME_SLOTS_12H.map(slot => {
                            const isPast = isTimeInPastForDate(teamDate, slot);
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
                          value={teamToTime}
                          onChange={(e) => setTeamToTime(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-slate-900 p-2 rounded-xl text-[11px] font-semibold focus:outline-none focus:border-emerald-600 cursor-pointer"
                        >
                          {TIME_SLOTS_12H.map(slot => {
                            const isPast = isTimeInPastForDate(teamDate, slot);
                            const isSame = slot === teamFromTime;
                            const isDisabled = isPast || isSame;
                            return (
                              <option 
                                key={slot} 
                                value={slot}
                                disabled={isDisabled}
                                className={isDisabled ? 'text-slate-400 bg-slate-100' : ''}
                              >
                                {slot}{isSame ? ' (Same as start)' : isPast ? ' (Passed)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>

                    {/* Quick Presets for Team Match */}
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

                    {/* Timing Warning / Error Card for Team Requirement */}
                    {hasTimingError && (
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">
                            {isSameTime 
                              ? 'Start and End Times Cannot Be Identical' 
                              : isTimeExpired 
                              ? 'Match Timing Expired' 
                              : 'Invalid Match Time Range'}
                          </div>
                          <div className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                            {isSameTime 
                              ? `From Time and To Time are both set to ${teamFromTime}. Please select a different End Time to specify match duration.` 
                              : isTimeExpired 
                              ? `The selected time window (${teamFromTime} - ${teamToTime}) has already passed for ${teamDate === todayStr ? 'Today' : teamDate}. Please choose an upcoming timing above or tap a preset.` 
                              : (timeRangeError.errorMsg || 'Please select a valid time window where End Time is after Start Time.')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─── SOLO PLAYER EDIT FORM ─── */}
              {postType === 'SOLO' && (
                <div className="space-y-4">
                  {/* 1. Playing Role */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Playing Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { role: 'ALL_ROUNDER', label: '🏏 All-Rounder' },
                        { role: 'BATSMAN', label: '🏏 Top Batsman' },
                        { role: 'BOWLER', label: '⚡ Pace / Spin Bowler' },
                        { role: 'WICKET_KEEPER', label: '🧤 Wicket Keeper' }
                      ].map(item => (
                        <button
                          key={item.role}
                          type="button"
                          onClick={() => setPlayerRole(item.role as PlayingRole)}
                          className={`p-2.5 rounded-2xl text-xs font-bold border text-left transition-all cursor-pointer ${
                            playerRole === item.role
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Home / Preferred Locality Selector (Searchable) */}
                  <div className="relative space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Preferred Locality / Area *
                    </label>
                    
                    <button
                      type="button"
                      onClick={() => setIsAreaDropdownOpen(prev => !prev)}
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 flex items-center justify-between transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{centerArea}, Surat</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isAreaDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isAreaDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 z-50 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            autoFocus
                            value={areaSearchQuery}
                            onChange={(e) => setAreaSearchQuery(e.target.value)}
                            placeholder="Search locality..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                          />
                        </div>

                        <div className="max-h-48 overflow-y-auto no-scrollbar space-y-1 pt-1">
                          {filteredLocalities.map(loc => {
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
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Match Date & Time Window */}
                  <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        Match Date *
                      </label>
                      <input
                        type="date"
                        min={todayStr}
                        value={soloDate}
                        onChange={(e) => setSoloDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-900 p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          From Time
                        </label>
                        <select
                          value={soloFromTime}
                          onChange={(e) => handleSoloFromTimeChange(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-slate-900 p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 cursor-pointer"
                        >
                          {TIME_SLOTS_12H.map(slot => {
                            const isPast = isTimeInPastForDate(soloDate, slot);
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
                          value={soloToTime}
                          onChange={(e) => setSoloToTime(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-slate-900 p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 cursor-pointer"
                        >
                          {TIME_SLOTS_12H.map(slot => {
                            const isPast = isTimeInPastForDate(soloDate, slot);
                            const isSame = slot === soloFromTime;
                            const isDisabled = isPast || isSame;
                            return (
                              <option 
                                key={slot} 
                                value={slot}
                                disabled={isDisabled}
                                className={isDisabled ? 'text-slate-400 bg-slate-100' : ''}
                              >
                                {slot}{isSame ? ' (Same as start)' : isPast ? ' (Passed)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>

                    {/* Quick Presets for Solo Availability */}
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
                            setSoloFromTime(p.from);
                            setSoloToTime(p.to);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10.5px] font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex-shrink-0 cursor-pointer transition-colors"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    {/* Timing Warning / Error Card for Solo Availability */}
                    {hasTimingError && (
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">
                            {isSameTime 
                              ? 'Start and End Times Cannot Be Identical' 
                              : isTimeExpired 
                              ? 'Match Timing Expired' 
                              : 'Invalid Match Time Range'}
                          </div>
                          <div className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                            {isSameTime 
                              ? `From Time and To Time are both set to ${soloFromTime}. Please select a different End Time (e.g. 1-2 hours later) to establish match duration.` 
                              : isTimeExpired 
                              ? `The selected time window (${soloFromTime} - ${soloToTime}) has already passed for ${soloDate === todayStr ? 'Today' : soloDate}. Please choose an upcoming timing above or tap a preset.` 
                              : (timeRangeError.errorMsg || 'Please select a valid time window where End Time is after Start Time.')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─── SHARED CONTACT PHONE NUMBER FIELD (Editable for friend's or alternate phone) ─── */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 mt-2">
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
                    className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                  />
                </div>

                <p className="text-[10.5px] text-slate-500 leading-snug">
                  Other team players will contact you on this number for match coordination.
                </p>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={hasTimingError}
                  className="w-full py-3.5 stitch-btn-orange text-xs font-bold rounded-2xl shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSameTime 
                      ? 'Select Different End Time' 
                      : isTimeExpired 
                      ? 'Select Upcoming Timing to Save' 
                      : hasTimingError 
                      ? 'Select Valid Match Timing' 
                      : 'Save & Update Live Post'}
                  </span>
                </button>
              </div>
            </>
          )}

        </form>

      </div>
    </div>
  );
};
