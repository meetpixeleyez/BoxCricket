import { User, Ground, AvailabilityPost, TeamPost, Team, Challenge, Review, PlatformFeeLedger, Booking } from '@/types';

export const SURAT_AREAS = [
  "All Areas",
  "Mota Varachha",
  "Adajan",
  "Vesu",
  "Katargam",
  "Varachha",
  "Pal",
  "Udhna",
  "Althan",
  "Ghod Dod Road",
  "Dumas Road"
];

export const MOCK_USERS: User[] = [
  {
    id: 'user_player_1',
    phone: '9876543210',
    name: 'Hardik Patel',
    role: 'PLAYER',
    city: 'Surat',
    playingRole: 'ALL_ROUNDER',
    skillLevel: 'ADVANCED',
    homeArea: 'Mota Varachha',
    lat: 21.2412,
    lng: 72.8834,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 'user_owner_1',
    phone: '9825100001',
    name: 'Ramesh Patel (Turf Owner)',
    role: 'OWNER',
    city: 'Surat',
    homeArea: 'Adajan',
    feeFreeUntil: '2026-12-31T23:59:59Z', // 3 months free offer
    createdAt: '2026-09-01T09:00:00Z',
  },
  {
    id: 'user_owner_2',
    phone: '9825100002',
    name: 'Vikram Desai',
    role: 'OWNER',
    city: 'Surat',
    homeArea: 'Vesu',
    feeFreeUntil: '2026-12-15T23:59:59Z',
    createdAt: '2026-09-05T11:00:00Z',
  },
  {
    id: 'user_admin_1',
    phone: '9999988888',
    name: 'BoxKhel Surat Admin',
    role: 'ADMIN',
    city: 'Surat',
    createdAt: '2026-01-01T00:00:00Z',
  }
];

export const AMENITY_OPTIONS = [
  { id: 'Night Floodlights', name: 'Night Floodlights', guj: 'રાત્રિ ફ્લડલાઇટ્સ', icon: '💡' },
  { id: 'Air-Cooled Dugout', name: 'Air-Cooled Dugout', guj: 'કૂલિંગ પેવેલિયન / ડગઆઉટ', icon: '❄️' },
  { id: 'Dedicated Car & Bike Parking', name: 'Dedicated Car & Bike Parking', guj: 'પાર્કિંગ સુવિધા', icon: '🚗' },
  { id: 'Chilled RO Drinking Water', name: 'Chilled RO Drinking Water', guj: 'પીવાનું ઠંડુ RO પાણી', icon: '💧' },
  { id: 'Changing Rooms & Clean Restroom', name: 'Changing Rooms & Clean Restroom', guj: 'ચેન્જિંગ રૂમ & ટોયલેટ', icon: '🚻' },
  { id: 'Live Scoreboard Screen', name: 'Live Scoreboard Screen', guj: 'લાઇવ સ્કોર ડિસ્પ્લે સ્ક્રીન', icon: '📺' },
  { id: 'Bat & Ball Rental Included', name: 'Bat & Ball Rental Included', guj: 'બેટ અને બોલ ઉપલબ્ધ', icon: '🏏' },
  { id: 'Canteen & Refreshments', name: 'Canteen & Refreshments', guj: 'કેન્ટીન અને નાસ્તો', icon: '☕' },
  { id: 'Power Generator Backup', name: 'Power Generator Backup', guj: 'જનરેટર પાવર બેકઅપ', icon: '⚡' },
  { id: 'First Aid Kit', name: 'First Aid Safety Kit', guj: 'પ્રાથમિક સારવાર કીટ', icon: '🩹' },
];

