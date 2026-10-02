"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  UserRole,
  Ground,
  Booking,
  AvailabilityPost,
  TeamPost,
  JoinRequest,
  Team,
  Challenge,
  Review,
  NotificationItem,
  AuditLog,
  PlatformFeeLedger,
  RefundTier
} from '@/types';
import {
  MOCK_USERS,
  MOCK_GROUNDS,
  MOCK_BOOKINGS,
  MOCK_AVAILABILITY_POSTS,
  MOCK_TEAM_POSTS,
  MOCK_TEAMS,
  MOCK_CHALLENGES,
  MOCK_REVIEWS,
  MOCK_LEDGER,
  normalizeAmenity
} from '@/lib/mockData';
import { translations, Language } from '@/lib/translations';

interface OfflineBlock {
  id: string;
  boxId: string;
  groundId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  isInitializing: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  logout: () => Promise<void>;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  
  // Global Localities Catalog
  localities: string[];
  addLocality: (newLocality: string) => { name: string; alreadyExisted: boolean };

  // Grounds
  grounds: Ground[];
  addGround: (ground: Omit<Ground, 'id' | 'createdAt' | 'avgRating' | 'totalReviews'>) => Ground;
  updateGround: (id: string, updates: Partial<Ground>) => void;
  toggleGroundStatus: (id: string, status: 'VERIFIED' | 'SUSPENDED' | 'PENDING') => void;
  
  // Bookings
  bookings: Booking[];
  createBooking: (bookingData: {
    boxId: string;
    boxName: string;
    groundId: string;
    groundName: string;
    groundArea: string;
    groundPhone: string;
    groundAddress: string;
    date: string;
    startTime: string;
    endTime: string;
    totalAmount: number;
    advanceAmount: number;
    balanceAmount: number;
    paymentStatus: 'UNPAID' | 'ADVANCE_PAID' | 'FULLY_PAID';
    utr?: string;
    refundPolicySnapshot: RefundTier[];
  }) => Booking;
  cancelBooking: (bookingId: string, reason: string) => { refundAmount: number; refundPercent: number };
  verifyAdvancePayment: (bookingId: string, received: boolean) => void;
  markBookingCompleted: (bookingId: string) => void;
  
  // Offline Blocks
  offlineBlocks: OfflineBlock[];
  addOfflineBlock: (block: Omit<OfflineBlock, 'id'>) => void;
  removeOfflineBlock: (id: string) => void;

  // Find Players & Matchmaking
  availabilityPosts: AvailabilityPost[];
  createAvailabilityPost: (post: Omit<AvailabilityPost, 'id' | 'playerId' | 'playerName' | 'playerPhone' | 'createdAt' | 'status'>) => AvailabilityPost;
  teamPosts: TeamPost[];
  createTeamPost: (post: Omit<TeamPost, 'id' | 'captainId' | 'captainName' | 'captainPhone' | 'createdAt' | 'status'>) => TeamPost;
  joinRequests: JoinRequest[];
  sendJoinRequest: (req: Omit<JoinRequest, 'id' | 'senderId' | 'senderName' | 'senderPhone' | 'senderRole' | 'senderSkill' | 'createdAt' | 'status'>) => JoinRequest;
  respondJoinRequest: (requestId: string, status: 'ACCEPTED' | 'REJECTED', rejectMessage?: string) => void;

  // Teams & Challenges
  teams: Team[];
  createTeam: (team: Omit<Team, 'id' | 'captainId' | 'captainName' | 'captainPhone' | 'matchesPlayed' | 'matchesWon' | 'createdAt'>) => Team;
  challenges: Challenge[];
  createChallenge: (chal: Omit<Challenge, 'id' | 'fromCaptainName' | 'fromCaptainPhone' | 'status' | 'createdAt'>) => Challenge;
  respondChallenge: (challengeId: string, status: 'ACCEPTED' | 'DECLINED' | 'COUNTERED', counterDate?: string, counterTime?: string) => void;
  submitMatchScore: (challengeId: string, winnerTeamId: string, scoreA: string, scoreB: string) => void;

