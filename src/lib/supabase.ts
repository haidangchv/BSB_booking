import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Court, Club, Booking, Minitour, PricingRule, CourtBlock, AuditLog, BookingType, BookingStatus } from '../types';
import { INITIAL_COURTS, INITIAL_CLUBS, INITIAL_MINITOURS, INITIAL_BOOKINGS, INITIAL_PRICING_RULES, INITIAL_COURT_BLOCKS, INITIAL_AUDIT_LOGS } from '../data/mockData';

// Supabase environment keys
const env = (import.meta as any).env || {};
const SUPABASE_URL = env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('http'));

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// LocalStorage Persistence Keys (Offline / Demo Fallback Mode)
const STORAGE_KEYS = {
  COURTS: 'bsb_courts_v3',
  CLUBS: 'bsb_clubs_v2',
  BOOKINGS: 'bsb_bookings_v2',
  MINITOURS: 'bsb_minitours_v2',
  PRICING: 'bsb_pricing_v2',
  BLOCKS: 'bsb_blocks_v2',
  AUDIT: 'bsb_audit_v2'
};

// Safe Local Storage Helpers
function getStoredItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    return JSON.parse(data);
  } catch (e) {
    console.warn(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing ${key} to storage:`, e);
  }
}

// ============================================================================
// CORE DATA SERVICES WITH SUPABASE & LOCAL FALLBACK
// ============================================================================

export const DatabaseService = {
  // COURTS
  async getCourts(): Promise<Court[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('courts').select('*').order('display_order', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map((c: any) => ({
            id: c.id,
            code: c.code,
            name: c.name,
            type: c.type,
            surface: c.surface,
            hourlyRateNormal: Number(c.hourly_rate_normal),
            hourlyRatePeak: Number(c.hourly_rate_peak),
            imageUrl: c.image_url,
            features: c.features || [],
            status: c.status || 'ACTIVE',
            isActive: c.is_active ?? true,
            displayOrder: c.display_order
          }));
        }
      } catch (err) {
        console.error('Supabase getCourts error, falling back to local storage', err);
      }
    }
    return getStoredItem<Court[]>(STORAGE_KEYS.COURTS, INITIAL_COURTS);
  },

  // CLUBS (Active only for public, all for admin)
  async getClubs(includeInactive = false): Promise<Club[]> {
    let clubs: Club[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('clubs').select('*').order('name', { ascending: true });
        if (!includeInactive) {
          query = query.eq('status', 'ACTIVE');
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          clubs = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            shortName: c.short_name,
            tagline: c.tagline || '',
            description: c.description || '',
            leaderName: c.leader_name,
            leaderPhone: c.leader_phone,
            email: c.email,
            scheduleDescription: c.schedule_description || '',
            regularDays: c.regular_days || [],
            regularTime: c.regular_time || '',
            assignedCourtIds: c.assigned_court_ids || [],
            memberCount: Number(c.member_count || 0),
            duprLevel: c.dupr_level || '',
            monthlyFee: Number(c.monthly_fee || 0),
            badge: c.badge || 'CLB BSB',
            coverImage: c.cover_image || '',
            color: c.color || '#11385E',
            tags: c.tags || [],
            status: c.status || 'ACTIVE',
            isOpenForMembers: c.is_open_for_members ?? true,
            notes: c.notes,
            createdAt: c.created_at
          }));
        }
      } catch (err) {
        console.error('Supabase getClubs error:', err);
      }
    }

    if (clubs.length === 0) {
      const allClubs = getStoredItem<Club[]>(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);
      clubs = includeInactive ? allClubs : allClubs.filter(c => c.status === 'ACTIVE');
    }

    return clubs;
  },

  async createClub(newClub: Omit<Club, 'id' | 'createdAt'>): Promise<Club> {
    const club: Club = {
      ...newClub,
      id: 'club-' + Date.now(),
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('clubs').insert([{
          id: club.id,
          name: club.name,
          short_name: club.shortName,
          tagline: club.tagline,
          description: club.description,
          leader_name: club.leaderName,
          leader_phone: club.leaderPhone,
          email: club.email,
          schedule_description: club.scheduleDescription,
          regular_days: club.regularDays,
          regular_time: club.regularTime,
          assigned_court_ids: club.assignedCourtIds,
          member_count: club.memberCount,
          dupr_level: club.duprLevel,
          monthly_fee: club.monthlyFee,
          badge: club.badge,
          cover_image: club.coverImage,
          color: club.color,
          tags: club.tags,
          status: club.status,
          is_open_for_members: club.isOpenForMembers,
          notes: club.notes
        }]);
      } catch (err) {
        console.error('Supabase insert club failed:', err);
      }
    }

    const currentClubs = getStoredItem<Club[]>(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);
    const updated = [club, ...currentClubs];
    setStoredItem(STORAGE_KEYS.CLUBS, updated);
    return club;
  },

  async updateClub(id: string, updates: Partial<Club>): Promise<Club[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('clubs').update({
          name: updates.name,
          leader_name: updates.leaderName,
          leader_phone: updates.leaderPhone,
          status: updates.status,
          member_count: updates.memberCount,
          updated_at: new Date().toISOString()
        }).eq('id', id);
      } catch (err) {
        console.error('Supabase update club failed:', err);
      }
    }

    const currentClubs = getStoredItem<Club[]>(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);
    const updated = currentClubs.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c);
    setStoredItem(STORAGE_KEYS.CLUBS, updated);
    return updated;
  },

  // BOOKINGS (All 5 Types)
  async getBookings(): Promise<Booking[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('bookings').select('*').order('date', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map((b: any) => ({
            id: b.id,
            bookingCode: b.booking_code,
            bookingType: b.booking_type,
            courtId: b.court_id,
            courtName: b.court_name,
            courtIds: b.court_ids || (b.court_id ? [b.court_id] : []),
            customerName: b.customer_name,
            customerPhone: b.customer_phone,
            customerEmail: b.customer_email,
            clubId: b.club_id,
            clubName: b.club_name,
            title: b.title,
            organizerName: b.organizer_name,
            participantCount: b.participant_count,
            teamCount: b.team_count,
            eventType: b.event_type,
            selectedServices: b.selected_services || [],
            setupMinutes: b.setup_minutes || 0,
            cleanupMinutes: b.cleanup_minutes || 0,
            date: b.date,
            startTime: b.start_time,
            endTime: b.end_time,
            durationHours: Number(b.duration_hours || 1),
            selectedDays: b.selected_days || [],
            durationMonths: b.duration_months,
            subtotal: Number(b.subtotal || 0),
            discountAmount: Number(b.discount_amount || 0),
            totalAmount: Number(b.total_amount || 0),
            depositAmount: Number(b.deposit_amount || 0),
            paymentStatus: b.payment_status,
            bookingStatus: b.booking_status,
            holdExpiresAt: b.hold_expires_at,
            checkinTime: b.checkin_time,
            noShowReason: b.no_show_reason,
            lastReminderSentAt: b.last_reminder_sent_at,
            notes: b.notes,
            createdByRole: b.created_by_role,
            createdAt: b.created_at
          }));
        }
      } catch (err) {
        console.error('Supabase getBookings error:', err);
      }
    }

    return getStoredItem<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  },

  async createBooking(booking: Booking): Promise<Booking> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('bookings').insert([{
          id: booking.id,
          booking_code: booking.bookingCode,
          booking_type: booking.bookingType,
          court_id: booking.courtId,
          court_name: booking.courtName,
          court_ids: booking.courtIds || [booking.courtId],
          customer_name: booking.customerName,
          customer_phone: booking.customerPhone,
          customer_email: booking.customerEmail,
          club_id: booking.clubId,
          club_name: booking.clubName,
          title: booking.title,
          organizer_name: booking.organizerName,
          participant_count: booking.participantCount,
          team_count: booking.teamCount,
          event_type: booking.eventType,
          selected_services: booking.selectedServices,
          setup_minutes: booking.setupMinutes,
          cleanup_minutes: booking.cleanupMinutes,
          date: booking.date,
          start_time: booking.startTime,
          end_time: booking.endTime,
          duration_hours: booking.durationHours,
          selected_days: booking.selectedDays,
          duration_months: booking.durationMonths,
          subtotal: booking.subtotal,
          discount_amount: booking.discountAmount,
          total_amount: booking.totalAmount,
          deposit_amount: booking.depositAmount,
          payment_status: booking.paymentStatus,
          booking_status: booking.bookingStatus,
          hold_expires_at: booking.holdExpiresAt,
          checkin_time: booking.checkinTime,
          no_show_reason: booking.noShowReason,
          last_reminder_sent_at: booking.lastReminderSentAt,
          notes: booking.notes,
          created_by_role: booking.createdByRole || 'customer'
        }]);
      } catch (err) {
        console.error('Supabase createBooking error:', err);
      }
    }

    const currentBookings = getStoredItem<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const updated = [booking, ...currentBookings];
    setStoredItem(STORAGE_KEYS.BOOKINGS, updated);
    return booking;
  },

  async updateBookingStatus(
    id: string, 
    status: BookingStatus, 
    paymentStatus?: 'pending' | 'paid' | 'deposit_paid',
    extraFields?: { checkinTime?: string; noShowReason?: string; lastReminderSentAt?: string }
  ): Promise<Booking[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const updatePayload: any = { 
          booking_status: status, 
          updated_at: new Date().toISOString(),
          ...(extraFields?.checkinTime !== undefined ? { checkin_time: extraFields.checkinTime } : (status === 'CHECKED_IN' ? { checkin_time: new Date().toISOString() } : {})),
          ...(extraFields?.noShowReason !== undefined ? { no_show_reason: extraFields.noShowReason } : {}),
          ...(extraFields?.lastReminderSentAt !== undefined ? { last_reminder_sent_at: extraFields.lastReminderSentAt } : {})
        };
        if (paymentStatus) updatePayload.payment_status = paymentStatus;
        await supabase.from('bookings').update(updatePayload).eq('id', id);
      } catch (err) {
        console.error('Supabase updateBookingStatus error:', err);
      }
    }

    const currentBookings = getStoredItem<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const updated = currentBookings.map(b => {
      if (b.id === id) {
        return {
          ...b,
          bookingStatus: status,
          ...(paymentStatus ? { paymentStatus } : {}),
          checkinTime: extraFields?.checkinTime !== undefined ? extraFields.checkinTime : (status === 'CHECKED_IN' ? new Date().toISOString() : b.checkinTime),
          noShowReason: extraFields?.noShowReason !== undefined ? extraFields.noShowReason : b.noShowReason,
          lastReminderSentAt: extraFields?.lastReminderSentAt !== undefined ? extraFields.lastReminderSentAt : b.lastReminderSentAt,
          updatedAt: new Date().toISOString()
        };
      }
      return b;
    });
    setStoredItem(STORAGE_KEYS.BOOKINGS, updated);
    return updated;
  },

  async deleteBooking(id: string): Promise<Booking[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('bookings').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase deleteBooking error:', err);
      }
    }

    const currentBookings = getStoredItem<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const updated = currentBookings.filter(b => b.id !== id);
    setStoredItem(STORAGE_KEYS.BOOKINGS, updated);
    return updated;
  },

  // MINITOURS
  async getMinitours(): Promise<Minitour[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('minitours').select('*').order('date', { ascending: true });
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.error('Supabase getMinitours error:', err);
      }
    }
    return getStoredItem<Minitour[]>(STORAGE_KEYS.MINITOURS, INITIAL_MINITOURS);
  },

  async updateMinitour(minitour: Minitour): Promise<Minitour[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('minitours').upsert(minitour);
      } catch (err) {
        console.error('Supabase updateMinitour error:', err);
      }
    }
    const current = getStoredItem<Minitour[]>(STORAGE_KEYS.MINITOURS, INITIAL_MINITOURS);
    const updated = current.map(t => t.id === minitour.id ? minitour : t);
    setStoredItem(STORAGE_KEYS.MINITOURS, updated);
    return updated;
  },

  // Reset to Demo Seed Data
  resetToDemoSeed(): void {
    setStoredItem(STORAGE_KEYS.COURTS, INITIAL_COURTS);
    setStoredItem(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);
    setStoredItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    setStoredItem(STORAGE_KEYS.MINITOURS, INITIAL_MINITOURS);
    setStoredItem(STORAGE_KEYS.PRICING, INITIAL_PRICING_RULES);
    setStoredItem(STORAGE_KEYS.BLOCKS, INITIAL_COURT_BLOCKS);
    setStoredItem(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
  }
};

// ============================================================================
// CONFLICT & ANTI-COLLISION ENGINE
// ============================================================================

export function checkSlotConflict(
  existingBookings: Booking[],
  candidate: {
    courtIds: string[];
    date: string;
    startTime: string;
    endTime: string;
    excludeBookingId?: string;
  }
): { hasConflict: boolean; conflictingBooking?: Booking; reason?: string } {
  const parseMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const candStart = parseMin(candidate.startTime);
  const candEnd = parseMin(candidate.endTime);

  for (const b of existingBookings) {
    if (candidate.excludeBookingId && b.id === candidate.excludeBookingId) continue;
    if (b.bookingStatus === 'CANCELLED' || b.bookingStatus === 'REJECTED' || b.bookingStatus === 'NO_SHOW') continue;

    // Check temporary HOLD expiry (5 minutes)
    if (b.bookingStatus === 'HOLD' && b.holdExpiresAt) {
      const expires = new Date(b.holdExpiresAt).getTime();
      if (Date.now() > expires) continue; // Expired hold, ignore
    }

    // Match Date
    if (b.date !== candidate.date) continue;

    // Match Court Overlap
    const bCourtIds = b.courtIds && b.courtIds.length > 0 ? b.courtIds : [b.courtId];
    const sharedCourt = candidate.courtIds.some(cid => bCourtIds.includes(cid));
    if (!sharedCourt) continue;

    // Check Time Interval Overlap (with setup/cleanup buffer)
    const bSetup = b.setupMinutes || 0;
    const bCleanup = b.cleanupMinutes || 0;
    const bStart = Math.max(0, parseMin(b.startTime) - bSetup);
    const bEnd = parseMin(b.endTime) + bCleanup;

    const isOverlap = Math.max(candStart, bStart) < Math.min(candEnd, bEnd);
    if (isOverlap) {
      return {
        hasConflict: true,
        conflictingBooking: b,
        reason: `Trùng giờ với mã đặt [${b.bookingCode}] (${b.courtName} • ${b.startTime} - ${b.endTime} • Trạng thái: ${b.bookingStatus})`
      };
    }
  }

  return { hasConflict: false };
}