export const normalizeAmenity = (name: string): string => {
  if (!name) return '';
  const clean = name.trim().toLowerCase();
  if (clean.includes('floodlight') || clean.includes('light')) return 'Night Floodlights';
  if (clean.includes('dugout') || clean.includes('pavilion')) return 'Air-Cooled Dugout';
  if (clean.includes('park') || clean.includes('car') || clean.includes('bike')) return 'Dedicated Car & Bike Parking';
  if (clean.includes('water') || clean.includes('ro') || clean.includes('chilled')) return 'Chilled RO Drinking Water';
  if (clean.includes('changing') || clean.includes('washroom') || clean.includes('restroom') || clean.includes('toilet')) return 'Changing Rooms & Clean Restroom';
  if (clean.includes('screen') || clean.includes('score')) return 'Live Scoreboard Screen';
  if (clean.includes('bat') || clean.includes('ball') || clean.includes('rental')) return 'Bat & Ball Rental Included';
  if (clean.includes('canteen') || clean.includes('refreshment') || clean.includes('snack')) return 'Canteen & Refreshments';
  if (clean.includes('generator') || clean.includes('power')) return 'Power Generator Backup';
  if (clean.includes('aid') || clean.includes('safety') || clean.includes('kit') || clean.includes('medical')) return 'First Aid Kit';
  return name.trim();
};