  // Reviews
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'playerId' | 'playerName' | 'createdAt'>) => void;
  replyToReview: (reviewId: string, reply: string) => void;

  // Platform Ledger & Admin
  ledger: PlatformFeeLedger[];
  auditLogs: AuditLog[];
  addAuditLog: (action: string, entityType: AuditLog['entityType'], entityId: string, details: string) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  unreadCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = localStorage.getItem('boxkhel_auth');
      if (savedAuth !== null) {
        return savedAuth === 'true';
      }
    }
    return false; // Default strictly to unauthenticated
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('boxkhel_user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (e) {}
      }
    }
    return MOCK_USERS[0];
  });

  const updateCurrentUser = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('boxkhel_user', JSON.stringify(user));
      localStorage.setItem('boxkhel_auth', 'true');
    }
  };

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>('en');

  // Check active session from PostgreSQL on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success && data.authenticated && data.user) {
          setIsAuthenticated(true);
          const profile = data.user.playerProfile;
          const userObj: User = {
            id: data.user.id,
            phone: data.user.phone,
            name: data.user.name,
            role: data.user.role as UserRole,
            city: data.user.city || 'Surat',
            photoUrl: data.user.photoUrl || undefined,
            isBlocked: false,
            playingRole: profile?.playingRole || 'ALL_ROUNDER',
            skillLevel: profile?.skillLevel || 'INTERMEDIATE',
            homeArea: profile?.homeArea || 'Adajan',
            createdAt: new Date().toISOString(),
          };
          setCurrentUser(userObj);
          if (typeof window !== 'undefined') {
            localStorage.setItem('boxkhel_user', JSON.stringify(userObj));
            localStorage.setItem('boxkhel_auth', 'true');
          }
        } else {
          // If server says unauthenticated and no explicit client auth
          if (typeof window !== 'undefined') {
            const savedAuth = localStorage.getItem('boxkhel_auth');
            if (savedAuth !== 'true') {
              setIsAuthenticated(false);
            }
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setIsInitializing(false);
      }
    }
    checkSession();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('boxkhel_auth', 'false');
      localStorage.removeItem('boxkhel_user');
    }
  };

  // Global Localities Catalog for Surat
  const DEFAULT_SURAT_LOCALITIES = [
    'Mota Varachha',
    'Adajan',
    'Vesu',
    'Katargam',
    'Pal',
    'Palanpur',
    'Althan',
    'Jahangirpura',
    'Dumas Road',
    'Rander',
    'Varachha',
    'Udhna',
    'Ghod Dod Road',
    'Piplod',
    'Bhatar',
    'Sarthana',
    'Amroli',
    'Kamrej'
  ];

  const [localities, setLocalities] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('boxkhel_localities');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return DEFAULT_SURAT_LOCALITIES;
  });

  const addLocality = (rawName: string): { name: string; alreadyExisted: boolean } => {
    const trimmed = rawName.trim();
    if (!trimmed) return { name: '', alreadyExisted: false };

    // Standardize title-casing e.g. "mota varachha" -> "Mota Varachha"
    const formatted = trimmed
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    // Strict Case-insensitive duplicate check!
    const existing = localities.find(loc => loc.toLowerCase() === formatted.toLowerCase());
    if (existing) {
      return { name: existing, alreadyExisted: true };
    }

    const updated = [...localities, formatted];
    setLocalities(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('boxkhel_localities', JSON.stringify(updated));
    }
    return { name: formatted, alreadyExisted: false };
  };

  const [grounds, setGrounds] = useState<Ground[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('boxkhel_grounds');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((g: Ground) => ({
              ...g,
              amenities: Array.from(new Set((g.amenities || []).map(normalizeAmenity).filter(Boolean)))
            }));
          }
        } catch (e) {}
      }
    }
    return MOCK_GROUNDS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('boxkhel_bookings');
      if (saved) try { return JSON.parse(saved); } catch (e) {}
    }
    return MOCK_BOOKINGS;
  });

  const [offlineBlocks, setOfflineBlocks] = useState<OfflineBlock[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('boxkhel_offline_blocks');
      if (saved) try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'block_sample_1',
        boxId: 'box_1_a',
        groundId: 'ground_1',
        date: '2026-10-01',
        startTime: '18:00',
        endTime: '19:00',
        reason: 'Local Tournament Phone Booking'
      }
    ];
  });

  const [availabilityPosts, setAvailabilityPosts] = useState<AvailabilityPost[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('boxkhel_avail_posts');
      if (saved) try { return JSON.parse(saved); } catch (e) {}
    }
    return MOCK_AVAILABILITY_POSTS;
  });

  const [teamPosts, setTeamPosts] = useState<TeamPost[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('boxkhel_team_posts');
      if (saved) try { return JSON.parse(saved); } catch (e) {}
    }
    return MOCK_TEAM_POSTS;
  });

  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('boxkhel_join_requests');
      if (saved) try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'req_1',
        targetPostId: 'teampost_1',
        postType: 'TEAM_POST',
        senderId: 'user_player_2',
        senderName: 'Chirag Shah',
        senderPhone: '9824011223',
        senderRole: 'BATSMAN',
        senderSkill: 'INTERMEDIATE',
        receiverId: 'user_player_1',
        message: 'Hi Hardik bhai, I am nearby LP Savani, can join your match at 9 PM!',
        status: 'PENDING',
        createdAt: '2026-09-30T13:00:00Z'
      }
    ];
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('boxkhel_teams');
      if (saved) try { return JSON.parse(saved); } catch (e) {}
    }
    return MOCK_TEAMS;
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('boxkhel_challenges');
      if (saved) try { return JSON.parse(saved); } catch (e) {}
    }
    return MOCK_CHALLENGES;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('boxkhel_reviews');
      if (saved) try { return JSON.parse(saved); } catch (e) {}
    }
    return MOCK_REVIEWS;
  });

  const [ledger, setLedger] = useState<PlatformFeeLedger[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('boxkhel_ledger');
      if (saved) try { return JSON.parse(saved); } catch (e) {}
    }
    return MOCK_LEDGER;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('boxkhel_audit');
      if (saved) try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'audit_1',
        adminId: 'user_admin_1',
        adminName: 'BoxKhel Admin',
        action: 'GROUND_VERIFIED',
        entityType: 'GROUND',
        entityId: 'ground_1',
        details: 'Admin verified Kings Box Cricket Arena and activated online booking.',
        timestamp: '2026-08-01T09:00:00Z'
      }
    ];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif_1',
      userId: 'user_player_1',
      title: 'Upcoming Match Tonight!',
      message: 'Your slot at Kings Box Cricket Arena (Box A) starts at 9:00 PM.',
      type: 'BOOKING',
      read: false,
      createdAt: '2026-09-30T14:00:00Z'
    },
    {
      id: 'notif_2',
      userId: 'user_owner_1',
      title: 'New Booking & Advance UTR',
      message: 'Hardik Patel booked Box A for tonight. Advance ₹270 received via UPI.',
      type: 'PAYMENT',
      read: false,
      createdAt: '2026-09-30T10:05:00Z'
    }
  ]);

  // Sync state to LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('boxkhel_grounds', JSON.stringify(grounds));
      localStorage.setItem('boxkhel_bookings', JSON.stringify(bookings));
      localStorage.setItem('boxkhel_offline_blocks', JSON.stringify(offlineBlocks));
      localStorage.setItem('boxkhel_avail_posts', JSON.stringify(availabilityPosts));
      localStorage.setItem('boxkhel_team_posts', JSON.stringify(teamPosts));
      localStorage.setItem('boxkhel_join_requests', JSON.stringify(joinRequests));
      localStorage.setItem('boxkhel_teams', JSON.stringify(teams));
      localStorage.setItem('boxkhel_challenges', JSON.stringify(challenges));
      localStorage.setItem('boxkhel_reviews', JSON.stringify(reviews));
      localStorage.setItem('boxkhel_ledger', JSON.stringify(ledger));
      localStorage.setItem('boxkhel_audit', JSON.stringify(auditLogs));
      localStorage.setItem('boxkhel_localities', JSON.stringify(localities));
    }
  }, [grounds, bookings, offlineBlocks, availabilityPosts, teamPosts, joinRequests, teams, challenges, reviews, ledger, auditLogs, localities]);

  const switchRole = (role: UserRole) => {
    const found = MOCK_USERS.find(u => u.role === role);
    if (found) {
      setCurrentUser(found);
    } else {
      setCurrentUser({
        ...currentUser,
        role: role
      });
    }
  };

  const addAuditLog = (action: string, entityType: AuditLog['entityType'], entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser.role === 'ADMIN' ? currentUser.id : 'user_admin_1',
      adminName: currentUser.role === 'ADMIN' ? currentUser.name : 'System Admin',
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Ground Operations
  const addGround = (groundData: Omit<Ground, 'id' | 'createdAt' | 'avgRating' | 'totalReviews'>): Ground => {
    const newGround: Ground = {
      ...groundData,
      id: `ground_${Date.now()}`,
      avgRating: 5.0,
      totalReviews: 0,
      createdAt: new Date().toISOString()
    };
    setGrounds(prev => [newGround, ...prev]);
    addAuditLog('GROUND_CREATED', 'GROUND', newGround.id, `Ground "${newGround.name}" registered in ${newGround.area}`);
    return newGround;
  };

  const updateGround = (id: string, updates: Partial<Ground>) => {
    setGrounds(prev => {
      const sanitizedUpdates = { ...updates };
      if (sanitizedUpdates.amenities) {
        sanitizedUpdates.amenities = Array.from(
          new Set(sanitizedUpdates.amenities.map(normalizeAmenity).filter(Boolean))
        );
      }
      return prev.map(g => g.id === id ? { ...g, ...sanitizedUpdates } : g);
    });
    addAuditLog('GROUND_UPDATED', 'GROUND', id, `Ground settings updated`);
  };

  const toggleGroundStatus = (id: string, status: 'VERIFIED' | 'SUSPENDED' | 'PENDING') => {
    setGrounds(prev => prev.map(g => g.id === id ? { ...g, status } : g));
    addAuditLog(`GROUND_${status}`, 'GROUND', id, `Ground status changed to ${status}`);
  };

  // Booking Operations
  const createBooking = (bookingData: {
    boxId: string;
    boxName: string;
    groundId: string;
    groundName: string;
    groundArea: string;
    groundPhone: string;
    groundAddress: string;
    date: string;
    startTime: string;
    endTime: string;
    totalAmount: number;
    advanceAmount: number;
    balanceAmount: number;
    paymentStatus: 'UNPAID' | 'ADVANCE_PAID' | 'FULLY_PAID';
    utr?: string;
    refundPolicySnapshot: RefundTier[];
  }): Booking => {
    const id = `BK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      id,
      ...bookingData,
      playerId: currentUser.id,
      playerName: currentUser.name,
      playerPhone: currentUser.phone,
      status: 'CONFIRMED', // Auto-confirm per Section 4.4 & 12
      advanceVerified: bookingData.advanceAmount > 0 ? true : false,
      createdAt: new Date().toISOString()
    };

    setBookings(prev => [newBooking, ...prev]);

    // Send notifications to Player and Owner
    const ground = grounds.find(g => g.id === bookingData.groundId);
    if (ground) {
      const ownerNotif: NotificationItem = {
        id: `notif_${Date.now()}_owner`,
        userId: ground.ownerId,
        title: `New Confirmed Booking: ${bookingData.boxName}`,
        message: `${currentUser.name} (${currentUser.phone}) booked slot ${bookingData.date} ${bookingData.startTime}-${bookingData.endTime}. Total: ₹${bookingData.totalAmount}`,
        type: 'BOOKING',
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [ownerNotif, ...prev]);
    }

    return newBooking;
  };

  const cancelBooking = (bookingId: string, reason: string): { refundAmount: number; refundPercent: number } => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { refundAmount: 0, refundPercent: 0 };

    // Calculate hours before start
    const matchDateTime = new Date(`${booking.date}T${booking.startTime}:00`);
    const now = new Date();
    const diffHours = (matchDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundPercent = 0;
    const sortedTiers = [...(booking.refundPolicySnapshot || [])].sort((a, b) => b.hoursBefore - a.hoursBefore);

    for (const tier of sortedTiers) {
      if (diffHours >= tier.hoursBefore) {
        refundPercent = tier.refundPercent;
        break;
      }
    }

    // Refund is on the advance amount paid
    const refundAmount = Math.round((booking.advanceAmount * refundPercent) / 100);

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'CANCELLED',
          paymentStatus: refundAmount > 0 ? 'REFUND_DUE' : b.paymentStatus,
          cancellationReason: reason,
          refundAmount: refundAmount
        };
      }
      return b;
    }));

    addAuditLog('BOOKING_CANCELLED', 'BOOKING', bookingId, `Cancelled. Refund calculated: ₹${refundAmount} (${refundPercent}%)`);
    return { refundAmount, refundPercent };
  };

  const verifyAdvancePayment = (bookingId: string, received: boolean) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        if (received) {
          return { ...b, advanceVerified: true, paymentStatus: 'ADVANCE_PAID' };
        } else {
          // If marked not received, booking cancels and dispute is raised
          return { ...b, status: 'CANCELLED', cancellationReason: 'Owner flagged advance payment as NOT received in bank' };
        }
      }
      return b;
    }));
  };

  const markBookingCompleted = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'COMPLETED', paymentStatus: 'FULLY_PAID' } : b));

    // Accrue 5% platform fee for owner
    const ground = grounds.find(g => g.id === booking.groundId);
    const owner = MOCK_USERS.find(u => u.id === ground?.ownerId);
    const isFeeFree = owner?.feeFreeUntil && new Date(owner.feeFreeUntil) > new Date();

    const feeAmount = Math.round((booking.totalAmount * 5) / 100);
    const newLedgerItem: PlatformFeeLedger = {
      id: `led_${Date.now()}`,
      ownerId: ground?.ownerId || 'user_owner_1',
      ownerName: ground?.ownerName || 'Turf Owner',
      bookingId: booking.id,
      groundName: booking.groundName,
      bookingAmount: booking.totalAmount,
      feePercent: 5,
      feeAmount,
      status: isFeeFree ? 'WAIVED' : 'ACCRUED',
      periodMonth: booking.date.slice(0, 7),
      createdAt: new Date().toISOString()
    };

    setLedger(prev => [newLedgerItem, ...prev]);
  };

  // Offline Blocks
  const addOfflineBlock = (block: Omit<OfflineBlock, 'id'>) => {
    const newBlock: OfflineBlock = {
      ...block,
      id: `block_${Date.now()}`
    };
    setOfflineBlocks(prev => [...prev, newBlock]);
  };

  const removeOfflineBlock = (id: string) => {
    setOfflineBlocks(prev => prev.filter(b => b.id !== id));
  };

  // Find Players
  const createAvailabilityPost = (post: Omit<AvailabilityPost, 'id' | 'playerId' | 'playerName' | 'playerPhone' | 'createdAt' | 'status'>): AvailabilityPost => {
    const newPost: AvailabilityPost = {
      ...post,
      id: `avail_${Date.now()}`,
      playerId: currentUser.id,
      playerName: currentUser.name,
      playerPhone: currentUser.phone,
      playerPhoto: currentUser.photoUrl,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    setAvailabilityPosts(prev => [newPost, ...prev]);
    return newPost;
  };

  const createTeamPost = (post: Omit<TeamPost, 'id' | 'captainId' | 'captainName' | 'captainPhone' | 'createdAt' | 'status'>): TeamPost => {
    const newPost: TeamPost = {
      ...post,
      id: `teampost_${Date.now()}`,
      captainId: currentUser.id,
      captainName: currentUser.name,
      captainPhone: currentUser.phone,
      status: 'OPEN',
      createdAt: new Date().toISOString()
    };
    setTeamPosts(prev => [newPost, ...prev]);
    return newPost;
  };

  const sendJoinRequest = (req: Omit<JoinRequest, 'id' | 'senderId' | 'senderName' | 'senderPhone' | 'senderRole' | 'senderSkill' | 'createdAt' | 'status'>): JoinRequest => {
    const newReq: JoinRequest = {
      ...req,
      id: `req_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderPhone: currentUser.phone,
      senderRole: currentUser.playingRole,
      senderSkill: currentUser.skillLevel,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    setJoinRequests(prev => [newReq, ...prev]);

    // Send notification
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: req.receiverId,
      title: 'New Player Join Request',
      message: `${currentUser.name} (${currentUser.phone}) sent a request to join your match!`,
      type: 'REQUEST',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);

    return newReq;
  };

  const respondJoinRequest = (requestId: string, status: 'ACCEPTED' | 'REJECTED', rejectMessage?: string) => {
    setJoinRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return { ...r, status, rejectMessage };
      }
      return r;
    }));
  };

  // Teams & Challenges
  const createTeam = (teamData: Omit<Team, 'id' | 'captainId' | 'captainName' | 'captainPhone' | 'matchesPlayed' | 'matchesWon' | 'createdAt'>): Team => {
    const newTeam: Team = {
      ...teamData,
      id: `team_${Date.now()}`,
      captainId: currentUser.id,
      captainName: currentUser.name,
      captainPhone: currentUser.phone,
      matchesPlayed: 0,
      matchesWon: 0,
      createdAt: new Date().toISOString()
    };
    setTeams(prev => [newTeam, ...prev]);
    return newTeam;
  };

  const createChallenge = (chal: Omit<Challenge, 'id' | 'fromCaptainName' | 'fromCaptainPhone' | 'status' | 'createdAt'>): Challenge => {
    const newChallenge: Challenge = {
      ...chal,
      id: `chal_${Date.now()}`,
      fromCaptainName: currentUser.name,
      fromCaptainPhone: currentUser.phone,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    setChallenges(prev => [newChallenge, ...prev]);
    return newChallenge;
  };

  const respondChallenge = (challengeId: string, status: 'ACCEPTED' | 'DECLINED' | 'COUNTERED', counterDate?: string, counterTime?: string) => {
    setChallenges(prev => prev.map(c => {
      if (c.id === challengeId) {
        return {
          ...c,
          status,
          counterDate,
          counterTime
        };
      }
      return c;
    }));
  };

  const submitMatchScore = (challengeId: string, winnerTeamId: string, scoreA: string, scoreB: string) => {
    setChallenges(prev => prev.map(c => {
      if (c.id === challengeId) {
        return {
          ...c,
          status: 'COMPLETED',
          matchResult: {
            winnerTeamId,
            teamAScore: scoreA,
            teamBScore: scoreB,
            confirmedByA: true,
            confirmedByB: true,
          }
        };
      }
      return c;
    }));

    // Update teams stats
    setTeams(prev => prev.map(t => {
      if (t.id === winnerTeamId) {
        return { ...t, matchesPlayed: t.matchesPlayed + 1, matchesWon: t.matchesWon + 1 };
      }
      return t;
    }));
  };

  // Reviews
  const addReview = (reviewData: Omit<Review, 'id' | 'playerId' | 'playerName' | 'createdAt'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev_${Date.now()}`,
      playerId: currentUser.id,
      playerName: currentUser.name,
      createdAt: new Date().toISOString()
    };
    setReviews(prev => [newReview, ...prev]);

    // Recalculate average rating for ground
    const allGroundReviews = [newReview, ...reviews.filter(r => r.groundId === reviewData.groundId)];
    const avg = allGroundReviews.reduce((sum, r) => sum + r.rating, 0) / allGroundReviews.length;
    setGrounds(prev => prev.map(g => g.id === reviewData.groundId ? {
      ...g,
      avgRating: Number(avg.toFixed(1)),
      totalReviews: allGroundReviews.length
    } : g));
  };

  const replyToReview = (reviewId: string, reply: string) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, ownerReply: reply } : r));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read && (n.userId === currentUser.id || currentUser.role === 'ADMIN')).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser: updateCurrentUser,
        switchRole,
        isAuthenticated,
        setIsAuthenticated,
        isInitializing,
        isAuthModalOpen,
        setIsAuthModalOpen,
        logout,
        language,
        setLanguage,
        t: translations[language],
        localities,
        addLocality,
        grounds,
        addGround,
        updateGround,
        toggleGroundStatus,
        bookings,
        createBooking,
        cancelBooking,
        verifyAdvancePayment,
        markBookingCompleted,
        offlineBlocks,
        addOfflineBlock,
        removeOfflineBlock,
        availabilityPosts,
        createAvailabilityPost,
        teamPosts,
        createTeamPost,
        joinRequests,
        sendJoinRequest,
        respondJoinRequest,
        teams,
        createTeam,
        challenges,
        createChallenge,
        respondChallenge,
        submitMatchScore,
        reviews,
        addReview,
        replyToReview,
        ledger,
        auditLogs,
        addAuditLog,
        notifications,
        markNotificationRead,
        unreadCount
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
