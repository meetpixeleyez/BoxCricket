"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Users, 
  MapPin, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Phone, 
  Share2, 
  Sparkles,
  ArrowRight,
  Shield,
  Search,
  RotateCcw,
  Check,
  X,
  Navigation,
  Inbox,
  Trash2,
  Calendar,
  CalendarDays,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Pencil,
  AlertCircle
} from 'lucide-react';
import { AvailabilityPost, TeamPost } from '@/types';
import { CreatePlayerPostModal } from '@/components/CreatePlayerPostModal';
import { EditPlayerPostModal } from '@/components/EditPlayerPostModal';
import { 
  getTodayDateString, 
  parseTimeToMinutes, 
  isTimeWindowInPastForDate,
  formatDateDisplay 
} from '@/lib/dateUtils';

type MainTab = 'NEED_TEAM' | 'NEED_PLAYERS' | 'MY_ACTIVITY';

export default function FindPlayersPage() {
  const { 
    availabilityPosts, 
    teamPosts, 
    grounds, 
    currentUser, 
    updateAvailabilityPostStatus,
    deleteAvailabilityPost,
    updateTeamPostStatus,
    deleteTeamPost
  } = useApp();

  // Helper date generators (Local-safe, prevents UTC midnight skew)
  const getTodayStr = () => getTodayDateString(0);
  const getTomorrowStr = () => getTodayDateString(1);
  const getNext7DaysStr = () => getTodayDateString(7);

  // Helper: check if post date & time window is expired (past)
  const isPostDateTimeExpired = (dateStr?: string, timeStr?: string): boolean => {
    if (!dateStr || !timeStr) return false;
    let startTimeStr = timeStr;
    let endTimeStr = timeStr;
    if (timeStr.includes('-')) {
      const parts = timeStr.split('-').map(s => s.trim());
      startTimeStr = parts[0];
      endTimeStr = parts[1] || parts[0];
    }
    return isTimeWindowInPastForDate(dateStr, startTimeStr, endTimeStr);
  };

  // Dynamically extract ONLY unique localities that have registered active box cricket turfs
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

  // Mode: 'NEED_TEAM' | 'NEED_PLAYERS' | 'MY_ACTIVITY'
  const [activeTab, setActiveTab] = useState<MainTab>('NEED_TEAM');
  
  // Search & Locality Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('All Surat');

  // Dedicated Date & Range Filter State
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [datePreset, setDatePreset] = useState<'ALL_DATES' | 'TODAY' | 'TOMORROW' | 'NEXT_7_DAYS' | 'CUSTOM'>('ALL_DATES');
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');
  
  // Create Post Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [postModalMode, setPostModalMode] = useState<'NEED_TEAM' | 'NEED_PLAYERS'>('NEED_TEAM');

  // Edit Post Modal State
  const [editingSoloPost, setEditingSoloPost] = useState<AvailabilityPost | null>(null);
  const [editingTeamPost, setEditingTeamPost] = useState<TeamPost | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Status & Delete Confirmation Modal State
  interface ConfirmModalState {
    isOpen: boolean;
    type: 'SOLO_MATCH' | 'SOLO_REACTIVATE' | 'TEAM_FILL' | 'TEAM_REOPEN' | 'DELETE_SOLO' | 'DELETE_TEAM';
    postId: string;
    title: string;
    message: string;
    confirmText: string;
    variant: 'emerald' | 'amber' | 'rose';
  }

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    type: 'SOLO_MATCH',
    postId: '',
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'emerald'
  });

  const handleConfirmAction = () => {
    if (!confirmModal.postId) return;

    if (confirmModal.type === 'SOLO_MATCH') {
      updateAvailabilityPostStatus(confirmModal.postId, 'MATCHED');
    } else if (confirmModal.type === 'SOLO_REACTIVATE') {
      updateAvailabilityPostStatus(confirmModal.postId, 'ACTIVE');
    } else if (confirmModal.type === 'TEAM_FILL') {
      updateTeamPostStatus(confirmModal.postId, 'FILLED');
    } else if (confirmModal.type === 'TEAM_REOPEN') {
      updateTeamPostStatus(confirmModal.postId, 'OPEN');
    } else if (confirmModal.type === 'DELETE_SOLO') {
      deleteAvailabilityPost(confirmModal.postId);
    } else if (confirmModal.type === 'DELETE_TEAM') {
      deleteTeamPost(confirmModal.postId);
    }

    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // Date Filter matching helper
  const matchesDateFilter = (postDateStr?: string) => {
    if (!postDateStr) return true;
    const today = getTodayStr();
    const tomorrow = getTomorrowStr();
    const next7Days = getNext7DaysStr();

    if (datePreset === 'TODAY') {
      return postDateStr === today;
    }
    if (datePreset === 'TOMORROW') {
      return postDateStr === tomorrow;
    }
    if (datePreset === 'NEXT_7_DAYS') {
      return postDateStr >= today && postDateStr <= next7Days;
    }
    if (datePreset === 'CUSTOM') {
      if (customFromDate && postDateStr < customFromDate) return false;
      if (customToDate && postDateStr > customToDate) return false;
      return true;
    }
    return true;
  };

  const getDateFilterLabel = () => {
    switch (datePreset) {
      case 'ALL_DATES': return 'All Dates';
      case 'TODAY': return 'Today';
      case 'TOMORROW': return 'Tomorrow';
      case 'NEXT_7_DAYS': return 'Next 7 Days';
      case 'CUSTOM':
        if (customFromDate && customToDate) return `${customFromDate} to ${customToDate}`;
        if (customFromDate) return `From ${customFromDate}`;
        if (customToDate) return `Up to ${customToDate}`;
        return 'Custom Range';
      default: return 'All Dates';
    }
  };

  // Real-time automatic expiration ticker (runs every 30s so posts auto-expire live without page reload)
  const [currentTimeTicker, setCurrentTimeTicker] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeTicker(Date.now());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  // ─── Filtered Solo Players List (Public Feed - Non-expired & other players only) ─
  const filteredAvailabilityPosts = useMemo(() => {
    let list = availabilityPosts.filter(p => p.status === 'ACTIVE' && p.playerId !== currentUser.id && !isPostDateTimeExpired(p.date, p.timeWindow));

    if (selectedArea !== 'All Surat') {
      list = list.filter(p => p.centerArea?.toLowerCase() === selectedArea.toLowerCase());
    }

    list = list.filter(p => matchesDateFilter(p.date));

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        p.playerName?.toLowerCase().includes(q) ||
        p.role?.toLowerCase().includes(q) ||
        p.centerArea?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [availabilityPosts, currentUser.id, selectedArea, datePreset, customFromDate, customToDate, searchQuery, currentTimeTicker]);

  // ─── Filtered Team Posts List (Public Feed - Non-expired & other teams only) ───
  const filteredTeamPosts = useMemo(() => {
    let list = teamPosts.filter(p => p.status === 'OPEN' && p.captainId !== currentUser.id && !isPostDateTimeExpired(p.date, p.time));

    if (selectedArea !== 'All Surat') {
      list = list.filter(p => p.area?.toLowerCase() === selectedArea.toLowerCase());
    }

    list = list.filter(p => matchesDateFilter(p.date));

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        p.teamName?.toLowerCase().includes(q) ||
        p.captainName?.toLowerCase().includes(q) ||
        p.groundName?.toLowerCase().includes(q) ||
        p.area?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [teamPosts, currentUser.id, selectedArea, datePreset, customFromDate, customToDate, searchQuery, currentTimeTicker]);

  // ─── User Created Posts List (My Activity) ──────────────────────────────
  const myAvailabilityPosts = useMemo(() => {
    return availabilityPosts.filter(p => p.playerId === currentUser.id);
  }, [availabilityPosts, currentUser.id, currentTimeTicker]);

  const myTeamPosts = useMemo(() => {
    return teamPosts.filter(p => p.captainId === currentUser.id);
  }, [teamPosts, currentUser.id, currentTimeTicker]);

  const handleSharePost = (title: string, details: string, mapUrl?: string) => {
    const text = `🏏 ${title}\n${details}${mapUrl ? `\n📍 Map Location: ${mapUrl}` : ''}\nConnect on BoxKhel Surat: http://localhost:3000/find-players`;
    if (navigator.share) {
      navigator.share({ title, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Post link copied to clipboard! Share with your cricket squad.');
    }
  };

  const isFilterActive = selectedArea !== 'All Surat' || datePreset !== 'ALL_DATES' || customFromDate !== '' || customToDate !== '' || searchQuery.trim() !== '';

  const resetFilters = () => {
    setSelectedArea('All Surat');
    setDatePreset('ALL_DATES');
    setCustomFromDate('');
    setCustomToDate('');
    setSearchQuery('');
    setIsDatePopoverOpen(false);
  };

  const formatPhoneNumber = (ph?: string) => {
    if (!ph) return '';
    const digits = ph.replace(/\D/g, '');
    const clean10 = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits.slice(-10);
    return clean10.length === 10 ? `+91\u00A0${clean10}` : ph;
  };

  const formatPlayingRole = (role: string) => {
    switch (role) {
      case 'ALL_ROUNDER': return '🏏 All-Rounder';
      case 'BATSMAN': return '🏏 Top Batsman';
      case 'BOWLER': return '⚡ Pace / Spin Bowler';
      case 'WICKET_KEEPER': return '🧤 Wicket Keeper';
      default: return role;
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      
      {/* 1. Main Tabs: Need Team vs Need Players vs My Activity */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/70 rounded-2xl">
        <button
          onClick={() => setActiveTab('NEED_TEAM')}
          className={`py-2.5 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
            activeTab === 'NEED_TEAM'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className={`w-3.5 h-3.5 ${activeTab === 'NEED_TEAM' ? 'text-emerald-700' : 'text-slate-500'}`} />
          <span className="truncate">Need Team</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            activeTab === 'NEED_TEAM' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300 text-slate-700'
          }`}>
            {filteredAvailabilityPosts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('NEED_PLAYERS')}
          className={`py-2.5 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
            activeTab === 'NEED_PLAYERS'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className={`w-3.5 h-3.5 ${activeTab === 'NEED_PLAYERS' ? 'text-emerald-700' : 'text-slate-500'}`} />
          <span className="truncate">Need Players</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            activeTab === 'NEED_PLAYERS' ? 'bg-orange-100 text-orange-800' : 'bg-slate-300 text-slate-700'
          }`}>
            {filteredTeamPosts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('MY_ACTIVITY')}
          className={`py-2.5 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer relative ${
            activeTab === 'MY_ACTIVITY'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Inbox className={`w-3.5 h-3.5 ${activeTab === 'MY_ACTIVITY' ? 'text-emerald-700' : 'text-slate-500'}`} />
          <span className="truncate">My Activity</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            activeTab === 'MY_ACTIVITY' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300 text-slate-700'
          }`}>
            {myAvailabilityPosts.length + myTeamPosts.length}
          </span>
        </button>
      </div>

      {/* 2. Search Bar & Locality Strip (Feed tabs only) */}
      {activeTab !== 'MY_ACTIVITY' && (
        <>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'NEED_TEAM' ? 'Search player by name, role (bowler, batsman), area...' : 'Search team by name, turf arena, area...'}
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

            {isFilterActive && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-3.5 py-2.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 rounded-2xl text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs flex-shrink-0"
                title="Reset Filters"
              >
                <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Surat Area / Locality Scrollable Strip (Purely Localities) */}
          <div 
            className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5"
            onWheel={(e) => {
              if (e.deltaY !== 0) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
          >
            <button
              onClick={() => setSelectedArea('All Surat')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                selectedArea === 'All Surat'
                  ? 'bg-[#065f46] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {selectedArea === 'All Surat' && <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" />}
              <span>All Surat</span>
            </button>

            {registeredBoxAreas.map((area) => {
              const isSelected = selectedArea.toLowerCase() === area.toLowerCase();
              return (
                <button
                  key={area}
                  onClick={() => setSelectedArea(isSelected ? 'All Surat' : area)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                    isSelected
                      ? 'bg-[#065f46] text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 mr-0.5 text-emerald-700 inline" />
                  <span>{area}</span>
                </button>
              );
            })}
          </div>

          {/* 3. Dedicated Date Filter & Header Actions */}
          <div className="relative z-30 flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center space-x-2 text-xs font-black text-slate-900">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {activeTab === 'NEED_TEAM' 
                  ? `${filteredAvailabilityPosts.length} Solo Players` 
                  : `${filteredTeamPosts.length} Teams Recruiting`}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Date Filter Dropdown Popover Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDatePopoverOpen(prev => !prev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all border cursor-pointer ${
                    datePreset !== 'ALL_DATES' || isDatePopoverOpen
                      ? 'bg-[#065f46] text-white border-[#065f46] shadow-sm'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <Calendar className={`w-3.5 h-3.5 ${datePreset !== 'ALL_DATES' || isDatePopoverOpen ? 'text-emerald-200' : 'text-emerald-700'}`} />
                  <span className="truncate max-w-[120px]">{getDateFilterLabel()}</span>
                  {isDatePopoverOpen ? (
                    <ChevronUp className="w-3 h-3 ml-0.5" />
                  ) : (
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  )}
                </button>

                {/* Popover Dropdown Card */}
                {isDatePopoverOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsDatePopoverOpen(false)} 
                    />

                    <div className="absolute right-0 top-full mt-2 w-72 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Filter Match Date
                        </span>
                        {datePreset !== 'ALL_DATES' && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        {[
                          { key: 'ALL_DATES', label: 'All Dates' },
                          { key: 'TODAY', label: 'Today Only' },
                          { key: 'TOMORROW', label: 'Tomorrow' },
                          { key: 'NEXT_7_DAYS', label: 'Next 7 Days' },
                        ].map((item) => {
                          const isSelected = datePreset === item.key;
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => {
                                setDatePreset(item.key as any);
                                setCustomFromDate('');
                                setCustomToDate('');
                                setIsDatePopoverOpen(false);
                              }}
                              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#065f46] text-white shadow-sm'
                                  : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-900'
                              }`}
                            >
                              <span>{item.label}</span>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Date Range Inputs */}
                      <div className="mt-2.5 pt-2.5 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 block mb-1.5">
                          Custom Date / Range
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <span className="text-[9px] text-slate-400 block mb-0.5">From</span>
                            <input
                              type="date"
                              value={customFromDate}
                              min={getTodayStr()}
                              onChange={(e) => {
                                setCustomFromDate(e.target.value);
                                setDatePreset('CUSTOM');
                              }}
                              className="w-full text-[11px] p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-emerald-600"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block mb-0.5">To</span>
                            <input
                              type="date"
                              value={customToDate}
                              min={customFromDate || getTodayStr()}
                              onChange={(e) => {
                                setCustomToDate(e.target.value);
                                setDatePreset('CUSTOM');
                              }}
                              className="w-full text-[11px] p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-emerald-600"
                            />
                          </div>
                        </div>

                        {datePreset === 'CUSTOM' && (customFromDate || customToDate) && (
                          <button
                            type="button"
                            onClick={() => setIsDatePopoverOpen(false)}
                            className="w-full mt-2 py-1.5 bg-[#065f46] text-white text-[11px] font-bold rounded-lg cursor-pointer"
                          >
                            Apply Custom Date
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Primary Post CTA Button */}
              <button
                type="button"
                onClick={() => {
                  setPostModalMode(activeTab === 'NEED_TEAM' ? 'NEED_TEAM' : 'NEED_PLAYERS');
                  setShowPostModal(true);
                }}
                className="px-3.5 py-1.5 stitch-btn-orange text-xs rounded-xl flex items-center space-x-1.5 shadow-sm font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{activeTab === 'NEED_TEAM' ? 'Post as Player' : 'Post for Team'}</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* 4. Content Area */}
      <div className="space-y-3">
        
        {/* VIEW A: Solo Players Looking for Teams (When activeTab === 'NEED_TEAM') */}
        {activeTab === 'NEED_TEAM' && (
          filteredAvailabilityPosts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 my-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto text-2xl font-black">
                🏏
              </div>
              <h3 className="text-base font-black text-slate-900">
                No Solo Players in {selectedArea}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Are you ready to play a box match? Post your availability so teams in Surat can call you directly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPostModalMode('NEED_TEAM');
                  setShowPostModal(true);
                }}
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 stitch-btn-orange text-xs rounded-xl shadow-md font-bold mt-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Post as Solo Player</span>
              </button>
            </div>
          ) : (
            filteredAvailabilityPosts.map((post) => {
              return (
                <div 
                  key={post.id}
                  className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all space-y-3"
                >
                  {/* Card Header: Player Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {post.playerPhoto ? (
                        <img
                          src={post.playerPhoto}
                          alt={post.playerName}
                          className="w-12 h-12 rounded-2xl object-cover border border-emerald-200 shadow-xs flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl flex-shrink-0 font-black text-emerald-800">
                          {post.playerName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-1">
                          <h3 className="text-sm font-black text-slate-900">
                            {post.playerName}
                          </h3>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className="whitespace-nowrap">{formatPhoneNumber(post.playerPhone)}</span>
                          <span>•</span>
                          <span className="whitespace-nowrap">{post.centerArea}, Surat</span>
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      ⚡ Ready to Play
                    </span>
                  </div>

                  {/* 4-Grid Specs */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Playing Role</div>
                      <div className="font-black text-slate-900">{formatPlayingRole(post.role)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Match Date</div>
                      <div className="font-bold text-emerald-800">{post.date}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Available Timing</div>
                      <div className="font-bold text-slate-900">{post.timeWindow}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Preferred Area</div>
                      <div className="font-bold text-slate-900">{post.centerArea}</div>
                    </div>
                  </div>

                  {/* Direct Contact Action Buttons */}
                  <div className="flex items-center space-x-2 pt-1">
                    <a
                      href={`tel:${post.playerPhone.replace(/\D/g, '')}`}
                      className="flex-1 py-3 bg-[#065f46] hover:bg-[#047857] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call {post.playerName} ({formatPhoneNumber(post.playerPhone)})</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleSharePost(`${post.playerName} Available for Box Match`, `${formatPlayingRole(post.role)} in ${post.centerArea} (${post.timeWindow})`)}
                      className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                      title="Share Player Card"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })
          )
        )}

        {/* VIEW B: Teams Looking for Players (When activeTab === 'NEED_PLAYERS') */}
        {activeTab === 'NEED_PLAYERS' && (
          filteredTeamPosts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 my-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-700 flex items-center justify-center mx-auto text-2xl font-black">
                🛡️
              </div>
              <h3 className="text-base font-black text-slate-900">
                No Team Requirements in {selectedArea}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Does your team need players for a match? Post your requirement to find energetic box cricketers.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPostModalMode('NEED_PLAYERS');
                  setShowPostModal(true);
                }}
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 stitch-btn-orange text-xs rounded-xl shadow-md font-bold mt-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Post Team Requirement</span>
              </button>
            </div>
          ) : (
            filteredTeamPosts.map((post) => {
              return (
                <div 
                  key={post.id}
                  className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all space-y-3"
                >
                  {/* Card Header: Team Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-sm font-black text-amber-900 flex-shrink-0">
                        {post.teamName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1">
                          <h3 className="text-sm font-black text-slate-900">
                            {post.teamName}
                          </h3>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className="whitespace-nowrap">Captain: {post.captainName}</span>
                          <span>•</span>
                          <span className="whitespace-nowrap">{formatPhoneNumber(post.captainPhone)}</span>
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                      👥 {post.neededPlayers} Needed
                    </span>
                  </div>

                  {/* 4-Grid Specs */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                        <span>Turf Arena</span>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${post.lat || 21.2450},${post.lng || 72.8890}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5"
                          title="Open Directions in Google Maps"
                        >
                          <Navigation className="w-2.5 h-2.5" />
                          <span>Directions</span>
                        </a>
                      </div>
                      <div className="font-black text-slate-900 truncate">{post.groundName}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Match Schedule</div>
                      <div className="font-bold text-slate-900">{post.time}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Locality</div>
                      <div className="font-bold text-slate-900">{post.area}, Surat</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Match Date</div>
                      <div className="font-bold text-emerald-800">{post.date}</div>
                    </div>
                  </div>

                  {/* Direct Contact Action Buttons */}
                  <div className="flex items-center space-x-2 pt-1">
                    <a
                      href={`tel:${post.captainPhone.replace(/\D/g, '')}`}
                      className="flex-1 py-3 bg-[#065f46] hover:bg-[#047857] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call Captain ({formatPhoneNumber(post.captainPhone)})</span>
                    </a>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${post.lat || 21.2450},${post.lng || 72.8890}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors flex items-center justify-center cursor-pointer"
                      title="Get Turn-by-Turn Map Directions"
                    >
                      <Navigation className="w-4 h-4 text-emerald-700" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleSharePost(
                        `${post.teamName} looking for players`, 
                        `Playing at ${post.groundName} on ${post.time}. Need ${post.neededPlayers} players.`,
                        `https://www.google.com/maps/dir/?api=1&destination=${post.lat || 21.2450},${post.lng || 72.8890}`
                      )}
                      className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                      title="Share Team Requirement"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })
          )
        )}

        {/* ─── VIEW C: My Activity (Single Clean Hub for User's Own Created Posts) ── */}
        {activeTab === 'MY_ACTIVITY' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                My Created Match Listings ({myAvailabilityPosts.length + myTeamPosts.length})
              </h3>
            </div>

            {myAvailabilityPosts.length === 0 && myTeamPosts.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto text-2xl font-black">
                  📋
                </div>
                <h3 className="text-sm font-black text-slate-900">No Posts Created Yet</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  When you post your availability or team requirements, they will appear here so you can manage, mark matched, or delete them anytime.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPostModalMode('NEED_TEAM');
                      setShowPostModal(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 stitch-btn-orange text-xs font-bold rounded-xl shadow-sm cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Post as Solo Player (Need Team)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPostModalMode('NEED_PLAYERS');
                      setShowPostModal(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#065f46] hover:bg-[#047857] text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Post for Team (Need Players)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 1. User's Solo Availability Posts */}
                {myAvailabilityPosts.map(p => {
                  const isExpired = isPostDateTimeExpired(p.date, p.timeWindow);
                  const isMatched = p.status === 'MATCHED';

                  return (
                    <div 
                      key={p.id} 
                      className={`rounded-3xl bg-white border p-4 shadow-sm hover:shadow-md transition-all space-y-3.5 ${
                        isExpired 
                          ? 'border-slate-200 bg-slate-50/70 opacity-90' 
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Card Header: Avatar, Name First, Locality, Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-3">
                          {p.playerPhoto || currentUser.photoUrl ? (
                            <img
                              src={p.playerPhoto || currentUser.photoUrl}
                              alt={currentUser.name}
                              className="w-12 h-12 rounded-2xl object-cover border border-emerald-200 shadow-xs flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl font-black text-emerald-800 flex-shrink-0">
                              {currentUser.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-black text-slate-900">
                                {currentUser.name}
                              </h3>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase">
                                SOLO PLAYER
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                              <span className="whitespace-nowrap flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400 inline" />
                                <span>{p.centerArea}</span>
                              </span>
                              <span>•</span>
                              <span className="whitespace-nowrap font-medium text-slate-700">
                                📞 {formatPhoneNumber(p.playerPhone || currentUser.phone)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                          isExpired 
                            ? 'bg-amber-50 text-amber-900 border-amber-200' 
                            : isMatched 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {isExpired ? '⏰ Time Expired' : isMatched ? '✅ Matched' : '⚡ Live Active'}
                        </span>
                      </div>

                      {/* Expired Informative Notice Banner */}
                      {isExpired && (
                        <div className="p-2.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-center justify-between gap-2 text-amber-950 text-[11px] animate-in fade-in duration-200">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Clock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                            <span className="font-medium truncate">Match time passed. Hidden automatically from live feed.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSoloPost(p);
                              setEditingTeamPost(null);
                              setIsEditModalOpen(true);
                            }}
                            className="text-[10.5px] font-bold text-amber-900 underline whitespace-nowrap cursor-pointer hover:text-amber-950"
                          >
                            Republish / Edit
                          </button>
                        </div>
                      )}

                      {/* 4-Grid Clean Specs */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold">Playing Role</div>
                          <div className="font-black text-slate-900">{formatPlayingRole(p.role)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold">Match Date</div>
                          <div className="font-bold text-emerald-800">{p.date}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold">Available Timing</div>
                          <div className="font-bold text-slate-900">{p.timeWindow}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold">Preferred Locality</div>
                          <div className="font-bold text-slate-900">{p.centerArea}</div>
                        </div>
                      </div>

                      {/* Card Actions: Edit & Status Toggle on Left, Delete on Right */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-2">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSoloPost(p);
                              setEditingTeamPost(null);
                              setIsEditModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                            title="Edit Post"
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-600" />
                            <span>Edit</span>
                          </button>

                          {!isExpired ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (isMatched) {
                                  setConfirmModal({
                                    isOpen: true,
                                    type: 'SOLO_REACTIVATE',
                                    postId: p.id,
                                    title: 'Reactivate Solo Post?',
                                    message: 'This will put your availability back into the live matchmaking feed so captains looking for players can contact you.',
                                    confirmText: 'Yes, Reactivate',
                                    variant: 'emerald'
                                  });
                                } else {
                                  setConfirmModal({
                                    isOpen: true,
                                    type: 'SOLO_MATCH',
                                    postId: p.id,
                                    title: 'Mark Match as Confirmed?',
                                    message: 'Found your match? Marking this as matched will pause your post from the live feed so you won\'t receive extra calls.',
                                    confirmText: 'Yes, Mark Matched',
                                    variant: 'emerald'
                                  });
                                }
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                                isMatched
                                  ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isMatched ? 'Reactivate' : 'Mark Matched ✓'}</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Match schedule passed</span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              type: 'DELETE_SOLO',
                              postId: p.id,
                              title: 'Delete Availability Post?',
                              message: 'Are you sure you want to delete this listing? You can always create a new post whenever you are ready to play.',
                              confirmText: 'Yes, Delete Post',
                              variant: 'rose'
                            });
                          }}
                          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer border border-rose-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* 2. User's Team Requirement Posts */}
                {myTeamPosts.map(p => {
                  const isExpired = isPostDateTimeExpired(p.date, p.time);
                  const isFilled = p.status === 'FILLED';

                  return (
                    <div 
                      key={p.id} 
                      className={`rounded-3xl bg-white border p-4 shadow-sm hover:shadow-md transition-all space-y-3.5 ${
                        isExpired 
                          ? 'border-slate-200 bg-slate-50/70 opacity-90' 
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Card Header: Profile Photo, Team Name First, Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-3">
                          {currentUser.photoUrl ? (
                            <img
                              src={currentUser.photoUrl}
                              alt={p.captainName}
                              className="w-12 h-12 rounded-2xl object-cover border border-amber-200 shadow-xs flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-sm font-black text-amber-900 flex-shrink-0">
                              {p.teamName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-black text-slate-900">
                                {p.teamName}
                              </h3>
                              <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-900 text-[10px] font-black uppercase">
                                TEAM REQUIREMENT
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                              <span className="whitespace-nowrap">Captain: {p.captainName}</span>
                              <span>•</span>
                              <span className="whitespace-nowrap font-medium text-slate-700">
                                📞 {formatPhoneNumber(p.captainPhone || currentUser.phone)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                          isExpired 
                            ? 'bg-amber-50 text-amber-900 border-amber-200' 
                            : isFilled 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {isExpired ? '⏰ Time Expired' : isFilled ? '✅ Squad Full' : `👥 ${p.neededPlayers} Needed`}
                        </span>
                      </div>

                      {/* Expired Informative Notice Banner */}
                      {isExpired && (
                        <div className="p-2.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-center justify-between gap-2 text-amber-950 text-[11px] animate-in fade-in duration-200">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Clock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                            <span className="font-medium truncate">Match schedule passed. Hidden automatically from live feed.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTeamPost(p);
                              setEditingSoloPost(null);
                              setIsEditModalOpen(true);
                            }}
                            className="text-[10.5px] font-bold text-amber-900 underline whitespace-nowrap cursor-pointer hover:text-amber-950"
                          >
                            Republish / Edit
                          </button>
                        </div>
                      )}

                      {/* 4-Grid Specs (No Directions Link on Turf Ground) */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold">Turf Ground</div>
                          <div className="font-black text-slate-900 truncate">{p.groundName}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold">Match Schedule</div>
                          <div className="font-bold text-slate-900">{p.time}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold">Locality</div>
                          <div className="font-bold text-slate-900">{p.area}, Surat</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold">Match Date</div>
                          <div className="font-bold text-emerald-800">{p.date}</div>
                        </div>
                      </div>

                      {/* Card Actions: Edit & Status on Left, Delete on Right */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-2">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTeamPost(p);
                              setEditingSoloPost(null);
                              setIsEditModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                            title="Edit Post"
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-600" />
                            <span>Edit</span>
                          </button>

                          {!isExpired ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (isFilled) {
                                  setConfirmModal({
                                    isOpen: true,
                                    type: 'TEAM_REOPEN',
                                    postId: p.id,
                                    title: 'Reopen Team Requirement?',
                                    message: 'This will publish your requirement back on the live feed for players looking to join a match.',
                                    confirmText: 'Yes, Reopen Squad',
                                    variant: 'emerald'
                                  });
                                } else {
                                  setConfirmModal({
                                    isOpen: true,
                                    type: 'TEAM_FILL',
                                    postId: p.id,
                                    title: 'Mark Squad as Full?',
                                    message: 'Got all required players? Marking your squad as full will close the requirement from the live feed.',
                                    confirmText: 'Yes, Mark Squad Full',
                                    variant: 'emerald'
                                  });
                                }
                              }}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                                isFilled
                                  ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isFilled ? 'Reopen Squad' : 'Mark Squad Full ✓'}</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Match schedule passed</span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              type: 'DELETE_TEAM',
                              postId: p.id,
                              title: 'Delete Team Requirement?',
                              message: 'Are you sure you want to delete this requirement? It will be removed from your activity and the matchmaking feed.',
                              confirmText: 'Yes, Delete Requirement',
                              variant: 'rose'
                            });
                          }}
                          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer border border-rose-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </div>

      {/* Interactive Post Creation Modal Component */}
      <CreatePlayerPostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        defaultMode={postModalMode}
      />

      {/* Interactive Post Edit / Update Modal Component */}
      <EditPlayerPostModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSoloPost(null);
          setEditingTeamPost(null);
        }}
        postType={editingTeamPost ? 'TEAM' : 'SOLO'}
        soloPost={editingSoloPost}
        teamPost={editingTeamPost}
      />

      {/* Clean Interactive Confirmation Modal for Status Updates & Deletions */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="absolute inset-0 z-0" onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} />

          <div className="w-full max-w-[400px] bg-white text-slate-900 rounded-t-[32px] sm:rounded-3xl shadow-2xl relative z-10 p-5 sm:p-6 space-y-4 border border-slate-100 animate-in slide-in-from-bottom-6 duration-300">
            
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto -mt-1 sm:hidden" />

            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${
                confirmModal.variant === 'rose'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : confirmModal.type.includes('REACTIVATE') || confirmModal.type.includes('REOPEN')
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {confirmModal.variant === 'rose' ? '🗑️' : confirmModal.type.includes('REACTIVATE') || confirmModal.type.includes('REOPEN') ? '⚡' : '✓'}
              </div>

              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900 leading-tight">
                {confirmModal.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {confirmModal.message}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmAction}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer text-white flex items-center justify-center space-x-1.5 ${
                  confirmModal.variant === 'rose'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                    : confirmModal.type.includes('REACTIVATE') || confirmModal.type.includes('REOPEN')
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
                    : 'bg-[#065f46] hover:bg-[#047857] shadow-emerald-700/25'
                }`}
              >
                <span>{confirmModal.confirmText}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