export const MOCK_GROUNDS: Ground[] = [
  {
    id: 'ground_1',
    ownerId: 'user_owner_1',
    ownerName: 'Ramesh Patel',
    ownerPhone: '9825100001',
    name: 'Virat Cricket Ground',
    description: 'Surat’s premier ultra-cushioned arena featuring 360° enclosed turf arenas and spacious open sky boxes with professional LED floodlights.',
    phone: '+91 98251 00001',
    addressLine: 'Near Sudama Chowk, Behind Shell Petrol Pump',
    area: 'Mota Varachha',
    city: 'Surat',
    state: 'Gujarat',
    pincode: '394101',
    lat: 21.2450,
    lng: 72.8890,
    amenities: [
      'Night Floodlights',
      'Dedicated Car & Bike Parking',
      'Chilled RO Drinking Water',
      'Bat & Ball Rental Included',
      'Air-Cooled Dugout'
    ],
    status: 'VERIFIED',
    avgRating: 4.8,
    totalReviews: 42,
    images: [
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1531415074868-036b1c57e329?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=1000&auto=format&fit=crop&q=80',
    ],
    boxes: [
      {
        id: 'box_1',
        groundId: 'ground_1',
        name: 'Box 1',
        type: 'THREE_SIXTY',
        widthFt: 110,
        heightFt: 45,
        maxPlayers: 14,
        basePrice: 900,
        slotMinutes: 60,
        isActive: true,
        images: [
          'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80'
        ],
        schedules: [
          { dayOfWeek: 1, openTime: '06:00', closeTime: '02:00', pricePerHour: 900 },
          { dayOfWeek: 2, openTime: '06:00', closeTime: '02:00', pricePerHour: 900 },
          { dayOfWeek: 3, openTime: '06:00', closeTime: '02:00', pricePerHour: 900 },
          { dayOfWeek: 4, openTime: '06:00', closeTime: '02:00', pricePerHour: 900 },
          { dayOfWeek: 5, openTime: '06:00', closeTime: '02:00', pricePerHour: 1000 },
          { dayOfWeek: 6, openTime: '06:00', closeTime: '02:00', pricePerHour: 1100 },
          { dayOfWeek: 0, openTime: '06:00', closeTime: '02:00', pricePerHour: 1100 },
        ]
      },
      {
        id: 'box_2',
        groundId: 'ground_1',
        name: 'Box 2',
        type: 'THREE_SIXTY',
        widthFt: 110,
        heightFt: 45,
        maxPlayers: 14,
        basePrice: 900,
        slotMinutes: 60,
        isActive: true,
        images: [
          'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80'
        ],
        schedules: [
          { dayOfWeek: 1, openTime: '06:00', closeTime: '02:00', pricePerHour: 900 },
          { dayOfWeek: 2, openTime: '06:00', closeTime: '02:00', pricePerHour: 900 },
          { dayOfWeek: 3, openTime: '06:00', closeTime: '02:00', pricePerHour: 900 },
          { dayOfWeek: 4, openTime: '06:00', closeTime: '02:00', pricePerHour: 900 },
          { dayOfWeek: 5, openTime: '06:00', closeTime: '02:00', pricePerHour: 1000 },
          { dayOfWeek: 6, openTime: '06:00', closeTime: '02:00', pricePerHour: 1100 },
          { dayOfWeek: 0, openTime: '06:00', closeTime: '02:00', pricePerHour: 1100 },
        ]
      },
      {
        id: 'box_3',
        groundId: 'ground_1',
        name: 'Box 3',
        type: 'OPEN',
        widthFt: 95,
        heightFt: 40,
        maxPlayers: 12,
        basePrice: 750,
        slotMinutes: 60,
        isActive: true,
        images: [
          'https://images.unsplash.com/photo-1531415074868-036b1c57e329?w=800&auto=format&fit=crop&q=80'
        ],
        schedules: [
          { dayOfWeek: 1, openTime: '06:00', closeTime: '00:00', pricePerHour: 750 },
          { dayOfWeek: 2, openTime: '06:00', closeTime: '00:00', pricePerHour: 750 },
          { dayOfWeek: 3, openTime: '06:00', closeTime: '00:00', pricePerHour: 750 },
          { dayOfWeek: 4, openTime: '06:00', closeTime: '00:00', pricePerHour: 750 },
          { dayOfWeek: 5, openTime: '06:00', closeTime: '00:00', pricePerHour: 850 },
          { dayOfWeek: 6, openTime: '06:00', closeTime: '00:00', pricePerHour: 900 },
          { dayOfWeek: 0, openTime: '06:00', closeTime: '00:00', pricePerHour: 900 },
        ]
      },
      {
        id: 'box_4',
        groundId: 'ground_1',
        name: 'Box 4',
        type: 'OPEN',
        widthFt: 95,
        heightFt: 40,
        maxPlayers: 12,
        basePrice: 750,
        slotMinutes: 60,
        isActive: true,
        images: [
          'https://images.unsplash.com/photo-1531415074868-036b1c57e329?w=800&auto=format&fit=crop&q=80'
        ],
        schedules: [
          { dayOfWeek: 1, openTime: '06:00', closeTime: '00:00', pricePerHour: 750 },
          { dayOfWeek: 2, openTime: '06:00', closeTime: '00:00', pricePerHour: 750 },
          { dayOfWeek: 3, openTime: '06:00', closeTime: '00:00', pricePerHour: 750 },
          { dayOfWeek: 4, openTime: '06:00', closeTime: '00:00', pricePerHour: 750 },
          { dayOfWeek: 5, openTime: '06:00', closeTime: '00:00', pricePerHour: 850 },
          { dayOfWeek: 6, openTime: '06:00', closeTime: '00:00', pricePerHour: 900 },
          { dayOfWeek: 0, openTime: '06:00', closeTime: '00:00', pricePerHour: 900 },
        ]
      },
      {
        id: 'box_5',
        groundId: 'ground_1',
        name: 'Box 5',
        type: 'OPEN',
        widthFt: 95,
        heightFt: 40,
        maxPlayers: 12,
        basePrice: 750,
        slotMinutes: 60,
        isActive: true,
        images: [
          'https://images.unsplash.com/photo-1531415074868-036b1c57e329?w=800&auto=format&fit=crop&q=80'
        ],
        schedules: [
          { dayOfWeek: 1, openTime: '06:00', closeTime: '00:00', pricePerHour: 750 },
          { dayOfWeek: 2, openTime: '06:00', closeTime: '00:00', pricePerHour: 750 },
          { dayOfWeek: 3, openTime: '06:00', closeTime: '00:00', pricePerHour: 750 },
          { dayOfWeek: 4, openTime: '06:00', closeTime: '00:00', pricePerHour: 750 },
          { dayOfWeek: 5, openTime: '06:00', closeTime: '00:00', pricePerHour: 850 },
          { dayOfWeek: 6, openTime: '06:00', closeTime: '00:00', pricePerHour: 900 },
          { dayOfWeek: 0, openTime: '06:00', closeTime: '00:00', pricePerHour: 900 },
        ]
      }
    ],
    paymentSettings: {
      upiId: 'viratcricket@okaxis',
      upiName: 'Virat Cricket Ground',
      qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=viratcricket@okaxis&pn=ViratCricketGround&cu=INR',
      advanceEnabled: true,
      advanceType: 'PERCENT',
      advanceValue: 30, // 30% advance
      refundTiers: [
        { hoursBefore: 12, refundPercent: 30 },
        { hoursBefore: 3, refundPercent: 20 },
        { hoursBefore: 1, refundPercent: 10 },
        { hoursBefore: 0, refundPercent: 0 }
      ]
    },
    createdAt: '2026-08-01T08:00:00Z'
  },
  {
    id: 'ground_2',
    ownerId: 'user_owner_2',
    ownerName: 'Vikram Desai',
    ownerPhone: '9825100002',
    name: 'Royal CricZone Turf',
    description: 'High-bounce Korean grass carpet box cricket ground in the heart of Vesu with full netting, pavilion stands, and fast bowling friendly pitch.',
    phone: '+91 98251 00002',
    addressLine: 'Opp. Rajhans Synfonia, VIP Road',
    area: 'Vesu',
    city: 'Surat',
    state: 'Gujarat',
    pincode: '395007',
    lat: 21.1410,
    lng: 72.7750,
    amenities: [
      'Night Floodlights',
      'Pavilion Seating',
      'Washroom & Shower',
      'Cold Water Dispenser',
      'Canteen / Snack Bar'
    ],
    status: 'VERIFIED',
    avgRating: 4.7,
    totalReviews: 29,
    images: [
      'https://images.unsplash.com/photo-1589801258579-18e091f4ca26?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1000&auto=format&fit=crop&q=80'
    ],
    boxes: [
      {
        id: 'box_2_a',
        groundId: 'ground_2',
        name: 'Grand Arena (Closed Roof)',
        type: 'CLOSED',
        widthFt: 120,
        heightFt: 50,
        maxPlayers: 16,
        basePrice: 1000,
        slotMinutes: 60,
        isActive: true,
        images: [
          'https://images.unsplash.com/photo-1589801258579-18e091f4ca26?w=800&auto=format&fit=crop&q=80'
        ],
        schedules: [
          { dayOfWeek: 1, openTime: '06:00', closeTime: '03:00', pricePerHour: 1000 },
          { dayOfWeek: 2, openTime: '06:00', closeTime: '03:00', pricePerHour: 1000 },
          { dayOfWeek: 3, openTime: '06:00', closeTime: '03:00', pricePerHour: 1000 },
          { dayOfWeek: 4, openTime: '06:00', closeTime: '03:00', pricePerHour: 1000 },
          { dayOfWeek: 5, openTime: '06:00', closeTime: '03:00', pricePerHour: 1200 },
          { dayOfWeek: 6, openTime: '06:00', closeTime: '03:00', pricePerHour: 1200 },
          { dayOfWeek: 0, openTime: '06:00', closeTime: '03:00', pricePerHour: 1200 },
        ]
      }
    ],
    paymentSettings: {
      upiId: 'royalcriczone@icici',
      upiName: 'Royal Criczone Vesu',
      qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=royalcriczone@icici&pn=RoyalCriczone&cu=INR',
      advanceEnabled: false, // Pay-at-venue only
      advanceType: 'PERCENT',
      advanceValue: 0,
      refundTiers: [
        { hoursBefore: 6, refundPercent: 100 },
        { hoursBefore: 0, refundPercent: 0 }
      ]
    },
    createdAt: '2026-08-10T10:00:00Z'
  },
  {
    id: 'ground_3',
    ownerId: 'user_owner_1',
    ownerName: 'Ramesh Patel',
    ownerPhone: '9825100001',
    name: 'Adajan Super Turf & Box',
    description: 'Spacious box turf with 40mm shock absorbing grass, perfect for high scoring friendly tournaments and corporate cricket matches.',
    phone: '+91 98251 00001',
    addressLine: 'Near Star Bazaar, LP Savani Road',
    area: 'Adajan',
    city: 'Surat',
    state: 'Gujarat',
    pincode: '395009',
    lat: 21.1960,
    lng: 72.7930,
    amenities: [
      'Night Floodlights',
      'Spectator Gallery',
      'RO Water',
      'Free WiFi',
      'Parking'
    ],
    status: 'VERIFIED',
    avgRating: 4.6,
    totalReviews: 18,
    images: [
      'https://images.unsplash.com/photo-1531415074868-036b1c57e329?w=1000&auto=format&fit=crop&q=80'
    ],
    boxes: [
      {
        id: 'box_3_a',
        groundId: 'ground_3',
        name: 'Turf 1 (360° Netting)',
        type: 'THREE_SIXTY',
        widthFt: 100,
        heightFt: 40,
        maxPlayers: 14,
        basePrice: 850,
        slotMinutes: 60,
        isActive: true,
        images: ['https://images.unsplash.com/photo-1531415074868-036b1c57e329?w=800&auto=format&fit=crop&q=80'],
        schedules: [
          { dayOfWeek: 1, openTime: '06:00', closeTime: '01:00', pricePerHour: 850 },
          { dayOfWeek: 2, openTime: '06:00', closeTime: '01:00', pricePerHour: 850 },
          { dayOfWeek: 3, openTime: '06:00', closeTime: '01:00', pricePerHour: 850 },
          { dayOfWeek: 4, openTime: '06:00', closeTime: '01:00', pricePerHour: 850 },
          { dayOfWeek: 5, openTime: '06:00', closeTime: '01:00', pricePerHour: 950 },
          { dayOfWeek: 6, openTime: '06:00', closeTime: '01:00', pricePerHour: 1000 },
          { dayOfWeek: 0, openTime: '06:00', closeTime: '01:00', pricePerHour: 1000 },
        ]
      }
    ],
    paymentSettings: {
      upiId: 'adajansuperbox@paytm',
      upiName: 'Adajan Super Turf',
      qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=adajansuperbox@paytm&pn=AdajanTurf&cu=INR',
      advanceEnabled: true,
      advanceType: 'FIXED',
      advanceValue: 250, // ₹250 fixed advance
      refundTiers: [
        { hoursBefore: 12, refundPercent: 50 },
        { hoursBefore: 3, refundPercent: 20 },
        { hoursBefore: 0, refundPercent: 0 }
      ]
    },
    createdAt: '2026-08-20T12:00:00Z'
  },
  {
    id: 'ground_4',
    ownerId: 'user_owner_2',
    ownerName: 'Vikram Desai',
    ownerPhone: '9825100002',
    name: 'Katargam Champions Arena',
    description: 'Popular community turf with smooth batting track, boundary sensor ropes, and match referee on demand.',
    phone: '+91 98251 00002',
    addressLine: 'Near Gajera Circle, Amroli Cross Road',
    area: 'Katargam',
    city: 'Surat',
    state: 'Gujarat',
    pincode: '395004',
    lat: 21.2310,
    lng: 72.8250,
    amenities: [
      'Night Floodlights',
      'Air Cooler Dugout',
      'Drinking Water',
      'Parking'
    ],
    status: 'VERIFIED',
    avgRating: 4.9,
    totalReviews: 54,
    images: [
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1000&auto=format&fit=crop&q=80'
    ],
    boxes: [
      {
        id: 'box_4_a',
        groundId: 'ground_4',
        name: 'Champions Turf A',
        type: 'THREE_SIXTY',
        widthFt: 105,
        heightFt: 45,
        maxPlayers: 14,
        basePrice: 800,
        slotMinutes: 60,
        isActive: true,
        images: ['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80'],
        schedules: [
          { dayOfWeek: 1, openTime: '06:00', closeTime: '02:00', pricePerHour: 800 },
          { dayOfWeek: 2, openTime: '06:00', closeTime: '02:00', pricePerHour: 800 },
          { dayOfWeek: 3, openTime: '06:00', closeTime: '02:00', pricePerHour: 800 },
          { dayOfWeek: 4, openTime: '06:00', closeTime: '02:00', pricePerHour: 800 },
          { dayOfWeek: 5, openTime: '06:00', closeTime: '02:00', pricePerHour: 900 },
          { dayOfWeek: 6, openTime: '06:00', closeTime: '02:00', pricePerHour: 950 },
          { dayOfWeek: 0, openTime: '06:00', closeTime: '02:00', pricePerHour: 950 },
        ]
      }
    ],
    paymentSettings: {
      upiId: 'katargamchampions@okaxis',
      upiName: 'Katargam Turf Sports',
      qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=katargamchampions@okaxis&pn=KatargamTurf&cu=INR',
      advanceEnabled: true,
      advanceType: 'PERCENT',
      advanceValue: 20,
      refundTiers: [
        { hoursBefore: 12, refundPercent: 30 },
        { hoursBefore: 3, refundPercent: 20 },
        { hoursBefore: 1, refundPercent: 10 },
        { hoursBefore: 0, refundPercent: 0 }
      ]
    },
    createdAt: '2026-08-25T14:00:00Z'
  }
];

