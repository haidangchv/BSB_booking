import React from 'react';
import { MapPin, Phone, Clock, Mail, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { BSBLogo } from './BSBLogo';
import { BSB_INFO } from '../data/mockData';

interface FooterProps {
  onOpenPlanModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPlanModal }) => {
  return (
    <footer className="bg-[#0b243d] text-slate-300 pt-12 pb-8 border-t border-blue-900/60 text-xs">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-blue-900/50">
          {/* Brand Col */}
          <div className="space-y-3">
            <BSBLogo variant="light" size="md" />
            <p className="text-slate-400 text-xs leading-relaxed mt-2">
              <strong>BSB - Better Social Balance</strong>. Cung cấp hệ sinh thái Pickleball chuẩn quốc tế, gắn kết cộng đồng đam mê thể thao và nâng cao sức khỏe toàn diện.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={onOpenPlanModal}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Kế Hoạch & Master Prompt AI
              </button>
            </div>
          </div>

          {/* Core Values */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">
              Giá Trị Cốt Lõi BSB
            </h4>
            <ul className="space-y-2 text-xs">
              {BSB_INFO.coreValues.map((v, i) => (
                <li key={i} className="space-y-0.5">
                  <div className="font-bold text-blue-300">{v.title}</div>
                  <div className="text-slate-400 text-[11px]">{v.desc}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Amenities & Facility */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">
              Tiện Ích Cụm Sân BSB
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {BSB_INFO.amenities.map((a, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">
              Thông Tin Liên Hệ
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{BSB_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hotline / Zalo: <strong className="text-white">{BSB_INFO.hotline}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{BSB_INFO.openHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>contact@bsbpickleball.vn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © 2026 BSB Pickleball Club. All rights reserved. (Better Social Balance)
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Quy định đặt sân</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Chính sách hoàn/đổi lịch</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Bảo mật thông tin</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
