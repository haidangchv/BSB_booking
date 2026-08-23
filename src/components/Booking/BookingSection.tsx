import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Clock, CheckCircle2, Shield, Sparkles, MapPin, 
  Users, Award, ChevronRight, Info, AlertCircle, QrCode, 
  CreditCard, Phone, User, Check, RefreshCw, Layers, ArrowRight,
  Flame, Trophy, Search, AlertTriangle, Timer, X, Copy, ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Court, Booking, BookingType, Club, BookingStatus } from '../../types';
import { BSB_INFO, BSB_COLORS, EVENT_SERVICES } from '../../data/mockData';
import { checkSlotConflict } from '../../lib/supabase';
import { BSBLogo } from '../BSBLogo';

interface BookingSectionProps {
  courts: Court[];
  clubs: Club[];
  bookings: Booking[];
  onAddBooking: (booking: Booking) => void;
  onNavigateToClubs?: () => void;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  courts,
  clubs,
  bookings,
  onAddBooking,
  onNavigateToClubs
}) => {
  // 5 Booking Types: 'clb' | 'minitour' | 'fixed' | 'casual' | 'event'
  const [bookingType, setBookingType] = useState<BookingType>('casual');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [filterCourtId, setFilterCourtId] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // --- Date & Court Selection ---
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedCourtId, setSelectedCourtId] = useState<string>(courts[0]?.id || 'court-1');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  
  // 5-minute HOLD Timer state
  const [holdSecondsLeft, setHoldSecondsLeft] = useState<number | null>(null);

  // --- Add-ons for Casual ---
  const [rentPaddle, setRentPaddle] = useState<number>(0);
  const [rentBalls, setRentBalls] = useState<boolean>(false);
  const [rentBallMachine, setRentBallMachine] = useState<boolean>(false);
  
  // --- CLB Booking State (Active Clubs Only) ---
  const activeClubs = useMemo(() => clubs.filter(c => c.status === 'ACTIVE'), [clubs]);
  const [selectedClubId, setSelectedClubId] = useState<string>(activeClubs[0]?.id || '');
  const [clubSearchTerm, setClubSearchTerm] = useState<string>('');
  const [clubContactPerson, setClubContactPerson] = useState<string>('');
  const [clubNotes, setClubNotes] = useState<string>('');

  // Auto-sync contact person when selecting club
  const selectedClub = useMemo(() => {
    return activeClubs.find(c => c.id === selectedClubId) || activeClubs[0];
  }, [activeClubs, selectedClubId]);

  // --- Minitour Booking State ---
  const [minitourTitle, setMinitourTitle] = useState<string>('Giải Đấu Mini Giao Lưu BSB');
  const [minitourOrganizer, setMinitourOrganizer] = useState<string>('');
  const [minitourPhone, setMinitourPhone] = useState<string>('');
  const [minitourTeamsCount, setMinitourTeamsCount] = useState<number>(8);
  const [minitourCourts, setMinitourCourts] = useState<string[]>(['court-1', 'court-2']);
  const [minitourFormatNotes, setMinitourFormatNotes] = useState<string>('Thi đấu loại trực tiếp 1 set chạm 11 điểm');

  // --- Fixed Booking State ---
  const [fixedDays, setFixedDays] = useState<number[]>([1, 3, 5]); // 1=T2, 3=T4, 5=T6
  const [fixedCourtId, setFixedCourtId] = useState<string>(courts[1]?.id || 'court-2');
  const [fixedTimeSlot, setFixedTimeSlot] = useState<string>('18:00 - 20:00');
  const [fixedDurationMonths, setFixedDurationMonths] = useState<number>(3);
  const [fixedStartDate, setFixedStartDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [fixedFrequency, setFixedFrequency] = useState<'weekly' | 'biweekly'>('weekly');

  // --- Event Booking State ---
  const [eventDate, setEventDate] = useState<string>(
    new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [eventTimeRange, setEventTimeRange] = useState<string>('13:00 - 18:00');
  const [eventSelectedCourts, setEventSelectedCourts] = useState<string[]>(['court-1', 'court-2', 'court-3']);
  const [eventAttendees, setEventAttendees] = useState<number>(40);
  const [eventTitle, setEventTitle] = useState<string>('Hội Thao Doanh Nghiệp BSB 2026');
  const [selectedEventServices, setSelectedEventServices] = useState<string[]>([
    'sound_system', 'referee', 'catering'
  ]);
  const [eventSetupMins, setEventSetupMins] = useState<number>(30);
  const [eventCleanupMins, setEventCleanupMins] = useState<number>(30);
  const [eventType, setEventType] = useState<string>('corporate');

  // --- Common Customer Info & Checkout Modal ---
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [agreePolicy, setAgreePolicy] = useState<boolean>(true);
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Success Modal & Details
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [lastCreatedBooking, setLastCreatedBooking] = useState<Booking | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Available time slots from 05:30 to 23:00
  const timeSlots = useMemo(() => [
    '05:30 - 06:30', '06:30 - 07:30', '07:30 - 08:30', '08:30 - 09:30',
    '09:30 - 10:30', '10:30 - 11:30', '11:30 - 12:30', '13:00 - 14:00',
    '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00',
    '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00', '22:00 - 23:00'
  ], []);

  // Quick 7 days for day selector
  const dateOptions = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const dayLabel = i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : `${dayNames[d.getDay()]} (${d.getDate()}/${d.getMonth() + 1})`;
      dates.push({ date: iso, label: dayLabel, isWeekend: d.getDay() === 0 || d.getDay() === 6 });
    }
    return dates;
  }, []);

  const selectedCourt = courts.find(c => c.id === selectedCourtId) || courts[0];
  const fixedCourt = courts.find(c => c.id === fixedCourtId) || courts[1];

  // 5-minute Hold countdown effect
  useEffect(() => {
    if (selectedSlots.length > 0 && holdSecondsLeft === null) {
      setHoldSecondsLeft(300); // 5 minutes = 300 seconds
    } else if (selectedSlots.length === 0) {
      setHoldSecondsLeft(null);
    }
  }, [selectedSlots.length, holdSecondsLeft]);

  useEffect(() => {
    if (holdSecondsLeft === null) return;
    if (holdSecondsLeft <= 0) {
      setSelectedSlots([]);
      setHoldSecondsLeft(null);
      alert('Thời gian giữ chỗ tạm thời 5 phút đã hết. Khung giờ được tự động giải phóng.');
      return;
    }
    const timer = setInterval(() => {
      setHoldSecondsLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [holdSecondsLeft]);

  // Check if slot on a specific court and date is occupied
  const getSlotBookingInfo = (courtId: string, slotStr: string, dateStr: string) => {
    const [start, end] = slotStr.split(' - ');
    return bookings.find(b => {
      if (b.bookingStatus === 'CANCELLED' || b.bookingStatus === 'REJECTED') return false;
      const bCourtIds = b.courtIds && b.courtIds.length > 0 ? b.courtIds : [b.courtId];
      if (!bCourtIds.includes(courtId)) return false;

      // Casual / CLB / Minitour / Event
      if (b.bookingType === 'casual' || b.bookingType === 'clb' || b.bookingType === 'minitour' || b.bookingType === 'event') {
        return b.date === dateStr && b.startTime <= start && b.endTime >= end;
      }
      // Fixed
      if (b.bookingType === 'fixed') {
        const checkDay = new Date(dateStr).getDay();
        return b.selectedDays?.includes(checkDay) && b.startTime <= start && b.endTime >= end;
      }
      return false;
    });
  };

  // Toggle slot for casual
  const handleToggleSlot = (slot: string) => {
    setConflictError(null);
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot].sort());
    }
  };

  // Fixed Booking Conflict Preview Calculator
  const fixedRecurringPreview = useMemo(() => {
    if (!fixedCourt) return [];
    const previewList = [];
    const [startTime, endTime] = fixedTimeSlot.split(' - ');
    const startDateObj = new Date(fixedStartDate);
    const totalWeeks = Math.round(fixedDurationMonths * 4.3);

    for (let w = 0; w < totalWeeks; w++) {
      for (const day of fixedDays) {
        const current = new Date(startDateObj);
        const dayOffset = (day - current.getDay() + 7) % 7 + (w * 7);
        current.setDate(startDateObj.getDate() + dayOffset);
        const iso = current.toISOString().split('T')[0];

        // Check conflict with other bookings
        const conflict = checkSlotConflict(bookings, {
          courtIds: [fixedCourtId],
          date: iso,
          startTime,
          endTime
        });

        previewList.push({
          date: iso,
          dayName: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][current.getDay()],
          hasConflict: conflict.hasConflict,
          conflictReason: conflict.reason
        });
      }
    }
    return previewList;
  }, [fixedCourt, fixedStartDate, fixedDurationMonths, fixedDays, fixedTimeSlot, bookings, fixedCourtId]);

  // Pricing for Casual
  const casualPricing = useMemo(() => {
    if (!selectedCourt) return { courtTotal: 0, addOns: 0, total: 0 };
    let courtTotal = 0;
    selectedSlots.forEach(slot => {
      const hour = parseInt(slot.split(':')[0], 10);
      const isPeak = hour >= 16;
      courtTotal += isPeak ? selectedCourt.hourlyRatePeak : selectedCourt.hourlyRateNormal;
    });
    const addOns = (rentPaddle * 40000 * selectedSlots.length) + 
                    (rentBalls ? 30000 : 0) + 
                    (rentBallMachine ? 100000 * selectedSlots.length : 0);
    return { courtTotal, addOns, total: courtTotal + addOns };
  }, [selectedCourt, selectedSlots, rentPaddle, rentBalls, rentBallMachine]);

  // Pricing for CLB (with 10% Club Perk)
  const clbPricing = useMemo(() => {
    if (!selectedCourt) return { courtTotal: 0, discount: 0, total: 0 };
    let raw = 0;
    selectedSlots.forEach(slot => {
      const hour = parseInt(slot.split(':')[0], 10);
      const isPeak = hour >= 16;
      raw += isPeak ? selectedCourt.hourlyRatePeak : selectedCourt.hourlyRateNormal;
    });
    const discount = Math.round(raw * 0.10); // 10% off for verified clubs
    return { courtTotal: raw, discount, total: Math.max(0, raw - discount) };
  }, [selectedCourt, selectedSlots]);

  // Pricing for Fixed
  const fixedPricing = useMemo(() => {
    if (!fixedCourt) return { sessionsCount: 0, rawTotal: 0, discount: 0, finalTotal: 0, deposit: 0 };
    const sessionsPerWeek = fixedDays.length;
    const totalSessions = Math.round(sessionsPerWeek * 4.3 * fixedDurationMonths);
    const hoursPerSession = 2;
    const isPeakHour = fixedTimeSlot.includes('18:') || fixedTimeSlot.includes('20:');
    const rate = isPeakHour ? fixedCourt.hourlyRatePeak : fixedCourt.hourlyRateNormal;
    const rawTotal = totalSessions * (rate * hoursPerSession);
    const discountRate = fixedDurationMonths >= 6 ? 0.20 : 0.15;
    const discount = Math.round(rawTotal * discountRate);
    const finalTotal = rawTotal - discount;
    const deposit = Math.round(finalTotal * 0.3);
    return { sessionsCount: totalSessions, rawTotal, discount, finalTotal, deposit };
  }, [fixedCourt, fixedDays, fixedTimeSlot, fixedDurationMonths]);

  // Pricing for Minitour
  const minitourPricing = useMemo(() => {
    const hours = 7; // Average tournament duration
    const courtRate = 200000;
    const baseFee = minitourCourts.length * courtRate * hours;
    const total = baseFee;
    return { total, courtsCount: minitourCourts.length, hours };
  }, [minitourCourts]);

  // Pricing for Event
  const eventPricing = useMemo(() => {
    const hours = 5;
    const baseCourtFee = eventSelectedCourts.length * 220000 * hours;
    let servicesTotal = 0;
    selectedEventServices.forEach(srvId => {
      const srv = EVENT_SERVICES.find(s => s.id === srvId);
      if (srv) {
        if (srv.isPerPerson) {
          servicesTotal += srv.price * eventAttendees;
        } else {
          servicesTotal += srv.price;
        }
      }
    });
    const subtotal = baseCourtFee + servicesTotal;
    const discount = Math.round(subtotal * 0.08);
    const total = subtotal - discount;
    const deposit = Math.round(total * 0.5);
    return { baseCourtFee, servicesTotal, discount, total, deposit };
  }, [eventSelectedCourts, selectedEventServices, eventAttendees]);

  // SUBMIT BOOKING
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    const randomCode = 'BSB-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
    const nowIso = new Date().toISOString();

    let newBooking: Booking;

    // 1. CLB BOOKING
    if (bookingType === 'clb') {
      if (!selectedClub) {
        alert('Vui lòng chọn Câu Lạc Bộ trong danh sách.');
        return;
      }
      if (selectedSlots.length === 0) {
        alert('Vui lòng chọn ít nhất 1 khung giờ cho buổi sinh hoạt CLB.');
        return;
      }
      const startTime = selectedSlots[0].split(' - ')[0];
      const endTime = selectedSlots[selectedSlots.length - 1].split(' - ')[1];

      // Conflict Check
      const conflict = checkSlotConflict(bookings, {
        courtIds: [selectedCourtId],
        date: selectedDate,
        startTime,
        endTime
      });
      if (conflict.hasConflict) {
        setConflictError(conflict.reason || 'Khung giờ này đã có lịch đặt.');
        return;
      }

      newBooking = {
        id: 'bk-' + Date.now(),
        bookingCode: randomCode,
        bookingType: 'clb',
        courtId: selectedCourtId,
        courtName: selectedCourt.name,
        courtIds: [selectedCourtId],
        customerName: clubContactPerson || selectedClub.leaderName,
        customerPhone: selectedClub.leaderPhone,
        customerEmail: selectedClub.email,
        clubId: selectedClub.id,
        clubName: selectedClub.name,
        date: selectedDate,
        startTime,
        endTime,
        durationHours: selectedSlots.length,
        subtotal: clbPricing.courtTotal,
        discountAmount: clbPricing.discount,
        totalAmount: clbPricing.total,
        depositAmount: clbPricing.total,
        paymentStatus: 'paid',
        bookingStatus: 'CONFIRMED',
        notes: clubNotes || `Sinh hoạt định kỳ CLB ${selectedClub.name}`,
        createdByRole: 'customer',
        createdAt: nowIso
      };
    }
    // 2. MINITOUR BOOKING
    else if (bookingType === 'minitour') {
      if (!minitourOrganizer.trim() || !minitourPhone.trim()) {
        alert('Vui lòng nhập Người phụ trách và Số điện thoại tổ chức minitour.');
        return;
      }
      if (minitourCourts.length === 0) {
        alert('Vui lòng chọn ít nhất 1 sân cho giải đấu.');
        return;
      }

      const startTime = '14:00';
      const endTime = '21:00';

      // Atomic Conflict Check for ALL requested courts
      const conflict = checkSlotConflict(bookings, {
        courtIds: minitourCourts,
        date: selectedDate,
        startTime,
        endTime
      });
      if (conflict.hasConflict) {
        setConflictError(conflict.reason || 'Một hoặc nhiều sân đã bị trùng lịch trong khung giờ minitour.');
        return;
      }

      newBooking = {
        id: 'bk-' + Date.now(),
        bookingCode: randomCode,
        bookingType: 'minitour',
        courtId: minitourCourts[0],
        courtName: `Cụm ${minitourCourts.length} Sân (${minitourCourts.map(cid => courts.find(c => c.id === cid)?.name).join(', ')})`,
        courtIds: minitourCourts,
        customerName: minitourOrganizer,
        customerPhone: minitourPhone,
        title: minitourTitle,
        organizerName: minitourOrganizer,
        teamCount: minitourTeamsCount,
        date: selectedDate,
        startTime,
        endTime,
        durationHours: 7,
        subtotal: minitourPricing.total,
        discountAmount: 0,
        totalAmount: minitourPricing.total,
        depositAmount: Math.round(minitourPricing.total * 0.5),
        paymentStatus: 'deposit_paid',
        bookingStatus: 'PENDING',
        notes: minitourFormatNotes,
        createdByRole: 'customer',
        createdAt: nowIso
      };
    }
    // 3. FIXED BOOKING
    else if (bookingType === 'fixed') {
      if (!customerName.trim() || !customerPhone.trim()) {
        alert('Vui lòng nhập Họ tên / Đơn vị và Số điện thoại.');
        return;
      }
      if (fixedDays.length === 0) {
        alert('Vui lòng chọn ít nhất 1 ngày trong tuần.');
        return;
      }

      const [startTime, endTime] = fixedTimeSlot.split(' - ');
      const hasConflict = fixedRecurringPreview.some(p => p.hasConflict);

      newBooking = {
        id: 'bk-' + Date.now(),
        bookingCode: randomCode,
        bookingType: 'fixed',
        courtId: fixedCourtId,
        courtName: fixedCourt.name,
        courtIds: [fixedCourtId],
        customerName,
        customerPhone,
        customerEmail,
        date: fixedStartDate,
        startTime,
        endTime,
        durationHours: 2,
        selectedDays: fixedDays,
        durationMonths: fixedDurationMonths,
        recurrence: {
          frequency: fixedFrequency,
          interval: fixedFrequency === 'weekly' ? 1 : 2,
          weekdays: fixedDays,
          startDate: fixedStartDate,
          endDate: new Date(new Date(fixedStartDate).setMonth(new Date(fixedStartDate).getMonth() + fixedDurationMonths)).toISOString().split('T')[0],
          occurrencesTotal: fixedPricing.sessionsCount,
          conflictingDates: fixedRecurringPreview.filter(p => p.hasConflict).map(p => p.date)
        },
        subtotal: fixedPricing.rawTotal,
        discountAmount: fixedPricing.discount,
        totalAmount: fixedPricing.finalTotal,
        depositAmount: fixedPricing.deposit,
        paymentStatus: 'deposit_paid',
        bookingStatus: hasConflict ? 'PENDING' : 'CONFIRMED',
        notes: customerNotes || `Lịch cố định ${fixedDurationMonths} tháng (${fixedDays.map(d => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d]).join(', ')})`,
        createdByRole: 'customer',
        createdAt: nowIso
      };
    }
    // 4. CASUAL BOOKING
    else if (bookingType === 'casual') {
      if (!customerName.trim() || !customerPhone.trim()) {
        alert('Vui lòng nhập Họ tên và Số điện thoại.');
        return;
      }
      if (selectedSlots.length === 0) {
        alert('Vui lòng chọn ít nhất 1 khung giờ.');
        return;
      }

      const startTime = selectedSlots[0].split(' - ')[0];
      const endTime = selectedSlots[selectedSlots.length - 1].split(' - ')[1];

      // Anti-Collision Check
      const conflict = checkSlotConflict(bookings, {
        courtIds: [selectedCourtId],
        date: selectedDate,
        startTime,
        endTime
      });
      if (conflict.hasConflict) {
        setConflictError(conflict.reason || 'Khung giờ này vừa có người đặt.');
        return;
      }

      newBooking = {
        id: 'bk-' + Date.now(),
        bookingCode: randomCode,
        bookingType: 'casual',
        courtId: selectedCourtId,
        courtName: selectedCourt.name,
        courtIds: [selectedCourtId],
        customerName,
        customerPhone,
        customerEmail,
        date: selectedDate,
        startTime,
        endTime,
        durationHours: selectedSlots.length,
        subtotal: casualPricing.courtTotal,
        discountAmount: 0,
        totalAmount: casualPricing.total,
        depositAmount: casualPricing.total,
        paymentStatus: 'paid',
        bookingStatus: 'CONFIRMED',
        notes: customerNotes || (rentPaddle > 0 ? `Thuê ${rentPaddle} vợt` : ''),
        createdByRole: 'customer',
        createdAt: nowIso
      };
    }
    // 5. EVENT BOOKING
    else {
      if (!customerName.trim() || !customerPhone.trim()) {
        alert('Vui lòng nhập Đơn vị / Đại diện và Số điện thoại.');
        return;
      }
      const [startTime, endTime] = eventTimeRange.split(' - ');

      // Multi-court Atomic Conflict Check
      const conflict = checkSlotConflict(bookings, {
        courtIds: eventSelectedCourts,
        date: eventDate,
        startTime,
        endTime
      });
      if (conflict.hasConflict) {
        setConflictError(conflict.reason || 'Một trong các sân đã có lịch trong khung giờ này.');
        return;
      }

      newBooking = {
        id: 'bk-' + Date.now(),
        bookingCode: randomCode,
        bookingType: 'event',
        courtId: eventSelectedCourts[0],
        courtName: `Cụm ${eventSelectedCourts.length} Sân Sự Kiện (${eventSelectedCourts.map(id => courts.find(c => c.id === id)?.name).join(', ')})`,
        courtIds: eventSelectedCourts,
        customerName,
        customerPhone,
        customerEmail,
        title: eventTitle,
        organizerName: customerName,
        participantCount: eventAttendees,
        eventType,
        selectedServices: selectedEventServices,
        setupMinutes: eventSetupMins,
        cleanupMinutes: eventCleanupMins,
        date: eventDate,
        startTime,
        endTime,
        durationHours: 5,
        subtotal: eventPricing.baseCourtFee + eventPricing.servicesTotal,
        discountAmount: eventPricing.discount,
        totalAmount: eventPricing.total,
        depositAmount: eventPricing.deposit,
        paymentStatus: 'deposit_paid',
        bookingStatus: 'PENDING',
        notes: customerNotes || `Sự kiện ${eventTitle} (${eventAttendees} người tham dự)`,
        createdByRole: 'customer',
        createdAt: nowIso
      };
    }

    // Trigger state save
    onAddBooking(newBooking);
    setLastCreatedBooking(newBooking);
    setIsSuccessModalOpen(true);
    setSelectedSlots([]);
    setHoldSecondsLeft(null);

    // Confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  const handleCopyBookingCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <section id="booking-section" className="py-8 px-4 max-w-7xl mx-auto font-sans">
      {/* Brand Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#11385E]/10 border border-[#11385E]/20 text-[#11385E] text-xs font-bold tracking-wider uppercase mb-3">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          Hệ Thống Đặt Sân Tự Động 24/7 • BSB PICKLEBALL
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          ĐẶT SÂN PICKLEBALL BSB
        </h2>
        <p className="text-slate-500 text-xs md:text-sm mt-2 max-w-xl mx-auto">
          6 sân tiêu chuẩn quốc tế USAPA, mặt đệm Laykold 8 lớp êm ái, hệ thống đèn chống chói 800-1000 Lux và phòng thay đồ tiện nghi.
        </p>
      </div>

      {/* 5 Main Booking Segmented Tabs according to PRD */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 gap-1 max-w-4xl w-full overflow-x-auto shadow-xs">
          {/* 1. CLB */}
          <button
            onClick={() => { setBookingType('clb'); setSelectedSlots([]); }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              bookingType === 'clb'
                ? 'bg-[#11385E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Users className="w-4 h-4 text-sky-400" />
            <span>1. CLB ({activeClubs.length})</span>
          </button>

          {/* 2. Minitour */}
          <button
            onClick={() => { setBookingType('minitour'); setSelectedSlots([]); }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              bookingType === 'minitour'
                ? 'bg-[#3E5168] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>2. Minitour</span>
          </button>

          {/* 3. Cố định */}
          <button
            onClick={() => { setBookingType('fixed'); setSelectedSlots([]); }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              bookingType === 'fixed'
                ? 'bg-[#676F84] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>3. Cố Định (-20%)</span>
          </button>

          {/* 4. Vãng lai */}
          <button
            onClick={() => { setBookingType('casual'); setSelectedSlots([]); }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              bookingType === 'casual'
                ? 'bg-[#A0AEBC] text-[#11385E] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Clock className="w-4 h-4 text-[#11385E]" />
            <span>4. Vãng Lai</span>
          </button>

          {/* 5. Sự kiện */}
          <button
            onClick={() => { setBookingType('event'); setSelectedSlots([]); }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              bookingType === 'event'
                ? 'bg-[#647A82] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Award className="w-4 h-4 text-indigo-300" />
            <span>5. Sự Kiện</span>
          </button>
        </div>
      </div>

      {/* 5-minute Temporary Hold Floating Alert Banner */}
      {holdSecondsLeft !== null && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-xl mb-6 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Timer className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>
              Đang giữ chỗ tạm thời: <strong className="font-mono text-amber-700">{Math.floor(holdSecondsLeft / 60)}:{(holdSecondsLeft % 60).toString().padStart(2, '0')}</strong> phút. Vui lòng hoàn tất biểu mẫu để xác nhận.
            </span>
          </div>
          <button 
            onClick={() => { setSelectedSlots([]); setHoldSecondsLeft(null); }}
            className="text-xs text-amber-700 hover:text-amber-950 font-bold underline cursor-pointer"
          >
            Giải phóng slot
          </button>
        </div>
      )}

      {/* Conflict Error Message */}
      {conflictError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div className="text-xs font-semibold">
            <strong>Phát hiện trùng lịch:</strong> {conflictError}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CLB BOOKING FORM (Strictly Selected from Admin List - NO Create Input) */}
      {/* ========================================================================= */}
      {bookingType === 'clb' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Search & Select Existing Active Club */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#11385E]" />
                  Bước 1: Chọn Câu Lạc Bộ Sinh Hoạt
                </span>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {activeClubs.length} CLB Đang Hoạt Động
                </span>
              </div>

              {/* Search Box */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm câu lạc bộ theo tên, trình độ DUPR, lịch..."
                  value={clubSearchTerm}
                  onChange={(e) => setClubSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                />
              </div>

              {/* Clubs Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeClubs
                  .filter(c => c.name.toLowerCase().includes(clubSearchTerm.toLowerCase()) || c.duprLevel.toLowerCase().includes(clubSearchTerm.toLowerCase()))
                  .map((club) => {
                    const isSelected = selectedClub?.id === club.id;
                    return (
                      <div
                        key={club.id}
                        onClick={() => setSelectedClubId(club.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-blue-50/70 border-[#11385E] ring-2 ring-[#11385E]/20'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{club.name}</h4>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#11385E] shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{club.tagline}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-2">
                          <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{club.duprLevel}</span>
                          <span>{club.memberCount} VĐV</span>
                          <span>HLV: {club.leaderName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 font-medium">
                          {club.scheduleDescription}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Requirement Rule: If not in list, contact message */}
              <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Chưa thấy CLB của bạn? Vui lòng liên hệ BSB để được thêm vào hệ thống.</span>
                </div>
                <a 
                  href={`tel:${BSB_INFO.hotline}`}
                  className="font-bold text-amber-800 underline hover:text-amber-950 whitespace-nowrap pl-2"
                >
                  Hotline {BSB_INFO.hotline}
                </a>
              </div>
            </div>

            {/* Step 2: Choose Date & Court & Time */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-[#11385E]" />
                Bước 2: Chọn Ngày & Sân Cho CLB
              </span>

              {/* Date Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mb-4">
                {dateOptions.map((item) => (
                  <button
                    key={item.date}
                    type="button"
                    onClick={() => setSelectedDate(item.date)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                      selectedDate === item.date
                        ? 'bg-[#11385E] text-white border-[#11385E]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Court Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                {courts.map((court) => (
                  <button
                    key={court.id}
                    type="button"
                    onClick={() => { setSelectedCourtId(court.id); setSelectedSlots([]); }}
                    className={`p-2.5 rounded-xl text-center border text-xs transition-all cursor-pointer ${
                      selectedCourtId === court.id
                        ? 'bg-blue-50 border-[#11385E] font-bold text-[#11385E]'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold truncate">{court.name.split(' ')[0]} {court.name.split(' ')[1]}</div>
                    <div className="text-[10px] text-slate-500 truncate">{court.surface.slice(0, 15)}...</div>
                  </button>
                ))}
              </div>

              {/* Time Slots Matrix */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-2">Chọn khung giờ sinh hoạt (có thể chọn nhiều tiếng liên tiếp):</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => {
                    const bookingInfo = getSlotBookingInfo(selectedCourtId, slot, selectedDate);
                    const isSelected = selectedSlots.includes(slot);
                    const isOccupied = Boolean(bookingInfo);

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => handleToggleSlot(slot)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all text-center ${
                          isOccupied
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                            : isSelected
                              ? 'bg-[#11385E] text-white border-[#11385E] font-bold shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* CLB Summary & Order Confirmation */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs sticky top-24">
              <h3 className="text-base font-extrabold text-[#11385E] mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-600" />
                Xác Nhận Lịch Đặt CLB
              </h3>

              {selectedClub && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">CLB:</span>
                    <strong className="text-slate-900">{selectedClub.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Người đại diện:</span>
                    <span className="text-slate-800">{selectedClub.leaderName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hotline CLB:</span>
                    <span className="text-slate-800">{selectedClub.leaderPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Đặc quyền CLB:</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 rounded">Chiết khấu 10%</span>
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Người liên hệ buổi chơi (không bắt buộc):</label>
                  <input
                    type="text"
                    placeholder={selectedClub?.leaderName || 'Tự lấy theo người đại diện CLB'}
                    value={clubContactPerson}
                    onChange={(e) => setClubContactPerson(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ghi chú cho BSB:</label>
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: Cần mượn thêm bóng tập..."
                    value={clubNotes}
                    onChange={(e) => setClubNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Price Calculation */}
              <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs mb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Thời lượng:</span>
                  <span>{selectedSlots.length} giờ ({selectedCourt?.name})</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Giá gốc:</span>
                  <span>{clbPricing.courtTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Ưu đãi CLB (10%):</span>
                  <span>-{clbPricing.discount.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-100">
                  <span>Tổng thanh toán:</span>
                  <span className="text-[#11385E]">{clbPricing.total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBookingSubmit}
                disabled={selectedSlots.length === 0}
                className={`w-full py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedSlots.length > 0
                    ? 'bg-[#11385E] hover:bg-[#0c2946] text-white shadow-sm'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                Gửi Lịch Đặt CLB
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MINITOUR BOOKING FORM */}
      {/* ========================================================================= */}
      {bookingType === 'minitour' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-amber-500" />
                Thông Tin Đặt Lịch Minitour & Giải Đấu Nhỏ
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tên Minitour / Giải đấu *</label>
                  <input
                    type="text"
                    value={minitourTitle}
                    onChange={(e) => setMinitourTitle(e.target.value)}
                    placeholder="Ví dụ: BSB Weekend Smash Cup"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3E5168] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Người phụ trách tổ chức *</label>
                  <input
                    type="text"
                    value={minitourOrganizer}
                    onChange={(e) => setMinitourOrganizer(e.target.value)}
                    placeholder="Họ và tên người đại diện"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3E5168] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại liên hệ *</label>
                  <input
                    type="tel"
                    value={minitourPhone}
                    onChange={(e) => setMinitourPhone(e.target.value)}
                    placeholder="0908 123 456"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3E5168] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số lượng đội tham gia dự kiến</label>
                  <select
                    value={minitourTeamsCount}
                    onChange={(e) => setMinitourTeamsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3E5168] focus:outline-none"
                  >
                    <option value={4}>4 Đội (Bán kết + Chung kết)</option>
                    <option value={8}>8 Đội (Tứ kết + Bán kết + Chung kết)</option>
                    <option value={16}>16 Đội (Vòng 16 + Tứ kết + Bán kết + Chung kết)</option>
                  </select>
                </div>
              </div>

              {/* Multi-court Selector */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Chọn các sân cần sử dụng cùng lúc (Atomic Lock):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {courts.map((court) => {
                    const isSelected = minitourCourts.includes(court.id);
                    return (
                      <button
                        key={court.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (minitourCourts.length > 1) {
                              setMinitourCourts(minitourCourts.filter(id => id !== court.id));
                            }
                          } else {
                            setMinitourCourts([...minitourCourts, court.id]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#3E5168] text-white border-[#3E5168] font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div>{court.name.split(' ')[0]} {court.name.split(' ')[1]}</div>
                        <div className="text-[10px] opacity-80">{court.type}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Format notes */}
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">Thể thức & Ghi chú giải đấu</label>
                <textarea
                  rows={2}
                  value={minitourFormatNotes}
                  onChange={(e) => setMinitourFormatNotes(e.target.value)}
                  placeholder="Ví dụ: Thi đấu vòng tròn tính điểm hoặc loại trực tiếp..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#3E5168] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs sticky top-24">
              <h3 className="text-base font-extrabold text-[#3E5168] mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Tóm Tắt Đặt Sân Minitour
              </h3>

              <div className="space-y-2 text-xs text-slate-600 mb-4">
                <div className="flex justify-between">
                  <span>Số sân sử dụng:</span>
                  <strong className="text-slate-900">{minitourCourts.length} Sân</strong>
                </div>
                <div className="flex justify-between">
                  <span>Thời lượng:</span>
                  <span>14:00 - 21:00 (7 tiếng)</span>
                </div>
                <div className="flex justify-between">
                  <span>Quy mô:</span>
                  <span>{minitourTeamsCount} cặp VĐV thi đấu</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Chi phí trọn gói:</span>
                  <span className="text-[#3E5168]">{minitourPricing.total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBookingSubmit}
                className="w-full py-3 bg-[#3E5168] hover:bg-[#2e3e50] text-white rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4" />
                Xác Nhận Đặt Minitour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FIXED (CỐ ĐỊNH) BOOKING FORM WITH CONFLICT PREVIEW */}
      {/* ========================================================================= */}
      {bookingType === 'fixed' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#676F84]" />
                  Cấu Hình Lịch Cố Định Dài Hạn (Hội Viên VIP)
                </span>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Tiết kiệm đến 20%
                </span>
              </div>

              {/* Customer Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ tên / Tên Doanh Nghiệp *</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A / Công ty B"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#676F84] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại liên hệ *</label>
                  <input
                    type="tel"
                    placeholder="0908 123 456"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#676F84] focus:outline-none"
                  />
                </div>
              </div>

              {/* Days of week selector */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Chọn các ngày sinh hoạt cố định trong tuần:</label>
                <div className="grid grid-cols-7 gap-2">
                  {[
                    { day: 1, label: 'Thứ 2' },
                    { day: 2, label: 'Thứ 3' },
                    { day: 3, label: 'Thứ 4' },
                    { day: 4, label: 'Thứ 5' },
                    { day: 5, label: 'Thứ 6' },
                    { day: 6, label: 'Thứ 7' },
                    { day: 0, label: 'Chủ Nhật' }
                  ].map((item) => {
                    const isSelected = fixedDays.includes(item.day);
                    return (
                      <button
                        key={item.day}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (fixedDays.length > 1) setFixedDays(fixedDays.filter(d => d !== item.day));
                          } else {
                            setFixedDays([...fixedDays, item.day].sort());
                          }
                        }}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                          isSelected
                            ? 'bg-[#676F84] text-white border-[#676F84]'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slot & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khung giờ cố định (2 tiếng):</label>
                  <select
                    value={fixedTimeSlot}
                    onChange={(e) => setFixedTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#676F84] focus:outline-none"
                  >
                    <option value="06:00 - 08:00">06:00 - 08:00 (Sáng sớm)</option>
                    <option value="08:00 - 10:00">08:00 - 10:00 (Sáng)</option>
                    <option value="16:00 - 18:00">16:00 - 18:00 (Chiều)</option>
                    <option value="18:00 - 20:00">18:00 - 20:00 (Tối VIP)</option>
                    <option value="20:00 - 22:00">20:00 - 22:00 (Đêm)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời hạn hợp đồng:</label>
                  <select
                    value={fixedDurationMonths}
                    onChange={(e) => setFixedDurationMonths(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#676F84] focus:outline-none"
                  >
                    <option value={1}>1 Tháng (Giảm 10%)</option>
                    <option value={3}>3 Tháng (Giảm 15%)</option>
                    <option value={6}>6 Tháng (Giảm 20% VIP)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày bắt đầu:</label>
                  <input
                    type="date"
                    value={fixedStartDate}
                    onChange={(e) => setFixedStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#676F84] focus:outline-none"
                  />
                </div>
              </div>

              {/* Court Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Chọn sân cố định:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {courts.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFixedCourtId(c.id)}
                      className={`p-2 rounded-xl text-center border text-xs transition-all cursor-pointer ${
                        fixedCourtId === c.id
                          ? 'bg-[#676F84] text-white border-[#676F84] font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="truncate">{c.name.split(' ')[0]} {c.name.split(' ')[1]}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recurring Conflict Checker Preview Table */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-indigo-600" />
                  Xem Trước {fixedRecurringPreview.length} Buổi Lặp & Kiểm Tra Xung Đột
                </span>
                <span className="text-[11px] text-slate-500">
                  {fixedRecurringPreview.filter(p => p.hasConflict).length === 0 ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 100% Buổi Hợp Lệ
                    </span>
                  ) : (
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Có {fixedRecurringPreview.filter(p => p.hasConflict).length} Buổi Trùng Lịch
                    </span>
                  )}
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100 text-xs">
                {fixedRecurringPreview.slice(0, 12).map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{item.dayName}</span>
                      <span className="text-slate-400 font-mono text-[11px]">({item.date})</span>
                    </div>
                    {item.hasConflict ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                        Trùng lịch - Chờ Admin đổi sân
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        Khả dụng
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs sticky top-24">
              <h3 className="text-base font-extrabold text-[#676F84] mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Hợp Đồng Cố Định
              </h3>

              <div className="space-y-2 text-xs text-slate-600 mb-4">
                <div className="flex justify-between">
                  <span>Tổng số buổi:</span>
                  <strong className="text-slate-900">{fixedPricing.sessionsCount} Buổi</strong>
                </div>
                <div className="flex justify-between">
                  <span>Sân cố định:</span>
                  <span>{fixedCourt?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Giá niêm yết:</span>
                  <span>{fixedPricing.rawTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Chiết khấu ({fixedDurationMonths >= 6 ? '20%' : '15%'}):</span>
                  <span>-{fixedPricing.discount.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Tổng chi phí:</span>
                  <span className="text-[#676F84]">{fixedPricing.finalTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-amber-700 bg-amber-50 p-2 rounded-lg">
                  <span>Cọc trước (30%):</span>
                  <span>{fixedPricing.deposit.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBookingSubmit}
                className="w-full py-3 bg-[#676F84] hover:bg-[#52596b] text-white rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4" />
                Ký Hợp Đồng Cố Định
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CASUAL (VÃNG LAI) BOOKING FORM */}
      {/* ========================================================================= */}
      {bookingType === 'casual' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Date */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-[#11385E]" />
                Bước 1: Chọn Ngày Chơi
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {dateOptions.map((item) => (
                  <button
                    key={item.date}
                    type="button"
                    onClick={() => setSelectedDate(item.date)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                      selectedDate === item.date
                        ? 'bg-[#11385E] text-white border-[#11385E]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Court */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[#11385E]" />
                Bước 2: Chọn Sân Chơi (6 Sân USAPA)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {courts.map((court) => {
                  const isSelected = selectedCourtId === court.id;
                  return (
                    <div
                      key={court.id}
                      onClick={() => { setSelectedCourtId(court.id); setSelectedSlots([]); }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-blue-50/70 border-[#11385E] ring-2 ring-[#11385E]/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-xs text-slate-900">{court.name}</h4>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#11385E]" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{court.surface}</p>
                      <div className="text-[11px] font-semibold text-[#11385E] mt-1.5">
                        {court.hourlyRateNormal.toLocaleString('vi-VN')}đ - {court.hourlyRatePeak.toLocaleString('vi-VN')}đ/h
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Slots Matrix */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-[#11385E]" />
                Bước 3: Chọn Khung Giờ Trống (Slot 60 phút)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {timeSlots.map((slot) => {
                  const bookingInfo = getSlotBookingInfo(selectedCourtId, slot, selectedDate);
                  const isSelected = selectedSlots.includes(slot);
                  const isOccupied = Boolean(bookingInfo);

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isOccupied}
                      onClick={() => handleToggleSlot(slot)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all text-center ${
                        isOccupied
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                          : isSelected
                            ? 'bg-[#11385E] text-white border-[#11385E] font-bold shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Casual Summary & Payment */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs sticky top-24">
              <h3 className="text-base font-extrabold text-[#11385E] mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-600" />
                Thông Tin Đặt Vãng Lai
              </h3>

              <div className="space-y-3 mb-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và tên người đặt *</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    placeholder="0908 123 456"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ghi chú (tuỳ chọn)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Cần bóng mới..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Price Calculation */}
              <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs mb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Sân:</span>
                  <span className="font-semibold text-slate-800">{selectedCourt?.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Số slot đã chọn:</span>
                  <span>{selectedSlots.length} giờ</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-100">
                  <span>Tổng tiền sân:</span>
                  <span className="text-[#11385E]">{casualPricing.total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBookingSubmit}
                disabled={selectedSlots.length === 0}
                className={`w-full py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedSlots.length > 0
                    ? 'bg-[#11385E] hover:bg-[#0c2946] text-white shadow-sm'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                Gửi Yêu Cầu Đặt Sân
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. EVENT (SỰ KIỆN) BOOKING FORM */}
      {/* ========================================================================= */}
      {bookingType === 'event' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-indigo-600" />
                Tổ Chức Sự Kiện & Hội Thao Doanh Nghiệp Trọn Gói
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tên Sự Kiện / Chương Trình *</label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Hội thao Pickleball Hè 2026"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#647A82] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đơn vị / Doanh nghiệp phụ trách *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Công ty ABC"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#647A82] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại liên hệ *</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0908 123 456"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#647A82] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quy mô người tham dự dự kiến</label>
                  <input
                    type="number"
                    value={eventAttendees}
                    onChange={(e) => setEventAttendees(Number(e.target.value))}
                    min={10}
                    max={200}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#647A82] focus:outline-none"
                  />
                </div>
              </div>

              {/* Service Add-ons */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-2">Dịch vụ bổ trợ sự kiện:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EVENT_SERVICES.map((service) => {
                    const isChecked = selectedEventServices.includes(service.id);
                    return (
                      <div
                        key={service.id}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedEventServices(selectedEventServices.filter(id => id !== service.id));
                          } else {
                            setSelectedEventServices([...selectedEventServices, service.id]);
                          }
                        }}
                        className={`p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2 ${
                          isChecked ? 'bg-indigo-50/60 border-indigo-300' : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <div className="font-bold text-slate-800">{service.name}</div>
                          <div className="text-[11px] text-slate-500">{service.desc}</div>
                          <div className="text-[11px] font-bold text-indigo-700 mt-1">
                            +{service.price.toLocaleString('vi-VN')}đ {service.isPerPerson ? '/ người' : ''}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs sticky top-24">
              <h3 className="text-base font-extrabold text-[#647A82] mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Dự Toán Sự Kiện
              </h3>

              <div className="space-y-2 text-xs text-slate-600 mb-4">
                <div className="flex justify-between">
                  <span>Tiền thuê cụm {eventSelectedCourts.length} sân (5h):</span>
                  <span>{eventPricing.baseCourtFee.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Dịch vụ & Teabreak ({selectedEventServices.length} gói):</span>
                  <span>+{eventPricing.servicesTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Ưu đãi doanh nghiệp (8%):</span>
                  <span>-{eventPricing.discount.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Tổng ngân sách:</span>
                  <span className="text-[#647A82]">{eventPricing.total.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-amber-700 bg-amber-50 p-2 rounded-lg">
                  <span>Đặt cọc (50%):</span>
                  <span>{eventPricing.deposit.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBookingSubmit}
                className="w-full py-3 bg-[#647A82] hover:bg-[#52646b] text-white rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4" />
                Gửi Đăng Ký Sự Kiện
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUCCESS MODAL & VIETQR PAYMENT CHECKOUT */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isSuccessModalOpen && lastCreatedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 overflow-hidden relative text-slate-800"
            >
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  GỬI YÊU CẦU ĐẶT SÂN THÀNH CÔNG!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Mã đặt sân của bạn đã được ghi nhận trên hệ thống BSB Pickleball.
                </p>
              </div>

              {/* Booking Code Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">MÃ TRA CỨU BOOKING</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {lastCreatedBooking.bookingStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-mono font-extrabold text-[#11385E] tracking-wider">
                    {lastCreatedBooking.bookingCode}
                  </span>
                  <button
                    onClick={() => handleCopyBookingCode(lastCreatedBooking.bookingCode)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedCode ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>

              {/* VietQR Quick Payment Details */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-6 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Khách hàng:</span>
                  <strong className="text-slate-900">{lastCreatedBooking.customerName} ({lastCreatedBooking.customerPhone})</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Sân & Thời gian:</span>
                  <span>{lastCreatedBooking.courtName} • {lastCreatedBooking.date} ({lastCreatedBooking.startTime} - {lastCreatedBooking.endTime})</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-blue-200/60">
                  <span>Số tiền thanh toán:</span>
                  <span className="text-[#11385E] font-extrabold text-sm">{lastCreatedBooking.totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="flex-1 py-3 bg-[#11385E] hover:bg-[#0c2946] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Hoàn Tất & Xem Lịch
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