export const MOCK_AVAILABILITY_POSTS: AvailabilityPost[] = [
  {
    id: 'avail_1',
    playerId: 'user_player_1',
    playerName: 'Hardik Patel',
    playerPhone: '9876543210',
    role: 'ALL_ROUNDER',
    skill: 'ADVANCED',
    date: '2026-10-01',
    timeWindow: '8:00 PM - 11:00 PM',
    centerArea: 'Mota Varachha',
    lat: 21.2412,
    lng: 72.8834,
    radiusKm: 6,
    note: 'Right-arm medium pacer & aggressive middle-order batsman. Ready to join any friendly box match tonight!',
    status: 'ACTIVE',
    createdAt: '2026-09-30T10:00:00Z',
  },
  {
    id: 'avail_2',
    playerId: 'user_player_2',
    playerName: 'Chirag Shah',
    playerPhone: '9824011223',
    role: 'BATSMAN',
    skill: 'INTERMEDIATE',
    date: '2026-10-01',
    timeWindow: '9:00 PM - 12:00 AM',
    centerArea: 'Adajan',
    lat: 21.1960,
    lng: 72.7930,
    radiusKm: 5,
    note: 'Opening batsman. Looking for a team playing around LP Savani / Star Bazaar.',
    status: 'ACTIVE',
    createdAt: '2026-09-30T11:30:00Z',
  },
  {
    id: 'avail_3',
    playerId: 'user_player_3',
    playerName: 'Meet Kakadiya',
    playerPhone: '9712344556',
    role: 'BOWLER',
    skill: 'PRO',
    date: '2026-10-02',
    timeWindow: '7:00 PM - 10:00 PM',
    centerArea: 'Katargam',
    lat: 21.2310,
    lng: 72.8250,
    radiusKm: 8,
    note: 'Spin bowler with accurate yorkers in box nets. Call me directly.',
    status: 'ACTIVE',
    createdAt: '2026-09-30T12:00:00Z',
  }
];

