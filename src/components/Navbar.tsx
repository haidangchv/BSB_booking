import React from 'react';
import { 
  Calendar, Users, Trophy, QrCode, FileText, 
  ShieldCheck, Phone, Sparkles, Menu, X, CheckCircle 
} from 'lucide-react';
import { BSBLogo } from './BSBLogo';
import { BSB_INFO } from '../data/mockData';

interface NavbarProps {
  activeTab: 'booking' | 'clubs' | 'minitour' | 'admin';
  setActiveTab: (tab: 'booking' | 'clubs' | 'minitour' | 'admin') => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  onOpenPlanModal: () => void;
  onOpenTicketLookup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  setIsAdmin,
  onOpenPlanModal,
  onOpenTicketLookup
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner with Brand Slogan */}
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
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Calendar className={`w-4 h-4 ${activeTab === 'booking' ? 'text-indigo-600' : 'text-slate-500'}`} />
            Lịch Đặt Sân
          </button>

          <button
            onClick={() => setActiveTab('clubs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'clubs'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Users className={`w-4 h-4 ${activeTab === 'clubs' ? 'text-indigo-600' : 'text-slate-500'}`} />
            Câu Lạc Bộ (CLB)
          </button>

          <button
            onClick={() => setActiveTab('minitour')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'minitour'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Trophy className={`w-4 h-4 ${activeTab === 'minitour' ? 'text-indigo-600' : 'text-slate-500'}`} />
            Minitour Giải Đấu
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${activeTab === 'admin' ? 'text-emerald-300' : 'text-emerald-600'}`} />
            Quản Trị Admin
          </button>
        </nav>

        {/* Right Actions with Professional Polish style */}
        <div className="flex items-center gap-3">
          {/* Online badge */}
          <span className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Trực tuyến • 6 Sân Sẵn Sàng
          </span>

          {/* Ticket Lookup Button */}
          <button
            onClick={onOpenTicketLookup}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Tra Cứu Vé</span>
          </button>

          {/* User / Admin Indicator */}
          <div 
            onClick={() => setActiveTab('admin')}
            className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200 cursor-pointer group"
          >
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Quản trị viên</p>
              <p className="text-[10px] text-slate-500 font-mono">ID: BSB-001</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-xs">
              AD
            </div>
          </div>

          {/* Plan & Prompt button on mobile */}
          <button
            onClick={onOpenPlanModal}
            className="lg:hidden p-2 bg-amber-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1 shadow-xs"
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
          <button
            onClick={() => { setActiveTab('booking'); setMobileMenuOpen(false); }}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-left flex items-center gap-2 ${
              activeTab === 'booking' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            Lịch Đặt Sân (Vãng lai, Cố định, Sự kiện)
          </button>

          <button
            onClick={() => { setActiveTab('clubs'); setMobileMenuOpen(false); }}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-left flex items-center gap-2 ${
              activeTab === 'clubs' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-600" />
            Câu Lạc Bộ (CLB Sinh Hoạt)
          </button>

          <button
            onClick={() => { setActiveTab('minitour'); setMobileMenuOpen(false); }}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-left flex items-center gap-2 ${
              activeTab === 'minitour' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Trophy className="w-4 h-4 text-indigo-600" />
            Minitour Giải Đấu
          </button>

          <button
            onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-left flex items-center gap-2 ${
              activeTab === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Quản Trị Admin (Thêm CLB, Lịch Sân, Tỷ Số)
          </button>

          <button
            onClick={() => { onOpenPlanModal(); setMobileMenuOpen(false); }}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-left flex items-center gap-2 text-amber-800 bg-amber-50 border border-amber-200"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            Xem Bản Kế Hoạch & Master Prompt AI
          </button>
        </div>
      )}
    </header>
  );
};
