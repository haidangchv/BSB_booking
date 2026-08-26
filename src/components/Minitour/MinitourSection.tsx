import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Calendar, MapPin, Users, Award, Shield, 
  Sparkles, CheckCircle2, Flame, ArrowRight, DollarSign,
  Medal, UserCheck, Play, Check, X
} from 'lucide-react';
import { Minitour, TournamentTeam, User } from '../../types';

interface MinitourSectionProps {
  minitours: Minitour[];
  currentUser?: User | null;
  onRegisterTeam: (tourId: string, team: TournamentTeam) => void;
}

export const MinitourSection: React.FC<MinitourSectionProps> = ({
  minitours,
  currentUser,
  onRegisterTeam
}) => {
  const [selectedTourId, setSelectedTourId] = useState<string>(minitours[0]?.id || 'tour-1');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [player1, setPlayer1] = useState(currentUser?.name || '');
  const [player2, setPlayer2] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [duprEstimate, setDuprEstimate] = useState(currentUser?.duprRating ? `${currentUser.duprRating}` : '3.0');
  const [regSuccess, setRegSuccess] = useState(false);

  const openRegisterModal = () => {
    if (currentUser) {
      if (!player1) setPlayer1(currentUser.name);
      if (!phone) setPhone(currentUser.phone);
      if (currentUser.duprRating) setDuprEstimate(String(currentUser.duprRating));
    }
    setIsRegisterModalOpen(true);
  };

  const selectedTour = minitours.find(t => t.id === selectedTourId) || minitours[0];

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !player1.trim() || !player2.trim() || !phone.trim()) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const newTeam: TournamentTeam = {
      id: `team-${Date.now()}`,
      teamName,
      player1,
      player2,
      phone,
      duprEstimate,
      registeredAt: new Date().toISOString().split('T')[0],
      paymentStatus: 'paid'
    };

    onRegisterTeam(selectedTour.id, newTeam);
    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setIsRegisterModalOpen(false);
      setTeamName('');
      setPlayer1('');
      setPlayer2('');
      setPhone('');
    }, 2000);
  };

  return (
    <section id="minitour-section" className="py-12 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold tracking-wider uppercase mb-3">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          Hệ Thống Giải Đấu Mini Hàng Tuần • BSB MINITOUR
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#11385E] tracking-tight">
          GIẢI ĐẤU MINITOUR BSB 2026
        </h2>
        <p className="text-slate-600 text-sm md:text-base mt-2">
          Sân chơi cọ xát đỉnh cao theo từng cấp độ DUPR. Cúp vô địch BSB, giải thưởng tiền mặt hấp dẫn và livestream chuyên nghiệp.
        </p>
      </div>

      {/* Tour Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {minitours.map(tour => {
          const isSelected = selectedTourId === tour.id;
          return (
            <div
              key={tour.id}
              onClick={() => setSelectedTourId(tour.id)}
              className={`cursor-pointer rounded-2xl border transition-all p-5 relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-[#11385E] bg-blue-50/70 ring-2 ring-[#11385E]/30 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    tour.status === 'completed'
                      ? 'bg-slate-200 text-slate-700'
                      : tour.status === 'ongoing'
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {tour.status === 'completed' ? 'Đã kết thúc' : tour.status === 'ongoing' ? 'Đang thi đấu LIVE' : 'Mở đăng ký'}
                  </span>
                  <span className="text-xs font-bold text-amber-600">
                    {tour.prizeTotal.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 line-clamp-2">{tour.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{tour.subtitle}</p>

                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{tour.date} ({tour.timeRange})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-600" />
                    <span>Hạng mục: <strong className="text-slate-800">{tour.category}</strong> ({tour.duprBracket})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đội tham gia: <strong className="text-slate-800">{tour.teams.length}/{tour.maxTeams} Cặp</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold">
                <span className="text-[#11385E]">Lệ phí: {tour.entryFee.toLocaleString('vi-VN')}đ/cặp</span>
                <span className="text-blue-600 flex items-center gap-1">
                  Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Tournament Detail View */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="bg-[#11385E] text-white text-xs font-bold px-3 py-1 rounded-full">
                {selectedTour.category}
              </span>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full">
                {selectedTour.duprBracket}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" /> {selectedTour.location}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-[#11385E]">
              {selectedTour.title}
            </h3>
            <p className="text-slate-600 text-xs md:text-sm mt-1">{selectedTour.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {selectedTour.status === 'registration_open' && (
              <button
                onClick={openRegisterModal}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                Đăng Ký Cặp Đấu ({selectedTour.entryFee.toLocaleString('vi-VN')}đ)
              </button>
            )}
          </div>
        </div>

        {/* Prize Pool Highlights */}
        <div className="my-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 p-4 rounded-2xl border border-amber-200">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase mb-1">
              <Medal className="w-4 h-4 text-amber-500" />
              Giải Nhất (Vô Địch BSB)
            </div>
            <div className="text-xs text-slate-800 font-semibold">{selectedTour.prizeFirst}</div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase mb-1">
              <Medal className="w-4 h-4 text-slate-400" />
              Giải Nhì (Huy Chương Bạc)
            </div>
            <div className="text-xs text-slate-800 font-semibold">{selectedTour.prizeSecond}</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100/60 p-4 rounded-2xl border border-orange-200">
            <div className="flex items-center gap-2 text-orange-900 font-bold text-xs uppercase mb-1">
              <Medal className="w-4 h-4 text-orange-400" />
              Giải Ba (Huy Chương Đồng)
            </div>
            <div className="text-xs text-slate-800 font-semibold">{selectedTour.prizeThird}</div>
          </div>
        </div>

        {/* Interactive Bracket / Matches Grid */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-[#11385E] flex items-center gap-2">
              <Play className="w-4 h-4 text-blue-600" />
              Sơ Đồ Nhánh Đấu & Kết Quả Trận Đấu
            </h4>
            <span className="text-xs text-slate-500">Chuẩn USAPA • Chạm 11 / 15 điểm</span>
          </div>

          {selectedTour.matches && selectedTour.matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 overflow-x-auto">
              {/* Quarter Finals */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center pb-2 border-b border-slate-200">
                  Tứ Kết (Quarter-Finals)
                </div>
                {selectedTour.matches.filter(m => m.round === 'quarter').map(m => (
                  <div key={m.id} className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs text-xs space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>{m.roundName} • {m.courtName}</span>
                      <span>{m.time}</span>
                    </div>
                    {/* Team 1 */}
                    <div className={`flex justify-between items-center p-1.5 rounded-lg ${
                      m.winnerTeamId === m.team1?.id ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-300' : 'text-slate-700'
                    }`}>
                      <span className="truncate pr-2">{m.team1?.teamName || 'TBD'}</span>
                      <span className="font-mono text-xs">{m.score1 !== undefined ? m.score1 : '-'}</span>
                    </div>
                    {/* Team 2 */}
                    <div className={`flex justify-between items-center p-1.5 rounded-lg ${
                      m.winnerTeamId === m.team2?.id ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-300' : 'text-slate-700'
                    }`}>
                      <span className="truncate pr-2">{m.team2?.teamName || 'TBD'}</span>
                      <span className="font-mono text-xs">{m.score2 !== undefined ? m.score2 : '-'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Semi Finals */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center pb-2 border-b border-slate-200">
                  Bán Kết (Semi-Finals)
                </div>
                {selectedTour.matches.filter(m => m.round === 'semi').map(m => (
                  <div key={m.id} className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs text-xs space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>{m.roundName} • {m.courtName}</span>
                      <span>{m.time}</span>
                    </div>
                    <div className={`flex justify-between items-center p-1.5 rounded-lg ${
                      m.winnerTeamId === m.team1?.id ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-300' : 'text-slate-700'
                    }`}>
                      <span className="truncate pr-2">{m.team1?.teamName || 'Thắng TK 1'}</span>
                      <span className="font-mono text-xs">{m.score1 !== undefined ? m.score1 : '-'}</span>
                    </div>
                    <div className={`flex justify-between items-center p-1.5 rounded-lg ${
                      m.winnerTeamId === m.team2?.id ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-300' : 'text-slate-700'
                    }`}>
                      <span className="truncate pr-2">{m.team2?.teamName || 'Thắng TK 2'}</span>
                      <span className="font-mono text-xs">{m.score2 !== undefined ? m.score2 : '-'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Final & 3rd */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-700 text-center pb-2 border-b border-amber-200">
                  CHUNG KẾT & TRANH HẠNG BA
                </div>
                {selectedTour.matches.filter(m => m.round === 'final' || m.round === 'third_place').map(m => (
                  <div key={m.id} className={`rounded-xl p-3.5 border shadow-sm text-xs space-y-1.5 ${
                    m.round === 'final' ? 'bg-gradient-to-br from-amber-50 to-amber-100/40 border-amber-300' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex justify-between text-[10px] font-bold text-amber-900">
                      <span>{m.roundName}</span>
                      <span>{m.time}</span>
                    </div>
                    <div className={`flex justify-between items-center p-2 rounded-lg ${
                      m.winnerTeamId === m.team1?.id ? 'bg-amber-200 text-amber-950 font-extrabold border border-amber-400' : 'text-slate-700'
                    }`}>
                      <span className="truncate pr-2">{m.team1?.teamName || 'TBD'}</span>
                      <span className="font-mono text-xs font-bold">{m.score1 !== undefined ? m.score1 : '-'}</span>
                    </div>
                    <div className={`flex justify-between items-center p-2 rounded-lg ${
                      m.winnerTeamId === m.team2?.id ? 'bg-amber-200 text-amber-950 font-extrabold border border-amber-400' : 'text-slate-700'
                    }`}>
                      <span className="truncate pr-2">{m.team2?.teamName || 'TBD'}</span>
                      <span className="font-mono text-xs font-bold">{m.score2 !== undefined ? m.score2 : '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
              Giải đấu đang trong giai đoạn mở cổng nhận đăng ký. Ban tổ chức sẽ tiến hành bốc thăm nhánh đấu sau khi đủ {selectedTour.maxTeams} cặp VĐV.
            </div>
          )}
        </div>

        {/* Tournament Rules */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Điều Lệ & Quy Định Giải Đấu:
          </h4>
          <ul className="text-xs space-y-1 text-slate-600">
            {selectedTour.rules.map((r, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-[#11385E] font-bold">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* REGISTER TEAM MODAL */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 text-slate-800"
            >
              <div className="bg-[#11385E] text-white p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Đăng ký tham gia giải</span>
                  <h3 className="text-base font-bold">{selectedTour.title}</h3>
                </div>
                <button
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-full bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {regSuccess ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-white shadow-lg">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">ĐĂNG KÝ CẶP ĐẤU THÀNH CÔNG!</h4>
                  <p className="text-xs text-slate-600">
                    Cặp đấu <strong>{teamName}</strong> ({player1} & {player2}) đã được thêm vào danh sách thi đấu BSB Minitour.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Tên Đội / Cặp Đấu *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Sài Gòn Smashers / CLB BSB Dinking"
                      value={teamName}
                      onChange={e => setTeamName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        VĐV 1 (Tên + Tuổi) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: Trần Văn A"
                        value={player1}
                        onChange={e => setPlayer1(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        VĐV 2 (Tên + Tuổi) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: Lê Văn B"
                        value={player2}
                        onChange={e => setPlayer2(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Số điện thoại đội trưởng *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="VD: 0908 123 456"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Điểm DUPR tự đánh giá
                      </label>
                      <input
                        type="text"
                        value={duprEstimate}
                        onChange={e => setDuprEstimate(e.target.value)}
                        placeholder="VD: 3.0"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center text-amber-950 font-bold">
                    <span>Lệ phí thi đấu cặp:</span>
                    <span className="text-sm">{selectedTour.entryFee.toLocaleString('vi-VN')}đ</span>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#11385E] hover:bg-blue-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      Xác Nhận Đăng Ký & Tham Gia Giải
                    </button>
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
