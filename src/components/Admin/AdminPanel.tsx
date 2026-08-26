import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, Users, Calendar, Trophy, Plus, Check, 
  Trash2, Edit, CheckCircle2, Clock, X, DollarSign, 
  Activity, Layers, AlertCircle, FileText, Database, 
  RefreshCw, Lock, Sparkles, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import { Club, Booking, Minitour, Court, BookingType, BookingStatus, User } from '../../types';
import { DatabaseService, isSupabaseConfigured } from '../../lib/supabase';

interface AdminPanelProps {
  clubs: Club[];
  bookings: Booking[];
  minitours: Minitour[];
  courts: Court[];
  currentUser?: User | null;
  onAddClub: (club: Club) => void;
  onUpdateBookingStatus: (id: string, status: BookingStatus) => void;
  onAddMinitour: (tour: Minitour) => void;
  onUpdateMatchScore: (tourId: string, matchId: string, s1: number, s2: number, winnerId?: string) => void;
  onSwitchToAdmin?: () => void;
  onNavigateToBooking?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  clubs,
  bookings,
  minitours,
  courts,
  currentUser,
  onAddClub,
  onUpdateBookingStatus,
  onAddMinitour,
  onUpdateMatchScore,
  onSwitchToAdmin,
  onNavigateToBooking
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'clubs' | 'bookings' | 'minitours' | 'database' | 'stats'>('clubs');

  // Role Guard Check: If not logged in or role is not admin
  const isUserAdmin = currentUser?.role === 'admin';

  // New Club Form State (As requested: Admin adds club details directly)
  const [newClubName, setNewClubName] = useState('');
  const [newClubTagline, setNewClubTagline] = useState('');
  const [newClubDesc, setNewClubDesc] = useState('');
  const [newClubLeader, setNewClubLeader] = useState('');
  const [newClubPhone, setNewClubPhone] = useState('');
  const [newClubSchedule, setNewClubSchedule] = useState('Thứ 3 - 5 - 7 (18:00 - 20:00)');
  const [newClubDupr, setNewClubDupr] = useState('DUPR 2.5 - 3.5');
  const [newClubFee, setNewClubFee] = useState<number>(600000);
  const [newClubBadge, setNewClubBadge] = useState('CLB Mới Thành Lập');
  const [newClubImage, setNewClubImage] = useState('https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=800&q=80');
  const [newClubTags, setNewClubTags] = useState('Giao lưu, DUPR 3.0, Nâng cao');
  const [showAddClubModal, setShowAddClubModal] = useState(false);

  // New Tournament Form State
  const [showAddTourModal, setShowAddTourModal] = useState(false);
  const [newTourTitle, setNewTourTitle] = useState('');
  const [newTourCategory, setNewTourCategory] = useState<'Đôi Nam' | 'Đôi Nữ' | 'Đôi Nam Nữ' | 'Mở rộng Open'>('Đôi Nam Nữ');
  const [newTourDupr, setNewTourDupr] = useState('DUPR 3.0');
  const [newTourDate, setNewTourDate] = useState('2026-09-26');
  const [newTourFee, setNewTourFee] = useState<number>(500000);
  const [newTourPrize, setNewTourPrize] = useState<number>(12000000);

