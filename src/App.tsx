import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HomeHero } from './components/HomeHero';
import { BookingSection } from './components/Booking/BookingSection';
import { ClubsSection } from './components/Clubs/ClubsSection';
import { MinitourSection } from './components/Minitour/MinitourSection';
import { AdminPanel } from './components/Admin/AdminPanel';
import { PromptPlanModal } from './components/PromptPlanModal';
import { TicketLookupModal } from './components/TicketLookupModal';
import { AuthModal } from './components/Auth/AuthModal';
import { MyBookingsModal } from './components/Auth/MyBookingsModal';
import { WelcomeIntro } from './components/WelcomeIntro';
import { Footer } from './components/Footer';
import { 
  INITIAL_COURTS, INITIAL_CLUBS, INITIAL_MINITOURS, INITIAL_BOOKINGS, 
  DEFAULT_ADMIN_USER, DEFAULT_CUSTOMER_USER 
} from './data/mockData';
import { Court, Club, Minitour, Booking, TournamentTeam, User, BookingType } from './types';
import { DatabaseService } from './lib/supabase';
import { EmailService } from './lib/emailService';

export default function App() {
  const [activeTab, setActiveTab] = useState<'booking' | 'clubs' | 'minitour' | 'admin'>('booking');
  const [selectedBookingType, setSelectedBookingType] = useState<BookingType>('casual');
  const [isLoading, setIsLoading] = useState(true);

  // Welcome animation display state (plays on first visit or when user clicks replay)
  const [showWelcomeIntro, setShowWelcomeIntro] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('bsb_intro_seen');
    } catch {
      return true;
    }
  });

  const handleDismissIntro = () => {
    setShowWelcomeIntro(false);
    try {
      sessionStorage.setItem('bsb_intro_seen', 'true');
    } catch {
      // ignore
    }
  };

  // Authentication State: Khách Hàng (Customer) vs Quản Trị Viên (Admin)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('bsb_current_user_v3');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_CUSTOMER_USER;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'login' | 'register' | 'switch'>('login');
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);

  // Core Data States
  const [courts, setCourts] = useState<Court[]>(INITIAL_COURTS);
  const [clubs, setClubs] = useState<Club[]>(INITIAL_CLUBS);
  const [minitours, setMinitours] = useState<Minitour[]>(INITIAL_MINITOURS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);

  // Modals
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Load Data on Mount from Supabase or Persistent Store
  useEffect(() => {
    async function loadData() {
      try {
        const [loadedCourts, loadedClubs, loadedBookings, loadedMinitours] = await Promise.all([
          DatabaseService.getCourts(),
          DatabaseService.getClubs(true),
          DatabaseService.getBookings(),
          DatabaseService.getMinitours()
        ]);
        setCourts(loadedCourts);
        setClubs(loadedClubs);
        setBookings(loadedBookings);
        setMinitours(loadedMinitours);
      } catch (err) {
        console.error('Error loading data from database service:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('bsb_current_user_v3', JSON.stringify(user));
    } catch {
      // ignore
    }
    // Auto-redirect admin users to admin dashboard
    if (user.role === 'admin') {
      setActiveTab('admin');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('bsb_current_user_v3');
    } catch {
      // ignore
    }
  };

  const openAuthModalWithTab = (tab: 'login' | 'register' | 'switch' = 'login') => {
    setAuthModalInitialTab(tab);
    setIsAuthModalOpen(true);
  };

  // Handlers with Database Service Persistence
  const handleAddBooking = async (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);
    await DatabaseService.createBooking(newBooking);
  };

  const handleAddClub = async (newClub: Club) => {
    setClubs(prev => [newClub, ...prev]);
    await DatabaseService.createClub(newClub);
  };

  const handleUpdateBookingStatus = async (id: string, status: Booking['bookingStatus']) => {
    const updated = await DatabaseService.updateBookingStatus(id, status);
    setBookings(updated);

    // Send transactional status change email
    const target = updated.find(b => b.id === id);
    if (target) {
      const templateType = status === 'CONFIRMED' ? 'CONFIRMED' : status === 'CANCELLED' ? 'CANCELLED' : status === 'REJECTED' ? 'REJECTED' : 'PENDING';
      EmailService.sendBookingConfirmationEmail(target, templateType).catch(console.warn);
    }
  };

  const handleRescheduleBooking = async (
    bookingId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    newCourtId?: string,
    newCourtName?: string
  ) => {
    let updatedTarget: Booking | undefined;
    setBookings(prev =>
      prev.map(b => {
        if (b.id !== bookingId) return b;
        updatedTarget = {
          ...b,
          date: newDate,
          startTime: newStartTime,
          endTime: newEndTime,
          courtId: newCourtId || b.courtId,
          courtName: newCourtName || b.courtName,
          bookingStatus: 'PENDING' as const,
          updatedAt: new Date().toISOString()
        };
        return updatedTarget;
      })
    );
    // Persist to storage
    const currentBookings = bookings.map(b => {
      if (b.id !== bookingId) return b;
      return {
        ...b,
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        courtId: newCourtId || b.courtId,
        courtName: newCourtName || b.courtName,
        bookingStatus: 'PENDING' as const,
        updatedAt: new Date().toISOString()
      };
    });
    try {
      localStorage.setItem('bsb_bookings_v2', JSON.stringify(currentBookings));
    } catch { /* ignore */ }

    // Send email notification about rescheduled booking
    if (updatedTarget) {
      EmailService.sendBookingConfirmationEmail(updatedTarget, 'RESCHEDULED').catch(console.warn);
    }
  };

  const handleBlockCourt = (courtId: string, date: string, startTime: string, endTime: string, reason: string) => {
    // Find conflicting bookings (active ones on same court, date, overlapping time)
    const parseMin = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + (m || 0);
    };
    const blockStart = parseMin(startTime);
    const blockEnd = parseMin(endTime);

    const conflictingIds: string[] = [];
    const affectedBookings: Booking[] = [];
    bookings.forEach(b => {
      if (b.date !== date) return;
      if (b.bookingStatus === 'CANCELLED' || b.bookingStatus === 'REJECTED') return;
      const bCourtIds = b.courtIds && b.courtIds.length > 0 ? b.courtIds : [b.courtId];
      if (!bCourtIds.includes(courtId)) return;
      const bStart = parseMin(b.startTime);
      const bEnd = parseMin(b.endTime);
      if (Math.max(blockStart, bStart) < Math.min(blockEnd, bEnd)) {
        conflictingIds.push(b.id);
        affectedBookings.push(b);
      }
    });

    // Revert conflicting bookings to PENDING
    if (conflictingIds.length > 0) {
      setBookings(prev =>
        prev.map(b =>
          conflictingIds.includes(b.id)
            ? { ...b, bookingStatus: 'PENDING' as const, updatedAt: new Date().toISOString() }
            : b
        )
      );

      // Notify affected customers via email
      affectedBookings.forEach(ab => {
        EmailService.sendBookingConfirmationEmail(
          { ...ab, bookingStatus: 'PENDING', notes: `Sân đang bảo trì (${reason}). Đang chờ xếp lịch lại.` },
          'RESCHEDULED'
        ).catch(console.warn);
      });
    }

    // Save the court block info to localStorage
    const blocks = JSON.parse(localStorage.getItem('bsb_court_blocks_v2') || '[]');
    blocks.push({
      id: `block-${Date.now()}`,
      courtId,
      date,
      startTime,
      endTime,
      reason,
      createdBy: currentUser?.name || 'Admin',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('bsb_court_blocks_v2', JSON.stringify(blocks));

    return conflictingIds;
  };

  const handleCancelBooking = async (bookingId: string) => {
    await handleUpdateBookingStatus(bookingId, 'CANCELLED');
  };

  const handleAddMinitour = async (newTour: Minitour) => {
    const updated = await DatabaseService.updateMinitour(newTour);
    setMinitours(updated);
  };

  const handleRegisterTournamentTeam = async (tourId: string, team: TournamentTeam) => {
    const currentTour = minitours.find(t => t.id === tourId);
    if (!currentTour) return;
    const updatedTour: Minitour = {
      ...currentTour,
      teams: [...currentTour.teams, team]
    };
    const updated = await DatabaseService.updateMinitour(updatedTour);
    setMinitours(updated);
  };

  const handleUpdateMatchScore = async (
    tourId: string, 
    matchId: string, 
    s1: number, 
    s2: number, 
    winnerId?: string
  ) => {
    const currentTour = minitours.find(t => t.id === tourId);
    if (!currentTour) return;
    const updatedTour: Minitour = {
      ...currentTour,
      matches: currentTour.matches.map(m => {
        if (m.id !== matchId) return m;
        return {
          ...m,
          score1: s1,
          score2: s2,
          winnerTeamId: winnerId || (s1 > s2 ? m.team1?.id : m.team2?.id),
          status: 'finished'
        };
      })
    };
    const updated = await DatabaseService.updateMinitour(updatedTour);
    setMinitours(updated);
  };

  const handleSelectHeroBookingType = (type: BookingType) => {
    setActiveTab('booking');
    setSelectedBookingType(type);
    const el = document.getElementById('booking-calendar-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToBooking = () => {
    setActiveTab('booking');
    const el = document.getElementById('booking-calendar-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#051323] text-slate-800 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Welcome Intro Splash Animation */}
      <AnimatePresence>
        {showWelcomeIntro && (
          <WelcomeIntro onComplete={handleDismissIntro} />
        )}
      </AnimatePresence>

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuthModal={openAuthModalWithTab}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        onOpenPlanModal={() => setIsPlanModalOpen(true)}
        onOpenTicketLookup={() => setIsTicketModalOpen(true)}
        onLogout={handleLogout}
        onReplayIntro={() => setShowWelcomeIntro(true)}
      />

      {/* Hero Section */}
      {activeTab === 'booking' && (
        <HomeHero
          selectedBookingType={selectedBookingType}
          onSelectBookingType={handleSelectHeroBookingType}
          onScrollToBooking={handleScrollToBooking}
          onNavigateToClubs={() => setActiveTab('clubs')}
          courtsCount={courts.length || 9}
          availableSlotsCount={22}
        />
      )}

      {/* Main App Content with Smooth Page Transitions */}
      <main className="flex-1 bg-[#f8fafc] relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'booking' && (
            <motion.div
              key="tab-booking"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <BookingSection
                courts={courts}
                clubs={clubs}
                bookings={bookings}
                currentUser={currentUser}
                initialBookingType={selectedBookingType}
                onBookingTypeChange={setSelectedBookingType}
                onAddBooking={handleAddBooking}
                onNavigateToClubs={() => setActiveTab('clubs')}
              />
            </motion.div>
          )}

          {activeTab === 'clubs' && (
            <motion.div
              key="tab-clubs"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <ClubsSection
                clubs={clubs}
                currentUser={currentUser}
                onOpenAdminClubModal={() => setActiveTab('admin')}
                isAdmin={isAdmin}
              />
            </motion.div>
          )}

          {activeTab === 'minitour' && (
            <motion.div
              key="tab-minitour"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <MinitourSection
                minitours={minitours}
                currentUser={currentUser}
                onRegisterTeam={handleRegisterTournamentTeam}
              />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div
              key="tab-admin"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <AdminPanel
                clubs={clubs}
                bookings={bookings}
                minitours={minitours}
                courts={courts}
                currentUser={currentUser}
                onAddClub={handleAddClub}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onRescheduleBooking={handleRescheduleBooking}
                onBlockCourt={handleBlockCourt}
                onAddMinitour={handleAddMinitour}
                onUpdateMatchScore={handleUpdateMatchScore}
                onSwitchToAdmin={() => handleLogin(DEFAULT_ADMIN_USER)}
                onNavigateToBooking={() => setActiveTab('booking')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer onOpenPlanModal={() => setIsPlanModalOpen(true)} />

      {/* Master Plan & Prompt Modal */}
      <PromptPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
      />

      {/* Ticket & QR Lookup Modal */}
      <TicketLookupModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        bookings={bookings}
      />

      {/* Auth Modal (Login / Register / Switch Role) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        initialTab={authModalInitialTab}
      />

      {/* My Bookings Modal (for Customer / Member) */}
      <MyBookingsModal
        isOpen={isMyBookingsOpen}
        onClose={() => setIsMyBookingsOpen(false)}
        currentUser={currentUser}
        bookings={bookings}
        onOpenBookingTab={() => setActiveTab('booking')}
        onCancelBooking={handleCancelBooking}
      />
    </div>
  );
}