export const MOCK_TEAM_POSTS: TeamPost[] = [
  {
    id: 'teampost_1',
    teamId: 'team_1',
    teamName: 'Varachha Strikers 11',
    captainId: 'user_player_1',
    captainName: 'Hardik Patel',
    captainPhone: '9876543210',
    groundName: 'Kings Box Cricket Arena',
    area: 'Mota Varachha',
    lat: 21.2450,
    lng: 72.8890,
    neededPlayers: 3,
    date: '2026-10-01',
    time: '9:00 PM - 10:30 PM',
    note: 'We have 5 players confirmed, need 3 more energetic players for a fast 8v8 game. Turf already booked!',
    status: 'OPEN',
    createdAt: '2026-09-30T09:00:00Z'
  },
  {
    id: 'teampost_2',
    teamId: 'team_2',
    teamName: 'Surat Royals Club',
    captainId: 'user_player_4',
    captainName: 'Jayesh Savaliya',
    captainPhone: '9898012345',
    groundName: 'Royal CricZone Turf',
    area: 'Vesu',
    lat: 21.1410,
    lng: 72.7750,
    neededPlayers: 2,
    date: '2026-10-01',
    time: '10:00 PM - 12:00 AM',
    note: 'Need 1 wicket-keeper and 1 batsman. Friendly match, great vibe.',
    status: 'OPEN',
    createdAt: '2026-09-30T10:15:00Z'
  }
];

