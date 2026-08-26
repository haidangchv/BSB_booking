import React from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, Users, Activity, Check, ChevronRight, ArrowDown, Sparkles, Trophy
} from 'lucide-react';
import { BookingType } from '../types';

interface HomeHeroProps {
  selectedBookingType?: BookingType;
  onSelectBookingType: (type: BookingType) => void;
  onScrollToBooking: () => void;
  onNavigateToClubs: () => void;
  courtsCount?: number;
  availableSlotsCount?: number;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  selectedBookingType = 'casual',
  onSelectBookingType,
  onScrollToBooking,
  onNavigateToClubs,
  courtsCount = 9,
  availableSlotsCount = 22
}) => {
  return (
    <section className="relative bg-gradient-to-b from-[#051323] via-[#091f37] to-[#0e2f52] text-white pt-8 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-blue-950/80">
      {/* Background ambient lighting & floating glowing elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 animate-pulse-glow" />
      <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none translate-y-1/3 animate-pulse-glow" style={{ animationDelay: '2s' }} />
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Decorative subtle floating pickleball ball */}
      <motion.div 
        animate={{ 
          y: [-10, 10, -10],
          rotate: [0, 15, -15, 0]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="hidden xl:block absolute top-12 right-[42%] w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400/20 via-lime-400/20 to-yellow-200/10 blur-sm pointer-events-none border border-amber-400/20"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: HERO CONTENT & BRAND SLOGAN */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Real-Time Engine Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d2a4a]/90 border border-[#1b4875] text-xs font-semibold text-emerald-300 shadow-lg backdrop-blur-md"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>BSB Real-Time Engine • Tránh Trùng Lịch 100%</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl lg:text-[58px] font-black text-white leading-[1.12] tracking-tight"
            >
              Play <span className="text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.35)]">Better.</span>
              <br />
              Connect <span className="text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.35)]">Better.</span>
              <br />
              Live in Balance.
            </motion.h1>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl"
            >
              Hệ thống 9 cụm sân Pickleball BSB: gồm <strong>7 sân chuẩn quốc tế</strong> (Sân 6 & 7 VIP) và <strong>2 sân tập nhỏ</strong> (Sân 8 & 9). Trải nghiệm đặt lịch tức thì theo slot 30 phút linh hoạt, hỗ trợ giữ slot 5 phút và thanh toán QR liền mạch.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <button
                onClick={onScrollToBooking}
                className="px-6 sm:px-7 py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-amber-400/25 flex items-center gap-2.5 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-slate-950" />
                <span>Đặt Sân Ngay Bây Giờ</span>
                <ChevronRight className="w-4 h-4 text-slate-950" />
              </button>

              <button
                onClick={onNavigateToClubs}
                className="px-6 py-3.5 bg-[#143458]/90 hover:bg-[#1c4877] border border-blue-700/60 hover:border-blue-500/80 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md backdrop-blur-sm"
              >
                <Users className="w-4 h-4 text-amber-300" />
                <span>Khám Phá CLB & Minitour</span>
              </button>
            </motion.div>

            {/* 5 Booking Type Filter Pills with Animated Moving Yellow Indicator */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="pt-3 flex flex-wrap items-center gap-2 text-xs"
            >
              <span className="text-slate-400 font-medium mr-1">5 Loại lịch:</span>
              
              {[
                { type: 'clb' as BookingType, label: 'CLB (-10%)' },
                { type: 'minitour' as BookingType, label: 'Minitour' },
                { type: 'fixed' as BookingType, label: 'Cố định (-20%)' },
                { type: 'casual' as BookingType, label: 'Vãng lai (Slot 30m)' },
                { type: 'event' as BookingType, label: 'Sự kiện' }
              ].map((item) => {
                const isSelected = selectedBookingType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => onSelectBookingType(item.type)}
                    className={`relative px-3.5 py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer z-10 select-none ${
                      isSelected
                        ? 'text-amber-300'
                        : 'text-slate-200 hover:text-white hover:bg-[#173e68]/60'
                    }`}
                  >
                    {isSelected ? (
                      <motion.div
                        layoutId="hero-booking-type-indicator"
                        className="absolute inset-0 bg-amber-400/20 border-2 border-amber-400 rounded-full -z-10 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#102d4d] hover:bg-[#173e68] border border-blue-800/70 hover:border-amber-400/50 rounded-full -z-10 transition-colors" />
                    )}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN: REAL-TIME STATUS CARD WIDGET */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="bg-[#0f2d4e]/90 backdrop-blur-xl border border-[#1d4c7a] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 transition-all hover:border-blue-400/50 hover:shadow-blue-500/10">
              
              {/* Widget Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400">
                    <Activity className="w-5 h-5 animate-pulse" />
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
                <div className="bg-[#091f37]/90 border border-[#18426d] rounded-2xl p-4 text-center transition-all hover:scale-[1.02] hover:border-amber-400/40">
                  <div className="text-3xl sm:text-4xl font-black text-amber-400">
                    {courtsCount} Sân
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-1">
                    7 Quốc Tế + 2 Tập Nhỏ
                  </div>
                </div>

                <div className="bg-[#091f37]/90 border border-[#18426d] rounded-2xl p-4 text-center transition-all hover:scale-[1.02] hover:border-emerald-400/40">
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                    {availableSlotsCount}+
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-1">
                    Slot 30m Trống Hôm Nay
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
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Xem Lịch & Chọn Slot Trống</span>
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
