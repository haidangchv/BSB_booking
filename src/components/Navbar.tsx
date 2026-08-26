import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, Users, Trophy, QrCode, FileText, 
  ShieldCheck, Phone, Sparkles, Menu, X, CheckCircle,
  User as UserIcon, LogIn, Ticket, LogOut, RefreshCw,
  ChevronDown, Award, Lock, ExternalLink
} from 'lucide-react';
import { BSBLogo } from './BSBLogo';
import { BSB_INFO } from '../data/mockData';
import { User } from '../types';
import { GoogleLogo } from './Auth/GoogleSignInModal';

interface NavbarProps {
  activeTab: 'booking' | 'clubs' | 'minitour' | 'admin';
  setActiveTab: (tab: 'booking' | 'clubs' | 'minitour' | 'admin') => void;
  currentUser: User | null;
  onOpenAuthModal: (tab?: 'login' | 'register' | 'switch') => void;
  onOpenMyBookings: () => void;
  onOpenPlanModal: () => void;
  onOpenTicketLookup: () => void;
  onLogout: () => void;
  onQuickSwitchRole: () => void;
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
  onQuickSwitchRole
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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs font-sans">
      {/* Top Banner with Brand Slogan & Status */}
      <div className="bg-[#11385E] py-1.5 px-4 text-center text-[11px] font-semibold text-blue-100 border-b border-blue-900 flex items-center justify-between">
        <div className="hidden md:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Hệ thống 6 sân USAPA mở cửa từ 05:30 - 23:00 hàng ngày</span>
        </div>
        <div className="mx-auto md:mx-0 font-bold tracking-wider text-amber-300 flex items-center gap-1.5">
          <span>BSB: BETTER SOCIAL BALANCE • CÂN BẰNG CUỘC SỐNG TÍCH CỰC</span>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onOpenPlanModal}
            className="text-amber-300 hover:text-white flex items-center gap-1 font-bold transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            📋 Kế Hoạch & Prompt AI
          </button>
          <span className="text-blue-300/40">|</span>
          <span className="text-blue-100 font-medium">Hotline: {BSB_INFO.hotline}</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('booking')}
          className="cursor-pointer flex items-center gap-3"
        >
          <BSBLogo variant="navy" size="sm" />
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('booking')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'booking'
                ? 'bg-white text-[#11385E] shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Calendar className={`w-4 h-4 ${activeTab === 'booking' ? 'text-[#11385E]' : 'text-slate-500'}`} />
            Lịch Đặt Sân
          </button>

          <button
            onClick={() => setActiveTab('clubs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'clubs'
                ? 'bg-white text-[#11385E] shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Users className={`w-4 h-4 ${activeTab === 'clubs' ? 'text-[#11385E]' : 'text-slate-500'}`} />
            Câu Lạc Bộ (CLB)
          </button>

          <button
            onClick={() => setActiveTab('minitour')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'minitour'
                ? 'bg-white text-[#11385E] shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Trophy className={`w-4 h-4 ${activeTab === 'minitour' ? 'text-amber-500' : 'text-slate-500'}`} />
            Minitour Giải Đấu
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-[#11385E] text-white shadow-xs'
                : isAdmin
                ? 'text-[#11385E] hover:text-[#0b2641] hover:bg-blue-50/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${activeTab === 'admin' ? 'text-emerald-300' : isAdmin ? 'text-emerald-600' : 'text-slate-500'}`} />
            Quản Trị Admin
            {isAdmin && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>
        </nav>

        {/* Right Actions & Authentication Area */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ticket Lookup Button */}
          <button
            onClick={onOpenTicketLookup}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 hidden sm:flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-indigo-600" />
            <span>Tra Cứu Vé</span>
          </button>

          {/* If user is logged in as Customer: Show "Lịch Của Tôi" shortcut */}
          {currentUser && currentUser.role === 'customer' && (
            <button
              onClick={onOpenMyBookings}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold border border-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Ticket className="w-4 h-4 text-amber-600" />
              <span className="hidden md:inline">Lịch Của Tôi</span>
            </button>
          )}

          {/* USER AUTH AREA */}
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-2xl border transition-all cursor-pointer ${
                  isAdmin 
                    ? 'bg-emerald-50/80 border-emerald-300 hover:bg-emerald-100/70 text-emerald-950' 
                    : 'bg-blue-50/80 border-blue-200 hover:bg-blue-100/70 text-slate-900'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs ${
                  isAdmin ? 'bg-[#11385E] ring-2 ring-emerald-400' : 'bg-indigo-600'
                }`}>
                  {isAdmin ? '🛡️' : currentUser.name.charAt(0)}
                </div>

                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-extrabold truncate max-w-[120px]">{currentUser.name}</p>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                      isAdmin ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
                    }`}>
                      {isAdmin ? 'ADMIN' : 'KHÁCH'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {isAdmin ? 'Toàn quyền quản trị' : `DUPR: ${currentUser.duprRating || '3.0'}`}
                  </p>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2.5 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-extrabold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500">{currentUser.email || currentUser.phone}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isAdmin ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isAdmin ? '🛡️ Quản Trị Viên (Admin)' : '🎾 Khách Hàng / Hội Viên'}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    {currentUser.role === 'customer' && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenMyBookings();
                        }}
                        className="w-full px-4 py-2 text-left font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Ticket className="w-4 h-4 text-amber-500" />
                        Lịch Đặt Chỗ Của Tôi
                      </button>
                    )}

                    {isAdmin ? (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setActiveTab('admin');
                        }}
                        className="w-full px-4 py-2 text-left font-bold text-[#11385E] hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Mở Bảng Quản Trị Admin
                      </button>
                    ) : null}

                    {/* Quick switch between Customer and Admin */}
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onQuickSwitchRole();
                      }}
                      className="w-full px-4 py-2 text-left font-bold text-indigo-700 hover:bg-indigo-50 flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-indigo-600" />
                        Chuyển sang {isAdmin ? 'Khách Hàng' : 'Admin'}
                      </span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono">
                        1-Click
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAuthModal('switch');
                      }}
                      className="w-full px-4 py-2 text-left font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-slate-400" />
                      Đổi Tài Khoản Khác...
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Đăng Xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Login / Register Button if Not Logged In */
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="px-3.5 py-2 bg-[#11385E] hover:bg-[#0c2946] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>Đăng Nhập</span>
              </button>

              <button
                onClick={() => onOpenAuthModal('login')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 hover:border-slate-400 transition-colors cursor-pointer shadow-xs"
                title="Đăng nhập nhanh bằng Google"
              >
                <GoogleLogo size={15} />
                <span>Google</span>
              </button>
            </div>
          )}

          {/* Plan & Prompt button on mobile */}
          <button
            onClick={onOpenPlanModal}
            className="lg:hidden p-2 bg-amber-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1 shadow-xs"
            title="Xem kế hoạch"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900 bg-slate-100 rounded-xl border border-slate-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2 text-xs">
          {/* User status on mobile */}
          {currentUser ? (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                  isAdmin ? 'bg-[#11385E]' : 'bg-indigo-600'
                }`}>
                  {isAdmin ? 'AD' : currentUser.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500">{isAdmin ? 'Quản Trị Viên (Admin)' : 'Khách Hàng / Hội Viên'}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  onQuickSwitchRole();
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[11px] font-bold border border-indigo-200 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Đổi vai trò
              </button>
            </div>
          ) : (
            <div className="space-y-2 mb-2">
              <button
                onClick={() => {
                  onOpenAuthModal('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-[#11385E] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                Đăng Nhập / Đăng Ký Hội Viên
              </button>

              <button
                onClick={() => {
                  onOpenAuthModal('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs"
              >
                <GoogleLogo size={16} />
                Tiếp Tục Bằng Tài Khoản Google
              </button>
            </div>
          )}

          <button
            onClick={() => { setActiveTab('booking'); setMobileMenuOpen(false); }}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-left flex items-center gap-2 ${
              activeTab === 'booking' ? 'bg-blue-50 text-[#11385E] border border-blue-200' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            Lịch Đặt Sân (Vãng lai, Cố định, Sự kiện)
          </button>

          <button
            onClick={() => { setActiveTab('clubs'); setMobileMenuOpen(false); }}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-left flex items-center gap-2 ${
              activeTab === 'clubs' ? 'bg-blue-50 text-[#11385E] border border-blue-200' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            Câu Lạc Bộ (CLB Sinh Hoạt)
          </button>

          <button
            onClick={() => { setActiveTab('minitour'); setMobileMenuOpen(false); }}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-left flex items-center gap-2 ${
              activeTab === 'minitour' ? 'bg-blue-50 text-[#11385E] border border-blue-200' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            Minitour Giải Đấu
          </button>

          <button
            onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-left flex items-center gap-2 ${
              activeTab === 'admin' ? 'bg-[#11385E] text-white' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Quản Trị Admin (Thêm CLB, Duyệt Sân, Tỷ Số)
          </button>

          {currentUser && (
            <button
              onClick={() => {
                onOpenMyBookings();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-left flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-200"
            >
              <Ticket className="w-4 h-4 text-amber-600" />
              Lịch Đặt Chỗ Của Tôi
            </button>
          )}

          <button
            onClick={() => { onOpenPlanModal(); setMobileMenuOpen(false); }}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-left flex items-center gap-2 text-slate-700 bg-slate-50 border border-slate-200"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Xem Bản Kế Hoạch & Master Prompt AI
          </button>
        </div>
      )}
    </header>
  );
};
