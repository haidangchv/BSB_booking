import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, Users, Trophy, QrCode, ShieldCheck, 
  Menu, X, User as UserIcon, LogIn, Ticket, LogOut, 
  ChevronDown, Bell
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
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuthModal,
  onOpenMyBookings,
  onOpenPlanModal,
  onOpenTicketLookup,
  onLogout
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
    <header className="sticky top-0 z-40 bg-[#071c33] border-b border-blue-900/60 shadow-lg text-white font-sans backdrop-blur-md">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        
        {/* Left: Brand Logo & Tagline */}
        <div 
          onClick={() => {
            setActiveTab('booking');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="cursor-pointer flex items-center gap-3 sm:gap-4 shrink-0"
        >
          <BSBLogo variant="light" size="sm" />
          <span className="hidden xl:inline-block text-[10px] font-extrabold tracking-[0.25em] text-slate-300 uppercase border-l border-blue-800/80 pl-3">
            BETTER SOCIAL BALANCE
          </span>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
          {/* Trang chủ */}
          <button
            onClick={() => {
              setActiveTab('booking');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'booking'
                ? 'text-white hover:text-amber-300'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/40'
            }`}
          >
            Trang chủ
          </button>

          {/* Đặt sân trực tuyến (Featured with active capsule & glowing dot) */}
          <button
            onClick={() => {
              setActiveTab('booking');
              const el = document.getElementById('booking-calendar-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="relative px-4 py-2 rounded-xl text-xs font-extrabold bg-[#0d2a4a] text-white border border-blue-700/80 hover:border-amber-400 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-[#071c33] animate-pulse"></span>
            <span>Đặt sân trực tuyến</span>
          </button>

          {/* Lịch của tôi */}
          <button
            onClick={onOpenMyBookings}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-blue-900/40 transition-all cursor-pointer"
          >
            Lịch của tôi
          </button>

          {/* CLB & Sự kiện */}
          <button
            onClick={() => setActiveTab('clubs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'clubs'
                ? 'bg-blue-800/60 text-amber-300 font-bold border border-blue-700'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/40'
            }`}
          >
            CLB & Sự kiện
          </button>

          {/* Minitour */}
          <button
            onClick={() => setActiveTab('minitour')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'minitour'
                ? 'bg-blue-800/60 text-amber-300 font-bold border border-blue-700'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/40'
            }`}
          >
            Minitour
          </button>

          {/* Chính sách & Liên hệ */}
          <button
            onClick={() => {
              const el = document.querySelector('footer');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-blue-900/40 transition-all cursor-pointer"
          >
            Chính sách & Liên hệ
          </button>

          {/* Admin tab if admin */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900/80'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Right: Actions & User Capsule */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Bell / Ticket lookup */}
          <button
            onClick={onOpenTicketLookup}
            className="relative p-2.5 rounded-xl bg-[#0e2c4b] hover:bg-[#153e6b] border border-blue-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Tra cứu vé & Thông báo"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute 1.5 top-1.5 right-1.5 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
          </button>

          {/* USER AUTH AREA */}
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl bg-[#0e2c4b]/90 hover:bg-[#143c66] border border-blue-800/80 transition-all cursor-pointer"
              >
                {/* User Avatar Circle */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs ${
                  isAdmin ? 'bg-emerald-600 ring-2 ring-emerald-400' : 'bg-amber-500 text-slate-950'
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
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0a223a] rounded-2xl shadow-2xl border border-blue-800/80 py-2 z-50 text-xs text-slate-200 animate-in fade-in slide-in-from-top-2">
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
                      className="w-full px-4 py-2 text-left font-bold text-slate-200 hover:bg-blue-900/50 flex items-center gap-2 cursor-pointer"
                    >
                      <Ticket className="w-4 h-4 text-amber-400" />
                      Lịch Đặt Chỗ Của Tôi
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenTicketLookup();
                      }}
                      className="w-full px-4 py-2 text-left font-semibold text-slate-200 hover:bg-blue-900/50 flex items-center gap-2 cursor-pointer"
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
                        className="w-full px-4 py-2 text-left font-bold text-emerald-400 hover:bg-emerald-950/40 flex items-center gap-2 cursor-pointer"
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
                      className="w-full px-4 py-2 text-left font-bold text-red-400 hover:bg-red-950/30 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      Đăng Xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Login Button */
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white bg-[#0e2c4b] rounded-xl border border-blue-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#081f37] border-t border-blue-900/80 px-4 py-4 space-y-2 text-xs text-slate-200">
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
        </div>
      )}
    </header>
  );
};
