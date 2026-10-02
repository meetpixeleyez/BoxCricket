"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, Search, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────
interface LatLng {
  lat: number;
  lng: number;
}

/** Structured address data returned after reverse geocoding */
export interface AddressData {
  fullAddress: string;   // full display_name from Nominatim
  addressLine: string;   // street + nearby landmark (fills the address textarea)
  area: string;          // locality / suburb / city_district (fills Area dropdown)
  pincode: string;       // postal code (fills Pincode field)
}

interface MapLocationPickerProps {
  /** Initial coordinates (pre-fill from existing ground) */
  initialLat?: number;
  initialLng?: number;
  /** Called whenever the user confirms a location — passes structured address */
  onLocationSelect: (lat: number, lng: number, data: AddressData) => void;
  /** Called when the modal closes without saving */
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Nominatim reverse geocode → returns structured AddressData
// ─────────────────────────────────────────────────────────────────────────────
const reverseGeocode = async (lat: number, lng: number): Promise<AddressData> => {
  const fallback: AddressData = {
    fullAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    addressLine: '',
    area: '',
    pincode: '',
  };
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) return fallback;
    const data = await res.json();
    const a = data.address || {};

    // Build a meaningful street address line
    const namePart = a.amenity || a.shop || a.building || a.tourism || a.leisure || '';
    const roadPart = a.road || a.pedestrian || a.footway || a.path || a.highway || '';
    const suburbPart = a.neighbourhood || a.quarter || a.suburb || '';
    const streetParts = [namePart, roadPart, suburbPart].filter(Boolean);
    const addressLine = streetParts.join(', ') ||
      (data.display_name ? data.display_name.split(',').slice(0, 3).join(',').trim() : '');

    // Area / Locality (used to match/suggest the Area dropdown)
    const area =
      a.city_district ||
      a.suburb ||
      a.neighbourhood ||
      a.quarter ||
      a.town ||
      '';

    // Pincode
    const pincode = (a.postcode || '').replace(/\s+/g, '').slice(0, 6);

    return {
      fullAddress: data.display_name || fallback.fullAddress,
      addressLine,
      area,
      pincode,
    };
  } catch {
    return fallback;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  Nominatim forward search
// ─────────────────────────────────────────────────────────────────────────────
interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

// ─── Surat center for geographic bias ───────────────────────────────────────
const SURAT_LAT = 21.1702;
const SURAT_LNG = 72.8311;
const SURAT_VIEWBOX = '72.60,20.95,73.15,21.45';

// ─── Source 1: Nominatim (OpenStreetMap official geocoder) ───────────────────
const searchNominatim = async (query: string): Promise<SearchResult[]> => {
  try {
    const q = query.toLowerCase().includes('surat') ? query : `${query}, Surat, Gujarat`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1&countrycodes=in&viewbox=${SURAT_VIEWBOX}&bounded=0`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en', 'Accept': 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
};

// ─── Source 2: Photon (Komoot – free, no API key, great Indian POI coverage) ─
const searchPhoton = async (query: string): Promise<SearchResult[]> => {
  try {
    const q = query.toLowerCase().includes('surat') ? query : `${query} Surat`;
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5&lat=${SURAT_LAT}&lon=${SURAT_LNG}&lang=en`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data?.features) return [];
    // Convert GeoJSON Feature format → our SearchResult format
    return (data.features as any[])
      .filter((f: any) => f.geometry?.coordinates && f.properties)
      .map((f: any, idx: number) => {
        const p = f.properties;
        const [lon, lat] = f.geometry.coordinates;
        // Build human-readable display_name from Photon properties
        const parts = [p.name, p.street, p.housenumber, p.district, p.city, p.state, p.country]
          .filter(Boolean);
        return {
          place_id: 900000 + idx, // unique fake id to avoid collision with Nominatim
          display_name: parts.join(', '),
          lat: String(lat),
          lon: String(lon),
        } as SearchResult;
      });
  } catch { return []; }
};

// ─── Dedup by proximity: skip if another result is within ~100m ───────────────
const dedupByProximity = (results: SearchResult[]): SearchResult[] => {
  const THRESHOLD = 0.001; // ~111m per degree
  const kept: SearchResult[] = [];
  for (const r of results) {
    const duplicate = kept.some(
      (k) => Math.abs(parseFloat(k.lat) - parseFloat(r.lat)) < THRESHOLD &&
              Math.abs(parseFloat(k.lon) - parseFloat(r.lon)) < THRESHOLD
    );
    if (!duplicate) kept.push(r);
  }
  return kept;
};

