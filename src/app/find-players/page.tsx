"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  Users, 
  MapPin, 
  Clock, 
  Plus, 
  SlidersHorizontal, 
  CheckCircle2, 
  Phone, 
  Share2, 
  Send, 
  Sparkles,
  Zap,
  ArrowRight,
  Radio
} from 'lucide-react';

export default function FindPlayersPage() {
  const { availabilityPosts, teamPosts, currentUser, t } = useApp();

  // Mode: 'NEED_TEAM' | 'NEED_PLAYERS'
  const [activeTab, setActiveTab] = useState<'NEED_TEAM' | 'NEED_PLAYERS'>('NEED_TEAM');
  const [selectedArea, setSelectedArea] = useState('All Surat');
  const [showPostModal, setShowPostModal] = useState(false);
  const [appliedPostIds, setAppliedPostIds] = useState<string[]>([]);

  const handleSendRequest = (postId: string) => {
    setAppliedPostIds(prev => [...prev, postId]);
    alert('Join request sent to captain! They will contact you on your registered mobile number.');
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      
      {/* 1. Main Tabs: I Need a Team vs Team Needs Players */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/70 rounded-2xl">
        <button
          onClick={() => setActiveTab('NEED_TEAM')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'NEED_TEAM'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-700" />
          <span>I Need a Team</span>
        </button>

        <button
          onClick={() => setActiveTab('NEED_PLAYERS')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'NEED_PLAYERS'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-slate-500" />
          <span>Team Needs Players</span>
        </button>
      </div>

      {/* 2. Action Button & Filters */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowPostModal(true)}
          className="flex-1 py-3 stitch-btn-orange text-xs flex items-center justify-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Post Availability</span>
        </button>

        <button className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-800 font-bold text-xs flex items-center space-x-1.5 shadow-sm hover:bg-slate-50">
          <SlidersHorizontal className="w-4 h-4 text-slate-600" />
          <span>Filters</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff6813]" />
        </button>
      </div>

      {/* 3. Surat Area Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
        {['All Surat', 'Mota Varachha', 'Adajan', '⚡ Tonight', 'Vesu'].map((area) => {
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
              {area === 'All Surat' && <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" />}
              <span>{area}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Live Feed Status Tag */}
      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs">
        <div className="flex items-center space-x-1.5 text-emerald-900 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>19 Box Matches looking for players in Surat</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 flex items-center space-x-1">
          <span>Live feed</span>
          <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
        </span>
      </div>

      {/* 5. Matchmaking Cards Feed */}
      <div className="space-y-4">
        
        {/* Card 1: Royal Challengers Surat */}
        <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm space-y-3">
          
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl flex-shrink-0">
                🦁
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <h3 className="text-sm font-black text-slate-900">Royal Challengers Surat</h3>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Hardik Patel • +91 98254 XXXXX
                </div>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
              👥 2 needed
            </span>
          </div>

          {/* 4-Grid Specs */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-[10px] text-slate-400">Turf Arena</div>
              <div className="font-bold text-slate-900">Striker Box Arena</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Time Slot</div>
              <div className="font-bold text-slate-900">Tonight, 9 - 11 PM</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Proximity</div>
              <div className="font-bold text-slate-900">1.2 km away</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Fee Split</div>
              <div className="font-bold text-emerald-800">₹120 / player</div>
            </div>
          </div>

          {/* Tags & Progress */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
              <div className="flex items-center space-x-1.5">
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px]">
                  All-Rounder Preferred
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px]">
                  Hard Tennis Ball
                </span>
              </div>
              <span className="text-slate-500">8/10 filled</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="w-[80%] h-full bg-[#065f46] rounded-full" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center space-x-2 pt-1">
            <button
              onClick={() => handleSendRequest('post_1')}
              disabled={appliedPostIds.includes('post_1')}
              className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                appliedPostIds.includes('post_1')
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                  : 'bg-[#065f46] hover:bg-[#047857] text-white shadow-sm'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{appliedPostIds.includes('post_1') ? 'Request Sent ✓' : 'Send Join Request'}</span>
            </button>

            <a
              href="tel:+919876543210"
              className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

        </div>

        {/* Card 2: Varachha Blasters */}
        <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm space-y-3">
          
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl flex-shrink-0">
                ⚡
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <h3 className="text-sm font-black text-slate-900">Varachha Blasters</h3>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Meet V. • +91 9714X XXXXX
                </div>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 text-[10px] font-bold border border-orange-200">
              👥 1 Bowler Urgent
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-[10px] text-slate-400">Turf Arena</div>
              <div className="font-bold text-slate-900">Kings Box Arena</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Schedule</div>
              <div className="font-bold text-slate-900">Tomorrow, 8:00 PM</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Format</div>
              <div className="font-bold text-slate-900">8-Over Tennis</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Fee Share</div>
              <div className="font-bold text-emerald-800">₹150</div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
              <div className="flex items-center space-x-1.5">
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px]">
                  Fast Bowler (Pace)
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px]">
                  Mota Varachha
                </span>
              </div>
              <span className="text-slate-500">9/10 filled</span>
            </div>

            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="w-[90%] h-full bg-[#ff6813] rounded-full" />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <button
              onClick={() => handleSendRequest('post_2')}
              disabled={appliedPostIds.includes('post_2')}
              className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                appliedPostIds.includes('post_2')
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                  : 'bg-[#065f46] hover:bg-[#047857] text-white shadow-sm'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{appliedPostIds.includes('post_2') ? 'Request Sent ✓' : 'Send Join Request'}</span>
            </button>

            <a
              href="tel:+919876543211"
              className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

        </div>

        {/* Card 3: Adajan Titans */}
        <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm space-y-3">
          
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xl flex-shrink-0">
                🛡️
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-sm font-black text-slate-900">Adajan Titans</h3>
                  <span className="px-2 py-0.2 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                    Friendly
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Chintan Desai • 3.4 km away
                </div>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
              👥 3 needed
            </span>
          </div>

          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 italic leading-relaxed">
            "Hosting weekend friendly tournament practice series. Welcoming any skill level for casual evening drills and an 8v8 game."
          </p>

          <div className="flex items-center justify-between text-xs text-slate-700 font-semibold px-1">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Prime Box, Adajan</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Sunday, 7:00 PM</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <button
              onClick={() => handleSendRequest('post_3')}
              disabled={appliedPostIds.includes('post_3')}
              className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                appliedPostIds.includes('post_3')
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                  : 'bg-[#065f46] hover:bg-[#047857] text-white shadow-sm'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{appliedPostIds.includes('post_3') ? 'Request Sent ✓' : 'Send Join Request'}</span>
            </button>

            <button
              onClick={() => alert('Post shared!')}
              className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* 6. Surat Box Card Promotional Banner */}
      <div className="rounded-3xl bg-[#065f46] p-5 text-white shadow-lg space-y-3 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-1.5 text-emerald-200 text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SURAT BOX CARD</span>
          </div>
          
          <h3 className="text-base font-black leading-snug">
            Looking for solo practice or a regular team?
          </h3>
          
          <p className="text-xs text-emerald-100/90 leading-relaxed">
            Create your player card with your batting style, bowling speed, and favorite area so captains can recruit you instantly.
          </p>

          <div className="pt-2">
            <Link
              href="/profile"
              className="inline-flex items-center space-x-2 px-5 py-3 stitch-btn-orange text-xs"
            >
              <span>Create Player Card</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-emerald-700/40 pointer-events-none" />
      </div>

    </div>
  );
}
