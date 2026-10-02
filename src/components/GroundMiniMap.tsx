"use client";

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ExternalLink, Compass } from 'lucide-react';

interface GroundMiniMapProps {
  lat: number;
  lng: number;
  groundName: string;
  addressLine: string;
  area: string;
  height?: string;
}

export function GroundMiniMap({
  lat,
  lng,
  groundName,
  addressLine,
  area,
  height = 'h-56'
}: GroundMiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const safeLat = typeof lat === 'number' && !isNaN(lat) && lat !== 0 ? lat : 21.2450;
  const safeLng = typeof lng === 'number' && !isNaN(lng) && lng !== 0 ? lng : 72.8890;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${safeLat},${safeLng}`;

  useEffect(() => {
    let isMounted = true;
    const container = containerRef.current;
    if (!container) return;

    import('leaflet').then((L) => {
      if (!isMounted || !containerRef.current) return;
      const Leaflet = L.default || L;

      // Fix icon URLs
      // @ts-ignore
      delete Leaflet.Icon.Default.prototype._getIconUrl;
      Leaflet.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Cleanup prior instance on container if exists
      if ((containerRef.current as any)._leaflet_id) {
        if (mapRef.current) {
          try {
            mapRef.current.remove();
          } catch (e) {
            // ignore
          }
          mapRef.current = null;
        }
        delete (containerRef.current as any)._leaflet_id;
      }

      const map = Leaflet.map(containerRef.current, {
        center: [safeLat, safeLng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false, // avoid intercepting page scroll
      });

      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Custom pulsing green pin icon
      const customPinHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px;">
          <span style="position: absolute; width: 36px; height: 36px; background-color: rgba(16, 185, 129, 0.4); border-radius: 9999px; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #059669, #047857); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.5); border: 2px solid white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        </div>
      `;

      const customIcon = Leaflet.divIcon({
        className: 'custom-ground-pin',
        html: customPinHtml,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      });

      const marker = Leaflet.marker([safeLat, safeLng], { icon: customIcon }).addTo(map);

      // Popup with ground name
      marker.bindPopup(`
        <div style="font-family: inherit; padding: 2px 4px; font-size: 12px; font-weight: 800; color: #0f172a; text-align: center;">
          <div style="color: #059669; font-size: 10px; text-transform: uppercase; font-weight: 900; letter-spacing: 0.5px;">Cricket Box Arena</div>
          <div>${groundName}</div>
          <div style="font-size: 10px; color: #64748b; font-weight: 500; margin-top: 2px;">${area}</div>
        </div>
      `, { offset: [0, -14] });

      mapRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      isMounted = false;
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapRef.current = null;
      }
      if (container && (container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }
    };
  }, [safeLat, safeLng, groundName, area]);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm group">
      {/* Real Interactive Map Container */}
      <div
        ref={containerRef}
        className={`w-full ${height} bg-slate-100 z-0`}
      />

      {/* Loading Skeleton */}
      {!mapLoaded && (
        <div className={`absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center text-xs text-slate-400 font-medium z-10`}>
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading ground map...</span>
          </div>
        </div>
      )}

      {/* Top Location Chip Overlay */}
      <div className="absolute top-3 left-3 right-3 z-20 pointer-events-none flex items-center justify-between">
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-slate-200/80 flex items-center space-x-2 max-w-[75%] truncate pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <span className="text-[11px] font-black text-slate-900 truncate">
            {groundName}
          </span>
          <span className="text-[10px] text-slate-400 font-medium truncate">
            • {area}
          </span>
        </div>

        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-2xl shadow-md border border-slate-200/80 text-[10px] font-mono text-slate-600 font-bold pointer-events-auto">
          {safeLat.toFixed(4)}, {safeLng.toFixed(4)}
        </div>
      </div>

      {/* Bottom Floating Navigation Action Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-2">
        <div className="hidden sm:block bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl text-[10px] text-slate-600 font-medium border border-slate-200/70 shadow-md truncate flex-1 mr-2">
          📍 {addressLine || `${area}, Surat`}
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-700/30 transition-all border border-emerald-600"
        >
          <Navigation className="w-4 h-4 text-emerald-200" />
          <span>Get Live Directions</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>
      </div>
    </div>
  );
}
