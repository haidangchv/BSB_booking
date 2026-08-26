import React from 'react';
import { 
  Calendar, Users, Activity, Check, ChevronRight, ArrowDown 
} from 'lucide-react';
import { BookingType } from '../types';

interface HomeHeroProps {
  onSelectBookingType: (type: BookingType) => void;
  onScrollToBooking: () => void;
  onNavigateToClubs: () => void;
  courtsCount?: number;
  availableSlotsCount?: number;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onSelectBookingType,
  onScrollToBooking,
  onNavigateToClubs,
  courtsCount = 4,
  availableSlotsCount = 14
}) => {
  return (
    <section className="relative bg-gradient-to-b from-[#071c33] via-[#0b2542] to-[#0e2f52] text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-blue-950">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none translate-y-1/3"></div>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: HERO CONTENT & BRAND SLOGAN */}
          <div className="lg:col-span-7 space-y-6">
            {/* Real-Time Engine Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d2a4a]/90 border border-[#1b4875] text-xs font-semibold text-emerald-300 shadow-sm backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>BSB Real-Time Booking Engine Online</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black text-white leading-[1.12] tracking-tight">
              Play <span className="text-amber-400">Better.</span>
              <br />
              Connect <span className="text-amber-400">Better.</span>
              <br />
              Live in Balance.
            </h1>

            {/* Description */}
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Hệ thống 9 cụm sân Pickleball BSB: gồm <strong>7 sân chuẩn quốc tế</strong> (Sân 6 & 7 VIP) và <strong>2 sân tập nhỏ</strong> (Sân 8 & 9). Trải nghiệm đặt lịch tức thì, chống trùng lịch tuyệt đối và tự động thông báo qua Email.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onScrollToBooking}
                className="px-6 sm:px-7 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-400/20 hover:shadow-amber-400/30 flex items-center gap-2.5 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-slate-950" />
                <span>Đặt Sân Ngay Bây Giờ</span>
                <ChevronRight className="w-4 h-4 text-slate-950" />
              </button>

              <button
                onClick={onNavigateToClubs}
                className="px-6 py-3.5 bg-[#143458]/80 hover:bg-[#1b436e] border border-slate-600/50 hover:border-slate-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Users className="w-4 h-4 text-amber-300" />
                <span>Khám Phá CLB & Minitour</span>
              </button>
            </div>

            {/* 5 Booking Type Filter Pills */}
            <div className="pt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium mr-1">5 Loại lịch:</span>
              
              <button
                onClick={() => onSelectBookingType('clb')}
                className="px-3 py-1 bg-[#102d4d] hover:bg-[#173e68] border border-blue-800/70 hover:border-amber-400/60 rounded-full text-slate-200 hover:text-white font-semibold transition-all cursor-pointer"
              >
                CLB
              </button>

              <button
                onClick={() => onSelectBookingType('minitour')}
                className="px-3 py-1 bg-[#102d4d] hover:bg-[#173e68] border border-blue-800/70 hover:border-amber-400/60 rounded-full text-slate-200 hover:text-white font-semibold transition-all cursor-pointer"
              >
                Minitour
              </button>

              <button
                onClick={() => onSelectBookingType('fixed')}
                className="px-3 py-1 bg-[#102d4d] hover:bg-[#173e68] border border-blue-800/70 hover:border-amber-400/60 rounded-full text-slate-200 hover:text-white font-semibold transition-all cursor-pointer"
              >
                Cố định
              </button>

              <button
                onClick={() => onSelectBookingType('casual')}
                className="px-3 py-1 bg-amber-400/15 border border-amber-400/60 text-amber-300 font-bold rounded-full transition-all cursor-pointer"
              >
                Vãng lai
              </button>

              <button
                onClick={() => onSelectBookingType('event')}
                className="px-3 py-1 bg-[#102d4d] hover:bg-[#173e68] border border-blue-800/70 hover:border-amber-400/60 rounded-full text-slate-200 hover:text-white font-semibold transition-all cursor-pointer"
              >
                Sự kiện
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: REAL-TIME STATUS CARD WIDGET */}
          <div className="lg:col-span-5">
            <div className="bg-[#0f2d4e]/90 backdrop-blur-xl border border-[#1d4c7a] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
              
              {/* Widget Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white">Tình Trạng Sân Hôm Nay</h3>
                    <p className="text-xs text-slate-300">Cập nhật trực tiếp theo thời gian thực</p>
                  </div>
                </div>

                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Open
                </span>
              </div>

              {/* 2 Stat Cards */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-[#091f37]/90 border border-[#18426d] rounded-2xl p-4 text-center">
                  <div className="text-3xl sm:text-4xl font-black text-amber-400">
                    7 Sân
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-1">
                    Sân chuẩn quốc tế
                  </div>
                </div>

                <div className="bg-[#091f37]/90 border border-[#18426d] rounded-2xl p-4 text-center">
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                    22+
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-1">
                    Khung giờ còn trống
                  </div>
                </div>
              </div>

              {/* Features List with Yellow Checkmarks */}
              <div className="space-y-2.5 pt-1 text-xs text-slate-200 font-medium">
                <div className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span><strong>7 Sân chuẩn quốc tế</strong> (Sân 6, 7 VIP) + <strong>2 Sân tập nhỏ</strong> (Sân 8, 9)</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Mặt sân US Open Pro Cushion 8 lớp giảm chấn thương</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Hệ thống chiếu sáng LED chống chói 500 - 1000 Lux</span>
                </div>
              </div>

              {/* Card Action Button */}
              <button
                onClick={onScrollToBooking}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                <span>Xem Lịch & Chọn Giờ Trống</span>
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
