"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { Loader2 } from 'lucide-react';

const PUBLIC_ROUTES = ['/login', '/signup'];

export const AppLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isInitializing } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (!mounted || isInitializing) return;

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/login');
    } else if (isAuthenticated && isPublicRoute) {
      router.replace('/');
    }
  }, [mounted, isInitializing, isAuthenticated, isPublicRoute, router]);

  // Loading spinner while checking initial auth
  if (!mounted || isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-[#065f46] flex items-center justify-center text-3xl shadow-xl shadow-emerald-950/40 animate-bounce">
          🏏
        </div>
        <div className="text-center">
          <h1 className="text-xl font-black tracking-wider text-emerald-400">BOXKHEL</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Surat Box Cricket Network</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-emerald-500 font-semibold pt-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Securing match session...</span>
        </div>
      </div>
    );
  }

  // If not authenticated and on public route (Login / Signup)
  if (!isAuthenticated && isPublicRoute) {
    return (
      <div className="app-container min-h-screen bg-slate-50">
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  // If unauthenticated on protected route while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Authenticated full app experience
  return (
    <div className="app-container">
      <Header />
      <main className="flex-1 pb-24">
        {children}
      </main>
      <Navigation />
    </div>
  );
};