export const MOCK_TEAMS: Team[] = [
  {
    id: 'team_1',
    name: 'Varachha Strikers 11',
    captainId: 'user_player_1',
    captainName: 'Hardik Patel',
    captainPhone: '9876543210',
    city: 'Surat',
    area: 'Mota Varachha',
    matchesPlayed: 14,
    matchesWon: 11,
    members: [
      { userId: 'user_player_1', name: 'Hardik Patel', phone: '9876543210', role: 'ALL_ROUNDER' },
      { userId: 'u_2', name: 'Kishan Gondaliya', phone: '9825000001', role: 'BATSMAN' },
      { userId: 'u_3', name: 'Ankit Balar', phone: '9825000002', role: 'BOWLER' },
      { userId: 'u_4', name: 'Pratik Vekariya', phone: '9825000003', role: 'ALL_ROUNDER' },
      { userId: 'u_5', name: 'Sanjay Moradiya', phone: '9825000004', role: 'WICKET_KEEPER' },
    ],
    createdAt: '2026-06-01T00:00:00Z'
  },
  {
    id: 'team_2',
    name: 'Surat Royals Club',
    captainId: 'user_player_4',
    captainName: 'Jayesh Savaliya',
    captainPhone: '9898012345',
    city: 'Surat',
    area: 'Vesu',
    matchesPlayed: 18,
    matchesWon: 13,
    members: [
      { userId: 'user_player_4', name: 'Jayesh Savaliya', phone: '9898012345', role: 'ALL_ROUNDER' },
      { userId: 'u_6', name: 'Darshan Ghelani', phone: '9898012346', role: 'BATSMAN' },
      { userId: 'u_7', name: 'Pooja Kasodariya', phone: '9898012347', role: 'BOWLER' },
      { userId: 'u_8', name: 'Vishal Chovatiya', phone: '9898012348', role: 'BATSMAN' },
    ],
    createdAt: '2026-06-15T00:00:00Z'
  },
  {
    id: 'team_3',
    name: 'Adajan Titans',
    captainId: 'user_player_2',
    captainName: 'Chirag Shah',
    captainPhone: '9824011223',
    city: 'Surat',
    area: 'Adajan',
    matchesPlayed: 8,
    matchesWon: 5,
    members: [
      { userId: 'user_player_2', name: 'Chirag Shah', phone: '9824011223', role: 'BATSMAN' },
      { userId: 'u_9', name: 'Mayur Kapadiya', phone: '9824011224', role: 'BOWLER' },
      { userId: 'u_10', name: 'Dhaval Patel', phone: '9824011225', role: 'ALL_ROUNDER' },
    ],
    createdAt: '2026-07-20T00:00:00Z'
  }
];

