import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Calendar, Clock, Award, Shield, CheckCircle2, 
  PlusCircle, Sparkles, Phone, MessageCircle, ChevronRight,
  Info, Lock, UserPlus, HeartHandshake, Check, X
} from 'lucide-react';
import { Club } from '../../types';

interface ClubsSectionProps {
  clubs: Club[];
  onOpenAdminClubModal: () => void;
  isAdmin: boolean;
}

export const ClubsSection: React.FC<ClubsSectionProps> = ({
  clubs,
  onOpenAdminClubModal,
  isAdmin
}) => {
  const [selectedClubForJoin, setSelectedClubForJoin] = useState<Club | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [duprSelf, setDuprSelf] = useState('DUPR 3.0');
  const [joinSuccess, setJoinSuccess] = useState(false);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberPhone.trim()) {
      alert('Vui lòng nhập họ tên và số điện thoại');
      return;
    }
    setJoinSuccess(true);
    setTimeout(() => {
      setJoinSuccess(false);
      setSelectedClubForJoin(null);
      setMemberName('');
      setMemberPhone('');
    }, 2000);
  };

  return (
    <section id="clubs-section" className="py-12 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-[#11385E] text-xs font-bold tracking-wider uppercase mb-3">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            Cộng Đồng Thể Thao Văn Minh • BSB CLUBS
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#11385E] tracking-tight">
            CÂU LẠC BỘ PICKLEBALL BSB
          </h2>
          <p className="text-slate-600 text-sm md:text-base mt-1 max-w-2xl">
            Các câu lạc bộ sinh hoạt định kỳ tại BSB. Tham gia giao lưu rèn luyện sức khỏe, nâng tầm trình độ và mở rộng kết nối.
          </p>
        </div>

        {/* Admin Action Button */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <button
              onClick={onOpenAdminClubModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#11385E] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              + Admin Thêm Câu Lạc Bộ Mới
            </button>
          ) : (
            <button
              onClick={onOpenAdminClubModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Quản Trị CLB (Dành cho Ban Chủ Nhiệm)
            </button>
          )}
        </div>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clubs.map(club => (
          <div
            key={club.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
          >
            {/* Top Image & Badge */}
            <div className="relative h-48 overflow-hidden bg-slate-900">
              <img
                src={club.coverImage}
                alt={club.name}
                className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              
              <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                <span className="bg-[#11385E]/90 text-white backdrop-blur-xs text-[10px] font-bold px-2.5 py-1 rounded-md border border-white/20">
                  {club.badge}
                </span>
                <span className="bg-emerald-600/90 text-white backdrop-blur-xs text-[10px] font-bold px-2.5 py-1 rounded-md">
                  {club.duprLevel}
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="text-xl font-bold">{club.name}</h3>
                <p className="text-xs text-blue-200 line-clamp-1">{club.tagline}</p>
              </div>
            </div>

            {/* Club Details */}
            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <p className="text-xs text-slate-600 leading-relaxed">
                {club.description}
              </p>

              {/* Specs Box */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Lịch sinh hoạt:</div>
                    <div className="font-semibold">{club.scheduleDescription}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Thành viên:</div>
                    <div className="font-semibold">{club.memberCount} Vận động viên</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Award className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Chủ nhiệm / HLV:</div>
                    <div className="font-semibold">{club.leaderName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <HeartHandshake className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Sinh hoạt phí:</div>
                    <div className="font-bold text-[#11385E]">{club.monthlyFee.toLocaleString('vi-VN')}đ/tháng</div>
                  </div>
                </div>
              </div>

              {/* Tags & Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex gap-1.5 flex-wrap">
                  {club.tags.map(t => (
                    <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                      #{t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedClubForJoin(club)}
                  className="px-4 py-2 bg-[#11385E] hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-300" />
                  Đăng Ký Giao Lưu
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QUICK JOIN CLUB MODAL (KHÁCH KHÔNG CẦN ĐIỀN NHIỀU THÔNG TIN) */}
      <AnimatePresence>
        {selectedClubForJoin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 text-slate-800"
            >
              <div className="bg-[#11385E] text-white p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Đăng ký tham gia sinh hoạt</span>
                  <h3 className="text-base font-bold">{selectedClubForJoin.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedClubForJoin(null)}
                  className="text-white/80 hover:text-white p-1 rounded-full bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {joinSuccess ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-white shadow-lg">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">ĐÃ GỬI ĐĂNG KÝ GIAO LƯU!</h4>
                  <p className="text-xs text-slate-600">
                    Ban chủ nhiệm CLB <strong>{selectedClubForJoin.name}</strong> ({selectedClubForJoin.leaderPhone}) sẽ liên hệ với bạn qua Zalo/SĐT để xếp sân giao lưu trong buổi sinh hoạt gần nhất!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleJoinSubmit} className="p-6 space-y-4 text-xs">
                  <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-blue-950">
                    <div className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Lịch sinh hoạt: {selectedClubForJoin.scheduleDescription}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      Mức phí: {selectedClubForJoin.monthlyFee.toLocaleString('vi-VN')}đ/tháng • Trình độ {selectedClubForJoin.duprLevel}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Họ và Tên VĐV *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Nguyễn Văn Nam"
                      value={memberName}
                      onChange={e => setMemberName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Số điện thoại / Zalo nhận liên hệ *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="VD: 0909 123 456"
                      value={memberPhone}
                      onChange={e => setMemberPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Trình độ DUPR tự đánh giá
                    </label>
                    <select
                      value={duprSelf}
                      onChange={e => setDuprSelf(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                    >
                      <option value="Mới chơi (Dưới 2.5)">Mới chơi (Dưới 2.5)</option>
                      <option value="DUPR 2.5 - 3.0 (Cơ bản)">DUPR 2.5 - 3.0 (Cơ bản)</option>
                      <option value="DUPR 3.0 - 3.5 (Khá)">DUPR 3.0 - 3.5 (Khá)</option>
                      <option value="DUPR 3.5 - 4.5+ (Chuyên sâu/Nâng cao)">DUPR 3.5 - 4.5+ (Chuyên sâu/Nâng cao)</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#11385E] hover:bg-blue-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      Xác Nhận Tham Gia Giao Lưu
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-2">
                      Thông tin được gửi trực tiếp đến Chủ nhiệm CLB để sắp xếp sân & đối thủ tương xứng.
                    </p>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
