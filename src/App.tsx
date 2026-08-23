import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BookingSection } from './components/Booking/BookingSection';
import { ClubsSection } from './components/Clubs/ClubsSection';
import { MinitourSection } from './components/Minitour/MinitourSection';
import { AdminPanel } from './components/Admin/AdminPanel';
import { PromptPlanModal } from './components/PromptPlanModal';
import { TicketLookupModal } from './components/TicketLookupModal';
import { Footer } from './components/Footer';
import { 
  INITIAL_COURTS, INITIAL_CLUBS, INITIAL_MINITOURS, INITIAL_BOOKINGS, BSB_INFO 
} from './data/mockData';
import { Court, Club, Minitour, Booking, TournamentTeam } from './types';
import { DatabaseService, isSupabaseConfigured } from './lib/supabase';
import { 
  Calendar, Users, Trophy, Sparkles, ShieldCheck, 
  Flame, Award, CheckCircle2, ChevronRight, Phone, Database, Server
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'booking' | 'clubs' | 'minitour' | 'admin'>('booking');
  const [isAdmin, setIsAdmin] = useState(true); // default true for easy demo & admin testing
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-[#11385E] selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        onOpenPlanModal={() => setIsPlanModalOpen(true)}
        onOpenTicketLookup={() => setIsTicketModalOpen(true)}
      />

      {/* Database Connection Status Bar */}
      <div className="bg-slate-900 text-slate-300 py-1.5 px-4 text-xs flex items-center justify-between border-b border-slate-800">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
            </span>
            <span>
              {isSupabaseConfigured ? (
                <strong className="text-emerald-400">Supabase PostgreSQL Connected</strong>
              ) : (
                <strong className="text-blue-300">Local Persistent DB Engine (Ready for Supabase / Vercel deployment)</strong>
              )}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400">
            <span>6 Sân USAPA</span>
            <span>•</span>
            <span>{clubs.filter(c => c.status === 'ACTIVE').length} CLB Hoạt Động</span>
            <span>•</span>
            <span>{bookings.length} Lịch Đặt Sân</span>
          </div>
        </div>
      </div>

      {/* Hero Banner with Brand Slogan & Quick CTA */}
      <section className="bg-gradient-to-b from-[#11385E] via-[#14426e] to-[#1c558c] text-white py-10 md:py-12 px-4 relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-wider text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              SÂN PICKLEBALL CAO CẤP TIÊU CHUẨN USAPA
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              BETTER SOCIAL BALANCE
              <span className="block text-blue-200 text-2xl sm:text-3xl font-semibold mt-1">
                Khám phá năng lượng & đam mê cùng BSB Club
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-xl">
              Hệ thống đặt sân thông minh hỗ trợ <strong>Lịch Vãng Lai</strong> theo giờ, <strong>Lịch Cố Định</strong> hội viên chiết khấu 20%, tổ chức <strong>Sự Kiện</strong> trọn gói, kết nối <strong>CLB</strong> và các giải đấu <strong>Minitour</strong> kịch tính mỗi tuần.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('booking')}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-slate-950" />
                Đặt Sân Ngay Bây Giờ
              </button>

              <button
                onClick={() => setIsPlanModalOpen(true)}
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs border border-white/30 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Xem Kế Hoạch & Master Prompt AI
              </button>
            </div>
          </div>

          {/* Quick 3 Value Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-3 w-full md:w-80">
            <div 
              onClick={() => setActiveTab('booking')}
              className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15 hover:bg-white/20 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <Calendar className="w-4 h-4" />
                1. Đặt Lịch Sân Linh Hoạt
              </div>
              <p className="text-[11px] text-blue-100 mt-1">
                Vãng lai (theo slot), Cố định (tháng), Sự kiện doanh nghiệp.
              </p>
            </div>

            <div 
              onClick={() => setActiveTab('clubs')}
              className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15 hover:bg-white/20 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <Users className="w-4 h-4" />
                2. Câu Lạc Bộ (CLB) BSB
              </div>
              <p className="text-[11px] text-blue-100 mt-1">
                Admin tự quản lý CLB, người chơi tham gia giao lưu 1-click.
              </p>
            </div>

            <div 
              onClick={() => setActiveTab('minitour')}
              className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15 hover:bg-white/20 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Trophy className="w-4 h-4" />
                3. Giải Đấu Minitour
              </div>
              <p className="text-[11px] text-blue-100 mt-1">
                Tranh cúp BSB hàng tuần, chia bảng DUPR 2.0 - 4.5+.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main App Content according to active tab */}
      <main className="flex-1">
        {activeTab === 'booking' && (
          <BookingSection
            courts={courts}
            clubs={clubs}
            bookings={bookings}
            onAddBooking={handleAddBooking}
            onNavigateToClubs={() => setActiveTab('clubs')}
          />
        )}

        {activeTab === 'clubs' && (
          <ClubsSection
            clubs={clubs}
            onOpenAdminClubModal={() => {
              setActiveTab('admin');
            }}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'minitour' && (
          <MinitourSection
            minitours={minitours}
            onRegisterTeam={handleRegisterTournamentTeam}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            clubs={clubs}
            bookings={bookings}
            minitours={minitours}
            courts={courts}
            onAddClub={handleAddClub}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onAddMinitour={handleAddMinitour}
            onUpdateMatchScore={handleUpdateMatchScore}
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
    </div>
  );
}