export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: 'chal_1',
    fromTeamId: 'team_1',
    fromTeamName: 'Varachha Strikers 11',
    fromCaptainName: 'Hardik Patel',
    fromCaptainPhone: '9876543210',
    toTeamId: 'team_2',
    toTeamName: 'Surat Royals Club',
    toCaptainName: 'Jayesh Savaliya',
    toCaptainPhone: '9898012345',
    date: '2026-10-02',
    time: '09:00 PM',
    overs: 8,
    groundName: 'Kings Box Cricket Arena',
    status: 'ACCEPTED',
    createdAt: '2026-09-29T14:00:00Z'
  },
  {
    id: 'chal_2',
    fromTeamId: 'team_3',
    fromTeamName: 'Adajan Titans',
    fromCaptainName: 'Chirag Shah',
    fromCaptainPhone: '9824011223',
    toTeamId: 'team_1',
    toTeamName: 'Varachha Strikers 11',
    toCaptainName: 'Hardik Patel',
    toCaptainPhone: '9876543210',
    date: '2026-10-03',
    time: '10:00 PM',
    overs: 10,
    groundName: 'Adajan Super Turf & Box',
    status: 'PENDING',
    createdAt: '2026-09-30T08:30:00Z'
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    bookingId: 'bk_sample_1',
    groundId: 'ground_1',
    playerId: 'user_player_1',
    playerName: 'Hardik Patel',
    rating: 5,
    comment: 'Superb indoor pitch quality and top notch lighting. The air pavilion dugout is a lifesaver in Surat humidity! Very easy booking process.',
    photos: [
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=80'
    ],
    ownerReply: 'Thanks Hardik bhai! Glad you enjoyed the game at Kings Box Arena. See you again next weekend!',
    createdAt: '2026-09-28T23:30:00Z'
  },
  {
    id: 'rev_2',
    bookingId: 'bk_sample_2',
    groundId: 'ground_1',
    playerId: 'user_player_3',
    playerName: 'Meet Kakadiya',
    rating: 5,
    comment: 'Great 360 netting, no ball loss and clear boundary rules. Excellent clean washrooms.',
    createdAt: '2026-09-26T18:00:00Z'
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'BK-2026-8801',
    boxId: 'box_1_a',
    boxName: 'Box A (360° Turf Arena)',
    groundId: 'ground_1',
    groundName: 'Kings Box Cricket Arena',
    groundArea: 'Mota Varachha',
    groundPhone: '+91 98251 00001',
    groundAddress: 'Near Sudama Chowk, Behind Shell Petrol Pump',
    playerId: 'user_player_1',
    playerName: 'Hardik Patel',
    playerPhone: '9876543210',
    date: '2026-10-01',
    startTime: '21:00',
    endTime: '22:00',
    totalAmount: 900,
    advanceAmount: 270, // 30%
    balanceAmount: 630,
    paymentStatus: 'ADVANCE_PAID',
    status: 'CONFIRMED',
    refundPolicySnapshot: [
      { hoursBefore: 12, refundPercent: 30 },
      { hoursBefore: 3, refundPercent: 20 },
      { hoursBefore: 1, refundPercent: 10 },
      { hoursBefore: 0, refundPercent: 0 }
    ],
    utr: 'UPI/329482910482',
    advanceVerified: true,
    createdAt: '2026-09-30T10:00:00Z'
  },
  {
    id: 'BK-2026-8802',
    boxId: 'box_2_a',
    boxName: 'Grand Arena (Closed Roof)',
    groundId: 'ground_2',
    groundName: 'Royal CricZone Turf',
    groundArea: 'Vesu',
    groundPhone: '+91 98251 00002',
    groundAddress: 'Opp. Rajhans Synfonia, VIP Road',
    playerId: 'user_player_1',
    playerName: 'Hardik Patel',
    playerPhone: '9876543210',
    date: '2026-09-28',
    startTime: '20:00',
    endTime: '21:00',
    totalAmount: 1000,
    advanceAmount: 0,
    balanceAmount: 1000,
    paymentStatus: 'FULLY_PAID',
    status: 'COMPLETED',
    refundPolicySnapshot: [
      { hoursBefore: 6, refundPercent: 100 },
      { hoursBefore: 0, refundPercent: 0 }
    ],
    advanceVerified: true,
    createdAt: '2026-09-28T14:00:00Z'
  }
];

export const MOCK_LEDGER: PlatformFeeLedger[] = [
  {
    id: 'led_1',
    ownerId: 'user_owner_1',
    ownerName: 'Ramesh Patel',
    bookingId: 'BK-2026-8801',
    groundName: 'Kings Box Cricket Arena',
    bookingAmount: 900,
    feePercent: 5,
    feeAmount: 45,
    status: 'WAIVED', // First 3 months free trial offer
    periodMonth: '2026-10',
    createdAt: '2026-09-30T10:00:00Z'
  },
  {
    id: 'led_2',
    ownerId: 'user_owner_2',
    ownerName: 'Vikram Desai',
    bookingId: 'BK-2026-8802',
    groundName: 'Royal CricZone Turf',
    bookingAmount: 1000,
    feePercent: 5,
    feeAmount: 50,
    status: 'WAIVED',
    periodMonth: '2026-09',
    createdAt: '2026-09-28T21:00:00Z'
  }
];