  // Filter Bookings
  const [bookingFilter, setBookingFilter] = useState<'all' | BookingType>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleCreateClubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName.trim() || !newClubLeader.trim()) {
      alert('Vui lòng nhập Tên CLB và Tên Chủ Nhiệm');
      return;
    }

    const club: Club = {
      id: `club-${Date.now()}`,
      name: newClubName,
      tagline: newClubTagline || 'CLB Pickleball chính thức tại cụm sân BSB',
      description: newClubDesc || 'Sinh hoạt giao lưu, rèn luyện kỹ thuật và thi đấu giao hữu hàng tuần.',
      leaderName: newClubLeader,
      leaderPhone: newClubPhone || '0908 123 272',
      scheduleDescription: newClubSchedule,
      regularDays: [2, 4, 6],
      regularTime: '18:00 - 20:00',
      assignedCourtIds: ['court-1', 'court-2'],
      memberCount: 15,
      duprLevel: newClubDupr,
      monthlyFee: newClubFee,
      badge: newClubBadge,
      coverImage: newClubImage,
      tags: newClubTags.split(',').map(t => t.trim()),
      status: 'ACTIVE',
      isOpenForMembers: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddClub(club);
    setShowAddClubModal(false);
    // Reset
    setNewClubName('');
    setNewClubTagline('');
    setNewClubDesc('');
    setNewClubLeader('');
  };

  const handleCreateTourSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTourTitle.trim()) return;

    const tour: Minitour = {
      id: `tour-${Date.now()}`,
      title: newTourTitle,
      subtitle: `Giải đấu Minitour hàng tuần tranh cúp BSB`,
      bannerImage: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=1200&q=80',
      date: newTourDate,
      timeRange: '14:00 - 20:00 (Thứ Bảy)',
      location: 'Cụm sân BSB Center (Sân 1, 2, 3)',
      format: 'knockout_8',
      category: newTourCategory,
      duprBracket: newTourDupr,
      entryFee: newTourFee,
      prizeTotal: newTourPrize,
      prizeFirst: `${(newTourPrize * 0.6).toLocaleString('vi-VN')}đ + Cúp Vô Địch BSB`,
      prizeSecond: `${(newTourPrize * 0.25).toLocaleString('vi-VN')}đ + Huy chương Bạc`,
      prizeThird: `${(newTourPrize * 0.15).toLocaleString('vi-VN')}đ + Huy chương Đồng`,
      maxTeams: 8,
      teams: [],
      matches: [],
      status: 'registration_open',
      rules: ['Chuẩn USAPA', 'Bóng thi đấu Franklin X-40']
    };

    onAddMinitour(tour);
    setShowAddTourModal(false);
    setNewTourTitle('');
  };

  const filteredBookings = bookings.filter(b => {
    const matchesType = bookingFilter === 'all' || b.bookingType === bookingFilter;
    const matchesStatus = statusFilter === 'all' || b.bookingStatus === statusFilter;
    return matchesType && matchesStatus;
  });

  if (!isUserAdmin) {
    return (
      <section className="py-12 px-4 max-w-4xl mx-auto font-sans">
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider">
              Yêu Cầu Quyền Quản Trị Viên (Admin)
            </span>
            <h2 className="text-2xl font-extrabold text-[#11385E]">
              Khu Vực Quản Trị Hệ Thống BSB
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn hiện đang truy cập với vai trò{' '}
              <strong className="text-indigo-700 font-bold">
                {currentUser ? `Khách Hàng (${currentUser.name})` : 'Khách Vãng Lai (Chưa đăng nhập)'}
              </strong>
              . Khu vực này chỉ dành cho Ban Quản Trị cụm sân BSB để duyệt lịch đặt sân, cấu hình CLB và quản lý giải đấu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="space-y-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                Khách Hàng (Customer)
              </span>
              <p className="text-[11px] text-slate-500">
                • Đặt 5 loại hình sân linh hoạt<br/>
                • Xem & tham gia các CLB<br/>
                • Đăng ký thi đấu Minitour<br/>
                • Quản lý vé & lịch cá nhân
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Quản Trị Viên (Admin)
              </span>
              <p className="text-[11px] text-slate-500">
                • Thêm & cấu hình thông tin CLB<br/>
                • Phê duyệt / Hủy lịch đặt sân<br/>
                • Cập nhật tỷ số trận đấu Minitour<br/>
                • Quản lý Database & Báo cáo
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onSwitchToAdmin && (
              <button
                onClick={onSwitchToAdmin}
                className="w-full sm:w-auto px-6 py-3 bg-[#11385E] hover:bg-[#0c2946] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Đăng Nhập / Chuyển Sang Quyền Admin (1-Chạm)
              </button>
            )}

            {onNavigateToBooking && (
              <button
                onClick={onNavigateToBooking}
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-slate-600" />
                Quay Lại Đặt Sân
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 px-4 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-[#11385E] text-white p-6 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-blue-900/40">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-white/10 rounded-xl border border-white/20">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold flex items-center gap-2 tracking-tight">
              TRUNG TÂM QUẢN TRỊ BSB PICKLEBALL
            </h2>
            <p className="text-xs text-blue-200">
              Quản trị viên: <strong>{currentUser?.name || 'Ban Quản Trị BSB'}</strong> ({currentUser?.email || 'admin@bsbpickleball.vn'}) • Toàn quyền quản trị
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Đang trực ban Admin
          </span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border border-slate-200 bg-slate-100 rounded-xl p-1 shadow-xs mb-6 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveAdminTab('clubs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeAdminTab === 'clubs'
              ? 'bg-white text-[#11385E] shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Users className="w-4 h-4 text-[#11385E]" />
          1. Câu Lạc Bộ ({clubs.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeAdminTab === 'bookings'
              ? 'bg-white text-[#11385E] shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Calendar className="w-4 h-4 text-[#11385E]" />
          2. Lịch Đặt Sân ({bookings.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('minitours')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeAdminTab === 'minitours'
              ? 'bg-white text-[#11385E] shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          3. Minitour & Điểm Số
        </button>

        <button
          onClick={() => setActiveAdminTab('database')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeAdminTab === 'database'
              ? 'bg-white text-[#11385E] shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-600" />
          4. Supabase & Database SQL
        </button>

        <button
          onClick={() => setActiveAdminTab('stats')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeAdminTab === 'stats'
              ? 'bg-white text-[#11385E] shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Activity className="w-4 h-4 text-purple-600" />
          5. Báo Cáo & Doanh Thu
        </button>
      </div>

      {/* TAB 1: CLUBS MANAGEMENT (ADMIN THÊM CÂU LẠC BỘ) */}
      {activeAdminTab === 'clubs' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-50/70 p-4 rounded-2xl border border-blue-200 gap-3">
            <div>
              <h3 className="font-bold text-[#11385E] text-sm">Danh Sách Câu Lạc Bộ Sinh Hoạt Tại BSB</h3>
              <p className="text-xs text-slate-600">
                (Khách hàng chỉ cần xem & chọn CLB; Admin là người trực tiếp thêm & cấu hình thông tin CLB)
              </p>
            </div>
            <button
              onClick={() => setShowAddClubModal(true)}
              className="px-4 py-2.5 bg-[#11385E] hover:bg-[#0c2946] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              + Thêm Câu Lạc Bộ Mới
            </button>
          </div>

          {/* Club List Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3.5">Tên CLB</th>
                  <th className="p-3.5">Cấp độ DUPR</th>
                  <th className="p-3.5">Lịch Sinh Hoạt</th>
                  <th className="p-3.5">Chủ Nhiệm / HLV</th>
                  <th className="p-3.5">Phí / Tháng</th>
                  <th className="p-3.5">Thành Viên</th>
                  <th className="p-3.5 text-right">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clubs.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="p-3.5 font-bold text-slate-900">
                      <div>{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{c.badge}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded font-semibold text-[11px]">
                        {c.duprLevel}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium">{c.scheduleDescription}</td>
                    <td className="p-3.5">
                      <div>{c.leaderName}</div>
                      <div className="text-[10px] text-slate-400">{c.leaderPhone}</div>
                    </td>
                    <td className="p-3.5 font-bold text-emerald-600">
                      {c.monthlyFee.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">{c.memberCount} VĐV</td>
                    <td className="p-3.5 text-right">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                        c.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {c.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm ngưng'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BOOKINGS MANAGEMENT (ALL 5 TYPES) */}
      {activeAdminTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Tất Cả' },
                { id: 'clb', label: 'CLB' },
                { id: 'minitour', label: 'Minitour' },
                { id: 'fixed', label: 'Cố Định' },
                { id: 'casual', label: 'Vãng Lai' },
                { id: 'event', label: 'Sự Kiện' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setBookingFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    bookingFilter === f.id
                      ? 'bg-[#11385E] text-white border-[#11385E]'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="HOLD">HOLD (Giữ chỗ 5p)</option>
                <option value="PENDING">PENDING (Chờ duyệt)</option>
                <option value="CONFIRMED">CONFIRMED (Đã duyệt)</option>
                <option value="COMPLETED">COMPLETED (Hoàn tất)</option>
                <option value="CANCELLED">CANCELLED (Đã hủy)</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3.5">Mã Booking</th>
                  <th className="p-3.5">Loại Hình</th>
                  <th className="p-3.5">Khách Hàng / CLB</th>
                  <th className="p-3.5">Sân & Thời Gian</th>
                  <th className="p-3.5">Tổng Tiền</th>
                  <th className="p-3.5">Trạng Thái</th>
                  <th className="p-3.5 text-right">Duyệt Sân</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/70">
                    <td className="p-3.5 font-mono font-bold text-[#11385E]">{b.bookingCode}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        b.bookingType === 'clb'
                          ? 'bg-[#11385E]/15 text-[#11385E]'
                          : b.bookingType === 'minitour'
                          ? 'bg-amber-100 text-amber-900'
                          : b.bookingType === 'fixed'
                          ? 'bg-slate-200 text-slate-800'
                          : b.bookingType === 'casual'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-indigo-100 text-indigo-900'
                      }`}>
                        {b.bookingType}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{b.customerName}</div>
                      <div className="text-[10px] text-slate-400">{b.customerPhone}</div>
                      {b.clubName && <div className="text-[10px] text-indigo-600 font-medium">{b.clubName}</div>}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-[#11385E]">{b.courtName}</div>
                      <div className="text-[10px] text-slate-500">
                        {b.date} ({b.startTime} - {b.endTime})
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {b.totalAmount.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.bookingStatus === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.bookingStatus === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : b.bookingStatus === 'HOLD'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      {b.bookingStatus !== 'CONFIRMED' && (
                        <button
                          onClick={() => onUpdateBookingStatus(b.id, 'CONFIRMED')}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          Duyệt
                        </button>
                      )}
                      {b.bookingStatus !== 'CANCELLED' && (
                        <button
                          onClick={() => onUpdateBookingStatus(b.id, 'CANCELLED')}
                          className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-[10px] font-bold cursor-pointer"
                        >
                          Hủy
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MINITOUR MANAGEMENT */}
      {activeAdminTab === 'minitours' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-amber-50 p-4 rounded-2xl border border-amber-200">
            <div>
              <h3 className="font-bold text-amber-950 text-sm">Điều Hành Giải Đấu Mini BSB & Nhập Điểm</h3>
              <p className="text-xs text-amber-800">Cập nhật trực tiếp kết quả các trận đấu trong nhánh</p>
            </div>
            <button
              onClick={() => setShowAddTourModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              + Tạo Giải Minitour Mới
            </button>
          </div>

          {minitours.map(tour => (
            <div key={tour.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h4 className="font-bold text-base text-[#11385E]">{tour.title}</h4>
                  <span className="text-xs text-slate-500">
                    {tour.category} • {tour.duprBracket} • Ngày {tour.date}
                  </span>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-[#11385E] rounded-full">
                  {tour.teams.length} Đội tham gia
                </span>
              </div>

              {tour.matches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tour.matches.map(m => (
                    <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                        <span>{m.roundName} ({m.courtName})</span>
                        <span>{m.time}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate flex-1 font-semibold">{m.team1?.teamName || 'TBD'}</span>
                        <input
                          type="number"
                          className="w-12 px-2 py-1 border rounded text-center font-bold bg-white"
                          defaultValue={m.score1 || 0}
                          onBlur={(e) => {
                            const val = Number(e.target.value);
                            const winner = val > (m.score2 || 0) ? m.team1?.id : m.team2?.id;
                            onUpdateMatchScore(tour.id, m.id, val, m.score2 || 0, winner);
                          }}
                        />
                        <span className="font-bold text-slate-400">-</span>
                        <input
                          type="number"
                          className="w-12 px-2 py-1 border rounded text-center font-bold bg-white"
                          defaultValue={m.score2 || 0}
                          onBlur={(e) => {
                            const val = Number(e.target.value);
                            const winner = (m.score1 || 0) > val ? m.team1?.id : m.team2?.id;
                            onUpdateMatchScore(tour.id, m.id, m.score1 || 0, val, winner);
                          }}
                        />
                        <span className="truncate flex-1 text-right font-semibold">{m.team2?.teamName || 'TBD'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Chưa tạo nhánh đấu cho giải này.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: SUPABASE & DATABASE CONFIGURATION */}
      {activeAdminTab === 'database' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Kết Nối Supabase & Vercel Postgres</h3>
                  <p className="text-xs text-slate-400">
                    Trạng thái kết nối: {isSupabaseConfigured ? (
                      <span className="text-emerald-400 font-bold">Đã cấu hình SUPABASE_URL & ANON_KEY</span>
                    ) : (
                      <span className="text-amber-400 font-bold">Đang chạy Database Engine Offline / LocalStorage Mode</span>
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn reset toàn bộ database về bộ Seed chuẩn 6 sân, 5 CLB, 12 Bookings?')) {
                    DatabaseService.resetToDemoSeed();
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Toàn Bộ Data Về Chuẩn
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-400" />
                  1. File Khởi Tạo Schema SQL:
                </div>
                <p className="text-slate-400 text-[11px]">
                  File <code className="text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded">/supabase/schema.sql</code> chứa toàn bộ định nghĩa bảng <code className="text-sky-300">courts</code>, <code className="text-sky-300">clubs</code>, <code className="text-sky-300">bookings</code>, <code className="text-sky-300">booking_slots</code>, <code className="text-sky-300">minitours</code>, RLS và Index.
                </p>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  2. File Dữ Liệu Mẫu Seed SQL:
                </div>
                <p className="text-slate-400 text-[11px]">
                  File <code className="text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded">/supabase/seed.sql</code> chứa 6 sân USAPA, 5 CLB hoạt động + 1 tạm ngưng, 12 booking đủ 5 loại.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STATS & REPORT */}
      {activeAdminTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold uppercase">Tổng Doanh Thu Ước Tính</span>
              <div className="text-2xl font-extrabold text-[#11385E] mt-2">
                {bookings.reduce((sum, b) => sum + (b.bookingStatus !== 'CANCELLED' ? b.totalAmount : 0), 0).toLocaleString('vi-VN')}đ
              </div>
              <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" /> +24% so với tháng trước
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold uppercase">Tổng Số Booking</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">{bookings.length}</div>
              <p className="text-[11px] text-slate-500 mt-1">Đủ 5 loại hình theo quy chuẩn</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold uppercase">CLB Hoạt Động</span>
              <div className="text-2xl font-extrabold text-indigo-700 mt-2">
                {clubs.filter(c => c.status === 'ACTIVE').length} / {clubs.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Tổng ~120 hội viên thường trực</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold uppercase">Công Suất Sân Giờ Vàng</span>
              <div className="text-2xl font-extrabold text-amber-600 mt-2">87.5%</div>
              <p className="text-[11px] text-slate-500 mt-1">Khung 17:00 - 21:00 hàng ngày</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Admin Add Club (Direct input) */}
      {showAddClubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddClubModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-[#11385E] mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Thêm Câu Lạc Bộ Mới Vào Hệ Thống BSB
            </h3>

            <form onSubmit={handleCreateClubSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Câu Lạc Bộ *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: CLB BSB Doanh Nhân Trẻ"
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Khẩu hiệu / Slogan</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đam mê và kết nối"
                  value={newClubTagline}
                  onChange={(e) => setNewClubTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chủ Nhiệm / HLV *</label>
                  <input
                    type="text"
                    required
                    placeholder="HLV Nguyễn Văn A"
                    value={newClubLeader}
                    onChange={(e) => setNewClubLeader(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Điện Thoại</label>
                  <input
                    type="tel"
                    placeholder="0908 123 456"
                    value={newClubPhone}
                    onChange={(e) => setNewClubPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cấp Độ Trình Độ DUPR</label>
                  <input
                    type="text"
                    value={newClubDupr}
                    onChange={(e) => setNewClubDupr(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hội Phí Hàng Tháng (VNĐ)</label>
                  <input
                    type="number"
                    value={newClubFee}
                    onChange={(e) => setNewClubFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lịch Sinh Hoạt Cố Định</label>
                <input
                  type="text"
                  value={newClubSchedule}
                  onChange={(e) => setNewClubSchedule(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddClubModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#11385E] hover:bg-[#0c2946] text-white font-bold rounded-xl"
                >
                  Lưu & Đăng CLB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
