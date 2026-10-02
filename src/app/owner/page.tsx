"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  CheckCircle2, 
  Edit3, 
  Phone, 
  MessageSquare, 
  Sun, 
  Zap, 
  Calendar, 
  ShieldCheck, 
  Sparkles,
  Camera,
  Plus,
  Trash2,
  MapPin,
  Clock,
  Building2,
  Info,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sliders,
  DollarSign,
  AlertCircle,
  Eye,
  RefreshCw,
  Search,
  Image as ImageIcon,
  X,
  Upload,
  Copy,
  QrCode
} from 'lucide-react';
import { TurfType, Ground, Box, RefundTier } from '@/types';
import { AMENITY_OPTIONS, normalizeAmenity } from '@/lib/mockData';

// Preset Surat Turf Photos for 1-click addition
const SAMPLE_PHOTOS = [
  { title: 'Box A Turf (Main 360°)', url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80' },
  { title: 'Floodlights Night View', url: 'https://images.unsplash.com/photo-1531415074868-036b1c57e329?w=800&auto=format&fit=crop&q=80' },
  { title: 'Dugout & Seating Arena', url: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&auto=format&fit=crop&q=80' },
  { title: 'Synthetic Pitch Close-up', url: 'https://images.unsplash.com/photo-1516475429286-465d815a0df7?w=800&auto=format&fit=crop&q=80' },
];

// Extract strictly 10 digits from any raw phone string
const extract10Digits = (phoneStr?: string): string => {
  if (!phoneStr) return '';
  const digits = phoneStr.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  return digits.slice(-10);
};

// Format 24-hour time string ("06:00", "14:30", "02:00") into 12-hour AM/PM format ("06:00 AM", "02:30 PM", "02:00 AM")
const formatTimeWithAMPM = (timeStr?: string): string => {
  if (!timeStr) return '';
  const clean = timeStr.trim();
  const parts = clean.split(':');
  if (parts.length < 2) return timeStr;
  
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1] || '00';
  if (isNaN(hours)) return timeStr;
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  
  const paddedHours = hours < 10 ? `0${hours}` : `${hours}`;
  return `${paddedHours}:${minutes} ${ampm}`;
};

// Format full operating schedule with AM/PM and next-day awareness
const formatOperatingHours = (open: string, close: string): string => {
  const formattedOpen = formatTimeWithAMPM(open);
  const formattedClose = formatTimeWithAMPM(close);
  
  const openHour = parseInt(open.split(':')[0] || '0', 10);
  const closeHour = parseInt(close.split(':')[0] || '0', 10);
  const isPastMidnight = closeHour < openHour;
  
  if (isPastMidnight) {
    return `${formattedOpen} to ${formattedClose} (Next Day • Daily)`;
  }
  return `${formattedOpen} to ${formattedClose} (Daily)`;
};

// Preset refund policy templates for box cricket owners
const REFUND_PRESETS: {
  id: string;
  name: string;
  guj: string;
  badge: string;
  description: string;
  tiers: RefundTier[];
}[] = [
  {
    id: 'standard',
    name: 'Balanced Standard',
    guj: 'સામાન્ય (ભલામણ કરેલ)',
    badge: '⭐ Recommended',
    description: '12h+ (30% refund) • 3-12h (20%) • 1-3h (10%) • <1h (0%)',
    tiers: [
      { hoursBefore: 12, refundPercent: 30 },
      { hoursBefore: 3, refundPercent: 20 },
      { hoursBefore: 1, refundPercent: 10 },
      { hoursBefore: 0, refundPercent: 0 }
    ]
  },
  {
    id: 'flexible',
    name: 'Player Friendly',
    guj: 'ખેલાડી-મૈત્રીપૂર્ણ',
    badge: 'High Trust',
    description: '12h+ (100% full refund) • 4-12h (50%) • <4h (0%)',
    tiers: [
      { hoursBefore: 12, refundPercent: 100 },
      { hoursBefore: 4, refundPercent: 50 },
      { hoursBefore: 0, refundPercent: 0 }
    ]
  },
  {
    id: 'strict',
    name: 'Strict / High-Demand',
    guj: 'કડક નિયમ (ઓછું રિફંડ)',
    badge: 'Prime Slots',
    description: '24h+ (50% refund) • <24h (0% No Refund)',
    tiers: [
      { hoursBefore: 24, refundPercent: 50 },
      { hoursBefore: 0, refundPercent: 0 }
    ]
  },
  {
    id: 'no_refund',
    name: 'Non-Refundable',
    guj: 'રિફંડ નહીં (નોન-રિફંડેબલ)',
    badge: 'Zero Risk',
    description: 'Booking advance is 100% non-refundable upon cancellation',
    tiers: [
      { hoursBefore: 0, refundPercent: 0 }
    ]
  }
];

interface PitchFormState {
  id: string;
  name: string;
  type: TurfType;
  widthFt: string;
  lengthFt: string;
  squadFormat: '6v6' | '7v7' | '8v8';
  dayRate: string;
  primeRate: string;
  weekendRate: string;
  slotDuration: '60' | '90' | '120';
  images: string[];
}

export default function OwnerGroundRegistrationPage() {
  const router = useRouter();
  const { currentUser, grounds, addGround, updateGround, localities, addLocality } = useApp();

  // Find if current user already owns any ground
  const existingGround = grounds.find(
    (g) => g.ownerPhone === currentUser.phone || g.ownerId === currentUser.id
  ) || grounds[0]; // fallback to first ground for demo testing

  // Page View Mode: 'OVERVIEW' (Manage Dashboard) vs 'WIZARD' (5-Step Form)
  const [viewMode, setViewMode] = useState<'OVERVIEW' | 'WIZARD'>('OVERVIEW');
  const [currentStep, setCurrentStep] = useState<number>(2); // Default to Step 2 as requested in screenshot or start at 1
  const [isEditingExisting, setIsEditingExisting] = useState<boolean>(true);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Pitch Delete Confirmation Modal State
  const [pitchIndexToDelete, setPitchIndexToDelete] = useState<number | null>(null);
  const [deleteWarningToast, setDeleteWarningToast] = useState<string | null>(null);

  // Global Locality Catalog Search & Add state
  const [isLocalityDropdownOpen, setIsLocalityDropdownOpen] = useState(false);
  const localityDropdownRef = useRef<HTMLDivElement>(null);
  const [localitySearch, setLocalitySearch] = useState('');
  const [isAddingNewLocality, setIsAddingNewLocality] = useState(false);
  const [customLocalityInput, setCustomLocalityInput] = useState('');
  const [localityFeedback, setLocalityFeedback] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (localityDropdownRef.current && !localityDropdownRef.current.contains(event.target as Node)) {
        setIsLocalityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLocalities = localities.filter((loc) =>
    loc.toLowerCase().includes(localitySearch.trim().toLowerCase())
  );

  const handleAddNewLocality = (nameToAdd?: string) => {
    const targetName = (nameToAdd || localitySearch || customLocalityInput).trim();
    if (!targetName) return;

    const result = addLocality(targetName);
    setArea(result.name);

    if (result.alreadyExisted) {
      setLocalityFeedback({
        message: `"${result.name}" already in Global Catalog. Selected!`,
        type: 'info'
      });
    } else {
      setLocalityFeedback({
        message: `✓ "${result.name}" added to Global Catalog & selected!`,
        type: 'success'
      });
    }

    setLocalitySearch('');
    setCustomLocalityInput('');
    setIsAddingNewLocality(false);
    setIsLocalityDropdownOpen(false);
    if (step1Error) setStep1Error(null);

    setTimeout(() => setLocalityFeedback(null), 3500);
  };

  // ----------------------------------------------------
  // FORM STATES (5 STEPS)
  // ----------------------------------------------------
  
  // Step 1: Ground Basic Info
  const [groundName, setGroundName] = useState('Royal Turf & Box Cricket Arena');
  const [groundDescription, setGroundDescription] = useState('Surat’s premier ultra-cushioned indoor 360 turf with professional LED floodlights and air-cooled dugout.');
  const [groundPhone, setGroundPhone] = useState('9825499887');
  const [addressLine, setAddressLine] = useState('Near Sudama Chowk, Behind Shell Petrol Pump');
  const [area, setArea] = useState('Mota Varachha');
  const [city, setCity] = useState('Surat');
  const [pincode, setPincode] = useState('394101');
  const [openTime, setOpenTime] = useState('06:00');
  const [closeTime, setCloseTime] = useState('02:00');
  const [allDaysOpen, setAllDaysOpen] = useState(true);

  // Step 2: Pitches & Hourly Rates (Multiple Pitches supported)
  const [pitches, setPitches] = useState<PitchFormState[]>([
    {
      id: 'pitch_1',
      name: 'Box A (Main Floodlight Pitch)',
      type: 'THREE_SIXTY',
      widthFt: '45',
      lengthFt: '75',
      squadFormat: '7v7',
      dayRate: '700',
      primeRate: '900',
      weekendRate: '1000',
      slotDuration: '60',
      images: [
        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1531415074868-036b1c57e329?w=800&auto=format&fit=crop&q=80'
      ]
    }
  ]);
  const [activePitchIndex, setActivePitchIndex] = useState<number>(0);

  // Pitch Tabs Horizontal Scroll & Auto-focus
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkTabScroll = () => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  };

  useEffect(() => {
    checkTabScroll();
    const el = tabsContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkTabScroll, { passive: true });
    window.addEventListener('resize', checkTabScroll);
    return () => {
      el.removeEventListener('scroll', checkTabScroll);
      window.removeEventListener('resize', checkTabScroll);
    };
  }, [pitches.length]);

  // Auto-scroll active tab into view whenever activePitchIndex or pitches change
  useEffect(() => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const activeTab = el.querySelector(`[data-tab-index="${activePitchIndex}"]`) as HTMLElement;
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    const timer = setTimeout(checkTabScroll, 350);
    return () => clearTimeout(timer);
  }, [activePitchIndex, pitches.length]);

  const scrollTabs = (direction: 'left' | 'right') => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -180 : 180;
    el.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(checkTabScroll, 250);
  };

  // Step 3: Facilities & Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Night Floodlights',
    'Dedicated Car & Bike Parking',
    'Chilled RO Drinking Water',
    'Bat & Ball Rental Included'
  ]);
  const [turfRules, setTurfRules] = useState('Tennis ball only. Rubber studs or sports shoes required. Metal spikes strictly prohibited.');

  // Step 4: Photos & Gallery
  const [galleryImages, setGalleryImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531415074868-036b1c57e329?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&auto=format&fit=crop&q=80'
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [previewPhotoIndex, setPreviewPhotoIndex] = useState<number | null>(null);

  // Step 5: Advance UPI Collection & Payout Settings
  const [requireAdvance, setRequireAdvance] = useState(true);
  const [advancePercent, setAdvancePercent] = useState('30');
  const [upiId, setUpiId] = useState('royalboxcricket@okhdfcbank');
  const [upiName, setUpiName] = useState('Royal Turf & Box Cricket LLP');
  const [refundTiers, setRefundTiers] = useState<RefundTier[]>([
    { hoursBefore: 12, refundPercent: 30 },
    { hoursBefore: 3, refundPercent: 20 },
    { hoursBefore: 1, refundPercent: 10 },
    { hoursBefore: 0, refundPercent: 0 }
  ]);
  const [showUpiQrPreview, setShowUpiQrPreview] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showCustomRefundEditor, setShowCustomRefundEditor] = useState(false);
  const [isCustomAdvance, setIsCustomAdvance] = useState(false);

  // Load existing ground data into form when entering edit mode
  const populateFormWithGround = (g: Ground) => {
    setGroundName(g.name);
    setGroundDescription(g.description || '');
    setGroundPhone(extract10Digits(g.phone));
    setAddressLine(g.addressLine);
    setArea(g.area);
    setCity(g.city);
    setPincode(g.pincode);
    setSelectedAmenities(
      Array.from(new Set((g.amenities || []).map(normalizeAmenity).filter(Boolean)))
    );
    setGalleryImages(g.images && g.images.length > 0 ? g.images : galleryImages);

    if (g.boxes && g.boxes.length > 0) {
      setPitches(
        g.boxes.map((b, idx) => ({
          id: b.id || `pitch_${idx + 1}`,
          name: b.name,
          type: b.type,
          widthFt: b.widthFt.toString(),
          lengthFt: (b.heightFt || 75).toString(),
          squadFormat: b.maxPlayers <= 12 ? '6v6' : b.maxPlayers >= 16 ? '8v8' : '7v7',
          dayRate: (b.basePrice ? b.basePrice - 100 : 700).toString(),
          primeRate: (b.basePrice || 900).toString(),
          weekendRate: (b.basePrice ? b.basePrice + 200 : 1000).toString(),
          slotDuration: (b.slotMinutes === 90 ? '90' : b.slotMinutes === 120 ? '120' : '60'),
          images: b.images && b.images.length > 0 ? b.images : galleryImages.slice(0, 2)
        }))
      );
      setActivePitchIndex(0);
      if (g.boxes[0]?.schedules?.[0]) {
        setOpenTime(g.boxes[0].schedules[0].openTime || '06:00');
        setCloseTime(g.boxes[0].schedules[0].closeTime || '02:00');
      }
    }

    if (g.paymentSettings) {
      setRequireAdvance(g.paymentSettings.advanceEnabled);
      setAdvancePercent(g.paymentSettings.advanceValue?.toString() || '30');
      setUpiId(g.paymentSettings.upiId);
      setUpiName(g.paymentSettings.upiName || g.name);
      if (g.paymentSettings.refundTiers) {
        setRefundTiers(g.paymentSettings.refundTiers);
      }
    }
  };

  // Pre-load existing ground on first render if available
  useEffect(() => {
    if (existingGround) {
      populateFormWithGround(existingGround);
    }
  }, [existingGround]);

  // Active pitch being edited in Step 2
  const activePitch = pitches[activePitchIndex] || pitches[0];

  const updateActivePitch = (updates: Partial<PitchFormState>) => {
    setPitches((prev) =>
      prev.map((p, idx) => (idx === activePitchIndex ? { ...p, ...updates } : p))
    );
  };

  // Add another pitch in Step 2
  const handleAddNewPitch = () => {
    const nextPitchNumber = pitches.length + 1;
    const newPitchLetter = String.fromCharCode(65 + pitches.length);
    const newP: PitchFormState = {
      id: `pitch_${Date.now()}`,
      name: `Box ${newPitchLetter} (Turf ${nextPitchNumber})`,
      type: 'THREE_SIXTY',
      widthFt: '45',
      lengthFt: '75',
      squadFormat: '7v7',
      dayRate: '700',
      primeRate: '900',
      weekendRate: '1000',
      slotDuration: '60',
      images: [SAMPLE_PHOTOS[0].url]
    };
    setPitches((prev) => [...prev, newP]);
    setActivePitchIndex(pitches.length);
  };

  // Delete / Remove pitch in Step 2 - Opens custom confirmation modal
  const handleRemovePitch = (indexToRemove: number) => {
    if (pitches.length <= 1) {
      setDeleteWarningToast("At least 1 box / pitch is required for your ground registration.");
      setTimeout(() => setDeleteWarningToast(null), 3000);
      return;
    }
    setPitchIndexToDelete(indexToRemove);
  };

  // Confirmed Delete execution from the Custom Modal
  const handleConfirmDeletePitch = () => {
    if (pitchIndexToDelete === null) return;
    const indexToRemove = pitchIndexToDelete;
    const removedName = pitches[indexToRemove]?.name || `Pitch #${indexToRemove + 1}`;

    setPitches((prev) => prev.filter((_, idx) => idx !== indexToRemove));

    // Adjust active index
    setActivePitchIndex((prev) => {
      if (indexToRemove === prev) {
        return Math.max(0, prev - 1);
      }
      if (indexToRemove < prev) {
        return prev - 1;
      }
      return prev;
    });

    setPitchIndexToDelete(null);
    setSaveSuccessMessage(`"${removedName}" removed successfully! 🗑️`);
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  // Toggle Amenity
  const toggleAmenity = (name: string) => {
    const canonical = normalizeAmenity(name);
    setSelectedAmenities((prev) => {
      const normalizedList = prev.map(normalizeAmenity);
      if (normalizedList.includes(canonical)) {
        return normalizedList.filter((a) => a !== canonical && a !== name);
      } else {
        return Array.from(new Set(normalizedList.concat(canonical)));
      }
    });
  };

  // Photo File Upload Handler with Canvas Downscaling & Max Limit (Max 12 Photos)
  const MAX_PHOTOS = 12;

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const maxDim = 1200;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (rawFiles.length === 0) return;

    if (galleryImages.length >= MAX_PHOTOS) {
      setDeleteWarningToast(`Maximum ${MAX_PHOTOS} photos allowed.`);
      setTimeout(() => setDeleteWarningToast(null), 3000);
      return;
    }

    const availableSlots = MAX_PHOTOS - galleryImages.length;
    const filesToProcess = rawFiles.slice(0, availableSlots);

    const compressed = await Promise.all(filesToProcess.map(compressImage));
    setGalleryImages((prev) => [...prev, ...compressed]);

    if (rawFiles.length > availableSlots) {
      setDeleteWarningToast(`Uploaded ${availableSlots} photos (maximum ${MAX_PHOTOS} limit reached).`);
      setTimeout(() => setDeleteWarningToast(null), 3500);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
    e.target.value = '';
  };

  const handleDropFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingPhoto(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleSetCoverPhoto = (index: number) => {
    if (index === 0) return;
    setGalleryImages((prev) => {
      const selected = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [selected, ...rest];
    });
    setSaveSuccessMessage("Cover photo updated! 🌟");
    setTimeout(() => setSaveSuccessMessage(null), 2500);
  };

  // Keyboard navigation for image preview lightbox
  useEffect(() => {
    if (previewPhotoIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewPhotoIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setPreviewPhotoIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : galleryImages.length - 1
        );
      } else if (e.key === 'ArrowRight') {
        setPreviewPhotoIndex((prev) =>
          prev !== null && prev < galleryImages.length - 1 ? prev + 1 : 0
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewPhotoIndex, galleryImages.length]);

  const handleRemovePhoto = (indexToRemove: number) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Step 5: UPI & Refund Policy helpers
  const isUpiValid = /^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId.trim());

  const handleSelectUpiHandle = (handle: string) => {
    const current = upiId.trim();
    if (!current) {
      setUpiId(`yourturf${handle}`);
      return;
    }
    const atIndex = current.indexOf('@');
    if (atIndex !== -1) {
      const username = current.substring(0, atIndex);
      setUpiId(`${username}${handle}`);
    } else {
      setUpiId(`${current}${handle}`);
    }
  };

  const handleCopyUpi = () => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const getActiveRefundPresetId = (currentTiers: RefundTier[]): string => {
    for (const preset of REFUND_PRESETS) {
      if (preset.tiers.length === currentTiers.length) {
        const match = preset.tiers.every((t, i) => 
          t.hoursBefore === currentTiers[i]?.hoursBefore && t.refundPercent === currentTiers[i]?.refundPercent
        );
        if (match) return preset.id;
      }
    }
    return 'custom';
  };

  const handleApplyRefundPreset = (presetTiers: RefundTier[]) => {
    setRefundTiers(presetTiers);
  };

  const handleAddRefundTier = () => {
    const existingHours = new Set(refundTiers.map(t => t.hoursBefore));
    const candidateHours = [24, 18, 12, 8, 6, 4, 3, 2, 1];
    const newHour = candidateHours.find(h => !existingHours.has(h)) || 6;
    const updated = [...refundTiers, { hoursBefore: newHour, refundPercent: 20 }].sort((a, b) => b.hoursBefore - a.hoursBefore);
    setRefundTiers(updated);
    setShowCustomRefundEditor(true);
  };

  const handleUpdateTierHours = (index: number, hours: number) => {
    const updated = refundTiers.map((t, i) => i === index ? { ...t, hoursBefore: hours } : t);
    updated.sort((a, b) => b.hoursBefore - a.hoursBefore);
    setRefundTiers(updated);
  };

  const handleUpdateTierPercent = (index: number, percent: number) => {
    const updated = refundTiers.map((t, i) => i === index ? { ...t, refundPercent: percent } : t);
    setRefundTiers(updated);
  };

  const handleRemoveRefundTier = (index: number) => {
    if (refundTiers.length <= 1) return;
    const updated = refundTiers.filter((_, i) => i !== index);
    setRefundTiers(updated);
  };

  const activeRefundPreset = getActiveRefundPresetId(refundTiers);

  // ----------------------------------------------------
  // SAVE & PUBLISH HANDLER
  // ----------------------------------------------------
  const handleSaveGround = (stayOnPage = false) => {
    const formattedBoxes: Box[] = pitches.map((p, idx) => ({
      id: p.id || `box_${idx + 1}`,
      groundId: existingGround?.id || 'ground_custom',
      name: p.name,
      type: p.type,
      widthFt: parseInt(p.widthFt) || 45,
      heightFt: parseInt(p.lengthFt) || 75,
      maxPlayers: p.squadFormat === '6v6' ? 12 : p.squadFormat === '8v8' ? 16 : 14,
      basePrice: parseInt(p.primeRate) || 900,
      slotMinutes: parseInt(p.slotDuration) || 60,
      isActive: true,
      images: p.images && p.images.length > 0 ? p.images : galleryImages.slice(0, 2),
      schedules: [
        { dayOfWeek: 1, openTime, closeTime, pricePerHour: parseInt(p.dayRate) || 700 },
        { dayOfWeek: 2, openTime, closeTime, pricePerHour: parseInt(p.dayRate) || 700 },
        { dayOfWeek: 3, openTime, closeTime, pricePerHour: parseInt(p.dayRate) || 700 },
        { dayOfWeek: 4, openTime, closeTime, pricePerHour: parseInt(p.dayRate) || 700 },
        { dayOfWeek: 5, openTime, closeTime, pricePerHour: parseInt(p.primeRate) || 900 },
        { dayOfWeek: 6, openTime, closeTime, pricePerHour: parseInt(p.weekendRate) || 1000 },
        { dayOfWeek: 0, openTime, closeTime, pricePerHour: parseInt(p.weekendRate) || 1000 }
      ]
    }));

    const formattedPhone = `+91 ${extract10Digits(groundPhone)}`;

    const groundPayload: Partial<Ground> = {
      name: groundName,
      description: groundDescription,
      phone: formattedPhone,
      addressLine,
      area,
      city,
      state: 'Gujarat',
      pincode,
      amenities: Array.from(new Set(selectedAmenities.map(normalizeAmenity).filter(Boolean))),
      images: galleryImages,
      boxes: formattedBoxes,
      status: 'VERIFIED',
      paymentSettings: {
        upiId,
        upiName,
        qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&cu=INR`,
        advanceEnabled: requireAdvance,
        advanceType: 'PERCENT',
        advanceValue: parseInt(advancePercent) || 30,
        refundTiers
      }
    };

    if (existingGround && isEditingExisting) {
      updateGround(existingGround.id, groundPayload);
      setSaveSuccessMessage('Ground details updated successfully!');
    } else {
      addGround({
        ownerId: currentUser.id || 'user_owner_custom',
        ownerName: currentUser.name || 'Ground Owner',
        ownerPhone: currentUser.phone || formattedPhone,
        name: groundName,
        description: groundDescription,
        phone: formattedPhone,
        addressLine,
        area,
        city,
        state: 'Gujarat',
        pincode,
        lat: 21.245,
        lng: 72.889,
        amenities: Array.from(new Set(selectedAmenities.map(normalizeAmenity).filter(Boolean))),
        status: 'VERIFIED',
        images: galleryImages,
        boxes: formattedBoxes,
        paymentSettings: {
          upiId,
          upiName,
          qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&cu=INR`,
          advanceEnabled: requireAdvance,
          advanceType: 'PERCENT',
          advanceValue: parseInt(advancePercent) || 30,
          refundTiers
        }
      });
      setSaveSuccessMessage('New ground successfully registered and published!');
    }

    setTimeout(() => {
      setSaveSuccessMessage(null);
      if (!stayOnPage) {
        setViewMode('OVERVIEW');
      }
    }, 1200);
  };

  // Step Progress Meta (6 Steps with Final Review & Onboarding)
  const stepTitles = [
    { num: 1, label: 'Info', title: 'Ground Information', guj: 'ગ્રાઉન્ડની પ્રાથમિક વિગતો', pct: '૧૬% પૂર્ણ (Step 1 of 6)' },
    { num: 2, label: 'Pitches', title: 'Ground & Pitch Setup', guj: 'ગ્રાઉન્ડ અને પીચ વિગતો', pct: '૩૩% પૂર્ણ (Step 2 of 6)' },
    { num: 3, label: 'Facility', title: 'Facility & Amenities', guj: 'સુવિધાઓ અને એમેનિટીઝ', pct: '૫૦% પૂર્ણ (Step 3 of 6)' },
    { num: 4, label: 'Photos', title: 'Ground & Pitch Photos', guj: 'ગ્રાઉન્ડના ફોટોગ્રાફ્સ', pct: '૬૬% પૂર્ણ (Step 4 of 6)' },
    { num: 5, label: 'UPI', title: 'UPI & Booking Policy', guj: 'પેમેન્ટ અને એડવાન્સ સેટિંગ્સ', pct: '૮૩% પૂર્ણ (Step 5 of 6)' },
    { num: 6, label: 'Review', title: 'Final Review & Onboarding', guj: 'ચકાસણી અને ગ્રાઉન્ડ રજીસ્ટ્રેશન', pct: '૧૦૦% તૈયાર (Final Review)' },
  ];

  const currentStepMeta = stepTitles[currentStep - 1] || stepTitles[0];

  // =========================================================================
  // VIEW 1: GROUND OVERVIEW / DASHBOARD (PRODUCTION-GRADE MANAGE VIEW)
  // =========================================================================
  if (viewMode === 'OVERVIEW' && existingGround) {
    return (
      <div className="p-4 space-y-4 pb-28 animate-in fade-in duration-200">
        
        {/* Save success toast */}
        {saveSuccessMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-700 text-white text-xs font-bold flex items-center justify-between shadow-lg animate-in slide-in-from-top-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{saveSuccessMessage}</span>
            </div>
            <button onClick={() => setSaveSuccessMessage(null)} className="text-emerald-200 hover:text-white">✕</button>
          </div>
        )}

        {/* 1. Ground Verified Status Card */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-[10px] font-bold">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Ground</span>
                </span>
                <span className="text-slate-400 font-mono">ID: {existingGround.id.slice(0, 8)}</span>
              </div>
              <h2 className="text-base font-black text-slate-900 mt-1">
                {existingGround.name}
              </h2>
              <p className="text-xs text-slate-500 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{existingGround.area}, {existingGround.city} • {existingGround.phone}</span>
              </p>
            </div>

            <button
              onClick={() => {
                populateFormWithGround(existingGround);
                setIsEditingExisting(true);
                setCurrentStep(1);
                setViewMode('WIZARD');
              }}
              className="p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-[#065f46] font-bold text-xs flex items-center space-x-1 border border-emerald-200 transition-all shadow-sm"
              title="Edit Ground Details"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pitches</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">{existingGround.boxes.length} Boxes</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Base Rate</div>
              <div className="text-sm font-black text-emerald-700 mt-0.5">₹{existingGround.boxes[0]?.basePrice || 900}/hr</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Advance</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">{existingGround.paymentSettings?.advanceValue || 30}% UPI</div>
            </div>
          </div>
        </div>

        {/* 2. Onboarding Offer: 3 Months 0% Fee Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 to-[#065f46] text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5 text-[10px] font-black tracking-wider uppercase text-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Special Surat Onboarding Benefit</span>
              </div>
              <h3 className="text-xs font-black">૩ મહિના 0% પ્લેટફોર્મ ફી (3 Months 0% Fee)</h3>
              <p className="text-[11px] text-emerald-100/90 leading-tight">
                All player bookings through BoxKhel are 100% free for your venue!
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-sm text-center border border-white/30 text-xs font-black">
              0% FEE
            </div>
          </div>
        </div>

        {/* 3. Quick Edit Section Switchers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Manage & Update Ground Sections
            </h3>
            <span className="text-[10px] text-emerald-700 font-bold">6 Sections</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {[
              { step: 1, title: '1. Basic Information', desc: 'Ground name, phone, address, timings', icon: '📝' },
              { step: 2, title: '2. Box & Pitch Specifications', desc: `${existingGround.boxes.length} Pitches • Dimensions • Hourly rates`, icon: '🏏' },
              { step: 3, title: '3. Amenities & Facilities', desc: `${existingGround.amenities.length} Features active (Lights, Parking, Water)`, icon: '⚡' },
              { step: 4, title: '4. Photos & Showcase', desc: `${existingGround.images.length} High-res photos uploaded`, icon: '📷' },
              { step: 5, title: '5. UPI Payout & Policy', desc: `UPI: ${existingGround.paymentSettings?.upiId} • ${existingGround.paymentSettings?.advanceValue}% Advance`, icon: '💳' },
              { step: 6, title: '6. Review & Onboarding', desc: 'Full ground overview, verification & live publish', icon: '🚀' },
            ].map((sec) => (
              <button
                key={sec.step}
                type="button"
                onClick={() => {
                  populateFormWithGround(existingGround);
                  setIsEditingExisting(true);
                  setCurrentStep(sec.step);
                  setViewMode('WIZARD');
                }}
                className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left flex items-center justify-between transition-all group shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-sm group-hover:scale-105 transition-transform">
                    {sec.icon}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                      {sec.title}
                    </h4>
                    <p className="text-[10px] text-slate-500">{sec.desc}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-slate-400 group-hover:text-emerald-700">
                  <span className="text-[10px] font-bold">Edit</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Active Pitches Overview */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-base">🏏</span>
              <h3 className="text-xs font-black text-slate-900">Your Active Pitches</h3>
            </div>
            <button
              onClick={() => {
                populateFormWithGround(existingGround);
                setIsEditingExisting(true);
                handleAddNewPitch();
                setCurrentStep(2);
                setViewMode('WIZARD');
              }}
              className="text-[11px] font-bold text-[#ff6813] hover:underline flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Box</span>
            </button>
          </div>

          <div className="space-y-2">
            {existingGround.boxes.map((b, idx) => (
              <div key={b.id || idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h4 className="text-xs font-bold text-slate-900">{b.name}</h4>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                      {b.type === 'THREE_SIXTY' ? '360° Closed' : b.type === 'OPEN' ? 'Open Turf' : 'Covered'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {b.widthFt}x{b.heightFt || 75} ft • {b.maxPlayers} Players • {b.slotMinutes || 60} min slot
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-[#ff6813]">₹{b.basePrice}/hr</div>
                  <button
                    onClick={() => {
                      populateFormWithGround(existingGround);
                      setIsEditingExisting(true);
                      setActivePitchIndex(idx);
                      setCurrentStep(2);
                      setViewMode('WIZARD');
                    }}
                    className="text-[10px] text-emerald-700 font-bold hover:underline"
                  >
                    Edit Rates
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Public View & Action Buttons */}
        <div className="space-y-2 pt-2">
          <Link
            href={`/ground/${existingGround.id}`}
            className="w-full py-3.5 rounded-2xl bg-white border-2 border-emerald-600 text-[#065f46] hover:bg-emerald-50 text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-sm"
          >
            <Eye className="w-4 h-4" />
            <span>View Public Turf Page (What Players See)</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </Link>

          <button
            onClick={() => {
              // Reset to clean form for new ground
              setGroundName('');
              setAddressLine('');
              setPitches([
                {
                  id: `pitch_${Date.now()}`,
                  name: 'Box A (Main Turf)',
                  type: 'THREE_SIXTY',
                  widthFt: '45',
                  lengthFt: '75',
                  squadFormat: '7v7',
                  dayRate: '700',
                  primeRate: '900',
                  weekendRate: '1000',
                  slotDuration: '60',
                  images: [SAMPLE_PHOTOS[0].url]
                }
              ]);
              setIsEditingExisting(false);
              setCurrentStep(1);
              setViewMode('WIZARD');
            }}
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span>Register Another Ground</span>
          </button>
        </div>

        {/* Surat Support Card */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-slate-700 text-xs flex items-center justify-between">
          <div>
            <div className="font-bold text-slate-900">Need ground setup help in Surat?</div>
            <div className="text-[11px] text-slate-500">Call our Mota Varachha / Adajan team for free setup</div>
          </div>
          <a
            href="tel:+919825012345"
            className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-[11px] font-bold shadow-sm"
          >
            Call Support
          </a>
        </div>

      </div>
    );
  }

  // =========================================================================
  // VIEW 2: 5-STEP GROUND REGISTRATION & EDIT WIZARD
  // =========================================================================
  return (
    <div className="p-4 space-y-4 pb-28 animate-in fade-in duration-200">
      
      {/* Toast Message */}
      {saveSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-700 text-white text-xs font-bold flex items-center justify-between shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{saveSuccessMessage}</span>
          </div>
        </div>
      )}

      {/* Top Navigation & Stepper Header */}
      <div className="space-y-2">
        
        {/* Step Counter & Gujarati Progress */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
            <span className="w-5 h-5 rounded-full bg-[#065f46] text-white flex items-center justify-center text-[11px] font-black">
              {currentStep}
            </span>
            <span>Step {currentStep} of 6</span>
          </div>
          <span className="text-xs font-bold text-[#ff6813]">
            {currentStepMeta.pct}
          </span>
        </div>

        {/* Section Heading & Gujarati Translation */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-tight">
              {currentStepMeta.title}
            </h1>
            <p className="text-xs text-slate-400">{currentStepMeta.guj}</p>
          </div>

          {existingGround && (
            <button
              onClick={() => setViewMode('OVERVIEW')}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition-colors"
            >
              Exit to Dashboard
            </button>
          )}
        </div>

        {/* 6 Step Progress Bars (Clickable to jump directly to any step) */}
        <div className="grid grid-cols-6 gap-1.5 pt-1">
          {stepTitles.map((st) => {
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;
            return (
              <button
                key={st.num}
                type="button"
                onClick={() => setCurrentStep(st.num)}
                title={`Jump to Step ${st.num}: ${st.title}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-600'
                    : isCurrent
                    ? 'bg-[#ff6813]'
                    : 'bg-slate-200 hover:bg-slate-300'
                }`}
              />
            );
          })}
        </div>

        {/* 6 Step Labels (Clickable navigation) */}
        <div className="flex justify-between text-[10px] font-bold select-none pt-0.5">
          {stepTitles.map((st) => {
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;
            return (
              <button
                key={st.num}
                type="button"
                onClick={() => setCurrentStep(st.num)}
                className={`transition-colors cursor-pointer text-left ${
                  isCompleted
                    ? 'text-emerald-700 font-bold'
                    : isCurrent
                    ? 'text-[#ff6813] font-black'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {st.num}. {st.label} {isCompleted && '✓'}
              </button>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* STEP 1: GROUND BASIC INFO (Only fields for Step 1) */}
      {/* =================================================================== */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm">
                📝
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Ground & Arena Details</h3>
                <p className="text-[10px] text-slate-400">ગ્રાઉન્ડનું નામ અને સંપર્ક વિગતો</p>
              </div>
            </div>

            {/* Ground Name */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Ground / Arena Name * <span className="text-[10px] font-normal text-slate-400">બોક્સ ગ્રાઉન્ડનું નામ</span>
              </label>
              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 focus-within:border-emerald-600 focus-within:bg-white transition-all">
                <input
                  type="text"
                  value={groundName}
                  onChange={(e) => {
                    setGroundName(e.target.value);
                    if (step1Error) setStep1Error(null);
                  }}
                  placeholder="e.g. Royal Turf & Box Cricket Arena"
                  className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
                />
                {groundName.trim() && <Check className="w-4 h-4 text-emerald-600 ml-2" />}
              </div>
            </div>

            {/* Contact Mobile with Fixed +91 and strictly 10 digits */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-900">
                  Booking Contact Phone *
                </label>
                <span className="text-[10px] text-slate-400">બુકિંગ ફોન નંબર</span>
              </div>
              <div className="flex items-center rounded-2xl border border-slate-200 bg-white focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/15 transition-all overflow-hidden shadow-sm">
                <div className="pl-3.5 pr-2 text-slate-400 flex items-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="py-2.5 px-2.5 font-bold text-xs text-slate-700 select-none bg-slate-100 border-r border-slate-200 flex items-center">
                  +91
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={groundPhone}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setGroundPhone(clean);
                    if (step1Error) setStep1Error(null);
                  }}
                  placeholder="98254 XXXXX"
                  className="w-full bg-transparent py-2.5 px-3 text-slate-900 text-xs font-bold placeholder:text-slate-400 focus:outline-none tracking-wider"
                />
                {groundPhone.length === 10 && (
                  <div className="pr-3 flex items-center text-emerald-600">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Helper text & Counter */}
              <div className="flex items-center justify-between mt-1 px-1">
                <span className={`text-[10px] ${step1Error ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                  {step1Error || (groundPhone.length === 10 ? '✓ Valid 10-digit mobile number' : 'Enter 10-digit mobile number without +91')}
                </span>
                <span className={`text-[10px] font-bold ${groundPhone.length === 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {groundPhone.length}/10 digits
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Ground Description & Highlights <span className="text-[10px] font-normal text-slate-400">ટર્ફની ખાસિયત</span>
              </label>
              <textarea
                rows={2}
                value={groundDescription}
                onChange={(e) => setGroundDescription(e.target.value)}
                placeholder="Surat's premier 360° LED floodlit cricket box with high-density synthetic grass..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>

            {/* Surat Area / Locality Dropdown with Global Catalog */}
            <div className="space-y-1.5" ref={localityDropdownRef}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  Surat Area / Locality * <span className="text-[10px] font-normal text-slate-400">વિસ્તાર</span>
                </label>
                <span className="text-[10px] text-slate-400">Global Catalog</span>
              </div>

              {/* Feedback Alert if added or already existed */}
              {localityFeedback && (
                <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in duration-150 ${
                  localityFeedback.type === 'success' 
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-blue-50 border border-blue-200 text-blue-800'
                }`}>
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{localityFeedback.message}</span>
                  </div>
                  <button onClick={() => setLocalityFeedback(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
              )}

              {/* Main Dropdown Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLocalityDropdownOpen(!isLocalityDropdownOpen)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isLocalityDropdownOpen
                      ? 'border-emerald-600 ring-2 ring-emerald-500/15 bg-white shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-xs flex-shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="truncate">
                      {area ? (
                        <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 truncate">
                          <span>{area}, Surat</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                            Selected
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">
                          Select or search Surat locality...
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    {area && <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />}
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isLocalityDropdownOpen ? 'transform rotate-180 text-emerald-600' : ''}`} />
                  </div>
                </button>

                {/* Floating Searchable Dropdown Menu */}
                {isLocalityDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xl z-40 overflow-hidden animate-in fade-in duration-150">
                    
                    {/* Search Bar inside Dropdown */}
                    <div className="p-2 border-b border-slate-100 bg-slate-50/70">
                      <div className="flex items-center rounded-xl border border-slate-200 bg-white px-2.5 py-2 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-500/20">
                        <Search className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
                        <input
                          type="text"
                          autoFocus
                          value={localitySearch}
                          onChange={(e) => setLocalitySearch(e.target.value)}
                          placeholder="Search Surat locality (e.g. Sarthana, Vesu, Punagam)..."
                          className="w-full bg-transparent text-xs font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
                        />
                        {localitySearch && (
                          <button
                            type="button"
                            onClick={() => setLocalitySearch('')}
                            className="text-slate-400 hover:text-slate-600 text-xs px-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Dynamic Add to Catalog Option when search query is not in list */}
                    {localitySearch.trim() && !localities.some(l => l.toLowerCase() === localitySearch.trim().toLowerCase()) && (
                      <button
                        type="button"
                        onClick={() => handleAddNewLocality(localitySearch.trim())}
                        className="w-full p-2.5 bg-orange-50 hover:bg-orange-100 text-left text-xs font-bold text-[#ff6813] flex items-center justify-between border-b border-orange-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <Plus className="w-3.5 h-3.5 text-[#ff6813]" />
                          <span>Add "<strong className="text-slate-900">{localitySearch.trim()}</strong>" to Global Catalog</span>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-orange-200 text-orange-900 font-bold uppercase tracking-wider">
                          New Area
                        </span>
                      </button>
                    )}

                    {/* Scrollable Localities List */}
                    <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                      {filteredLocalities.map((loc) => {
                        const isSelected = area.toLowerCase() === loc.toLowerCase();
                        return (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => {
                              setArea(loc);
                              setIsLocalityDropdownOpen(false);
                              setLocalitySearch('');
                              if (step1Error) setStep1Error(null);
                            }}
                            className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected 
                                ? 'bg-emerald-50/80 text-emerald-900 font-bold' 
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                              <span>{loc}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />}
                          </button>
                        );
                      })}

                      {filteredLocalities.length === 0 && (
                        <div className="p-4 text-center text-xs text-slate-400">
                          No existing locality found for "{localitySearch}".
                        </div>
                      )}
                    </div>

                    {/* Bottom "+ Add New Locality" Quick Action */}
                    <div className="p-2 border-t border-slate-100 bg-slate-50/80">
                      {!isAddingNewLocality ? (
                        <button
                          type="button"
                          onClick={() => setIsAddingNewLocality(true)}
                          className="w-full py-2 px-3 rounded-xl border border-dashed border-emerald-600 bg-white hover:bg-emerald-50 text-[#065f46] text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Add New Locality</span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-1.5 p-1 bg-white rounded-xl border border-emerald-300 shadow-sm animate-in fade-in">
                          <input
                            type="text"
                            autoFocus
                            value={customLocalityInput}
                            onChange={(e) => setCustomLocalityInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddNewLocality(customLocalityInput);
                              }
                            }}
                            placeholder="Type new locality name..."
                            className="flex-1 bg-transparent px-2 text-xs font-bold text-slate-900 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddNewLocality(customLocalityInput)}
                            className="px-2.5 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition-colors shadow-sm"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => { setIsAddingNewLocality(false); setCustomLocalityInput(''); }}
                            className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            </div>

            {/* Full Street Address (Textarea as requested) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-900">
                  Full Street Address & Landmark * <span className="text-[10px] font-normal text-slate-400">પૂરું સરનામું</span>
                </label>
                <span className="text-[10px] text-slate-400">For player navigation & GPS</span>
              </div>
              <textarea
                rows={2}
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="e.g. Near Sudama Chowk, Behind Shell Petrol Pump, Opposite Laxmi Residency..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all resize-y min-h-[60px]"
              />
            </div>

            {/* City & Pincode */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  City <span className="text-[10px] font-normal text-slate-400">શહેર</span>
                </label>
                <div className="rounded-2xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Surat, Gujarat</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Fixed</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Pincode <span className="text-[10px] font-normal text-slate-400">પિનકોડ</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="394101"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all tracking-wider"
                />
              </div>
            </div>

            {/* Operating Hours */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  Operating Daily Hours <span className="text-[10px] font-normal text-slate-400">સમયગાળો</span>
                </label>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  {formatOperatingHours(openTime, closeTime)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">Opens (શરૂઆત):</span>
                    <span className="text-xs font-black text-emerald-800">{formatTimeWithAMPM(openTime)}</span>
                  </div>
                  <input
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">Closes (બંધ):</span>
                    <span className="text-xs font-black text-emerald-800">{formatTimeWithAMPM(closeTime)}</span>
                  </div>
                  <input
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Quick Preset Hours */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-semibold text-slate-400">Surat Timings:</span>
                {[
                  { label: '06:00 AM - 02:00 AM', open: '06:00', close: '02:00' },
                  { label: '06:00 AM - 12:00 AM', open: '06:00', close: '00:00' },
                  { label: '24 Hours Open', open: '00:00', close: '23:59' }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => { setOpenTime(preset.open); setCloseTime(preset.close); }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      openTime === preset.open && closeTime === preset.close
                        ? 'bg-[#065f46] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {existingGround && (
              <button
                type="button"
                onClick={() => setViewMode('OVERVIEW')}
                className="py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs text-center flex items-center justify-center hover:bg-slate-50"
              >
                <span>Dashboard</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (!groundName.trim()) {
                  setStep1Error('Please enter your Ground / Arena Name.');
                  return;
                }
                if (groundPhone.length !== 10) {
                  setStep1Error('Please enter a valid 10-digit mobile number.');
                  return;
                }
                if (!area || !area.trim()) {
                  setStep1Error('Please select or add your Surat Locality / Area.');
                  return;
                }
                setStep1Error(null);
                setCurrentStep(2);
              }}
              className={`${existingGround ? 'col-span-2' : 'col-span-3'} py-3.5 stitch-btn-orange text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-md font-bold`}
            >
              <span>Save & Next: Pitches</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* STEP 2: BOX & PITCH SETUP + PRICING (MATCHES USER SCREENSHOT EXACTLY) */}
      {/* =================================================================== */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Multiple Pitch Selector Control Bar */}
          <div className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            {/* Header: Title + Count + Pinned Always-Visible Add Box Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#065f46] flex items-center justify-center text-sm font-bold shadow-xs">
                  🏏
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-black text-slate-900 tracking-tight">Configured Boxes</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {pitches.length} {pitches.length === 1 ? 'Box' : 'Boxes'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">દરેક બોક્સ સિલેક્ટ કરી સેટિંગ્સ બદલો</p>
                </div>
              </div>

              {/* Pinned Add Box Button (Never gets hidden) */}
              <button
                type="button"
                onClick={handleAddNewPitch}
                className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 active:scale-95 text-[#ff6813] border border-orange-200 text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Box</span>
              </button>
            </div>

            {/* Scrollable Tabs Row with Left & Right Arrow Buttons */}
            <div className="relative flex items-center">
              {/* Left Arrow Button */}
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scrollTabs('left')}
                  className="absolute left-0 z-10 w-7 h-7 rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-700 hover:text-emerald-800 hover:bg-white flex items-center justify-center transition-all cursor-pointer -ml-1.5"
                  aria-label="Previous Box"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {/* Tabs Scroll Area */}
              <div
                ref={tabsContainerRef}
                onWheel={(e) => {
                  if (e.deltaY !== 0 && tabsContainerRef.current) {
                    tabsContainerRef.current.scrollBy({ left: e.deltaY, behavior: 'smooth' });
                  }
                }}
                className="flex items-center space-x-2 overflow-x-auto py-1 px-1 scroll-smooth w-full scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {pitches.map((p, idx) => {
                  const isActive = activePitchIndex === idx;
                  return (
                    <div
                      key={p.id || idx}
                      data-tab-index={idx}
                      className={`flex items-center rounded-2xl border transition-all flex-shrink-0 ${
                        isActive
                          ? 'bg-[#065f46] text-white border-emerald-700 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActivePitchIndex(idx)}
                        className="pl-3 pr-2 py-2 text-xs font-bold flex items-center space-x-1.5 whitespace-nowrap cursor-pointer"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-300 animate-pulse' : 'bg-slate-300'}`} />
                        <span>Pitch #{idx + 1}: {p.name.split(' (')[0] || p.name}</span>
                      </button>
                      {pitches.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePitch(idx);
                          }}
                          title={`Delete Pitch #${idx + 1}`}
                          className={`pr-2.5 pl-1 py-2 text-xs font-bold transition-colors cursor-pointer ${
                            isActive
                              ? 'text-emerald-200 hover:text-white'
                              : 'text-slate-400 hover:text-rose-600'
                          }`}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}

              </div>

              {/* Right Arrow Button */}
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => scrollTabs('right')}
                  className="absolute right-0 z-10 w-7 h-7 rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-700 hover:text-emerald-800 hover:bg-white flex items-center justify-center transition-all cursor-pointer -mr-1.5"
                  aria-label="Next Box"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Unified Pitch Configuration Card (Specifications + Pricing & Duration) */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
            
            {/* Card Master Header: Pitch Title, Prev/Next Switcher, & Single Delete Button */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#065f46] flex items-center justify-center text-sm font-bold shadow-xs">
                  🏏
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      {activePitch.name || `Pitch #${activePitchIndex + 1}`}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                      Box {activePitchIndex + 1} of {pitches.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">બોક્સ સાઇઝ, ફોર્મેટ અને રેટિંગ વિગતો</p>
                </div>
              </div>

              {/* Quick Prev / Next Navigator & Single Delete Button */}
              <div className="flex items-center space-x-2">
                {pitches.length > 1 && (
                  <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                    <button
                      type="button"
                      disabled={activePitchIndex === 0}
                      onClick={() => setActivePitchIndex((prev) => Math.max(0, prev - 1))}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Previous Box"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-1.5 text-[10px] font-black text-slate-700 whitespace-nowrap">
                      {activePitchIndex + 1}/{pitches.length}
                    </span>
                    <button
                      type="button"
                      disabled={activePitchIndex === pitches.length - 1}
                      onClick={() => setActivePitchIndex((prev) => Math.min(pitches.length - 1, prev + 1))}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Next Box"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {pitches.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePitch(activePitchIndex)}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                    title={`Delete Pitch #${activePitchIndex + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Box</span>
                  </button>
                )}
              </div>
            </div>

            {/* SECTION 1: Box & Pitch Specifications */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold">
                  ⚙️
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    1. Pitch Specifications
                  </h4>
                  <p className="text-[10px] text-slate-400">પીચ પ્રકાર અને ક્ષમતા (Court Specs)</p>
                </div>
              </div>

              {/* Box Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-900">Box / Pitch Name *</label>
                  <span className="text-[10px] text-slate-400">બોક્સનું નામ</span>
                </div>
                <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 focus-within:border-emerald-600 focus-within:bg-white transition-all">
                  <input
                    type="text"
                    value={activePitch.name}
                    onChange={(e) => updateActivePitch({ name: e.target.value })}
                    placeholder="e.g. Box A (Main Floodlight Pitch)"
                    className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
                  />
                  <Check className="w-4 h-4 text-emerald-600 ml-2" />
                </div>
              </div>

              {/* Pitch Enclosure Type */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-900">Pitch Enclosure Type</label>
                  <span className="text-[10px] text-slate-400">પીચ કવરેજ</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'THREE_SIXTY', title: '360° Netting', sub: 'Closed Box' },
                    { id: 'OPEN', title: 'Open Turf', sub: 'ખુલ્લા ટર્ફ' },
                    { id: 'CLOSED', title: 'Covered Roof', sub: 'શેડ વાળું' },
                  ].map((t) => {
                    const isSelected = activePitch.type === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => updateActivePitch({ type: t.id as TurfType })}
                        className={`p-2.5 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'bg-[#065f46] text-white border-[#065f46] shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-bold">{t.title}</div>
                        <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                          {t.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-900">Dimensions (In Feet)</label>
                  <span className="text-[10px] text-slate-400">માપ (ફૂટ માં)</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Width (પહોળાઈ)</div>
                      <input
                        type="number"
                        value={activePitch.widthFt}
                        onChange={(e) => updateActivePitch({ widthFt: e.target.value })}
                        className="bg-transparent text-sm font-black text-slate-900 w-16 focus:outline-none"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-400">ft</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Length (લંબાઈ)</div>
                      <input
                        type="number"
                        value={activePitch.lengthFt}
                        onChange={(e) => updateActivePitch({ lengthFt: e.target.value })}
                        className="bg-transparent text-sm font-black text-slate-900 w-16 focus:outline-none"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-400">ft</span>
                  </div>
                </div>
              </div>

              {/* Ideal Squad Format */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-900">Ideal Squad Format</label>
                  <span className="text-[10px] text-slate-400">ખેલાડી ક્ષમતા</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '6v6', title: '6 vs 6', sub: '(12 Players)' },
                    { id: '7v7', title: '7 vs 7', sub: '(14 Recommended)' },
                    { id: '8v8', title: '8 vs 8', sub: '(16 Players)' },
                  ].map((f) => {
                    const isSelected = activePitch.squadFormat === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => updateActivePitch({ squadFormat: f.id as any })}
                        className={`p-2.5 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'bg-[#065f46] text-white border-[#065f46] shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-bold">{f.title}</div>
                        <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                          {f.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Subtle Divider between Section 1 and Section 2 */}
            <div className="border-t border-slate-200/80 pt-1" />

            {/* SECTION 2: Hourly Pricing & Duration */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center text-xs font-bold">
                  ₹
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    2. Hourly Pricing & Slot Duration
                  </h4>
                  <p className="text-[10px] text-slate-400">દર કલાકનો ભાવ અને સમયગાળો</p>
                </div>
              </div>

              {/* Daytime Rate */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Daytime Rate</div>
                    <div className="text-[10px] text-slate-400">6:00 AM - 6:00 PM</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-black text-slate-900">₹</span>
                  <input
                    type="number"
                    value={activePitch.dayRate}
                    onChange={(e) => updateActivePitch({ dayRate: e.target.value })}
                    className="w-16 p-1 rounded-lg bg-white border border-slate-200 text-sm font-black text-slate-900 text-center focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">/hr</span>
                </div>
              </div>

              {/* Night Rate (Highlighted with Orange Accent) */}
              <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-200 flex items-center justify-between relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#ff6813]" />
                <div className="flex items-center space-x-2.5">
                  <Zap className="w-4 h-4 text-[#ff6813]" />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-slate-900">Night Rate</span>
                      <span className="px-1.5 py-0.2 rounded bg-orange-200 text-orange-900 text-[9px] font-bold">
                        રાત્રિ / ફ્લડલાઇટ
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">6:00 PM - 12:00 AM (Floodlights)</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-black text-[#ff6813]">₹</span>
                  <input
                    type="number"
                    value={activePitch.primeRate}
                    onChange={(e) => updateActivePitch({ primeRate: e.target.value })}
                    className="w-16 p-1 rounded-lg bg-white border border-orange-300 text-sm font-black text-[#ff6813] text-center focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">/hr</span>
                </div>
              </div>

              {/* Weekend Rate */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Weekend Rate</div>
                    <div className="text-[10px] text-slate-400">શનિ & રવિ (Sat & Sun)</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-black text-slate-900">₹</span>
                  <input
                    type="number"
                    value={activePitch.weekendRate}
                    onChange={(e) => updateActivePitch({ weekendRate: e.target.value })}
                    className="w-16 p-1 rounded-lg bg-white border border-slate-200 text-sm font-black text-slate-900 text-center focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">/hr</span>
                </div>
              </div>

              {/* Booking Slot Duration */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-900">Booking Slot Duration</label>
                  <span className="text-[10px] text-slate-400">સ્લોટ સમયગાળો</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {['60', '90', '120'].map((dur) => {
                    const isSelected = activePitch.slotDuration === dur;
                    return (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => updateActivePitch({ slotDuration: dur as any })}
                        className={`py-2.5 rounded-2xl text-xs font-bold text-center border transition-all ${
                          isSelected
                            ? 'bg-[#065f46] text-white border-[#065f46] shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {dur} min {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>

                <p className="text-[10px] text-slate-500 mt-2">
                  💡 Most Surat turfs prefer 60-minute recurring slots for seamless scheduling.
                </p>
              </div>

            </div>

          </div>

          {/* Surat Onboarding Support Banner */}
          <div className="p-4 rounded-3xl bg-blue-50/80 border border-blue-100 shadow-sm space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-[#ff6813] text-white flex items-center justify-center text-sm flex-shrink-0">
                🏟️
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">
                  સુરત ઓનબોર્ડિંગ સહાયતા (Need Help?)
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Call our Surat ground team or WhatsApp <strong className="text-slate-900">+91 98250 12345</strong>. We visit your ground in Mota Varachha, Adajan, or Vesu for <strong className="text-emerald-800">free HD photography & slot setup!</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="tel:+919825012345"
                className="py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Phone className="w-3.5 h-3.5 text-slate-600" />
                <span>Call Team</span>
              </a>

              <a
                href="https://wa.me/919825012345"
                target="_blank"
                rel="noreferrer"
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Bottom Action Navigation */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs text-center flex items-center justify-center space-x-1 hover:bg-slate-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back: Info</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="col-span-2 py-3.5 stitch-btn-orange text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-md font-bold"
            >
              <span>Save & Next: Facility</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* STEP 3: FACILITY & AMENITIES (Only fields for Step 3) */}
      {/* =================================================================== */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-sm">
                ⚡
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Facilities & Turf Amenities</h3>
                <p className="text-[10px] text-slate-400">ખેલાડીઓ માટે ઉપલબ્ધ સુવિધાઓ</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Select all amenities available at your turf. Players in Surat filter box cricket venues by amenities like Floodlights, Parking, and Chilled Water.
            </p>

            {/* Amenities Grid */}
            <div className="grid grid-cols-1 gap-2">
              {AMENITY_OPTIONS.map((am) => {
                const isSelected = selectedAmenities.map(normalizeAmenity).includes(am.name);
                return (
                  <button
                    key={am.id}
                    type="button"
                    onClick={() => toggleAmenity(am.name)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-base">
                        {am.icon}
                      </span>
                      <div>
                        <div className={`text-xs font-bold ${isSelected ? 'text-emerald-950 font-black' : 'text-slate-800'}`}>
                          {am.name}
                        </div>
                        <div className="text-[10px] text-slate-400">{am.guj}</div>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                      isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Ground Rules & Policies */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Turf Rules & Guidelines <span className="text-[10px] font-normal text-slate-400">નિયમો</span>
              </label>
              <textarea
                rows={2}
                value={turfRules}
                onChange={(e) => setTurfRules(e.target.value)}
                placeholder="Tennis ball only, Spikes strictly prohibited, 10 min grace period..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs text-center flex items-center justify-center space-x-1 hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back: Pitches</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleSaveGround(true);
                setCurrentStep(4);
              }}
              className="col-span-2 py-3.5 stitch-btn-orange text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-md font-bold"
            >
              <span>Save & Next: Photos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            
            {/* Header: Title + Photo Counter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#065f46] flex items-center justify-center text-sm font-bold shadow-xs">
                  📷
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Ground & Pitch Photos</h3>
                  <p className="text-[10px] text-slate-400">ટર્ફના ફોટા અપલોડ કરો (Max 12 Photos)</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                galleryImages.length >= 12
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {galleryImages.length}/12 Photos
              </span>
            </div>

            {/* Empty State when no photos exist */}
            {galleryImages.length === 0 && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <p className="text-xs font-bold text-slate-700">No photos uploaded yet</p>
                <p className="text-[10px] text-slate-400">Upload at least 1 photo for your ground showcase</p>
              </div>
            )}

            {/* 1. Primary Cover Photo Hero View (Click to Preview) */}
            {galleryImages.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 px-0.5">
                  <span className="flex items-center space-x-1">
                    <span>⭐ Primary Cover Photo</span>
                    <span className="text-[10px] text-slate-400 font-normal">(મેઇન લિસ્ટિંગ ફોટો)</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">Visible first to players</span>
                </div>

                <div 
                  onClick={() => setPreviewPhotoIndex(0)}
                  className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group shadow-sm cursor-pointer hover:border-emerald-500 transition-all"
                  title="Click to preview full size photo"
                >
                  <img
                    src={galleryImages[0]}
                    alt="Ground cover photo"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
                  
                  <span className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center space-x-1">
                    <span>✓ Main Cover</span>
                  </span>

                  <div className="absolute top-2 right-2 flex items-center space-x-1.5 z-10">
                    <span className="px-2 py-0.5 rounded-lg bg-black/60 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      🔍 Preview
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto(0);
                      }}
                      className="w-7 h-7 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                      title="Remove Cover Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="absolute bottom-2.5 left-3 text-white text-xs font-bold drop-shadow-sm flex items-center space-x-1.5">
                    <span>Photo #1 • Main Ground Cover</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Additional Photos Grid (Click to Preview) */}
            {galleryImages.length > 1 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 px-0.5">
                  <span>Additional Showcase Photos ({galleryImages.length - 1})</span>
                  <span className="text-[10px] text-slate-400">Click to preview • Tap ★ to set cover</span>
                </div>

                <div className="max-h-52 overflow-y-auto pr-1 rounded-2xl">
                  <div className="grid grid-cols-3 gap-2">
                    {galleryImages.slice(1).map((img, idx) => {
                      const actualIndex = idx + 1;
                      return (
                        <div
                          key={actualIndex}
                          onClick={() => setPreviewPhotoIndex(actualIndex)}
                          className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs cursor-pointer hover:border-emerald-500 transition-all"
                          title="Click to preview full size photo"
                        >
                          <img
                            src={img}
                            alt={`Ground photo ${actualIndex + 1}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-bold drop-shadow-md">🔍 Preview</span>
                          </div>
                          
                          {/* Quick Action Buttons */}
                          <div className="absolute top-1 right-1 flex items-center space-x-1 z-10">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetCoverPhoto(actualIndex);
                              }}
                              className="w-6 h-6 rounded-lg bg-black/70 hover:bg-amber-500 text-amber-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-[10px]"
                              title="Set as Main Cover Photo"
                            >
                              ★
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePhoto(actualIndex);
                              }}
                              className="w-6 h-6 rounded-lg bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                              title="Remove photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">
                            #{actualIndex + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Hidden File Input for Device Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              multiple
              className="hidden"
            />

            {/* Direct Device File Upload Box with Drag & Drop */}
            {galleryImages.length < MAX_PHOTOS ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingPhoto(true);
                }}
                onDragLeave={() => setIsDraggingPhoto(false)}
                onDrop={handleDropFiles}
                className={`p-4 rounded-3xl border-2 border-dashed transition-all text-center cursor-pointer group flex flex-col items-center justify-center space-y-2 active:scale-[0.99] ${
                  isDraggingPhoto
                    ? 'border-emerald-600 bg-emerald-100/60 scale-[1.01]'
                    : 'border-emerald-300 hover:border-emerald-600 bg-emerald-50/40 hover:bg-emerald-50/70'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-white border border-emerald-100 text-[#065f46] shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5 text-[#065f46]" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-slate-900 group-hover:text-emerald-950">
                    {galleryImages.length === 0 ? 'Upload Turf Photos' : '+ Add More Photos'}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Select from gallery or drag & drop ({MAX_PHOTOS - galleryImages.length} slots left)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#065f46] hover:bg-[#044e3a] text-white text-xs font-bold shadow-md shadow-emerald-900/15 flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Photos</span>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-xs font-bold text-emerald-800">
                ✅ Maximum limit of 12 photos reached.
              </div>
            )}

          </div>

          {/* Action Row */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs text-center flex items-center justify-center space-x-1 hover:bg-slate-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back: Facility</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="col-span-2 py-3.5 stitch-btn-orange text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-md font-bold"
            >
              <span>Save & Next: UPI Payout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* STEP 5: UPI PAYMENT & ADVANCE SETTINGS (Only fields for Step 5) */}
      {/* =================================================================== */}
      {currentStep === 5 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm">
                💳
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Direct-to-Owner UPI Settlement</h3>
                <p className="text-[10px] text-slate-400">એડવાન્સ પેમેન્ટ અને UPI સેટિંગ્સ</p>
              </div>
            </div>

            {/* Advance Payment Toggle */}
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Require Advance via UPI</div>
                <div className="text-[10px] text-slate-500">નો-શો બચાવવા માટે એડવાન્સ જરૂરી છે (Recommended)</div>
              </div>

              <button
                type="button"
                onClick={() => setRequireAdvance(!requireAdvance)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  requireAdvance ? 'bg-[#065f46]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    requireAdvance ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Advance Percentage Selector */}
            {requireAdvance && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900">Minimum Advance Required</label>
                  <span className="text-[10px] text-slate-400">કેટલા ટકા એડવાન્સ?</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { val: '20', label: '20%', sub: `₹${Math.round((parseInt(pitches[0]?.primeRate || '900') * 20)/100)}/slot` },
                    { val: '30', label: '30%', sub: '★ Best', isRec: true },
                    { val: '50', label: '50%', sub: `₹${Math.round((parseInt(pitches[0]?.primeRate || '900') * 50)/100)}/slot` },
                    { val: '100', label: '100%', sub: 'Full Pay' },
                  ].map((adv) => {
                    const isSelected = advancePercent === adv.val && !isCustomAdvance;
                    return (
                      <button
                        key={adv.val}
                        type="button"
                        onClick={() => {
                          setAdvancePercent(adv.val);
                          setIsCustomAdvance(false);
                        }}
                        className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#065f46] text-white border-[#065f46] shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-black">{adv.label}</div>
                        <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-emerald-200 font-bold' : 'text-slate-500'}`}>
                          {adv.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Advance Toggle */}
                <div className="flex items-center justify-between pt-0.5">
                  <button
                    type="button"
                    onClick={() => setIsCustomAdvance(!isCustomAdvance)}
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{isCustomAdvance ? '✓ Using Custom Percentage' : '+ Custom Advance % (બીજા ટકા સેટ કરો)'}</span>
                  </button>
                  {isCustomAdvance && (
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="number"
                        min="5"
                        max="100"
                        value={advancePercent}
                        onChange={(e) => setAdvancePercent(e.target.value)}
                        placeholder="e.g. 40"
                        className="w-16 rounded-xl border border-slate-300 bg-white px-2 py-1 text-xs font-black text-center text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                      <span className="text-xs font-bold text-slate-700">%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payout UPI ID */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                  <span>Payout UPI ID (Instant Ground Settlement)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400">તમારો UPI ID (GPay / PhonePe / Paytm)</span>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <span className="text-sm">📱</span>
                </div>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value.toLowerCase().trim())}
                  placeholder="e.g. kingscricket@okaxis or 98980XXXXX@paytm"
                  className={`w-full rounded-2xl pl-10 pr-28 py-3 text-xs font-bold text-slate-900 border transition-all ${
                    isUpiValid
                      ? 'bg-white border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : upiId.length > 0
                      ? 'bg-white border-amber-400 focus:ring-2 focus:ring-amber-400/20'
                      : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-600'
                  }`}
                />
                
                {/* Real-time Status Badge inside Input */}
                <div className="absolute inset-y-0 right-2 flex items-center space-x-1">
                  {upiId && (
                    <button
                      type="button"
                      onClick={() => setUpiId('')}
                      className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-[10px] transition-colors cursor-pointer mr-1"
                      title="Clear input"
                    >
                      ✕
                    </button>
                  )}
                  {isUpiValid ? (
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center space-x-1">
                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                      <span>Valid UPI</span>
                    </span>
                  ) : upiId.length > 0 ? (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Add @bank
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Quick UPI Handle Helper Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-semibold text-slate-400">Quick Handles:</span>
                {['@okaxis', '@okhdfcbank', '@oksbi', '@paytm', '@ybl', '@icici', '@ibl'].map((handle) => (
                  <button
                    key={handle}
                    type="button"
                    onClick={() => handleSelectUpiHandle(handle)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      upiId.endsWith(handle)
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {handle}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Holder / Business Name */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-900">
                  Account Holder / Business Name <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400">ખાતાધારક / પેઢીનું નામ</span>
              </div>
              <input
                type="text"
                value={upiName}
                onChange={(e) => setUpiName(e.target.value)}
                placeholder="e.g. Kings Box Cricket LLP or Ramesh Patel"
                className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <p className="text-[10px] text-slate-400">
                This exact name will be displayed to players on Google Pay, PhonePe, Paytm before they tap pay.
              </p>
            </div>

            {/* Live QR Preview Toggle Bar */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#065f46] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Customer UPI QR Preview</div>
                  <div className="text-[10px] text-slate-500">Live preview of QR players will scan</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUpiQrPreview(!showUpiQrPreview)}
                className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-all cursor-pointer shadow-xs flex items-center space-x-1"
              >
                <span>{showUpiQrPreview ? 'Hide QR' : 'Test QR Code'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showUpiQrPreview ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Live QR Code Preview Panel */}
            {showUpiQrPreview && (
              <div className="p-4 rounded-3xl bg-slate-900 text-white space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">📱</span>
                    <div>
                      <div className="text-xs font-bold text-white">Live Payment QR Preview</div>
                      <div className="text-[10px] text-slate-400">Scan with any UPI App to verify account</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    Direct Payout
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 py-1">
                  <div className="w-36 h-36 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg flex-shrink-0">
                    {isUpiValid ? (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=${upiName || groundName}&cu=INR`)}`}
                        alt="UPI QR Code"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center p-2 text-slate-400 text-[10px]">
                        Please enter valid UPI ID
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-xs flex-1 w-full">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Payee Name (ખાતાધારક)</span>
                      <span className="font-bold text-white text-sm">{upiName || groundName || 'Ground Owner'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Payout UPI ID</span>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <code className="font-mono text-emerald-400 font-bold bg-slate-800 px-2.5 py-1 rounded-lg text-xs break-all">
                          {upiId || 'Not specified'}
                        </code>
                        {upiId && (
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="pt-1 text-[10px] text-slate-400 leading-tight">
                      ⚡ 100% direct bank settlement. Funds transfer immediately to your bank account with zero middleman fee.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Player Cancellation & Refund Policy (Fully Configurable) */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-sm font-bold shadow-xs">
                    ⚖️
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Player Cancellation & Refund Policy</h4>
                    <p className="text-[10px] text-slate-400">ખેલાડી રદ કરે ત્યારે એડવાન્સ રિફંડના નિયમો</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCustomRefundEditor(!showCustomRefundEditor)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                    showCustomRefundEditor || activeRefundPreset === 'custom'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Sliders className="w-3 h-3" />
                  <span>{showCustomRefundEditor ? 'Done Editing' : 'Customize Tiers'}</span>
                </button>
              </div>

              {/* 4 Policy Presets */}
              <div className="grid grid-cols-2 gap-2">
                {REFUND_PRESETS.map((preset) => {
                  const isActive = activeRefundPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyRefundPreset(preset.tiers)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                        isActive
                          ? 'bg-emerald-50/80 border-emerald-600 shadow-sm ring-1 ring-emerald-600/30'
                          : 'bg-white border-slate-200 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-xs font-bold ${isActive ? 'text-emerald-950 font-black' : 'text-slate-900'}`}>
                          {preset.name}
                        </span>
                        {isActive && (
                          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium mb-1">
                        {preset.guj}
                      </div>
                      <div className={`text-[9px] line-clamp-2 leading-tight ${isActive ? 'text-emerald-800 font-semibold' : 'text-slate-400'}`}>
                        {preset.description}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Tier Editor (Accordion or when Custom Preset Active) */}
              {(showCustomRefundEditor || activeRefundPreset === 'custom') && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900">Custom Refund Tier Rules</span>
                      <p className="text-[10px] text-slate-500">Add or edit hours and refund percentages</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddRefundTier}
                      className="px-2.5 py-1 rounded-xl bg-[#065f46] hover:bg-[#044e3a] text-white text-[10px] font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Tier</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {refundTiers.map((tier, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-2 shadow-xs"
                      >
                        {/* Hours Condition */}
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-slate-400 w-4">#{idx + 1}</span>
                          {tier.hoursBefore > 0 ? (
                            <div className="flex items-center space-x-1.5 text-xs text-slate-700">
                              <span className="text-[11px] font-medium text-slate-500">Cancel &gt;</span>
                              <select
                                value={tier.hoursBefore}
                                onChange={(e) => handleUpdateTierHours(idx, Number(e.target.value))}
                                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                              >
                                {[48, 36, 24, 18, 12, 8, 6, 4, 3, 2, 1].map((h) => (
                                  <option key={h} value={h}>{h} Hours Before</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div className="text-xs font-bold text-slate-700">
                              <span>Under {refundTiers[idx - 1]?.hoursBefore || 1} hr / No-show:</span>
                            </div>
                          )}
                        </div>

                        {/* Refund Percent & Actions */}
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 text-xs">
                            <span className="text-[11px] text-slate-500">Refund:</span>
                            <select
                              value={tier.refundPercent}
                              onChange={(e) => handleUpdateTierPercent(idx, Number(e.target.value))}
                              className={`rounded-lg border px-2 py-1 text-xs font-bold focus:outline-none ${
                                tier.refundPercent >= 50
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                  : tier.refundPercent > 0
                                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                                  : 'bg-rose-50 border-rose-300 text-rose-700'
                              }`}
                            >
                              {[100, 90, 80, 75, 60, 50, 40, 30, 25, 20, 15, 10, 5, 0].map((p) => (
                                <option key={p} value={p}>{p}% Refund</option>
                              ))}
                            </select>
                          </div>

                          {refundTiers.length > 1 && tier.hoursBefore !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRefundTier(idx)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete tier"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Live Policy Summary (Always Visible & Calculated) */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Current Applied Refund Breakdown</span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Live Policy
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {refundTiers.map((tier, idx) => {
                    const hoursLabel = tier.hoursBefore > 0
                      ? (idx === 0 ? `Cancel ${tier.hoursBefore}+ hours before match:` : `Cancel ${tier.hoursBefore} to ${refundTiers[idx - 1]?.hoursBefore} hours before:`)
                      : `Under ${refundTiers[idx - 1]?.hoursBefore || 1} hour / No-show:`;
                    
                    return (
                      <div key={idx} className="flex justify-between items-center text-slate-700">
                        <span>{hoursLabel}</span>
                        <strong className={
                          tier.refundPercent >= 50
                            ? 'text-emerald-700'
                            : tier.refundPercent > 0
                            ? 'text-amber-700'
                            : 'text-rose-600'
                        }>
                          {tier.refundPercent > 0 ? `${tier.refundPercent}% Refund` : '0% (No Refund)'}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-[10px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Payments go directly to your bank account via UPI deep links and QR codes. Zero gateway middleman fee!</span>
            </div>

          </div>

          {/* Action Row */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs text-center flex items-center justify-center space-x-1 hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back: Photos</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(6)}
              className="col-span-2 py-3.5 stitch-btn-orange text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-md font-bold"
            >
              <span>Next: Final Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* STEP 6: FINAL REVIEW & ONBOARDING (FULL DATA VERIFICATION & SAVE)   */}
      {/* =================================================================== */}
      {currentStep === 6 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Welcome / Verification Header */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-800 to-[#065f46] text-white shadow-md space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-200">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Step 6: Final Review & Onboarding</span>
            </div>
            <h2 className="text-sm font-black">
              તમારી ગ્રાઉન્ડ વિગતો ચકાસો અને ઓનબોર્ડિંગ પૂર્ણ કરો
            </h2>
            <p className="text-[11px] text-emerald-100/90 leading-relaxed">
              Verify all ground information below. If you want to make changes, tap "Edit" on any section. Once confirmed, your turf will be live for players to book!
            </p>
          </div>

          {/* Section 1 Review: Basic Ground Info */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="text-base">📝</span>
                <div>
                  <h3 className="text-xs font-black text-slate-900">1. Basic Ground Info</h3>
                  <p className="text-[10px] text-slate-400">નામ, સંપર્ક અને સરનામું</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#065f46] font-bold text-xs flex items-center space-x-1 border border-slate-200 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-[11px]">Ground Name:</span>
                <span className="font-bold text-slate-900 text-right">{groundName || 'Not Set'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-[11px]">Contact Phone:</span>
                <span className="font-bold text-slate-900 font-mono">+91 {extract10Digits(groundPhone)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-[11px]">Area / Locality:</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  📍 {area}, Surat
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-500 text-[11px] flex-shrink-0 mr-2">Address:</span>
                <span className="font-medium text-slate-700 text-right text-[11px]">
                  {addressLine} ({pincode})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-[11px]">Daily Hours:</span>
                <span className="font-bold text-slate-900 font-mono text-xs">
                  {formatTimeWithAMPM(openTime)} to {formatTimeWithAMPM(closeTime)} <span className="font-sans text-[11px] text-slate-500 font-medium">(Daily)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Section 2 Review: Pitches & Rates */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="text-base">🏏</span>
                <div>
                  <h3 className="text-xs font-black text-slate-900">2. Pitches & Pricing</h3>
                  <p className="text-[10px] text-slate-400">{pitches.length} Pitches Configured</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#065f46] font-bold text-xs flex items-center space-x-1 border border-slate-200 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <div className="space-y-2">
              {pitches.map((p, idx) => (
                <div key={p.id || idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{p.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {p.type === 'THREE_SIXTY' ? '360° Closed' : p.type === 'OPEN' ? 'Open Turf' : 'Covered'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Dimensions: {p.widthFt}x{p.lengthFt} ft • Format: {p.squadFormat} • Slot: {p.slotDuration} min
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] pt-1 border-t border-slate-200/60 font-bold">
                    <span className="text-slate-600">Day: <strong className="text-slate-900">₹{p.dayRate}</strong>/hr</span>
                    <span className="text-[#ff6813]">Night: <strong>₹{p.primeRate}</strong>/hr</span>
                    <span className="text-emerald-700">Weekend: <strong>₹{p.weekendRate}</strong>/hr</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3 Review: Amenities & Facilities */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="text-base">⚡</span>
                <div>
                  <h3 className="text-xs font-black text-slate-900">3. Amenities & Facilities</h3>
                  <p className="text-[10px] text-slate-400">{selectedAmenities.length} Features Selected</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#065f46] font-bold text-xs flex items-center space-x-1 border border-slate-200 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {selectedAmenities.map((am) => (
                <span key={am} className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 text-[11px] font-bold flex items-center space-x-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{am}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Section 4 Review: Photos */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="text-base">📷</span>
                <div>
                  <h3 className="text-xs font-black text-slate-900">4. Photos & Showcase</h3>
                  <p className="text-[10px] text-slate-400">{galleryImages.length} Photos Uploaded</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#065f46] font-bold text-xs flex items-center space-x-1 border border-slate-200 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {galleryImages.slice(0, 3).map((img, idx) => (
                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={img} alt={`Ground preview ${idx}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            {galleryImages.length > 3 && (
              <p className="text-[10px] text-slate-400 text-center">+{galleryImages.length - 3} more photos</p>
            )}
          </div>

          {/* Section 5 Review: UPI & Payout */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="text-base">💳</span>
                <div>
                  <h3 className="text-xs font-black text-slate-900">5. UPI Payout & Policy</h3>
                  <p className="text-[10px] text-slate-400">ડાયરેક્ટ બેંક એકાઉન્ટ UPI</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#065f46] font-bold text-xs flex items-center space-x-1 border border-slate-200 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-[11px]">UPI ID:</span>
                <span className="font-bold text-emerald-800 font-mono">{upiId || 'Not Set'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-[11px]">Payee / Firm Name:</span>
                <span className="font-bold text-slate-900">{upiName || groundName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-[11px]">Booking Advance:</span>
                <span className="font-bold text-[#ff6813]">
                  {requireAdvance ? `${advancePercent}% Advance Required` : 'Full Pay at Venue'}
                </span>
              </div>
              <div className="flex justify-between items-start pt-1.5 border-t border-slate-100">
                <span className="text-slate-500 text-[11px]">Refund Policy:</span>
                <span className="font-bold text-slate-800 text-[11px] text-right">
                  {refundTiers.length === 1 && refundTiers[0].refundPercent === 0
                    ? '100% Non-Refundable'
                    : refundTiers.map(t => `${t.hoursBefore > 0 ? `${t.hoursBefore}h+` : '<1h'}: ${t.refundPercent}%`).join(' • ')}
                </span>
              </div>
            </div>
          </div>

          {/* Final Action Row */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs text-center flex items-center justify-center space-x-1 hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back: UPI</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveGround(false)}
              className="col-span-2 py-3.5 rounded-2xl bg-[#065f46] hover:bg-[#044e3a] active:scale-[0.99] text-white text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-emerald-900/20 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{isEditingExisting ? '💾 Confirm & Save Ground Details' : '🚀 Confirm & Publish Ground Live!'}</span>
            </button>
          </div>

        </div>
      )}

      {/* Custom Pitch Delete Confirmation Modal */}
      {pitchIndexToDelete !== null && pitches[pitchIndexToDelete] && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPitchIndexToDelete(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Icon */}
            <button
              type="button"
              onClick={() => setPitchIndexToDelete(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Warning Trash Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-inner mx-auto mt-1">
              <Trash2 className="w-7 h-7 text-rose-600 animate-pulse" />
            </div>

            {/* Modal Heading & Subheading */}
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">
                Delete Pitch / Box?
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                શું તમે આ બોક્સ કાઢી નાખવા માંગો છો?
              </p>
            </div>

            {/* Target Pitch Preview Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-base">🏏</span>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {pitches[pitchIndexToDelete].name || `Pitch #${pitchIndexToDelete + 1}`}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {pitches[pitchIndexToDelete].type} • {pitches[pitchIndexToDelete].squadFormat}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-100 text-rose-700">
                  Pitch #{pitchIndexToDelete + 1}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                <span>Size: <strong className="text-slate-900">{pitches[pitchIndexToDelete].widthFt} × {pitches[pitchIndexToDelete].lengthFt} ft</strong></span>
                <span>Rate: <strong className="text-emerald-700 font-bold">₹{pitches[pitchIndexToDelete].primeRate || pitches[pitchIndexToDelete].dayRate}/hr</strong></span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 flex items-start space-x-2">
              <span className="text-sm flex-shrink-0">⚠️</span>
              <p className="leading-snug">
                This action cannot be undone. All configured dimensions, rates, and slots for this box will be removed.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setPitchIndexToDelete(null)}
                className="py-3 px-4 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 active:scale-95 transition-all text-center cursor-pointer"
              >
                Cancel (રદ કરો)
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePitch}
                className="py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-rose-600/25 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox / Preview Modal */}
      {previewPhotoIndex !== null && galleryImages[previewPhotoIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPreviewPhotoIndex(null)}
        >
          <div
            className="relative max-w-lg w-full flex flex-col items-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Controls Bar */}
            <div className="w-full flex items-center justify-between text-white px-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-300">
                  Photo {previewPhotoIndex + 1} of {galleryImages.length}
                </span>
                {previewPhotoIndex === 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                    ★ Main Cover
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {previewPhotoIndex !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetCoverPhoto(previewPhotoIndex)}
                    className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <span>★ Make Cover</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const idxToRemove = previewPhotoIndex;
                    handleRemovePhoto(idxToRemove);
                    if (galleryImages.length <= 1) {
                      setPreviewPhotoIndex(null);
                    } else {
                      setPreviewPhotoIndex(Math.max(0, idxToRemove - 1));
                    }
                  }}
                  className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 transition-colors cursor-pointer"
                  title="Delete Photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewPhotoIndex(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Close Preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Image Display with Side Navigation */}
            <div className="relative w-full flex items-center justify-center">
              {/* Prev Button */}
              {galleryImages.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setPreviewPhotoIndex((prev) =>
                      prev !== null && prev > 0 ? prev - 1 : galleryImages.length - 1
                    )
                  }
                  className="absolute left-2 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 backdrop-blur-sm transition-all cursor-pointer shadow-lg"
                  aria-label="Previous Photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* High-res Image Preview */}
              <div className="max-h-[70vh] max-w-full overflow-hidden rounded-3xl border border-white/15 bg-black/40 flex items-center justify-center shadow-2xl">
                <img
                  src={galleryImages[previewPhotoIndex]}
                  alt={`Turf Photo ${previewPhotoIndex + 1}`}
                  className="max-h-[70vh] w-auto max-w-full object-contain select-none"
                />
              </div>

              {/* Next Button */}
              {galleryImages.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setPreviewPhotoIndex((prev) =>
                      prev !== null && prev < galleryImages.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="absolute right-2 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 backdrop-blur-sm transition-all cursor-pointer shadow-lg"
                  aria-label="Next Photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Bottom Dots Indicator */}
            {galleryImages.length > 1 && (
              <div className="flex items-center space-x-1.5 pt-1">
                {galleryImages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPreviewPhotoIndex(i)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      i === previewPhotoIndex
                        ? 'w-6 bg-emerald-400'
                        : 'w-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Warning if trying to delete the only remaining box */}
      {deleteWarningToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center space-x-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{deleteWarningToast}</span>
        </div>
      )}

    </div>
  );
}
