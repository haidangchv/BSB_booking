import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Users, Trophy, QrCode, ShieldCheck, 
  Menu, X, User as UserIcon, LogIn, Ticket, LogOut, 
  ChevronDown, Bell, Sparkles, Play
} from 'lucide-react';
import { BSBLogo } from './BSBLogo';
import { User } from '../types';

interface NavbarProps {
  activeTab: 'booking' | 'clubs' | 'minitour' | 'admin';
  setActiveTab: (tab: 'booking' | 'clubs' | 'minitour' | 'admin') => void;
  currentUser: User | null;
  onOpenAuthModal: (tab?: 'login' | 'register' | 'switch') => void;
  onOpenMyBookings: () => void;
  onOpenPlanModal: () => void;
  onOpenTicketLookup: () => void;
  onLogout: () => void;
  onReplayIntro?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuthModal,
  onOpenMyBookings,
  onOpenPlanModal,
  onOpenTicketLookup,
  onLogout,
  onReplayIntro
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-[#051323]/95 border-b border-blue-900/60 shadow-xl text-white font-sans backdrop-blur-md">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
        
        {/* Left: Brand Logo & Tagline */}
        <div 
          onClick={() => {
            setActiveTab('booking');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="cursor-pointer flex items-center gap-3 sm:gap-4 shrink-0 group"
        >
          <BSBLogo variant="light" size="sm" className="group-hover:scale-105 transition-transform" />
          <span className="hidden xl:inline-block text-[10px] font-extrabold tracking-[0.25em] text-slate-300 uppercase border-l border-blue-800/80 pl-3">
            BETTER SOCIAL BALANCE
          </span>
        </div>

        {/* Center: Navigation Links with Animated Active Capsule */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
          {/* Trang chủ / Đặt sân */}
          <button
            onClick={() => {
              setActiveTab('booking');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'booking'
                ? 'text-white'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/40'
            }`}
          >
            {activeTab === 'booking' && (
              <motion.div
                layoutId="navbar-tab-indicator"
                className="absolute inset-0 bg-blue-600/40 border border-blue-400/50 rounded-xl -z-10 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Đặt Sân Trực Tuyến</span>
            </span>
          </button>

          {/* Lịch của tôi */}
          <button
            onClick={onOpenMyBookings}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-blue-900/40 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Ticket className="w-3.5 h-3.5 text-amber-400" />
            <span>Lịch của tôi</span>
          </button>

          {/* CLB & Sự kiện */}
          <button
            onClick={() => setActiveTab('clubs')}
            className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'clubs'
                ? 'text-amber-300'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/40'
            }`}
          >
            {activeTab === 'clubs' && (
              <motion.div
                layoutId="navbar-tab-indicator"
                className="absolute inset-0 bg-blue-600/40 border border-blue-400/50 rounded-xl -z-10 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>CLB & Sự kiện</span>
            </span>
          </button>

          {/* Minitour */}
          <button
            onClick={() => setActiveTab('minitour')}
            className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'minitour'
                ? 'text-amber-300'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/40'
            }`}
          >
            {activeTab === 'minitour' && (
              <motion.div
                layoutId="navbar-tab-indicator"
                className="absolute inset-0 bg-blue-600/40 border border-blue-400/50 rounded-xl -z-10 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Minitour</span>
            </span>
          </button>

          {/* Admin tab if admin */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'admin'
                  ? 'text-white'
                  : 'text-emerald-300 hover:text-white hover:bg-emerald-900/40'
              }`}
            >
              {activeTab === 'admin' && (
                <motion.div
                  layoutId="navbar-tab-indicator"
                  className="absolute inset-0 bg-emerald-600/60 border border-emerald-400/60 rounded-xl -z-10 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Right: Actions & User Capsule */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Replay Intro Button */}
          {onReplayIntro && (
            <button
              onClick={onReplayIntro}
              className="px-2.5 py-2 rounded-xl bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/60 text-xs font-semibold text-amber-300 flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer shadow-xs"
              title="Xem lại Animation Chào Mừng"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="hidden sm:inline">Intro</span>
            </button>
          )}

          {/* Notification Bell / Ticket lookup */}
          <button
            onClick={onOpenTicketLookup}
            className="relative p-2.5 rounded-xl bg-[#0e2c4b] hover:bg-[#153e6b] border border-blue-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Tra cứu vé & Thông báo"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
          </button>

          {/* USER AUTH AREA */}
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl bg-[#0e2c4b]/90 hover:bg-[#143c66] border border-blue-800/80 transition-all cursor-pointer hover:border-blue-600"
              >
                {/* User Avatar Circle */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-xs ${
                  isAdmin ? 'bg-emerald-600 text-white ring-2 ring-emerald-400' : 'bg-amber-400 text-slate-950 font-extrabold'
                }`}>
                  {isAdmin ? '🛡️' : currentUser.name.charAt(0)}
                </div>

                {/* User Name & Role */}
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-white truncate max-w-[120px] leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] font-semibold text-amber-300 leading-tight mt-0.5">
                    {isAdmin ? 'Quản Trị Viên' : 'Khách Hàng'}
                  </p>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-[#0a223a] rounded-2xl shadow-2xl border border-blue-800/80 py-2 z-50 text-xs text-slate-200"
                  >
                    <div className="px-4 py-2.5 border-b border-blue-900/60">
                      <p className="font-extrabold text-white">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400">{currentUser.email || currentUser.phone}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isAdmin ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                        }`}>
                          {isAdmin ? '🛡️ Quản Trị Viên (Admin)' : '🎾 Khách Hàng BSB'}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenMyBookings();
                        }}
                        className="w-full px-4 py-2 text-left font-bold text-slate-200 hover:bg-blue-900/50 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Ticket className="w-4 h-4 text-amber-400" />
                        Lịch Đặt Chỗ Của Tôi
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenTicketLookup();
                        }}
                        className="w-full px-4 py-2 text-left font-semibold text-slate-200 hover:bg-blue-900/50 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <QrCode className="w-4 h-4 text-indigo-400" />
                        Tra Cứu Vé & Check-in QR
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setActiveTab('admin');
                          }}
                          className="w-full px-4 py-2 text-left font-bold text-emerald-400 hover:bg-emerald-950/40 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Bảng Quản Trị Admin
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-blue-900/60">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 text-left font-bold text-red-400 hover:bg-red-950/30 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        Đăng Xuất
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Login Button */
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer shadow-lg shadow-amber-400/20"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white bg-[#0e2c4b] rounded-xl border border-blue-800 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-[#051323] border-t border-blue-900/80 px-4 py-4 space-y-2 text-xs text-slate-200 overflow-hidden"
          >
            <button
              onClick={() => {
                setActiveTab('booking');
                setMobileMenuOpen(false);
              }}
              className="w-full p-2.5 rounded-xl text-left font-bold flex items-center gap-2 hover:bg-blue-900/40 text-white"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              Lịch Đặt Sân Trực Tuyến
            </button>

            <button
              onClick={() => {
                onOpenMyBookings();
                setMobileMenuOpen(false);
              }}
              className="w-full p-2.5 rounded-xl text-left font-bold flex items-center gap-2 hover:bg-blue-900/40 text-white"
            >
              <Ticket className="w-4 h-4 text-amber-400" />
              Lịch Của Tôi
            </button>

            <button
              onClick={() => {
                setActiveTab('clubs');
                setMobileMenuOpen(false);
              }}
              className="w-full p-2.5 rounded-xl text-left font-bold flex items-center gap-2 hover:bg-blue-900/40 text-white"
            >
              <Users className="w-4 h-4 text-blue-400" />
              Câu Lạc Bộ (CLB) & Sự Kiện
            </button>

            <button
              onClick={() => {
                setActiveTab('minitour');
                setMobileMenuOpen(false);
              }}
              className="w-full p-2.5 rounded-xl text-left font-bold flex items-center gap-2 hover:bg-blue-900/40 text-white"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              Minitour Giải Đấu
            </button>

            <button
              onClick={() => {
                onOpenTicketLookup();
                setMobileMenuOpen(false);
              }}
              className="w-full p-2.5 rounded-xl text-left font-bold flex items-center gap-2 hover:bg-blue-900/40 text-white"
            >
              <QrCode className="w-4 h-4 text-indigo-400" />
              Tra Cứu Vé & Mã QR
            </button>

            {onReplayIntro && (
              <button
                onClick={() => {
                  onReplayIntro();
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-left font-bold flex items-center gap-2 hover:bg-blue-900/40 text-amber-300"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Xem Animation Chào Mừng
              </button>
            )}

            {currentUser && (
              <div className="pt-2 border-t border-blue-900/60 flex items-center justify-between">
                <span className="text-slate-400 text-xs font-semibold">{currentUser.name}</span>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-red-400 font-bold hover:underline"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
