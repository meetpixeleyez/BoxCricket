"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Camera, 
  MapPin, 
  Plus, 
  X, 
  Phone, 
  Check, 
  ChevronRight, 
  Users, 
  FileText, 
  Languages, 
  MessageSquare, 
  Save, 
  Edit3,
  CheckCircle2,
  Sparkles,
  LogOut,
  LogIn,
  ShieldCheck
} from 'lucide-react';
import { PlayingRole, SkillLevel } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, setCurrentUser, isAuthenticated, language, setLanguage, logout } = useApp();

  const [name, setName] = useState(currentUser.name || 'Hardik Patel');
  const [playingRole, setPlayingRole] = useState<PlayingRole>(currentUser.playingRole || 'ALL_ROUNDER');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(currentUser.skillLevel || 'INTERMEDIATE');
  const [battingStyle, setBattingStyle] = useState('Right-hand Bat');
  const [bowlingStyle, setBowlingStyle] = useState('Right-arm Medium Fast');
  const [showPhoneToCaptains, setShowPhoneToCaptains] = useState(true);

  const [preferredGrounds, setPreferredGrounds] = useState([
    { id: '1', name: 'Kings Box Cricket', area: 'Adajan, Surat • 4.5 km away' },
    { id: '2', name: 'Striker Arena', area: 'Mota Varachha, Surat • 1.2 km away' },
  ]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || 'Hardik Patel');
      setPlayingRole(currentUser.playingRole || 'ALL_ROUNDER');
      setSkillLevel(currentUser.skillLevel || 'INTERMEDIATE');
    }
  }, [currentUser]);

  const handleSave = () => {
    setCurrentUser({
      ...currentUser,
      name,
      playingRole,
      skillLevel,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    router.push('/login');
  };

  const removeGround = (id: string) => {
    setPreferredGrounds(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="p-4 space-y-5 pb-28">
      
      {/* Guest Login Banner if not authenticated */}
      {!isAuthenticated && (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-bold text-slate-900">You are browsing as Guest</div>
            <div className="text-[10px] text-slate-500">Sign in to save matches and receive WhatsApp alerts</div>
          </div>
          <Link
            href="/login"
            className="px-3.5 py-2 stitch-btn-orange text-xs flex items-center space-x-1 flex-shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        </div>
      )}

      {/* 1. Progress Header */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-sm font-black text-slate-900">
            <span>Player Profile</span>
            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            ● 85% Completed
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="w-[85%] h-full bg-[#065f46] rounded-full" />
        </div>
      </div>

      {/* 2. Profile Photo & Name Card */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 text-center shadow-sm relative overflow-hidden">
        <div className="relative inline-block mx-auto mb-3">
          <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-emerald-500/20 shadow-md">
            <img
              src={currentUser.photoUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300"}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          </div>
          <button className="absolute bottom-0 right-0 p-2 rounded-full bg-[#ff6813] text-white shadow-md hover:scale-105 transition-transform">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <h2 className="text-lg font-black text-slate-900">{name}</h2>
        <div className="text-xs text-slate-500 font-medium mt-0.5">{currentUser.phone}</div>
        <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mt-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>Mota Varachha, Surat</span>
        </div>
      </div>

      {/* 3. Playing Role */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-900">Playing Role</label>
          <span className="text-[10px] text-slate-400">Primary on field</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: 'ALL_ROUNDER', label: 'All-rounder' },
            { key: 'BATSMAN', label: 'Batsman' },
            { key: 'BOWLER', label: 'Fast Bowler' },
            { key: 'BOWLER_SPIN', label: 'Spin Bowler' },
            { key: 'WICKET_KEEPER', label: 'Wicketkeeper' },
          ].map((r) => {
            const isSelected = playingRole === r.key || (r.key === 'BOWLER' && playingRole === 'BOWLER');
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => setPlayingRole(r.key as PlayingRole)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  isSelected
                    ? 'bg-[#065f46] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Skill Level */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-900">Skill Level</label>
          <span className="text-[10px] text-slate-400">Match matchmaking</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'BEGINNER', label: 'Beginner' },
            { key: 'INTERMEDIATE', label: 'Intermediate' },
            { key: 'PRO', label: 'Pro / Club' },
          ].map((s) => {
            const isSelected = skillLevel === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setSkillLevel(s.key as SkillLevel)}
                className={`py-2.5 rounded-2xl text-xs font-bold text-center transition-all ${
                  isSelected
                    ? 'bg-[#065f46] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Batting & Bowling Style */}
      <div>
        <label className="block text-xs font-bold text-slate-900 mb-2">Batting & Bowling Style</label>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 text-xs shadow-sm">
            <span className="flex items-center space-x-2 font-bold text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff6813]" />
              <span>{battingStyle}</span>
            </span>
            <Edit3 className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 text-xs shadow-sm">
            <span className="flex items-center space-x-2 font-bold text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>{bowlingStyle}</span>
            </span>
            <Edit3 className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* 6. Preferred Grounds in Surat */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-900">Preferred Grounds in Surat</label>
          <button className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-0.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Turf</span>
          </button>
        </div>

        <div className="space-y-2">
          {preferredGrounds.map((g) => (
            <div
              key={g.id}
              className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-sm">
                  🏟️
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{g.name}</div>
                  <div className="text-[10px] text-slate-500">{g.area}</div>
                </div>
              </div>

              <button
                onClick={() => removeGround(g.id)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Show Phone Toggle */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-start space-x-3 pr-2">
          <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Show phone number to captains</div>
            <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
              Verified Surat captains can call you directly for urgent tournament or friendly slots.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPhoneToCaptains(!showPhoneToCaptains)}
          className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 flex-shrink-0 ${
            showPhoneToCaptains ? 'bg-[#065f46]' : 'bg-slate-300'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
              showPhoneToCaptains ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* 8. Team & Account Management List */}
      <div className="space-y-1">
        <label className="block text-xs font-bold text-slate-900 mb-2">Team & Account Management</label>

        <div className="rounded-3xl bg-white border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden text-xs">
          
          <Link href="/teams" className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">My Teams</div>
                <div className="text-[10px] text-slate-500">Surat Strikers, Varachha Blasters</div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">2 Teams</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </Link>

          <Link href="/my-bookings" className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Match History & Scorecards</div>
                <div className="text-[10px] text-slate-500">Past scorecards, MVP tags & turf records</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center">
                <Languages className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">App Language</div>
                <div className="text-[10px] text-slate-500">English (Change to ગુજરાતી / हिंदी)</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-800 text-[10px] font-bold uppercase">
              {language}
            </span>
          </div>

          <a
            href="https://wa.me/919825084721"
            target="_blank"
            rel="noreferrer"
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Help & WhatsApp Support</div>
                <div className="text-[10px] text-slate-500">Instant resolution for slot & player disputes</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </a>

        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center space-x-1.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile preferences updated successfully!</span>
        </div>
      )}

      {/* 9. Save Button */}
      <button
        onClick={handleSave}
        className="w-full py-4 stitch-btn-orange text-sm flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
      >
        <Save className="w-4 h-4" />
        <span>Save & Update Profile</span>
      </button>

      {/* 10. Dedicated Logout Button */}
      {isAuthenticated && (
        <div className="pt-2">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full py-3.5 rounded-2xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{loggingOut ? 'Logging Out...' : 'Log Out of BoxKhel'}</span>
          </button>
        </div>
      )}

    </div>
  );
}
