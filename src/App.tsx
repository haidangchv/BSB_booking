import React, { useState, useEffect } from 'react';
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
import { Footer } from './components/Footer';
import { 
  INITIAL_COURTS, INITIAL_CLUBS, INITIAL_MINITOURS, INITIAL_BOOKINGS, 
  DEFAULT_ADMIN_USER, DEFAULT_CUSTOMER_USER 
} from './data/mockData';
import { Court, Club, Minitour, Booking, TournamentTeam, User, BookingType } from './types';
import { DatabaseService, isSupabaseConfigured } from './lib/supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState<'booking' | 'clubs' | 'minitour' | 'admin'>('booking');
  const [selectedBookingType, setSelectedBookingType] = useState<BookingType>('casual');
  const [isLoading, setIsLoading] = useState(true);

  // Authentication State: Khách Hàng (Customer) vs Quản Trị Viên (Admin)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('bsb_current_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    // Default to a realistic active Customer user for instant exploration
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
          DatabaseService.getClubs(true), // Include inactive for admin
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
      localStorage.setItem('bsb_current_user', JSON.stringify(user));
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('bsb_current_user');
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
    <div className="min-h-screen bg-[#071c33] text-slate-800 flex flex-col font-sans selection:bg-[#11385E] selection:text-white">
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
      />

      {/* Hero Section */}
      {activeTab === 'booking' && (
        <HomeHero
          onSelectBookingType={handleSelectHeroBookingType}
          onScrollToBooking={handleScrollToBooking}
          onNavigateToClubs={() => setActiveTab('clubs')}
          courtsCount={courts.length || 4}
          availableSlotsCount={14}
        />
      )}

      {/* Main App Content according to active tab */}
      <main className="flex-1 bg-[#f8fafc]">
        {activeTab === 'booking' && (
          <BookingSection
            courts={courts}
            clubs={clubs}
            bookings={bookings}
            currentUser={currentUser}
            initialBookingType={selectedBookingType}
            onAddBooking={handleAddBooking}
            onNavigateToClubs={() => setActiveTab('clubs')}
          />
        )}

        {activeTab === 'clubs' && (
          <ClubsSection
            clubs={clubs}
            currentUser={currentUser}
            onOpenAdminClubModal={() => {
              setActiveTab('admin');
            }}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'minitour' && (
          <MinitourSection
            minitours={minitours}
            currentUser={currentUser}
            onRegisterTeam={handleRegisterTournamentTeam}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            clubs={clubs}
            bookings={bookings}
            minitours={minitours}
            courts={courts}
            currentUser={currentUser}
            onAddClub={handleAddClub}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onAddMinitour={handleAddMinitour}
            onUpdateMatchScore={handleUpdateMatchScore}
            onSwitchToAdmin={() => handleLogin(DEFAULT_ADMIN_USER)}
            onNavigateToBooking={() => setActiveTab('booking')}
          />
        )}
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
