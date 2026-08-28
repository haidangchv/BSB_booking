import { Booking, BookingStatus } from '../types';

/**
 * Calculates the dynamic real-time status of a booking based on the Check-in lifecycle rules:
 * - Before game:
 *    - >15m before start: CONFIRMED
 *    - <=15m before start until start + 30m: CHECKIN_PENDING (Chờ check-in)
 * - Admin checks in: CHECKED_IN
 * - After play time:
 *    - If checked in: COMPLETED (Hoàn tất)
 *    - If NOT checked in within 30 minutes after start time: NO_SHOW (Khách không đến & Tự động giải phóng sân)
 * - Unapproved PENDING/HOLD past end time: CANCELLED
 */
export function getDynamicBookingStatus(
  booking: Booking,
  currentDateIso?: string,
  nowMinutes?: number
): BookingStatus {
  // If explicitly cancelled, rejected, or marked as no-show
  if (
    booking.bookingStatus === 'CANCELLED' ||
    booking.bookingStatus === 'REJECTED' ||
    booking.bookingStatus === 'NO_SHOW'
  ) {
    return booking.bookingStatus;
  }

  const now = new Date();
  const todayIso = currentDateIso || now.toISOString().split('T')[0];
  const currentMin = nowMinutes !== undefined ? nowMinutes : (now.getHours() * 60 + now.getMinutes());

  const parseTime = (t: string) => {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const startMin = parseTime(booking.startTime);
  const endMin = parseTime(booking.endTime);

  const isPastDay = booking.date < todayIso;
  const isToday = booking.date === todayIso;
  const isFutureDay = booking.date > todayIso;

  // 1. Unapproved bookings (HOLD or PENDING) that have passed their game time
  if (booking.bookingStatus === 'HOLD' || booking.bookingStatus === 'PENDING') {
    if (isPastDay || (isToday && endMin <= currentMin)) {
      return 'CANCELLED';
    }
    return booking.bookingStatus;
  }

  // 2. Already Checked-in bookings
  if (booking.bookingStatus === 'CHECKED_IN' || booking.checkinTime) {
    // If play duration has ended -> COMPLETED
    if (isPastDay || (isToday && endMin <= currentMin)) {
      return 'COMPLETED';
    }
    return 'CHECKED_IN';
  }

  // 3. Completed bookings
  if (booking.bookingStatus === 'COMPLETED') {
    return 'COMPLETED';
  }

  // 4. Approved bookings (CONFIRMED or CHECKIN_PENDING)
  if (booking.bookingStatus === 'CONFIRMED' || booking.bookingStatus === 'CHECKIN_PENDING') {
    // Case 4A: Past day or > 30 minutes after start time and still not checked-in -> NO_SHOW (Release court)
    if (isPastDay || (isToday && currentMin >= startMin + 30)) {
      return 'NO_SHOW';
    }

    // Case 4B: Within 15 minutes before start time until start + 30 minutes -> CHECKIN_PENDING
    if (isToday && currentMin >= startMin - 15 && currentMin < startMin + 30) {
      return 'CHECKIN_PENDING';
    }

    // Case 4C: More than 15 minutes before start time -> CONFIRMED
    return 'CONFIRMED';
  }

  return booking.bookingStatus;
}

/**
 * Checks if a booking is in the grace period (15m to 30m after start time without check-in)
 */
export function isGracePeriodWarning(booking: Booking, currentDateIso?: string, nowMinutes?: number): boolean {
  if (booking.bookingStatus !== 'CHECKIN_PENDING' || booking.checkinTime) return false;
  const now = new Date();
  const todayIso = currentDateIso || now.toISOString().split('T')[0];
  const currentMin = nowMinutes !== undefined ? nowMinutes : (now.getHours() * 60 + now.getMinutes());
  if (booking.date !== todayIso) return false;

  const [h, m] = booking.startTime.split(':').map(Number);
  const startMin = (h || 0) * 60 + (m || 0);

  return currentMin >= startMin + 15 && currentMin < startMin + 30;
}

/**
 * Sweeps a list of bookings and applies dynamic lifecycle status transitions
 */
export function syncBookingsLifecycle(
  bookings: Booking[],
  currentDateIso?: string,
  nowMinutes?: number
): { updatedBookings: Booking[]; hasChanges: boolean } {
  let hasChanges = false;
  const updatedBookings = bookings.map(b => {
    const effectiveStatus = getDynamicBookingStatus(b, currentDateIso, nowMinutes);
    if (b.bookingStatus !== effectiveStatus) {
      hasChanges = true;
      return {
        ...b,
        bookingStatus: effectiveStatus,
        noShowReason: effectiveStatus === 'NO_SHOW' && !b.noShowReason 
          ? 'Quá 30 phút chưa check-in (Tự động giải phóng sân)' 
          : b.noShowReason,
        updatedAt: new Date().toISOString()
      };
    }
    return b;
  });

  return { updatedBookings, hasChanges };
}
