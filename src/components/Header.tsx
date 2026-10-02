"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Bell, 
  ChevronDown, 
  MapPin, 
  ArrowLeft, 
  Sparkles, 
  Check
} from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    currentUser, 
    isAuthenticated,
    setIsAuthModalOpen,
    language, 
    setLanguage, 
    notifications, 
    unreadCount 
  } = useApp();

  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [selectedArea, setSelectedArea] = useState('Mota Varachha, Surat');

  // Check if we are on a secondary/detail page with a Back button
  const isDetailPage = pathname.startsWith('/ground/') || pathname === '/owner';
  const isHome = pathname === '/';

  // Get screen title for secondary pages
  const getHeaderTitle = () => {
    if (pathname.startsWith('/ground/')) return 'Turf Details';
    if (pathname === '/my-bookings') return 'Bookings';
    if (pathname === '/find-players') return 'Find Players Hub';
    if (pathname === '/teams') return 'Teams & Challenges';
    if (pathname === '/profile') return 'Player Profile Setup';
    if (pathname === '/owner') return 'Box Ground Registration';
    return 'BoxKhel';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-2.5 shadow-sm">
      
      {/* Top Bar Row */}
      <div className="flex items-center justify-between">
        
        {/* Left: Back button OR App Brand */}
        {isDetailPage ? (
          <div className="flex items-center space-x-2.5">
            <button 
              onClick={() => router.back()}
              className="p-1.5 -ml-1 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-white text-base shadow-sm">
              🏏
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">
              {getHeaderTitle()}
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-2.5">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-[#065f46] flex items-center justify-center text-white shadow-md shadow-emerald-900/10">
                <span className="text-lg">🏏</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  BOXKHEL
                </span>
                <button
                  onClick={() => setShowLocationMenu(!showLocationMenu)}
                  className="flex items-center space-x-1 text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors"
                >
                  <span className="truncate max-w-[150px]">{selectedArea}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </Link>
          </div>
        )}

        {/* Right Actions: Notification Bell + Profile Avatar */}
        <div className="flex items-center space-x-3">
          
          {/* Notification Bell */}
          <Link
            href="/my-bookings"
            className="relative p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff6813] ring-2 ring-white" />
          </Link>

          {/* User Profile Avatar / Login trigger */}
          {isAuthenticated ? (
            <Link
              href="/profile"
              className="relative rounded-full ring-2 ring-emerald-600/40 hover:ring-emerald-600 transition-all overflow-hidden flex-shrink-0"
              title="My Profile"
            >
              <img
                src={currentUser.photoUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-full stitch-btn-orange text-xs font-bold shadow-sm"
              title="Sign In"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Location Dropdown Modal */}
      {showLocationMenu && (
        <div className="absolute left-4 top-14 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase text-slate-400">Select Surat Area</div>
          {['Mota Varachha, Surat', 'Adajan West, Surat', 'Vesu VIP Road, Surat', 'Katargam, Surat', 'Pal, Surat'].map((area) => (
            <button
              key={area}
              onClick={() => { setSelectedArea(area); setShowLocationMenu(false); }}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 ${selectedArea === area ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'}`}
            >
              <span>{area}</span>
              {selectedArea === area && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>
          ))}
        </div>
      )}

      {/* Secondary Bar on Home: Language Selector & Live Turfs Counter */}
      {isHome && (
        <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-xs">
          
          {/* Language Switcher Pill */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200">
            <span className="text-[11px] px-1.5 text-slate-500 font-medium">🌐</span>
            {(['en', 'gu', 'hi'] as const).map((lang) => {
              const labelMap = { en: 'EN', gu: 'ગુજરાતી', hi: 'हिंदी' };
              const isCurrent = language === lang;
              return (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                    isCurrent
                      ? 'bg-[#065f46] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {labelMap[lang]}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </header>
  );
};
