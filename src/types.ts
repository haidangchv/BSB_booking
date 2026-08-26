export type BookingType = 'clb' | 'minitour' | 'fixed' | 'casual' | 'event';

export type BookingStatus = 
  | 'HOLD' 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'REJECTED' 
  | 'NO_SHOW';

export type CourtStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
export type ClubStatus = 'ACTIVE' | 'INACTIVE';

export interface Court {
  id: string;
  code?: string;
  name: string;
  type: 'indoor' | 'outdoor' | 'center_court';
  surface: string;
  hourlyRateNormal: number; // 05:30 - 16:00
  hourlyRatePeak: number;   // 16:00 - 23:00
  imageUrl: string;
  features: string[];
  status: CourtStatus;
  isActive: boolean;
  displayOrder?: number;
}

export interface Club {
  id: string;
  name: string;
  shortName?: string;
  tagline: string;
  description: string;
  leaderName: string;
  leaderPhone: string;
  email?: string;
  scheduleDescription: string; // e.g. "Thứ 2 - 4 - 6: 18:00 - 20:00"
  regularDays: number[]; // 1=T2, 2=T3... 0=CN
  regularTime: string;
  assignedCourtIds: string[];
  memberCount: number;
  duprLevel: string; // e.g. "DUPR 3.0 - 4.2"
  monthlyFee: number;
  badge: string;
  coverImage: string;
  color?: string;
  tags: string[];
  status: ClubStatus;
  isOpenForMembers: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BookingSlot {
  id: string;
  bookingId: string;
  courtId: string;
  courtName?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  setupMinutes?: number;
  cleanupMinutes?: number;
}

export interface RecurrenceRule {
  frequency: 'weekly' | 'biweekly';
  interval: number;
  weekdays: number[]; // [1, 3, 5] for Mon, Wed, Fri
  startDate: string;
  endDate: string;
  occurrencesTotal?: number;
  conflictingDates?: string[];
}

export interface Booking {
  id: string;
  bookingCode: string;
  courtId: string;
  courtName: string;
  bookingType: BookingType;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  // Specific to CLB booking
  clubId?: string;
  clubName?: string;
  // Specific to Minitour / Event
  title?: string;
  organizerName?: string;
  participantCount?: number;
  teamCount?: number;
  courtIds?: string[]; // Multi-court allocation
  setupMinutes?: number;
  cleanupMinutes?: number;
  // Time & Slot info
  date: string; // YYYY-MM-DD (or start date for recurring)
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  durationHours?: number;
  // Specific to fixed booking
  selectedDays?: number[]; // [1, 3, 5] for Mon, Wed, Fri
  durationMonths?: number; // 1, 2, 3, 6 months
  recurrence?: RecurrenceRule;
  // Event details
  eventType?: string; // 'tournament' | 'corporate' | 'workshop' | 'gathering'
  selectedServices?: string[];
  // Financials
  subtotal?: number;
  totalAmount: number;
  discountAmount: number;
  depositAmount: number;
  paymentStatus: 'pending' | 'paid' | 'deposit_paid';
  bookingStatus: BookingStatus;
  holdExpiresAt?: string; // ISO string for 5-minute temporary hold
  notes?: string;
  createdByRole?: 'customer' | 'admin';
  createdAt: string;
  updatedAt?: string;
}

export interface PricingRule {
  id: string;
  courtId?: string | null;
  dayType: 'weekday' | 'weekend' | 'holiday';
  startTime: string; // "05:30"
  endTime: string;   // "16:00"
  bookingType?: BookingType | null;
  pricePerHour: number;
  activeFrom?: string;
  activeTo?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CourtBlock {
  id: string;
  courtId: string;
  courtName?: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  createdBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'COURT_BLOCK';
  entityType: 'booking' | 'club' | 'court' | 'minitour' | 'pricing';
  entityId: string;
  details: string;
  createdAt: string;
}

export interface TournamentTeam {
  id: string;
  teamName: string;
  player1: string;
  player2: string;
  phone: string;
  duprEstimate: string;
  registeredAt: string;
  paymentStatus: 'paid' | 'pending';
}

export interface TournamentMatch {
  id: string;
  round: 'quarter' | 'semi' | 'final' | 'third_place';
  roundName: string;
  matchNumber: number;
  team1?: TournamentTeam;
  team2?: TournamentTeam;
  score1?: number;
  score2?: number;
  winnerTeamId?: string;
  courtName?: string;
  time?: string;
  status: 'upcoming' | 'live' | 'finished';
}

export interface Minitour {
  id: string;
  title: string;
  subtitle: string;
  bannerImage: string;
  date: string;
  timeRange: string;
  location: string;
  format: 'knockout_8' | 'knockout_16' | 'round_robin';
  category: 'Đôi Nam' | 'Đôi Nữ' | 'Đôi Nam Nữ' | 'Mở rộng Open';
  duprBracket: string;
  entryFee: number;
  prizeTotal: number;
  prizeFirst: string;
  prizeSecond: string;
  prizeThird: string;
  maxTeams: number;
  teams: TournamentTeam[];
  matches: TournamentMatch[];
  status: 'registration_open' | 'ongoing' | 'completed';
  rules: string[];
}

export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  avatar?: string;
  duprRating?: number;
  clubName?: string;
  membershipTier?: 'STANDARD' | 'SILVER' | 'GOLD' | 'VIP';
  password?: string;
  joinedAt?: string;
}

