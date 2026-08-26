import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ShieldCheck, User as UserIcon, Lock, Mail, Phone, 
  Sparkles, CheckCircle2, ArrowRight, UserPlus, LogIn, 
  Award, KeyRound, AlertCircle, RefreshCw
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { MOCK_USERS, DEFAULT_ADMIN_USER, DEFAULT_CUSTOMER_USER } from '../../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
  initialTab?: 'login' | 'register' | 'switch';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  initialTab = 'login'
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'demo'>(initialTab === 'switch' ? 'demo' : initialTab);
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<UserRole>('customer');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDupr, setRegDupr] = useState('3.0');
  const [regClub, setRegClub] = useState('CLB BSB Sunrise Picklers');
  const [regSuccess, setRegSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const query = loginIdentifier.trim().toLowerCase();
    
    // Check if matching mock users
    let foundUser = MOCK_USERS.find(
      u => u.email.toLowerCase() === query || u.phone === query || u.name.toLowerCase().includes(query)
    );

    // If logging in as admin specifically
    if (loginRole === 'admin') {
      if (query === 'admin' || query === 'admin@bsbpickleball.vn' || query === '0908123272' || !query) {
        onLogin(DEFAULT_ADMIN_USER);
        onClose();
        return;
      }
    }

    if (foundUser) {
      onLogin(foundUser);
      onClose();
      return;
    }

    // If typed any custom user, create session for customer
    if (loginIdentifier.trim()) {
      const customUser: User = {
        id: `user-${Date.now()}`,
        name: loginIdentifier.includes('@') ? loginIdentifier.split('@')[0] : loginIdentifier,
        phone: loginIdentifier.startsWith('0') ? loginIdentifier : '0908 999 888',
        email: loginIdentifier.includes('@') ? loginIdentifier : `${loginIdentifier.replace(/\s+/g, '').toLowerCase()}@gmail.com`,
        role: loginRole,
        duprRating: 3.0,
        membershipTier: loginRole === 'admin' ? 'VIP' : 'STANDARD',
        joinedAt: new Date().toISOString().split('T')[0]
      };
      onLogin(customUser);
      onClose();
    } else {
      setLoginError('Vui lòng nhập Email, Số điện thoại hoặc chọn Tài khoản mẫu bên dưới.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim()) {
      setLoginError('Vui lòng điền họ tên và số điện thoại');
      return;
    }

    const newUser: User = {
      id: `user-reg-${Date.now()}`,
      name: regName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim() || `${regPhone.trim()}@bsb.vn`,
      role: 'customer',
      duprRating: parseFloat(regDupr) || 3.0,
      clubName: regClub,
      membershipTier: 'STANDARD',
      joinedAt: new Date().toISOString().split('T')[0]
    };

    setRegSuccess(true);
    setTimeout(() => {
      onLogin(newUser);
      setRegSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-7 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto font-sans"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#11385E] text-white shadow-md mb-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-xl font-extrabold text-[#11385E]">
            {currentUser ? 'Tài Khoản & Phân Quyền BSB' : 'Đăng Nhập / Đăng Ký Hội Viên'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Hệ thống phân quyền minh bạch giữa <strong className="text-indigo-700">Khách Hàng (Customer)</strong> & <strong className="text-emerald-700">Quản Trị Viên (Admin)</strong>
          </p>
        </div>

        {/* Current User Card if Logged In */}
        {currentUser && (
          <div className="mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white shadow-xs ${
                  currentUser.role === 'admin' ? 'bg-[#11385E] ring-2 ring-emerald-400' : 'bg-indigo-600'
                }`}>
                  {currentUser.role === 'admin' ? 'AD' : currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{currentUser.name}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                      currentUser.role === 'admin' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                      {currentUser.role === 'admin' ? '🛡️ Quản Trị Viên (Admin)' : '🎾 Khách Hàng / Hội Viên'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{currentUser.phone} • {currentUser.email}</p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500">
                DUPR: <strong className="text-indigo-700">{currentUser.duprRating || 'Chưa cập nhật'}</strong>
                {currentUser.clubName && <> • CLB: <strong className="text-slate-700">{currentUser.clubName}</strong></>}
              </span>
              <button
                onClick={() => {
                  onLogout();
                  setTab('login');
                }}
                className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Đăng Xuất
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border border-slate-200 bg-slate-100 rounded-xl p-1 mb-5">
          <button
            onClick={() => { setTab('login'); setLoginError(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'login' 
                ? 'bg-white text-[#11385E] shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Đăng Nhập
          </button>

          <button
            onClick={() => { setTab('register'); setLoginError(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'register' 
                ? 'bg-white text-[#11385E] shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Đăng Ký Mới
          </button>

          <button
            onClick={() => { setTab('demo'); setLoginError(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'demo' 
                ? 'bg-white text-indigo-700 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Chọn Nhanh (Demo)
          </button>
        </div>

        {/* TAB 1: LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            {/* Select Role to Login */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Bạn muốn đăng nhập với vai trò:</label>
              <div className="grid grid-cols-2 gap-2.5">
                <div
                  onClick={() => setLoginRole('customer')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    loginRole === 'customer'
                      ? 'bg-blue-50/80 border-[#11385E] ring-1 ring-[#11385E]'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-[#11385E] flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                      Khách Hàng
                    </span>
                    {loginRole === 'customer' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                  <p className="text-[10px] text-slate-500">Đặt sân, tham gia CLB, đăng ký minitour & quản lý vé</p>
                </div>

                <div
                  onClick={() => setLoginRole('admin')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    loginRole === 'admin'
                      ? 'bg-emerald-50/80 border-emerald-600 ring-1 ring-emerald-600'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Quản Trị Viên (Admin)
                    </span>
                    {loginRole === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <p className="text-[10px] text-slate-500">Thêm CLB, duyệt lịch sân, nhập điểm minitour, quản trị hệ thống</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email hoặc Số Điện Thoại</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={loginRole === 'admin' ? 'admin@bsbpickleball.vn hoặc 0908 123 272' : 'Ví dụ: 0908 123 456 hoặc haidang@gmail.com'}
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none font-medium"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">Mật khẩu</label>
                <span className="text-[10px] text-indigo-600 cursor-pointer hover:underline" onClick={() => setLoginPassword('123456')}>
                  Mật khẩu demo: 123456
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Nhập mật khẩu (Mặc định: 123456)"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {loginError && (
              <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#11385E] hover:bg-[#0c2946] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
            >
              <LogIn className="w-4 h-4" />
              Đăng Nhập Ngay
            </button>

            <div className="pt-2 text-center text-[11px] text-slate-500">
              Chưa có tài khoản?{' '}
              <button 
                type="button"
                onClick={() => setTab('register')} 
                className="text-indigo-600 font-bold hover:underline"
              >
                Đăng ký thành viên mới
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: REGISTER FORM */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            {regSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-base font-bold text-slate-900">Đăng Ký Thành Công!</h3>
                <p className="text-xs text-slate-500">Chào mừng bạn gia nhập cộng đồng BSB Pickleball Club.</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ & Tên *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Số Điện Thoại *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0908 123 456"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="an.nguyen@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Trình Độ DUPR (Ước tính)</label>
                    <select
                      value={regDupr}
                      onChange={(e) => setRegDupr(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      <option value="2.0">DUPR 2.0 (Mới chơi)</option>
                      <option value="2.5">DUPR 2.5 (Căn bản)</option>
                      <option value="3.0">DUPR 3.0 (Trung cấp)</option>
                      <option value="3.5">DUPR 3.5 (Nâng cao)</option>
                      <option value="4.0">DUPR 4.0+ (Bán chuyên)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">CLB Muốn Tham Gia</label>
                    <select
                      value={regClub}
                      onChange={(e) => setRegClub(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="CLB BSB Sunrise Picklers">CLB BSB Sunrise Picklers</option>
                      <option value="CLB BSB Doanh Nhân & Bạn Hữu">CLB BSB Doanh Nhân & Bạn Hữu</option>
                      <option value="CLB Nữ Hoàng Pickleball BSB">CLB Nữ Hoàng Pickleball BSB</option>
                      <option value="CLB BSB Thi Đấu Đỉnh Cao">CLB BSB Thi Đấu Đỉnh Cao</option>
                      <option value="Chưa chọn CLB">Chưa chọn CLB (Vãng lai)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mật Khẩu Tạo Mới</label>
                  <input
                    type="password"
                    placeholder="Mật khẩu ít nhất 6 ký tự"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Đăng Ký & Đăng Nhập Tự Động
                </button>
              </>
            )}
          </form>
        )}

        {/* TAB 3: 1-CLICK DEMO ACCOUNTS (QUICK SWITCHER) */}
        {tab === 'demo' && (
          <div className="space-y-3 text-xs">
            <p className="text-[11px] text-slate-500">
              Chọn một trong các tài khoản mẫu dưới đây để thử nghiệm ngay lập tức các phân quyền:
            </p>

            {/* Admin Account */}
            <div
              onClick={() => {
                onLogin(DEFAULT_ADMIN_USER);
                onClose();
              }}
              className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-300 hover:border-emerald-500 hover:bg-emerald-100/70 cursor-pointer transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#11385E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  🛡️ AD
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#11385E] group-hover:text-emerald-800">
                      {DEFAULT_ADMIN_USER.name}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">
                      ADMIN
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-900 mt-0.5">
                    Toàn quyền quản trị: Thêm CLB, duyệt lịch sân, nhập điểm minitour, cấu hình DB.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>

            {/* Customer 1 */}
            <div
              onClick={() => {
                onLogin(DEFAULT_CUSTOMER_USER);
                onClose();
              }}
              className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-300 hover:border-blue-500 hover:bg-blue-100/70 cursor-pointer transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  HĐ
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 group-hover:text-indigo-700">
                      {DEFAULT_CUSTOMER_USER.name} (Khách Hàng Hội Viên)
                    </span>
                    <span className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded text-[10px] font-bold">
                      DUPR 3.5
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Hội viên CLB Sunrise Picklers • Đặt sân vãng lai / cố định / sự kiện & quản lý vé cá nhân.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>

            {/* Customer 2 */}
            {MOCK_USERS.slice(2).map(user => (
              <div
                key={user.id}
                onClick={() => {
                  onLogin(user);
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-400 hover:bg-slate-100 cursor-pointer transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 group-hover:text-indigo-700">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        (Khách Hàng • DUPR {user.duprRating})
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {user.clubName || 'Khách vãng lai'} • {user.phone}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
