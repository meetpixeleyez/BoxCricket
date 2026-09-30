export type UserRole = 'PLAYER' | 'OWNER' | 'ADMIN';

export type PlayingRole = 'BATSMAN' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER';
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PRO';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  photoUrl?: string;
  city: string;
  playingRole?: PlayingRole;
  skillLevel?: SkillLevel;
  homeArea?: string;
  lat?: number;
  lng?: number;
  feeFreeUntil?: string; // for owners: 3 months zero fee waiver
  isBlocked?: boolean;
  createdAt: string;
}

export type TurfType = 'OPEN' | 'CLOSED' | 'THREE_SIXTY';
export type GroundStatus = 'PENDING' | 'VERIFIED' | 'SUSPENDED';

export interface RefundTier {
  hoursBefore: number;
  refundPercent: number;
}

export interface PaymentSettings {
  upiId: string;
  upiName: string;
  qrImageUrl: string;
  advanceEnabled: boolean;
  advanceType: 'PERCENT' | 'FIXED';
  advanceValue: number; // e.g. 30% or 300 INR
  refundTiers: RefundTier[];
}

export interface BoxSchedule {
  dayOfWeek: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  openTime: string; // "06:00"
  closeTime: string; // "02:00"
  pricePerHour: number;
}

export interface Box {
  id: string;
  groundId: string;
  name: string; // "Box A", "Box B"
  type: TurfType;
  widthFt: number;
  heightFt: number;
  maxPlayers: number; // e.g. 14 (7v7)
  basePrice: number; // ₹800/hr
  slotMinutes: number; // 60, 90, 120
  images: string[];
  isActive: boolean;
  schedules: BoxSchedule[];
}

export interface Ground {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  name: string;
  description: string;
  phone: string;
  addressLine: string;
  area: string; // e.g., "Mota Varachha", "Adajan", "Vesu", "Katargam", "Pal"
  city: string; // "Surat"
  state: string; // "Gujarat"
  pincode: string;
  lat: number;
  lng: number;
  amenities: string[]; // ['Night Floodlights', 'Air Pavilion', 'Dugout', 'RO Drinking Water', 'Dedicated Parking', 'Changing Room', 'Live Streaming Screen']
  status: GroundStatus;
  createdByAdminId?: string;
  avgRating: number;
  totalReviews: number;
  images: string[];
  boxes: Box[];
  paymentSettings: PaymentSettings;
  createdAt: string;
}

export type SlotStatus = 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED_OFFLINE';

export interface Slot {
  id: string;
  boxId: string;
  boxName: string;
  groundId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "20:00"
  endTime: string; // "21:00"
  price: number;
  status: SlotStatus;
  heldByPlayerId?: string;
  holdExpiresAt?: string;
}

export type BookingStatus = 'HELD' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type PaymentStatus = 'UNPAID' | 'ADVANCE_PAID' | 'FULLY_PAID' | 'REFUND_DUE' | 'REFUNDED';

export interface Booking {
  id: string;
  boxId: string;
  boxName: string;
  groundId: string;
  groundName: string;
  groundArea: string;
  groundPhone: string;
  groundAddress: string;
  playerId: string;
  playerName: string;
  playerPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  refundPolicySnapshot: RefundTier[];
  utr?: string;
  advanceVerified?: boolean;
  holdExpiresAt?: string;
  cancellationReason?: string;
  refundAmount?: number;
  createdAt: string;
}

export interface PlatformFeeLedger {
  id: string;
  ownerId: string;
  ownerName: string;
  bookingId: string;
  groundName: string;
  bookingAmount: number;
  feePercent: number; // 5
  feeAmount: number;
  status: 'WAIVED' | 'ACCRUED' | 'INVOICED' | 'PAID';
  periodMonth: string; // "2026-10"
  createdAt: string;
}

export interface AvailabilityPost {
  id: string;
  playerId: string;
  playerName: string;
  playerPhone: string;
  playerPhoto?: string;
  role: PlayingRole;
  skill: SkillLevel;
  date: string;
  timeWindow: string; // e.g. "8:00 PM - 11:00 PM"
  centerArea: string;
  lat: number;
  lng: number;
  radiusKm: number;
  note?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'MATCHED';
  createdAt: string;
}

export interface TeamPost {
  id: string;
  teamId: string;
  teamName: string;
  captainId: string;
  captainName: string;
  captainPhone: string;
  groundName: string;
  area: string;
  lat: number;
  lng: number;
  neededPlayers: number;
  date: string;
  time: string;
  note?: string;
  status: 'OPEN' | 'FILLED' | 'CLOSED';
  createdAt: string;
}

export interface JoinRequest {
  id: string;
  targetPostId: string;
  postType: 'AVAILABILITY' | 'TEAM_POST';
  senderId: string;
  senderName: string;
  senderPhone: string;
  senderRole?: PlayingRole;
  senderSkill?: SkillLevel;
  receiverId: string;
  message?: string;
  rejectMessage?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface TeamMember {
  userId: string;
  name: string;
  phone: string;
  role: PlayingRole;
}

export interface Team {
  id: string;
  name: string;
  captainId: string;
  captainName: string;
  captainPhone: string;
  logoUrl?: string;
  city: string;
  area: string;
  members: TeamMember[];
  matchesPlayed: number;
  matchesWon: number;
  createdAt: string;
}

export type ChallengeStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COUNTERED' | 'COMPLETED';

export interface Challenge {
  id: string;
  fromTeamId: string;
  fromTeamName: string;
  fromCaptainName: string;
  fromCaptainPhone: string;
  toTeamId: string;
  toTeamName: string;
  toCaptainName: string;
  toCaptainPhone: string;
  date: string;
  time: string;
  overs: number;
  groundName?: string;
  status: ChallengeStatus;
  counterTime?: string;
  counterDate?: string;
  matchResult?: {
    winnerTeamId: string;
    teamAScore: string;
    teamBScore: string;
    confirmedByA: boolean;
    confirmedByB: boolean;
  };
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  groundId: string;
  playerId: string;
  playerName: string;
  rating: number; // 1-5
  comment: string;
  photos?: string[];
  ownerReply?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'BOOKING' | 'PAYMENT' | 'REQUEST' | 'CHALLENGE' | 'SYSTEM';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  entityType: 'GROUND' | 'OWNER' | 'USER' | 'BOOKING' | 'REFUND';
  entityId: string;
  details: string;
  timestamp: string;
}
