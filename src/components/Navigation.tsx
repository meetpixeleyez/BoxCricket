"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  CalendarDays, 
  Shield, 
  User as UserIcon,
  Building2
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const { currentUser } = useApp();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Players', href: '/find-players', icon: Users },
    { label: 'Bookings', href: '/my-bookings', icon: CalendarDays },
    { label: 'Teams', href: '/teams', icon: Shield },
    { label: currentUser.role === 'OWNER' ? 'My Turf' : 'Profile', href: currentUser.role === 'OWNER' ? '/owner' : '/profile', icon: currentUser.role === 'OWNER' ? Building2 : UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.04)] safe-area-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-0.5 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-[#065f46] font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.75]'}`} />
            <span className={`text-[11px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-[#065f46]' : 'font-medium text-slate-500'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
