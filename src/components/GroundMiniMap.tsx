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

      // Tooltip with ground name & address (strictly on hover / tap)
      const popupHtml = `
        <div style="font-family: inherit; min-width: 160px; max-width: 240px; padding: 2px 0;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; gap: 8px;">
            <span style="font-size: 8.5px; font-weight: 800; color: #047857; text-transform: uppercase; letter-spacing: 0.5px; background: #ecfdf5; padding: 1.5px 5px; border-radius: 4px; border: 1px solid #a7f3d0;">
              Cricket Box
            </span>
            <span style="display: inline-flex; align-items: center; gap: 3px; font-size: 8.5px; font-weight: 700; color: #059669;">
              <span style="width: 5px; height: 5px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
              Active
            </span>
          </div>
          <div style="font-size: 12px; font-weight: 800; color: #0f172a; line-height: 1.25; letter-spacing: -0.1px;">
            ${groundName}
          </div>
          <div style="font-size: 10px; color: #64748b; font-weight: 500; margin-top: 3px; line-height: 1.3;">
            📍 ${addressLine || area || 'Surat, Gujarat'}
          </div>
        </div>
      `;

      marker.bindTooltip(popupHtml, {
        direction: 'top',
        offset: [0, -28],
        className: 'custom-ground-popup',
        opacity: 1,
        sticky: false,
        interactive: false,
      });

      // Explicit hover & mouseout handlers
      marker.on('mouseover', () => {
        marker.openTooltip();
      });

      marker.on('mouseout', () => {
        marker.closeTooltip();
      });

      // Native DOM event listener hook for immediate hover detection
      setTimeout(() => {
        const el = marker.getElement();
        if (el) {
          el.addEventListener('mouseenter', () => marker.openTooltip());
          el.addEventListener('mouseleave', () => marker.closeTooltip());
        }
      }, 50);

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
  }, [safeLat, safeLng, groundName, addressLine, area]);

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

      {/* Compact Floating Directions Button */}
      <div className="absolute bottom-2.5 right-2.5 z-20">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 active:scale-95 text-white font-bold text-[11px] flex items-center space-x-1.5 shadow-md backdrop-blur-md transition-all border border-slate-700/40"
          title="Open in Google Maps"
        >
          <Navigation className="w-3 h-3 text-emerald-400" />
          <span>Directions</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
        </a>
      </div>
    </div>
  );
}
