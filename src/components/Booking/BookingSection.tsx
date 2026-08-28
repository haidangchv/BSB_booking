import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Clock, CheckCircle2, Shield, Sparkles, MapPin, 
  Users, Award, ChevronRight, Info, AlertCircle, QrCode, 
  CreditCard, Phone, User as UserIcon, Check, RefreshCw, Layers, ArrowRight,
  Flame, Trophy, Search, AlertTriangle, Timer, X, Copy, ExternalLink, Mail, Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Court, Booking, BookingType, Club, BookingStatus, User, EmailNotification } from '../../types';
import { BSB_INFO, BSB_COLORS, EVENT_SERVICES } from '../../data/mockData';
import { checkSlotConflict } from '../../lib/supabase';
import { EmailService } from '../../lib/emailService';
import { EmailPreviewModal } from '../Email/EmailPreviewModal';
import { BSBLogo } from '../BSBLogo';

interface BookingSectionProps {
  courts: Court[];
  clubs: Club[];
  bookings: Booking[];
  currentUser?: User | null;
  initialBookingType?: BookingType;
  onAddBooking: (booking: Booking) => void;
  onNavigateToClubs?: () => void;
  onBookingTypeChange?: (type: BookingType) => void;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  courts,
  clubs,
  bookings,
  currentUser,
  initialBookingType = 'casual',
  onAddBooking,
  onNavigateToClubs,
  onBookingTypeChange
}) => {
  // 5 Booking Types: 'clb' | 'minitour' | 'fixed' | 'casual' | 'event'
  const [bookingType, setBookingType] = useState<BookingType>(initialBookingType);

  useEffect(() => {
    if (initialBookingType) {
      setBookingType(initialBookingType);
    }
  }, [initialBookingType]);

  const handleSwitchBookingType = (type: BookingType) => {
    setBookingType(type);
    setSelectedSlots([]);
    onBookingTypeChange?.(type);
  };
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [filterCourtId, setFilterCourtId] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // --- Date & Court Selection ---
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedCourtId, setSelectedCourtId] = useState<string>(courts[0]?.id || 'court-1');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [casualCourtFilter, setCasualCourtFilter] = useState<'all' | 'vip' | 'training' | 'standard' | 'indoor' | 'outdoor'>('all');
  
  // Default: Show slots from current time onwards (hide past slots)
  const [hidePastSlots, setHidePastSlots] = useState<boolean>(true);
  const gridContainerRef = React.useRef<HTMLDivElement>(null);

  // Real-time live clock in minutes (for Live Timeline Red Line)
  const [currentMinutes, setCurrentMinutes] = useState<number>(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    };
    updateTime();
    const interval = setInterval(updateTime, 15000); // sync every 15s
    return () => clearInterval(interval);
  }, []);

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
  const [customerName, setCustomerName] = useState<string>(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState<string>(currentUser?.phone || '');
  const [customerEmail, setCustomerEmail] = useState<string>(currentUser?.email || '');
  const [customerNotes, setCustomerNotes] = useState<string>('');

  // Auto populate customer details if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name || '');
      setCustomerPhone(currentUser.phone || '');
      setCustomerEmail(currentUser.email || '');
    }
  }, [currentUser]);
  const [agreePolicy, setAgreePolicy] = useState<boolean>(true);
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Success Modal & Details
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [lastCreatedBooking, setLastCreatedBooking] = useState<Booking | null>(null);
  const [lastCreatedEmail, setLastCreatedEmail] = useState<EmailNotification | null>(null);
  const [previewEmail, setPreviewEmail] = useState<EmailNotification | null>(null);
  const [isPreviewEmailOpen, setIsPreviewEmailOpen] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Available time slots from 05:30 to 23:00 (30-minute intervals)
  const timeSlots = useMemo(() => [
    '05:30 - 06:00', '06:00 - 06:30', '06:30 - 07:00', '07:00 - 07:30',
    '07:30 - 08:00', '08:00 - 08:30', '08:30 - 09:00', '09:00 - 09:30',
    '09:30 - 10:00', '10:00 - 10:30', '10:30 - 11:00', '11:00 - 11:30',
    '11:30 - 12:00', '12:00 - 12:30', '12:30 - 13:00', '13:00 - 13:30',
    '13:30 - 14:00', '14:00 - 14:30', '14:30 - 15:00', '15:00 - 15:30',
    '15:30 - 16:00', '16:00 - 16:30', '16:30 - 17:00', '17:00 - 17:30',
    '17:30 - 18:00', '18:00 - 18:30', '18:30 - 19:00', '19:00 - 19:30',
    '19:30 - 20:00', '20:00 - 20:30', '20:30 - 21:00', '21:00 - 21:30',
    '21:30 - 22:00', '22:00 - 22:30', '22:30 - 23:00'
  ], []);

  // Time slots to display based on selected date & hidePastSlots filter (default: from now onwards)
  const displayedTimeSlots = useMemo(() => {
    const todayIso = new Date().toISOString().split('T')[0];
    if (selectedDate === todayIso && hidePastSlots) {
      const currentSlotIndex = timeSlots.findIndex(slot => {
        const [endH, endM] = slot.split(' - ')[1].split(':').map(Number);
        const slotEndMinutes = endH * 60 + (endM || 0);
        return slotEndMinutes > currentMinutes; // keep current & future slots
      });
      if (currentSlotIndex !== -1) {
        return timeSlots.slice(currentSlotIndex);
      }
    }
    return timeSlots;
  }, [timeSlots, selectedDate, hidePastSlots, currentMinutes]);

  // Auto-scroll when viewing today or toggling view mode
  useEffect(() => {
    const todayIso = new Date().toISOString().split('T')[0];
    if (selectedDate === todayIso && gridContainerRef.current) {
      if (!hidePastSlots) {
        const currentSlotIndex = timeSlots.findIndex(slot => {
          const [startH, startM] = slot.split(' - ')[0].split(':').map(Number);
          const slotStartMinutes = startH * 60 + (startM || 0);
          return slotStartMinutes >= currentMinutes - 30;
        });
        if (currentSlotIndex > 0) {
          gridContainerRef.current.scrollTo({
            top: Math.max(0, currentSlotIndex * 44 - 44),
            behavior: 'smooth'
          });
        }
      } else {
        gridContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [selectedDate, hidePastSlots, currentMinutes]);

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
    // Check court blocks first
    try {
      const blocks = JSON.parse(localStorage.getItem('bsb_court_blocks_v2') || '[]');
      const blockMatch = blocks.find((bl: any) => {
        if (bl.courtId !== courtId || bl.date !== dateStr) return false;
        return bl.startTime <= start && bl.endTime >= end;
      });
      if (blockMatch) {
        return {
          id: blockMatch.id,
          bookingCode: 'BLOCK',
          bookingType: 'block' as any,
          customerName: `Khóa: ${blockMatch.reason || 'Bảo trì'}`,
          bookingStatus: 'HOLD' as any,
          courtId,
          courtName: '',
          date: dateStr,
          startTime: start,
          endTime: end,
          totalAmount: 0,
          discountAmount: 0,
          depositAmount: 0,
          customerPhone: '',
          paymentStatus: 'PAID',
          createdAt: ''
        } as unknown as Booking;
      }
    } catch {}

    return bookings.find(b => {
      if (b.bookingStatus === 'CANCELLED' || b.bookingStatus === 'REJECTED' || b.bookingStatus === 'NO_SHOW') return false;
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

  // Color & badge styling for booked slot tags in Grid
  const getBookingTagInfo = (b: Booking) => {
    switch (b.bookingType) {
      case 'clb':
        return {
          type: 'clb',
          badgeText: `👥 CLB ${b.clubName ? `• ${b.clubName}` : ''}`,
          shortText: b.clubName || b.customerName || 'CLB',
          bgClass: 'bg-indigo-600 text-white border-indigo-700 shadow-xs hover:bg-indigo-700',
          dotColor: 'bg-indigo-400',
          label: 'Câu Lạc Bộ'
        };
      case 'minitour':
        return {
          type: 'minitour',
          badgeText: `🏆 Giải Minitour`,
          shortText: 'Minitour BSB',
          bgClass: 'bg-amber-500 text-slate-950 font-black border-amber-600 shadow-xs hover:bg-amber-400',
          dotColor: 'bg-amber-900',
          label: 'Minitour'
        };
      case 'fixed':
        return {
          type: 'fixed',
          badgeText: `📅 Lịch Cố Định`,
          shortText: 'Cố Định',
          bgClass: 'bg-slate-700 text-slate-100 border-slate-800 shadow-xs hover:bg-slate-800',
          dotColor: 'bg-slate-400',
          label: 'Cố Định'
        };
      case 'casual':
        return {
          type: 'casual',
          badgeText: `🎾 Vãng Lai: ${b.customerName}`,
          shortText: b.customerName || 'Vãng Lai',
          bgClass: 'bg-blue-600 text-white border-blue-700 shadow-xs hover:bg-blue-700',
          dotColor: 'bg-blue-300',
          label: 'Vãng Lai'
        };
      case 'event':
        return {
          type: 'event',
          badgeText: `🎪 Sự Kiện`,
          shortText: 'Sự Kiện',
          bgClass: 'bg-purple-600 text-white border-purple-700 shadow-xs hover:bg-purple-700',
          dotColor: 'bg-purple-300',
          label: 'Sự Kiện'
        };
      case 'block' as any:
        return {
          type: 'block',
          badgeText: `🔒 ${b.customerName || 'Khóa Sân'}`,
          shortText: 'Khóa Sân',
          bgClass: 'bg-rose-600 text-white border-rose-700 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(0,0,0,0.15)_6px,rgba(0,0,0,0.15)_12px)] shadow-xs',
          dotColor: 'bg-rose-300',
          label: 'Khóa / Bảo Trì'
        };
      default:
        return {
          type: 'other',
          badgeText: `Đã Đặt: ${b.customerName}`,
          shortText: b.customerName || 'Đã Đặt',
          bgClass: 'bg-slate-600 text-white border-slate-700 shadow-xs',
          dotColor: 'bg-slate-400',
          label: 'Đã Đặt'
        };
    }
  };

  // Helper to check if a slot is in the past
  const isSlotInPast = (slotStr: string, dateStr: string, nowMinutes: number) => {
    const todayIso = new Date().toISOString().split('T')[0];
    if (dateStr < todayIso) return true;
    if (dateStr > todayIso) return false;
    const [startStr] = slotStr.split(' - ');
    const [h, m] = startStr.split(':').map(Number);
    const startMin = h * 60 + (m || 0);
    return startMin < nowMinutes;
  };

  // Clean up selected slots if they become past
  useEffect(() => {
    const todayIso = new Date().toISOString().split('T')[0];
    if (selectedDate < todayIso) {
      if (selectedSlots.length > 0) setSelectedSlots([]);
    } else if (selectedDate === todayIso) {
      const validSlots = selectedSlots.filter(s => !isSlotInPast(s, selectedDate, currentMinutes));
      if (validSlots.length !== selectedSlots.length) {
        setSelectedSlots(validSlots);
      }
    }
  }, [selectedDate, currentMinutes]);

  // Toggle slot for casual
  const handleToggleSlot = (slot: string, courtId?: string) => {
    setConflictError(null);
    if (isSlotInPast(slot, selectedDate, currentMinutes)) {
      return; // Cannot select past slots
    }
    if (courtId && courtId !== selectedCourtId) {
      setSelectedCourtId(courtId);
      setSelectedSlots([slot]);
      return;
    }
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

  // Pricing for Casual (each slot = 30 mins = 0.5 hours)
  const casualPricing = useMemo(() => {
    if (!selectedCourt) return { courtTotal: 0, addOns: 0, total: 0 };
    let courtTotal = 0;
    selectedSlots.forEach(slot => {
      const [startH] = slot.split(' - ')[0].split(':').map(Number);
      const isPeak = startH >= 16;
      const rate = isPeak ? selectedCourt.hourlyRatePeak : selectedCourt.hourlyRateNormal;
      courtTotal += Math.round(rate * 0.5);
    });
    const totalHours = selectedSlots.length * 0.5;
    const addOns = (rentPaddle * 40000 * Math.max(1, totalHours)) + 
                    (rentBalls ? 30000 : 0) + 
                    (rentBallMachine ? 100000 * totalHours : 0);
    return { courtTotal, addOns, total: courtTotal + addOns };
  }, [selectedCourt, selectedSlots, rentPaddle, rentBalls, rentBallMachine]);

  // Pricing for CLB (with 10% Club Perk)
  const clbPricing = useMemo(() => {
    if (!selectedCourt) return { courtTotal: 0, discount: 0, total: 0 };
    let raw = 0;
    selectedSlots.forEach(slot => {
      const [startH] = slot.split(' - ')[0].split(':').map(Number);
      const isPeak = startH >= 16;
      const rate = isPeak ? selectedCourt.hourlyRatePeak : selectedCourt.hourlyRateNormal;
      raw += Math.round(rate * 0.5);
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
        customerName: customerName || clubContactPerson || selectedClub.leaderName,
        customerPhone: customerPhone || selectedClub.leaderPhone,
        customerEmail: customerEmail || selectedClub.email || currentUser?.email || 'clb@bsbpickleball.vn',
        clubId: selectedClub.id,
        clubName: selectedClub.name,
        date: selectedDate,
        startTime,
        endTime,
        durationHours: selectedSlots.length * 0.5,
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
        customerEmail: customerEmail || currentUser?.email || 'minitour@bsbpickleball.vn',
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
        customerEmail: customerEmail || currentUser?.email || 'khachhang@bsbpickleball.vn',
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
        customerEmail: customerEmail || currentUser?.email || 'khachhang@bsbpickleball.vn',
        date: selectedDate,
        startTime,
        endTime,
        durationHours: selectedSlots.length * 0.5,
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
        customerEmail: customerEmail || currentUser?.email || 'event@bsbpickleball.vn',
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

    // Send transactional email notification
    try {
      const emailStatus = newBooking.bookingStatus === 'CONFIRMED' ? 'CONFIRMED' : 'PENDING';
      EmailService.sendBookingConfirmationEmail(newBooking, emailStatus).then(sentEmail => {
        setLastCreatedEmail(sentEmail);
      });
    } catch (err) {
      console.warn('Could not dispatch booking email notification:', err);
    }

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
    <section id="booking-calendar-section" className="py-8 px-4 max-w-7xl mx-auto font-sans scroll-mt-20">
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
          Hệ thống 9 cụm sân: <strong>7 sân chuẩn quốc tế (Sân 6 & 7 VIP)</strong> + <strong>2 sân tập nhỏ (Sân 8 & 9)</strong>, mặt đệm Laykold 8 lớp êm ái, hệ thống đèn chống chói 800-1000 Lux.
        </p>
      </div>

      {/* 5 Main Booking Segmented Tabs according to PRD */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 gap-1 max-w-4xl w-full overflow-x-auto shadow-xs">
          {/* 1. CLB */}
          <button
            type="button"
            onClick={() => handleSwitchBookingType('clb')}
            className={`relative flex-1 py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer z-10 ${
              bookingType === 'clb' ? 'text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {bookingType === 'clb' && (
              <motion.div
                layoutId="booking-type-indicator"
                className="absolute inset-0 bg-[#11385E] rounded-xl -z-10 shadow-sm"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <Users className="w-4 h-4 text-sky-400" />
            <span>1. CLB ({activeClubs.length})</span>
          </button>

          {/* 2. Minitour */}
          <button
            type="button"
            onClick={() => handleSwitchBookingType('minitour')}
            className={`relative flex-1 py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer z-10 ${
              bookingType === 'minitour' ? 'text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {bookingType === 'minitour' && (
              <motion.div
                layoutId="booking-type-indicator"
                className="absolute inset-0 bg-[#3E5168] rounded-xl -z-10 shadow-sm"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>2. Minitour</span>
          </button>

          {/* 3. Cố định */}
          <button
            type="button"
            onClick={() => handleSwitchBookingType('fixed')}
            className={`relative flex-1 py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer z-10 ${
              bookingType === 'fixed' ? 'text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {bookingType === 'fixed' && (
              <motion.div
                layoutId="booking-type-indicator"
                className="absolute inset-0 bg-[#676F84] rounded-xl -z-10 shadow-sm"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>3. Cố Định (-20%)</span>
          </button>

          {/* 4. Vãng lai */}
          <button
            type="button"
            onClick={() => handleSwitchBookingType('casual')}
            className={`relative flex-1 py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer z-10 ${
              bookingType === 'casual' ? 'text-[#11385E]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {bookingType === 'casual' && (
              <motion.div
                layoutId="booking-type-indicator"
                className="absolute inset-0 bg-[#A0AEBC] rounded-xl -z-10 shadow-sm"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <Clock className="w-4 h-4 text-[#11385E]" />
            <span>4. Vãng Lai</span>
          </button>

          {/* 5. Sự kiện */}
          <button
            type="button"
            onClick={() => handleSwitchBookingType('event')}
            className={`relative flex-1 py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer z-10 ${
              bookingType === 'event' ? 'text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {bookingType === 'event' && (
              <motion.div
                layoutId="booking-type-indicator"
                className="absolute inset-0 bg-[#647A82] rounded-xl -z-10 shadow-sm"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
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

      {/* 5 Dynamic Booking Forms with AnimatePresence */}
      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* 1. CLB BOOKING FORM (Strictly Selected from Admin List - NO Create Input) */}
        {/* ========================================================================= */}
        {bookingType === 'clb' && (
          <motion.div
            key="clb"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-2 mb-4">
                {courts.map((court) => {
                  const isVip = court.id === 'court-6' || court.id === 'court-7' || court.category === 'vip';
                  const isTraining = court.id === 'court-8' || court.id === 'court-9' || court.category === 'training';

                  return (
                    <button
                      key={court.id}
                      type="button"
                      onClick={() => { setSelectedCourtId(court.id); setSelectedSlots([]); }}
                      className={`p-2.5 rounded-xl text-center border text-xs transition-all cursor-pointer relative ${
                        selectedCourtId === court.id
                          ? 'bg-blue-50 border-[#11385E] font-bold text-[#11385E] ring-2 ring-[#11385E]/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 font-bold truncate">
                        <span>{court.name.split(' ')[0]} {court.name.split(' ')[1]}</span>
                      </div>
                      <div className="mt-1">
                        {isVip ? (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-extrabold rounded text-[9px]">
                            ⭐ VIP
                          </span>
                        ) : isTraining ? (
                          <span className="px-1.5 py-0.5 bg-sky-100 text-sky-900 border border-sky-300 font-extrabold rounded text-[9px]">
                            🎯 Sân tập
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px]">
                            🏆 USAPA
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Time Slots Matrix */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-2">Chọn khung giờ sinh hoạt (slot 30 phút, có thể chọn nhiều slot liên tiếp):</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Thông tin người đặt sân:</label>
                    {currentUser && (
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Tự động điền
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Họ và tên *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="Số điện thoại *"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Email nhận xác nhận *</label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                    />
                  </div>
                </div>

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
                  <span>{selectedSlots.length * 0.5} giờ ({selectedSlots.length} slot) - {selectedCourt?.name}</span>
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
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 2. MINITOUR BOOKING FORM */}
      {/* ========================================================================= */}
      {bookingType === 'minitour' && (
        <motion.div
          key="minitour"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
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
                  <label className="block font-bold text-slate-700 mb-1">Email nhận xác nhận *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="email@example.com"
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
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 3. FIXED (CỐ ĐỊNH) BOOKING FORM WITH CONFLICT PREVIEW */}
      {/* ========================================================================= */}
      {bookingType === 'fixed' && (
        <motion.div
          key="fixed"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-2">
                  {courts.map((c) => {
                    const isVip = c.id === 'court-6' || c.id === 'court-7' || c.category === 'vip';
                    const isTraining = c.id === 'court-8' || c.id === 'court-9' || c.category === 'training';

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setFixedCourtId(c.id)}
                        className={`p-2.5 rounded-xl text-center border text-xs transition-all cursor-pointer ${
                          fixedCourtId === c.id
                            ? 'bg-[#676F84] text-white border-[#676F84] font-bold ring-2 ring-[#676F84]/20'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="truncate font-bold">{c.name.split(' ')[0]} {c.name.split(' ')[1]}</div>
                        <div className="mt-1">
                          {isVip ? (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${fixedCourtId === c.id ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-900 border border-amber-300'}`}>
                              ⭐ VIP
                            </span>
                          ) : isTraining ? (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${fixedCourtId === c.id ? 'bg-sky-400 text-slate-950' : 'bg-sky-100 text-sky-900 border border-sky-300'}`}>
                              🎯 Sân tập
                            </span>
                          ) : (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] ${fixedCourtId === c.id ? 'bg-slate-600 text-slate-200' : 'bg-slate-100 text-slate-600'}`}>
                              🏆 USAPA
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
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
              <div className="space-y-3 mb-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Đại diện ký hợp đồng:</label>
                    {currentUser && (
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Tự động điền
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Họ và tên / Đơn vị *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#676F84] focus:outline-none mb-2"
                  />
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="tel"
                      placeholder="Số điện thoại *"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#676F84] focus:outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Email nhận xác nhận *"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#676F84] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 mb-4 border-t border-slate-100 pt-3">
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
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 4. CASUAL (VÃNG LAI) BOOKING FORM - SCHEDULE MATRIX GRID VIEW */}
      {/* ========================================================================= */}
      {bookingType === 'casual' && (
        <motion.div
          key="casual"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          <div className="lg:col-span-8 space-y-5">
            {/* Step 1: Date & Filter Controls Header */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#11385E]" />
                    Bước 1: Chọn Ngày & Lọc Sân
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Lịch trực quan dạng Matrix Grid theo thời gian thực 05:30 - 23:00
                  </p>
                </div>

                {/* Quick Native Date Picker */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Chọn ngày khác:</span>
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#11385E] focus:ring-2 focus:ring-[#11385E] focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* 7 Quick Date Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {dateOptions.map((item) => {
                  const isSelected = selectedDate === item.date;
                  const isToday = item.label === 'Hôm nay';
                  return (
                    <button
                      key={item.date}
                      type="button"
                      onClick={() => setSelectedDate(item.date)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border relative ${
                        isSelected
                          ? 'bg-[#11385E] text-white border-[#11385E] shadow-xs ring-2 ring-[#11385E]/20'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {isToday && (
                        <span className="absolute -top-1.5 right-1 px-1.5 py-0.2 bg-rose-500 text-white text-[8px] font-black rounded-full shadow-xs">
                          LIVE
                        </span>
                      )}
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Court Category Filter Pills */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-600 mr-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#11385E]" /> Sân:
                  </span>
                  {[
                    { id: 'all', label: 'Tất Cả (9 Sân)' },
                    { id: 'vip', label: '⭐ Sân VIP (6 & 7)' },
                    { id: 'training', label: '🎯 Sân Tập (8 & 9)' },
                    { id: 'standard', label: '🏆 USAPA (1-5)' },
                    { id: 'indoor', label: '🏢 Trong Nhà' },
                    { id: 'outdoor', label: '🌤️ Ngoài Trời' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setCasualCourtFilter(f.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        casualCourtFilter === f.id
                          ? 'bg-[#11385E] text-white border-[#11385E]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="text-[11px] font-bold text-[#11385E] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Giờ vàng (Peak): 16:00 - 23:00
                </div>
              </div>
            </div>

            {/* Color Legend Bar */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Chú Thích Nhãn Lịch & Trạng Thái:
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Click vào ô trống để chọn giờ</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="font-semibold text-slate-700 truncate">Khả dụng</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#11385E] text-white px-2 py-1 rounded-lg font-bold border border-[#11385E]">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 animate-pulse"></span>
                  <span className="truncate">Đang chọn</span>
                </div>
                <div className="flex items-center gap-1.5 bg-blue-100 text-blue-950 px-2 py-1 rounded-lg font-bold border border-blue-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                  <span className="truncate">Vãng Lai</span>
                </div>
                <div className="flex items-center gap-1.5 bg-indigo-100 text-indigo-950 px-2 py-1 rounded-lg font-bold border border-indigo-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0"></span>
                  <span className="truncate">CLB Sinh Hoạt</span>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-100 text-amber-950 px-2 py-1 rounded-lg font-bold border border-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                  <span className="truncate">Minitour</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-200 text-slate-900 px-2 py-1 rounded-lg font-bold border border-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700 shrink-0"></span>
                  <span className="truncate">Lịch Cố Định</span>
                </div>
                <div className="flex items-center gap-1.5 bg-rose-100 text-rose-900 px-2 py-1 rounded-lg font-bold border border-rose-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0"></span>
                  <span className="truncate">Khóa / Bảo Trì</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 text-slate-400 px-2 py-1 rounded-lg border border-slate-200 opacity-60">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0"></span>
                  <span className="truncate line-through">Đã qua giờ</span>
                </div>
              </div>
            </div>

            {/* Step 2 & 3: SCHEDULE MATRIX GRID TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-xs text-[#11385E]">
                    BẢNG LỊCH MATRIX ({selectedDate})
                  </span>
                  <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-semibold">
                    {displayedTimeSlots.length} Khung Giờ (30p/slot)
                  </span>

                  {/* Toggle Mode for Today: From Now vs All Day */}
                  {selectedDate === new Date().toISOString().split('T')[0] && (
                    <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl text-[11px] font-bold gap-1 ml-1">
                      <button
                        type="button"
                        onClick={() => setHidePastSlots(true)}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                          hidePastSlots
                            ? 'bg-[#11385E] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Từ Hiện Tại Trở Đi (Mặc định)
                      </button>
                      <button
                        type="button"
                        onClick={() => setHidePastSlots(false)}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          !hidePastSlots
                            ? 'bg-[#11385E] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Xem Cả Ngày (05:30 - 23:00)
                      </button>
                    </div>
                  )}
                </div>

                {selectedSlots.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-pulse">
                      ✓ Đã chọn {selectedSlots.length} slot ({selectedCourt?.name})
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedSlots([])}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
                    >
                      Bỏ chọn tất cả
                    </button>
                  </div>
                )}
              </div>

              {/* Matrix Grid with Sticky Headers & Live Indicator */}
              <div ref={gridContainerRef} className="relative overflow-x-auto max-h-[620px] overflow-y-auto scroll-smooth">
                <table className="w-full text-left border-collapse min-w-[760px]">
                  {/* Sticky Top Court Header */}
                  <thead className="sticky top-0 z-20 bg-slate-100/95 backdrop-blur-xs border-b border-slate-200 shadow-2xs">
                    <tr>
                      <th className="p-3 w-28 text-center text-xs font-bold text-slate-600 uppercase border-r border-slate-200 sticky left-0 z-30 bg-slate-100/95 backdrop-blur-xs">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#11385E]" />
                          Giờ / Sân
                        </div>
                      </th>
                      {courts
                        .filter(c => {
                          if (casualCourtFilter === 'vip') return c.category === 'vip' || c.id === 'court-6' || c.id === 'court-7';
                          if (casualCourtFilter === 'training') return c.category === 'training' || c.id === 'court-8' || c.id === 'court-9';
                          if (casualCourtFilter === 'standard') return c.category === 'standard' || (c.id >= 'court-1' && c.id <= 'court-5');
                          if (casualCourtFilter === 'indoor') return c.type === 'indoor';
                          if (casualCourtFilter === 'outdoor') return c.type === 'outdoor';
                          return true;
                        })
                        .map(court => {
                          const isCurrentActiveCourt = selectedCourtId === court.id;
                          const isVip = court.id === 'court-6' || court.id === 'court-7' || court.category === 'vip';
                          const isTraining = court.id === 'court-8' || court.id === 'court-9' || court.category === 'training';

                          return (
                            <th
                              key={court.id}
                              className={`p-2.5 text-center min-w-[130px] border-r border-slate-200 transition-colors ${
                                isCurrentActiveCourt
                                  ? 'bg-blue-50/90 text-[#11385E] border-b-2 border-b-[#11385E]'
                                  : 'text-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1 font-extrabold text-xs">
                                <span>{court.name}</span>
                                {isVip && (
                                  <span className="px-1 py-0.2 bg-amber-500 text-slate-950 text-[9px] font-black rounded">
                                    VIP
                                  </span>
                                )}
                                {isTraining && (
                                  <span className="px-1 py-0.2 bg-sky-500 text-white text-[9px] font-black rounded">
                                    TẬP
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                                {Math.round(court.hourlyRateNormal / 2000)}k - {Math.round(court.hourlyRatePeak / 2000)}k / slot
                              </div>
                            </th>
                          );
                        })}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 relative">
                    {/* REAL-TIME LIVE RED TIMELINE INDICATOR */}
                    {(() => {
                      const todayIso = new Date().toISOString().split('T')[0];
                      const isToday = selectedDate === todayIso;
                      const isWithinDay = currentMinutes >= 330 && currentMinutes <= 1380; // 05:30 to 23:00
                      if (!isToday || !isWithinDay || displayedTimeSlots.length === 0) return null;

                      // Start minute of the first displayed slot
                      const [firstH, firstM] = displayedTimeSlots[0].split(' - ')[0].split(':').map(Number);
                      const firstStartMin = firstH * 60 + (firstM || 0);

                      // Calculate relative slot fraction from top of displayed rows
                      const slotFraction = (currentMinutes - firstStartMin) / 30;
                      if (slotFraction < 0) return null; // Don't draw if above visible area
                      const topOffsetPx = slotFraction * 44;
                      const liveHour = Math.floor(currentMinutes / 60);
                      const liveMin = currentMinutes % 60;
                      const liveTimeFormatted = `${String(liveHour).padStart(2, '0')}:${String(liveMin).padStart(2, '0')}`;

                      return (
                        <div
                          style={{ top: `${topOffsetPx}px` }}
                          className="absolute left-0 right-0 z-25 pointer-events-none flex items-center"
                        >
                          {/* Live Time Badge on Left Sticky Axis */}
                          <div className="sticky left-1 z-35 -mt-3 flex items-center gap-1 bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-md border border-white animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                            🔴 {liveTimeFormatted} HIỆN TẠI
                          </div>
                          {/* Red Line spanning entire matrix */}
                          <div className="flex-1 h-[2px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] border-t border-red-400"></div>
                        </div>
                      );
                    })()}

                    {/* Time Slot Rows */}
                    {displayedTimeSlots.map((slot, rowIndex) => {
                      const [startH, startM] = slot.split(' - ')[0].split(':').map(Number);
                      const isPeak = startH >= 16;
                      const slotStartMinutes = startH * 60 + (startM || 0);
                      const todayIso = new Date().toISOString().split('T')[0];
                      const isPast = selectedDate < todayIso || (selectedDate === todayIso && slotStartMinutes < currentMinutes);

                      const visibleCourts = courts.filter(c => {
                        if (casualCourtFilter === 'vip') return c.category === 'vip' || c.id === 'court-6' || c.id === 'court-7';
                        if (casualCourtFilter === 'training') return c.category === 'training' || c.id === 'court-8' || c.id === 'court-9';
                        if (casualCourtFilter === 'standard') return c.category === 'standard' || (c.id >= 'court-1' && c.id <= 'court-5');
                        if (casualCourtFilter === 'indoor') return c.type === 'indoor';
                        if (casualCourtFilter === 'outdoor') return c.type === 'outdoor';
                        return true;
                      });

                      return (
                        <tr key={slot} className={`h-11 transition-colors ${isPast ? 'bg-slate-50/40' : 'hover:bg-slate-50/50'}`}>
                          {/* Left Sticky Time Column */}
                          <td className={`p-2 text-center text-xs font-bold border-r border-slate-200 sticky left-0 z-10 backdrop-blur-xs transition-opacity ${
                            isPast ? 'bg-slate-100/90 opacity-50 select-none' : 'bg-slate-50/95'
                          }`}>
                            <div className="flex items-center justify-center gap-1">
                              <span className={isPast ? 'text-slate-400 line-through' : isPeak ? 'text-amber-800 font-extrabold' : 'text-slate-700'}>
                                {slot.split(' - ')[0]}
                              </span>
                              {!isPast && isPeak && (
                                <span className="text-[9px] text-amber-600 font-black" title="Khung giờ vàng Peak">
                                  ⚡
                                </span>
                              )}
                            </div>
                            <div className={`text-[9px] font-normal ${isPast ? 'text-slate-300 line-through' : 'text-slate-400'}`}>
                              {slot.split(' - ')[1]}
                            </div>
                          </td>

                          {/* Court Slot Cells */}
                          {visibleCourts.map((court) => {
                            const bookingInfo = getSlotBookingInfo(court.id, slot, selectedDate);
                            const isOccupied = Boolean(bookingInfo);
                            const isSelected = selectedCourtId === court.id && selectedSlots.includes(slot);
                            const rate = isPeak ? court.hourlyRatePeak : court.hourlyRateNormal;
                            const slotPrice = Math.round(rate * 0.5);

                            if (isOccupied && bookingInfo) {
                              const tag = getBookingTagInfo(bookingInfo);
                              return (
                                <td
                                  key={court.id}
                                  className={`p-1 border-r border-slate-100 text-center relative ${isPast ? 'bg-slate-50/40' : ''}`}
                                  title={`${tag.badgeText} (${slot})${isPast ? ' - Đã diễn ra' : ''}`}
                                >
                                  <div className={`w-full h-9 rounded-lg px-1.5 py-0.5 flex flex-col justify-center items-center text-[10px] font-bold border transition-all cursor-not-allowed select-none ${
                                    isPast
                                      ? 'opacity-45 grayscale-[35%] bg-slate-200 text-slate-600 border-slate-300'
                                      : tag.bgClass
                                  }`}>
                                    <span className="truncate w-full text-center leading-tight">
                                      {tag.shortText}
                                    </span>
                                    <span className="text-[8px] opacity-90 uppercase tracking-tighter">
                                      {tag.label} {isPast && '(Đã qua)'}
                                    </span>
                                  </div>
                                </td>
                              );
                            }

                            // Past available slot: dimmed, blurred, disabled
                            if (isPast) {
                              return (
                                <td key={court.id} className="p-1 border-r border-slate-100 text-center bg-slate-50/50">
                                  <div
                                    className="w-full h-9 rounded-lg border border-dashed border-slate-200/90 bg-slate-100/70 text-slate-400 flex flex-col justify-center items-center text-[10px] cursor-not-allowed select-none opacity-35"
                                    title="Khung giờ trong quá khứ, không thể đặt"
                                  >
                                    <span className="font-semibold text-[10px] text-slate-400 line-through">
                                      {slot.split(' - ')[0]}
                                    </span>
                                    <span className="text-[8px] text-slate-400 uppercase tracking-tighter">
                                      Đã qua
                                    </span>
                                  </div>
                                </td>
                              );
                            }

                            if (isSelected) {
                              return (
                                <td key={court.id} className="p-1 border-r border-slate-100 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSlot(slot, court.id)}
                                    className="w-full h-9 rounded-lg bg-[#11385E] text-white border-2 border-amber-400 shadow-sm flex flex-col justify-center items-center text-[10px] font-extrabold cursor-pointer transition-all hover:bg-[#0c2946] ring-2 ring-[#11385E]/30"
                                  >
                                    <span className="flex items-center gap-0.5 text-amber-300">
                                      <Check className="w-3 h-3" /> Đã chọn
                                    </span>
                                    <span className="text-[9px] text-white/90 font-mono">
                                      {slotPrice.toLocaleString('vi-VN')}đ
                                    </span>
                                  </button>
                                </td>
                              );
                            }

                            // Available Future Slot Cell
                            return (
                              <td key={court.id} className="p-1 border-r border-slate-100 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSlot(slot, court.id)}
                                  className={`w-full h-9 rounded-lg border border-slate-200/80 bg-white hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-900 transition-all flex flex-col justify-center items-center text-[10px] cursor-pointer group ${
                                    isPeak ? 'text-slate-800' : 'text-slate-600'
                                  }`}
                                >
                                  <span className="font-bold font-mono group-hover:hidden">
                                    {Math.round(slotPrice / 1000)}k
                                  </span>
                                  <span className="text-[9px] text-slate-400 group-hover:hidden">
                                    {isPeak ? '⚡Peak' : 'Thường'}
                                  </span>
                                  <span className="hidden group-hover:flex items-center gap-0.5 text-emerald-700 font-extrabold text-[10px]">
                                    + Đặt slot
                                  </span>
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Casual Summary & Payment Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs sticky top-24">
              <h3 className="text-base font-extrabold text-[#11385E] mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sky-600" />
                  Phiếu Đặt Sân Vãng Lai
                </span>
                <span className="text-xs font-bold text-slate-500">{selectedDate}</span>
              </h3>

              {/* Selected Court & Slots overview */}
              <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 mb-4 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-semibold">Sân đã chọn:</span>
                  <span className="font-extrabold text-[#11385E] text-sm">{selectedCourt?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Loại sân:</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {selectedCourt?.type === 'center_court' ? 'Sân VIP Trung Tâm' : selectedCourt?.type === 'indoor' ? 'Trong Nhà' : 'Ngoài Trời'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-blue-200/60">
                  <span className="text-slate-600">Khung giờ ({selectedSlots.length} slot):</span>
                  <span className="font-bold text-indigo-900">
                    {selectedSlots.length > 0 ? `${selectedSlots.length * 0.5} Giờ` : 'Chưa chọn'}
                  </span>
                </div>

                {selectedSlots.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1.5">
                    {selectedSlots.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-white text-[#11385E] rounded-md font-mono text-[10px] font-bold border border-blue-200 flex items-center gap-1">
                        {s}
                        <button
                          type="button"
                          onClick={() => handleToggleSlot(s)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Info Form */}
              <div className="space-y-3 mb-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Họ và tên người đặt *</label>
                    {currentUser && (
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Tự động điền
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
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
                    required
                    placeholder="0908 123 456"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email nhận xác nhận *</label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ghi chú (tuỳ chọn)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Cần mượn thêm vợt..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Price Calculation */}
              <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs mb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Tiền sân ({selectedSlots.length} slot):</span>
                  <span className="font-semibold text-slate-800">{casualPricing.courtTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                {casualPricing.addOns > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Phụ kiện thuê thêm:</span>
                    <span>+{casualPricing.addOns.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Tổng thanh toán:</span>
                  <span className="text-[#11385E] text-lg">{casualPricing.total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBookingSubmit}
                disabled={selectedSlots.length === 0}
                className={`w-full py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  selectedSlots.length > 0
                    ? 'bg-[#11385E] hover:bg-[#0c2946] text-white hover:shadow-lg'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4 text-amber-400" />
                {selectedSlots.length > 0 ? `Xác Nhận Đặt ${selectedSlots.length} Slot` : 'Vui Lòng Chọn Giờ Trống Trên Grid'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 5. EVENT (SỰ KIỆN) BOOKING FORM */}
      {/* ========================================================================= */}
      {bookingType === 'event' && (
        <motion.div
          key="event"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
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
                  <label className="block font-bold text-slate-700 mb-1">Email nhận xác nhận *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="email@example.com"
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
        </motion.div>
      )}
      </AnimatePresence>

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

              {/* Email Sent Confirmation Card */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 mb-5 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-900">Email xác nhận đã được gửi!</div>
                    <div className="text-[11px] text-emerald-700">
                      Gửi tới: <strong className="font-semibold">{lastCreatedBooking.customerEmail || 'khachhang@bsbpickleball.vn'}</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const em = lastCreatedEmail || EmailService.getEmailByBookingId(lastCreatedBooking.id);
                    if (em) {
                      setPreviewEmail(em);
                      setIsPreviewEmailOpen(true);
                    }
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs shrink-0"
                >
                  <Send className="w-3 h-3" />
                  Xem Email
                </button>
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

      {/* Transactional Email Preview Modal */}
      <EmailPreviewModal
        isOpen={isPreviewEmailOpen}
        onClose={() => setIsPreviewEmailOpen(false)}
        email={previewEmail}
      />
    </section>
  );
};
