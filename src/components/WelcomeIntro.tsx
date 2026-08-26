import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Play, Award, Zap, ShieldCheck } from 'lucide-react';
import { BSBLogo } from './BSBLogo';

interface WelcomeIntroProps {
  onComplete: () => void;
}

export const WelcomeIntro: React.FC<WelcomeIntroProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Step progression
    const t1 = setTimeout(() => setStep(1), 400);  // Court line draw
    const t2 = setTimeout(() => setStep(2), 1200); // Brand text & ball bounce
    const t3 = setTimeout(() => setStep(3), 2200); // Badges & ready

    // Progress bar for auto-skip
    const startTime = Date.now();
    const duration = 4800; // 4.8s total duration
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        onComplete();
      }
    }, 40);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 bg-[#051323] text-white flex flex-col items-center justify-center p-4 overflow-hidden select-none"
    >
      {/* Dynamic Ambient Background Lights */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-amber-500/15 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center text-center space-y-7">
        
        {/* Top Tagline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/50 border border-blue-500/30 text-xs font-bold text-amber-300 backdrop-blur-md shadow-lg"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>CHÀO MỪNG ĐẾN VỚI BSB PICKLEBALL CLUB</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </motion.div>

        {/* Central Court & Animated Ball Visual */}
        <div className="relative w-72 h-40 sm:w-80 sm:h-44 bg-[#0a233f]/90 rounded-2xl border-2 border-blue-500/40 p-3 shadow-2xl flex items-center justify-center overflow-hidden">
          {/* Animated SVG Court Layout */}
          <svg className="w-full h-full text-blue-400/60" viewBox="0 0 300 160" fill="none">
            {/* Court boundary */}
            <rect 
              x="10" y="10" width="280" height="140" rx="6" 
              stroke="currentColor" strokeWidth="2.5" strokeDasharray="900"
              className={step >= 1 ? "court-line-anim" : ""}
            />
            {/* Center Net */}
            <line 
              x1="150" y1="10" x2="150" y2="150" 
              stroke="#f59e0b" strokeWidth="3" strokeDasharray="4 2"
            />
            {/* Non-Volley Zone (Kitchen) Lines */}
            <line x1="110" y1="10" x2="110" y2="150" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.7" />
            <line x1="190" y1="10" x2="190" y2="150" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.7" />
            
            {/* Center Service Line */}
            <line x1="10" y1="80" x2="110" y2="80" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.7" />
            <line x1="190" y1="80" x2="290" y2="80" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.7" />

            {/* Kitchen Zone Tint */}
            <rect x="110" y="10" width="80" height="140" fill="#3b82f6" fillOpacity="0.12" />
          </svg>

          {/* Glowing Animated Pickleball */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={step >= 2 ? {
              scale: 1,
              opacity: 1,
              x: [-70, 0, 70, 0, -70],
              y: [0, -38, 0, -32, 0],
            } : {}}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-lime-400 to-yellow-200 shadow-[0_0_20px_#facc15] flex items-center justify-center pointer-events-none"
          >
            {/* Ball holes details */}
            <div className="grid grid-cols-2 gap-0.5">
              <span className="w-1 h-1 rounded-full bg-slate-900/40" />
              <span className="w-1 h-1 rounded-full bg-slate-900/40" />
              <span className="w-1 h-1 rounded-full bg-slate-900/40" />
              <span className="w-1 h-1 rounded-full bg-slate-900/40" />
            </div>
          </motion.div>

          {/* Court Center Label */}
          <div className="absolute text-[10px] font-black tracking-widest text-slate-400/80 uppercase">
            NVZ KITCHEN
          </div>
        </div>

        {/* Main Logo & Typography Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={step >= 2 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-3"
        >
          <div className="flex justify-center">
            <BSBLogo variant="light" size="lg" />
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Play <span className="text-amber-400">Better.</span> Connect <span className="text-amber-400">Better.</span>
          </h2>
          
          <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto font-medium">
            Hệ thống 9 sân chuẩn quốc tế • Đặt lịch thông minh • Chống trùng tuyệt đối
          </p>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={step >= 3 ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-lg text-xs"
        >
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200 flex flex-col items-center gap-1 shadow-md">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-[11px]">Giữ Slot 5 Phút</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200 flex flex-col items-center gap-1 shadow-md">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-[11px]">9 Cụm Sân Cao Cấp</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200 flex flex-col items-center gap-1 shadow-md">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-[11px]">QR Check-in 1 Chạm</span>
          </div>
        </motion.div>

        {/* Actions & Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="w-full max-w-xs space-y-3 pt-2"
        >
          <button
            onClick={onComplete}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-amber-400/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
          >
            <span>Vào Sân Trải Nghiệm</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          {/* Auto dismiss progress bar */}
          <div className="space-y-1.5">
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-400 transition-all duration-75 ease-linear rounded-full shadow-[0_0_8px_#f59e0b]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium px-1">
              <span>Tự động vào sau {Math.max(1, Math.ceil((4800 - (progress * 48)) / 1000))}s</span>
              <button 
                onClick={onComplete}
                className="hover:text-white underline cursor-pointer"
              >
                Bỏ qua
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};
