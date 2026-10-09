"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  MapPin, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Phone, 
  Share2, 
  Sparkles, 
  Zap, 
  UserCheck, 
  Plus, 
  Pencil,
  ArrowRight,
  ShieldCheck,
  Flame,
  Radio
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AvailabilityPost, TeamPost, PlayingRole } from '@/types';
import { isTimeWindowInPastForDate, formatDateDisplay } from '@/lib/dateUtils';
import { EditPlayerPostModal } from '@/components/EditPlayerPostModal';
import { CreatePlayerPostModal } from '@/components/CreatePlayerPostModal';

interface HomeMatchmakingCarouselProps {
  selectedArea: string; // e.g. "All Surat" or "Mota Varachha"
}

// Map player role to display label & icon
const ROLE_BADGE_MAP: Record<PlayingRole, { label: string; icon: string; bg: string; text: string }> = {
  ALL_ROUNDER: { label: 'All-Rounder', icon: '🏏', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800' },
  BATSMAN: { label: 'Top Batsman', icon: '🏏', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800' },
  BOWLER: { label: 'Bowler', icon: '⚡', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800' },
  WICKET_KEEPER: { label: 'Wicket Keeper', icon: '🧤', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800' },
};

// Clean 10-digit phone number helper
const cleanPhone = (phone?: string): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return digits.slice(-10);
};

export const HomeMatchmakingCarousel: React.FC<HomeMatchmakingCarouselProps> = ({ selectedArea }) => {
  const { availabilityPosts, teamPosts, currentUser } = useApp();

  // Tab State: 'SOLO' | 'TEAM'
  const [activeTab, setActiveTab] = useState<'SOLO' | 'TEAM'>('SOLO');

  // Edit / Create Post Modal State
  const [editingSoloPost, setEditingSoloPost] = useState<AvailabilityPost | null>(null);
  const [editingTeamPost, setEditingTeamPost] = useState<TeamPost | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createDefaultMode, setCreateDefaultMode] = useState<'NEED_TEAM' | 'NEED_PLAYERS'>('NEED_TEAM');

  // 1. Filter Active Solo Posts (Matched with locality & not expired)
  const filteredSoloPosts = useMemo(() => {
    return availabilityPosts.filter(post => {
      // Must be ACTIVE status
      if (post.status !== 'ACTIVE') return false;

      // Check if time window has passed
      let startTime = post.timeWindow;
      let endTime = post.timeWindow;
      if (post.timeWindow && post.timeWindow.includes('-')) {
        const parts = post.timeWindow.split('-').map(s => s.trim());
        startTime = parts[0];
        endTime = parts[1] || parts[0];
      }
      if (isTimeWindowInPastForDate(post.date, startTime, endTime)) {
        return false;
      }

      // Locality Filter
      if (selectedArea !== 'All Surat') {
        const matchesArea = post.centerArea && post.centerArea.toLowerCase() === selectedArea.toLowerCase();
        if (!matchesArea) return false;
      }

      return true;
    });
  }, [availabilityPosts, selectedArea]);

  // 2. Filter Active Team Posts (Matched with locality & not expired)
  const filteredTeamPosts = useMemo(() => {
    return teamPosts.filter(post => {
      // Must be OPEN status
      if (post.status !== 'OPEN') return false;

      // Check if time window has passed
      let startTime = post.time;
      let endTime = post.time;
      if (post.time && post.time.includes('-')) {
        const parts = post.time.split('-').map(s => s.trim());
        startTime = parts[0];
        endTime = parts[1] || parts[0];
      }
      if (isTimeWindowInPastForDate(post.date, startTime, endTime)) {
        return false;
      }

      // Locality Filter
      if (selectedArea !== 'All Surat') {
        const matchesArea = post.area && post.area.toLowerCase() === selectedArea.toLowerCase();
        if (!matchesArea) return false;
      }

      return true;
    });
  }, [teamPosts, selectedArea]);

  // 3. Safe Check Auto-Fallback:
  // If Solo has 0 posts but Team has posts, auto-switch tab to TEAM!
  useEffect(() => {
    if (filteredSoloPosts.length === 0 && filteredTeamPosts.length > 0) {
      setActiveTab('TEAM');
    } else if (filteredSoloPosts.length > 0 && activeTab === 'TEAM' && filteredTeamPosts.length === 0) {
      setActiveTab('SOLO');
    }
  }, [filteredSoloPosts.length, filteredTeamPosts.length]);

  const totalCount = filteredSoloPosts.length + filteredTeamPosts.length;

  const handleShare = (text: string, title: string) => {
    if (navigator.share) {
      navigator.share({ title, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Match details copied to clipboard!');
    }
  };

  const handleOpenEditSolo = (post: AvailabilityPost) => {
    setEditingSoloPost(post);
    setEditingTeamPost(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEditTeam = (post: TeamPost) => {
    setEditingTeamPost(post);
    setEditingSoloPost(null);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-2.5">
      
      {/* Top Header: Section Title + Subtitle + View All Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-sm font-black text-slate-900 leading-tight">
                Live Matchmaking
              </h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {selectedArea !== 'All Surat' ? `Active in ${selectedArea}` : 'Nearby players & open squads'}
            </p>
          </div>
        </div>

        {/* View All Link to /find-players */}
        <Link
          href="/find-players"
          className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-0.5 bg-orange-50 hover:bg-orange-100 border border-orange-200/80 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Segmented Filter Pills Toggle: Solo vs Team */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 max-w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('SOLO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'SOLO'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Solo Players</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'SOLO' ? 'bg-orange-100 text-orange-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {filteredSoloPosts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TEAM')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'TEAM'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Need Players</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'TEAM' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {filteredTeamPosts.length}
            </span>
          </button>
        </div>

        {/* Quick Post CTA */}
        <button
          type="button"
          onClick={() => {
            setCreateDefaultMode(activeTab === 'SOLO' ? 'NEED_TEAM' : 'NEED_PLAYERS');
            setIsCreateModalOpen(true);
          }}
          className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-xl flex items-center space-x-1 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-600" />
          <span>Post Free</span>
        </button>
      </div>

      {/* ─── CAROUSEL SLIDER VIEW: SOLO PLAYERS ─── */}
      {activeTab === 'SOLO' && filteredSoloPosts.length > 0 && (
        <div className="flex items-stretch space-x-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pt-0.5 pb-2 -mx-4 px-4">
          {filteredSoloPosts.map((post) => {
            const isOwnPost = post.playerId === currentUser.id || post.playerPhone === currentUser.phone;
            const roleInfo = ROLE_BADGE_MAP[post.role] || ROLE_BADGE_MAP.ALL_ROUNDER;

            return (
              <div
                key={post.id}
                className={`min-w-[270px] max-w-[285px] sm:min-w-[290px] snap-start flex-shrink-0 bg-white rounded-3xl border ${
                  isOwnPost ? 'border-orange-300 ring-1 ring-orange-400/20' : 'border-slate-200/90'
                } p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden`}
              >
                {/* Top Banner Tag if Own Post */}
                {isOwnPost && (
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl tracking-wider shadow-xs">
                    Your Post • Live
                  </div>
                )}

                {/* Player Header */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-sm flex items-center justify-center shadow-xs flex-shrink-0">
                        {post.playerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 pr-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-black text-slate-900 truncate">
                            {post.playerName}
                          </span>
                          {isOwnPost && (
                            <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-1.5 rounded-full border border-orange-200">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[10.5px] text-slate-500 font-medium flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                          <span className="truncate">{post.centerArea}, Surat</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Playing Role Pill */}
                  <div className="flex items-center space-x-1.5 mb-2.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border flex items-center gap-1 ${roleInfo.bg} ${roleInfo.text}`}>
                      <span>{roleInfo.icon}</span>
                      <span>{roleInfo.label}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/60">
                      Looking to Play
                    </span>
                  </div>

                  {/* Match Date & Time Window */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 space-y-1 mb-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        Date
                      </span>
                      <span>{formatDateDisplay(post.date)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        Time
                      </span>
                      <span className="text-emerald-800 font-black">{post.timeWindow}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="pt-1 flex items-center space-x-2">
                  {isOwnPost ? (
                    <button
                      type="button"
                      onClick={() => handleOpenEditSolo(post)}
                      className="flex-1 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-900 text-xs font-black flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-orange-600" />
                      <span>Edit My Post</span>
                    </button>
                  ) : (
                    <>
                      <a
                        href={`tel:+91${cleanPhone(post.playerPhone)}`}
                        className="flex-1 py-2 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-black flex items-center justify-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Player</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleShare(
                          `🏏 Box Cricket Match Call!\nPlayer: ${post.playerName} (${roleInfo.label})\nArea: ${post.centerArea}\nDate: ${formatDateDisplay(post.date)} (${post.timeWindow})\nContact: +91 ${cleanPhone(post.playerPhone)}\nConnecting via BoxKhel`,
                          `Box Cricket Player Availability`
                        )}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                        title="Share post"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Solo Tab Empty but Team Tab has Posts */}
      {activeTab === 'SOLO' && filteredSoloPosts.length === 0 && filteredTeamPosts.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
          <p className="text-xs text-slate-600 font-medium">
            No solo players looking to play in {selectedArea} right now.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('TEAM')}
              className="text-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              View {filteredTeamPosts.length} Open Teams →
            </button>
          </div>
        </div>
      )}

      {/* ─── CAROUSEL SLIDER VIEW: TEAM REQUIREMENTS ─── */}
      {activeTab === 'TEAM' && filteredTeamPosts.length > 0 && (
        <div className="flex items-stretch space-x-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pt-0.5 pb-2 -mx-4 px-4">
          {filteredTeamPosts.map((post) => {
            const isOwnPost = post.captainId === currentUser.id || post.captainPhone === currentUser.phone;

            return (
              <div
                key={post.id}
                className={`min-w-[270px] max-w-[285px] sm:min-w-[290px] snap-start flex-shrink-0 bg-white rounded-3xl border ${
                  isOwnPost ? 'border-orange-300 ring-1 ring-orange-400/20' : 'border-slate-200/90'
                } p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden`}
              >
                {/* Top Banner Tag if Own Post */}
                {isOwnPost && (
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl tracking-wider shadow-xs">
                    Your Team Post
                  </div>
                )}

                {/* Team Card Header */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-sm flex items-center justify-center shadow-xs flex-shrink-0">
                        {post.teamName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 pr-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-black text-slate-900 truncate">
                            {post.teamName}
                          </span>
                        </div>
                        <div className="text-[10.5px] text-slate-500 font-medium flex items-center gap-1 mt-0.5 truncate">
                          <span className="text-slate-400">By</span>
                          <span className="font-semibold text-slate-700 truncate">{post.captainName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ground & Needed Count Badge */}
                  <div className="flex items-center space-x-1.5 mb-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-rose-600" />
                      <span>Need {post.neededPlayers} {post.neededPlayers === 1 ? 'Player' : 'Players'}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/60 truncate">
                      📍 {post.area}
                    </span>
                  </div>

                  {/* Match Date, Ground & Time Window */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 space-y-1 mb-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                      <span className="text-slate-500 font-medium">Turf</span>
                      <span className="text-emerald-900 font-black truncate max-w-[150px]">{post.groundName}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        Date
                      </span>
                      <span>{formatDateDisplay(post.date)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        Time
                      </span>
                      <span className="text-emerald-800 font-black">{post.time}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="pt-1 flex items-center space-x-2">
                  {isOwnPost ? (
                    <button
                      type="button"
                      onClick={() => handleOpenEditTeam(post)}
                      className="flex-1 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-900 text-xs font-black flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-orange-600" />
                      <span>Edit Team Requirement</span>
                    </button>
                  ) : (
                    <>
                      <a
                        href={`tel:+91${cleanPhone(post.captainPhone)}`}
                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black flex items-center justify-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Join Squad</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleShare(
                          `🏏 Players Needed for Box Cricket!\nTeam: ${post.teamName}\nGround: ${post.groundName}, ${post.area}\nNeeded: ${post.neededPlayers} Players\nDate: ${formatDateDisplay(post.date)} (${post.time})\nContact Captain: +91 ${cleanPhone(post.captainPhone)}\nJoin via BoxKhel`,
                          `Box Cricket Team Requirement`
                        )}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                        title="Share requirement"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Team Tab Empty but Solo Tab has Posts */}
      {activeTab === 'TEAM' && filteredTeamPosts.length === 0 && filteredSoloPosts.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
          <p className="text-xs text-slate-600 font-medium">
            No teams looking for players in {selectedArea} right now.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('SOLO')}
              className="text-xs font-black text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              View {filteredSoloPosts.length} Solo Players →
            </button>
          </div>
        </div>
      )}

      {/* ─── EMPTY STATE IN SELECTED LOCALITY ─── */}
      {totalCount === 0 && (
        <div className="rounded-3xl bg-gradient-to-br from-emerald-50/70 via-white to-orange-50/50 border border-slate-200/90 p-4 text-center space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-emerald-700 flex items-center justify-center mx-auto shadow-xs text-lg">
            🏏
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">
              {selectedArea !== 'All Surat' 
                ? `No live match posts in ${selectedArea}` 
                : 'No active player requests right now'}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs mx-auto">
              Need a 6th player or want to join a squad tonight? Post your requirement free in 30 seconds!
            </p>
          </div>

          <div className="pt-1 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCreateDefaultMode('NEED_TEAM');
                setIsCreateModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Availability</span>
            </button>
            <Link
              href="/find-players"
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Explore All Feeds
            </Link>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {isEditModalOpen && (
        <EditPlayerPostModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          postType={editingSoloPost ? 'SOLO' : 'TEAM'}
          soloPost={editingSoloPost || undefined}
          teamPost={editingTeamPost || undefined}
        />
      )}

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <CreatePlayerPostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          defaultMode={createDefaultMode}
        />
      )}

    </div>
  );
};