// ─── Source 3: Overpass API (direct OSM database fuzzy name search) ──────────
const searchOverpass = async (query: string): Promise<SearchResult[]> => {
  try {
    // Search nodes, ways, relations with matching name inside Surat bounding box
    const bbox = '20.95,72.60,21.45,73.15'; // south,west,north,east
    const escapedQuery = query.replace(/["\\]/g, '\\$&'); // escape quotes
    const overpassQuery = `
      [out:json][timeout:8];
      (
        node["name"~"${escapedQuery}",i](${bbox});
        way["name"~"${escapedQuery}",i](${bbox});
        relation["name"~"${escapedQuery}",i](${bbox});
      );
      out center 5;
    `.trim();
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data?.elements) return [];
    return (data.elements as any[]).map((el: any, idx: number) => {
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (!lat || !lon) return null;
      const name = el.tags?.name || el.tags?.['name:en'] || 'Unknown';
      const addr = [el.tags?.['addr:street'], el.tags?.['addr:city'], 'Gujarat, India']
        .filter(Boolean).join(', ');
      return {
        place_id: 800000 + idx,
        display_name: addr ? `${name}, ${addr}` : `${name}, Surat, Gujarat`,
        lat: String(lat),
        lon: String(lon),
      } as SearchResult;
    }).filter(Boolean) as SearchResult[];
  } catch { return []; }
};

// ─── Main search: all 3 sources in parallel, merge & dedup ───────────────────
const searchAddress = async (query: string): Promise<SearchResult[]> => {
  const [nominatimRes, photonRes, overpassRes] = await Promise.allSettled([
    searchNominatim(query),
    searchPhoton(query),
    searchOverpass(query),
  ]);
  const nom = nominatimRes.status === 'fulfilled' ? nominatimRes.value : [];
  const pho = photonRes.status === 'fulfilled' ? photonRes.value : [];
  const ovp = overpassRes.status === 'fulfilled' ? overpassRes.value : [];
  // Priority: Overpass first (best for exact local name match), then interleave nom+photon
  const merged: SearchResult[] = [...ovp];
  const maxLen = Math.max(nom.length, pho.length);
  for (let i = 0; i < maxLen; i++) {
    if (nom[i]) merged.push(nom[i]);
    if (pho[i]) merged.push(pho[i]);
  }
  return dedupByProximity(merged).slice(0, 7);
};

// ─────────────────────────────────────────────────────────────────────────────
//  Helper: format a short readable label from display_name
// ─────────────────────────────────────────────────────────────────────────────
const shortLabel = (displayName: string): string => {
  const parts = displayName.split(',').map((s) => s.trim());
  return parts.slice(0, 3).join(', ');
};

// ─────────────────────────────────────────────────────────────────────────────
//  Default center: Surat, Gujarat
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_CENTER: LatLng = { lat: 21.1702, lng: 72.8311 };
const DEFAULT_ZOOM = 13;

// ─────────────────────────────────────────────────────────────────────────────
//  MapLocationPicker Component
//  Uses react-leaflet + OpenStreetMap tiles (100% free, no API key)
// ─────────────────────────────────────────────────────────────────────────────
export function MapLocationPicker({
  initialLat,
  initialLng,
  onLocationSelect,
  onClose,
}: MapLocationPickerProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const hasInitialCoords =
    initialLat !== undefined &&
    initialLng !== undefined &&
    initialLat !== 0 &&
    initialLng !== 0;

  const [pinned, setPinned] = useState<LatLng | null>(
    hasInitialCoords ? { lat: initialLat!, lng: initialLng! } : null
  );
  const [addressData, setAddressData] = useState<AddressData>({
    fullAddress: '', addressLine: '', area: '', pincode: ''
  });
  const [isReversing, setIsReversing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // ── Reverse geocode whenever pinned changes ──────────────────────────────
  useEffect(() => {
    if (!pinned) return;
    let cancelled = false;
    setIsReversing(true);
    reverseGeocode(pinned.lat, pinned.lng).then((data) => {
      if (!cancelled) {
        setAddressData(data);
        setIsReversing(false);
      }
    });
    return () => { cancelled = true; };
  }, [pinned]);

  // ── Initialize Leaflet map (client-side only) ────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const container = mapContainerRef.current;
    if (!container) return;

    // Dynamic import to avoid SSR issues
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      leafletRef.current = L.default || L;
      const Leaflet = leafletRef.current;

      // Fix default icon paths (webpack issue with react-leaflet)
      // @ts-ignore
      delete Leaflet.Icon.Default.prototype._getIconUrl;
      Leaflet.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // If container was already initialized by previous instance / StrictMode, clean it up
      if ((mapContainerRef.current as any)._leaflet_id) {
        if (mapRef.current) {
          try {
            mapRef.current.remove();
          } catch (e) {
            // ignore
          }
          mapRef.current = null;
        }
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      const initialCenter = hasInitialCoords
        ? { lat: initialLat!, lng: initialLng! }
        : DEFAULT_CENTER;

      const map = Leaflet.map(mapContainerRef.current, {
        center: [initialCenter.lat, initialCenter.lng],
        zoom: hasInitialCoords ? 16 : DEFAULT_ZOOM,
        zoomControl: false,
      });

      // OpenStreetMap tiles – completely free
      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom zoom control in bottom-right
      Leaflet.control.zoom({ position: 'bottomright' }).addTo(map);

      // If we have initial coords, drop a marker
      if (hasInitialCoords) {
        const marker = Leaflet.marker([initialLat!, initialLng!], { draggable: true }).addTo(map);
        markerRef.current = marker;
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setPinned({ lat: pos.lat, lng: pos.lng });
        });
      }

      // Click on map to pin/move marker
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          const marker = Leaflet.marker([lat, lng], { draggable: true }).addTo(map);
          markerRef.current = marker;
          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            setPinned({ lat: pos.lat, lng: pos.lng });
          });
        }
        setPinned({ lat, lng });
      });

      mapRef.current = map;
      setMapReady(true);
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
        markerRef.current = null;
      }
      if (container && (container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helper: fly to & pin a location ─────────────────────────────────────
  const flyAndPin = useCallback((lat: number, lng: number, zoom = 17) => {
    if (!mapRef.current || !leafletRef.current) return;
    const Leaflet = leafletRef.current;
    mapRef.current.flyTo([lat, lng], zoom, { animate: true, duration: 1.2 });
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = Leaflet.marker([lat, lng], { draggable: true }).addTo(mapRef.current);
      markerRef.current = marker;
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setPinned({ lat: pos.lat, lng: pos.lng });
      });
    }
    setPinned({ lat, lng });
  }, []);

  // ── GPS / My Location ────────────────────────────────────────────────────
  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported in this browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        flyAndPin(pos.coords.latitude, pos.coords.longitude, 17);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Location permission denied. Please allow access.');
        } else {
          setGpsError('Unable to fetch location. Try again.');
        }
        setTimeout(() => setGpsError(null), 4000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // ── Address Search ────────────────────────────────────────────────────────
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!val.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      const results = await searchAddress(val);
      setSearchResults(results);
      setIsSearching(false);
      // Keep search open when results arrive
      if (results.length > 0) setSearchOpen(true);
    }, 500); // Reduced to 500ms for snappier feel
  };

  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    flyAndPin(lat, lng, 17);
    setSearchQuery(shortLabel(result.display_name));
    setSearchResults([]);
    setSearchOpen(false);
  };

  // ── Confirm selection ─────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!pinned) return;
    onLocationSelect(pinned.lat, pinned.lng, addressData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal card */}
      <div className="flex flex-col w-full h-full max-w-2xl mx-auto bg-white shadow-2xl overflow-hidden md:my-6 md:rounded-3xl md:max-h-[92vh]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex-shrink-0">
          <div>
            <h2 className="text-base font-black tracking-tight flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Pin Your Ground Location
            </h2>
            <p className="text-[11px] text-emerald-100 mt-0.5">
              Tap on map or drag the marker to set exact location
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Close map"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Search Bar ── */}
        <div className="px-3 py-2 bg-white border-b border-slate-100 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search area, landmark or address in Surat…"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            />
            {isSearching ? (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 animate-spin" />
            ) : searchQuery ? (
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}

            {/* Search dropdown results — rendered inside relative so it escapes flex layout */}
            {searchOpen && searchQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-200 z-[9999] max-h-64 overflow-y-auto">
                {/* Searching state */}
                {isSearching && (
                  <div className="flex items-center gap-2 px-4 py-3 text-xs text-slate-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500 flex-shrink-0" />
                    <span>Searching across 3 sources…</span>
                  </div>
                )}

                {/* No results found — actionable guidance */}
                {!isSearching && searchResults.length === 0 && (
                  <div className="p-3 space-y-2">
                    <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <span>🔍</span> "{searchQuery}" not found in map data
                    </p>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      Many Indian local malls, societies & shops aren't indexed in free map databases.
                      Use these instead:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { setSearchOpen(false); handleMyLocation(); }}
                        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold hover:bg-emerald-100 transition-colors"
                      >
                        <Navigation className="w-3 h-3 flex-shrink-0" />
                        Use GPS Location
                      </button>
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold hover:bg-blue-100 transition-colors"
                      >
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        Tap Map to Pin
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      💡 Tip: Try searching just the area name (e.g. "Mota Varachha", "Adajan")
                    </p>
                  </div>
                )}

                {/* Results list */}
                {searchResults.map((r) => (
                  <button
                    key={r.place_id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectResult(r)}
                    className="w-full text-left px-4 py-3 hover:bg-emerald-50 border-b border-slate-100 last:border-0 transition-colors"
                  >
                    <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-1">
                      {shortLabel(r.display_name)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {r.display_name}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Map Container ── */}
        <div className="relative flex-1 min-h-0">
          {/* Leaflet map */}
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Map container - Leaflet CSS loaded globally */}

          {/* Center crosshair hint (before any pin) */}
          {!pinned && mapReady && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[500]">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-white/90 px-3 py-1 rounded-full shadow-md">
                  Tap anywhere to drop pin
                </span>
              </div>
            </div>
          )}

          {/* My Location button */}
          <button
            onClick={handleMyLocation}
            disabled={gpsLoading}
            className="absolute top-3 right-3 z-[500] flex items-center gap-1.5 bg-white shadow-lg border border-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-all disabled:opacity-60"
            title="Use my current location"
          >
            {gpsLoading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
              : <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            }
            {gpsLoading ? 'Locating…' : 'My Location'}
          </button>

          {/* GPS error toast */}
          {gpsError && (
            <div className="absolute top-14 right-3 z-[500] flex items-center gap-2 bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-lg animate-in slide-in-from-top-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {gpsError}
            </div>
          )}
        </div>

        {/* ── Bottom Panel: Address breakdown + Confirm ── */}
        <div className="flex-shrink-0 bg-white border-t border-slate-100 px-4 py-3 space-y-3">
          {/* Address breakdown card */}
          <div className={`rounded-2xl border transition-all ${
            pinned ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
          }`}>
            {pinned ? (
              isReversing ? (
                <div className="flex items-center gap-2 px-3.5 py-3 text-xs text-emerald-700">
                  <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                  Fetching address details…
                </div>
              ) : (
                <div className="px-3.5 py-3 space-y-1.5">
                  {/* Street Address row */}
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Street Address</span>
                      <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2 mt-0.5">
                        {addressData.addressLine || addressData.fullAddress.split(',').slice(0, 3).join(',') || 'Address fetched'}
                      </p>
                    </div>
                  </div>
                  {/* Area + Pincode row */}
                  <div className="flex items-center gap-3 pt-0.5 border-t border-emerald-200">
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Area / Locality</span>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        {addressData.area || 'Surat'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Pincode</span>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        {addressData.pincode || '—'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Coords</span>
                      <p className="text-[10px] font-mono text-emerald-600 mt-0.5">
                        {pinned.lat.toFixed(5)}, {pinned.lng.toFixed(5)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-3">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <p className="text-xs text-slate-400 italic">
                  No location pinned yet — tap on the map above
                </p>
              </div>
            )}
          </div>

          {/* Will auto-fill hint */}
          {pinned && !isReversing && (
            <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Address, Area & Pincode will be auto-filled in your form
            </p>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onClose}
              className="py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!pinned || isReversing}
              className="py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Location
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
