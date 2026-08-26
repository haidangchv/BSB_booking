import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Check, Shield, ArrowRight, UserPlus, Sparkles, 
  Lock, CheckCircle2, AlertCircle, RefreshCw, User as UserIcon
} from 'lucide-react';
import { User } from '../../types';
import { DEFAULT_ADMIN_USER, DEFAULT_CUSTOMER_USER } from '../../data/mockData';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  mode?: 'signin' | 'signup';
}

export const GoogleLogo: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={`inline-block shrink-0 ${className}`}
  >
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode = 'signin'
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [duprRating, setDuprRating] = useState('3.5');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (!isOpen) return null;

  const quickGoogleAccounts: Array<{
    name: string;
    email: string;
    avatar: string;
    role: 'customer' | 'admin';
    dupr: number;
    badge: string;
  }> = [
    {
      name: 'Nguyễn Hải Đăng',
      email: 'haidanghsgl@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      role: 'customer',
      dupr: 3.5,
      badge: 'Tài khoản Google của bạn'
    },
    {
      name: 'Ban Quản Trị BSB',
      email: 'admin@bsbpickleball.vn',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'admin',
      dupr: 4.5,
      badge: 'Google Workspace Admin'
    },
    {
      name: 'Trần Minh Tuấn',
      email: 'minhtuan.pickle@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
      role: 'customer',
      dupr: 3.0,
      badge: 'Hội viên Google'
    }
  ];

  const handleSelectAccount = (acc: typeof quickGoogleAccounts[0]) => {
    setIsAuthenticating(acc.email);
    
    setTimeout(() => {
      const user: User = {
        id: `google-${acc.email.replace(/[@.]/g, '_')}`,
        name: acc.name,
        email: acc.email,
        phone: acc.role === 'admin' ? '0908 123 272' : '0908 123 456',
        role: acc.role,
        avatar: acc.avatar,
        duprRating: acc.dupr,
        membershipTier: acc.role === 'admin' ? 'VIP' : 'GOLD',
        joinedAt: new Date().toISOString().split('T')[0]
      };
      
      setSelectedUser(user);
      setAuthSuccess(true);
      
      setTimeout(() => {
        onSuccess(user);
        onClose();
        setIsAuthenticating(null);
        setAuthSuccess(false);
      }, 700);
    }, 600);
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;

    const email = customEmail.trim().toLowerCase();
    const formattedEmail = email.includes('@') ? email : `${email}@gmail.com`;
    const defaultName = customName.trim() || formattedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    setIsAuthenticating(formattedEmail);

    setTimeout(() => {
      const isAdminEmail = formattedEmail.includes('admin') || formattedEmail === 'admin@bsbpickleball.vn';
      const user: User = {
        id: `google-${formattedEmail.replace(/[@.]/g, '_')}`,
        name: defaultName,
        email: formattedEmail,
        phone: customPhone.trim() || '0909 888 777',
        role: isAdminEmail ? 'admin' : 'customer',
        duprRating: parseFloat(duprRating) || 3.0,
        membershipTier: isAdminEmail ? 'VIP' : 'STANDARD',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultName)}&background=11385E&color=fff&bold=true`,
        joinedAt: new Date().toISOString().split('T')[0]
      };

      setSelectedUser(user);
      setAuthSuccess(true);

      setTimeout(() => {
        onSuccess(user);
        onClose();
        setIsAuthenticating(null);
        setAuthSuccess(false);
      }, 700);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header with Google & BSB */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs mb-3">
            <GoogleLogo size={30} />
          </div>

          <h3 className="text-lg font-extrabold text-slate-900">
            {mode === 'signup' ? 'Đăng Ký Bằng Tài Khoản Google' : 'Đăng Nhập Bằng Google'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Đăng nhập an toàn, nhanh chóng và tự động đồng bộ hồ sơ hội viên BSB Pickleball
          </p>
        </div>

        {/* OAuth Progress Banner if authenticating */}
        {isAuthenticating && (
          <div className="mb-4 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-xs text-blue-900 animate-pulse">
            <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
            <div>
              <p className="font-bold">Đang xác thực tài khoản Google...</p>
              <p className="text-[11px] text-blue-700">{isAuthenticating}</p>
            </div>
          </div>
        )}

        {authSuccess && selectedUser && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Xác thực Google thành công!</p>
              <p className="text-[11px] text-emerald-700">Chào mừng {selectedUser.name} ({selectedUser.email})</p>
            </div>
          </div>
        )}

        {!isCustomMode ? (
          /* Google Account Chooser List */
          <div className="space-y-2.5">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              Chọn tài khoản Google để tiếp tục:
            </p>

            {quickGoogleAccounts.map((acc) => (
              <button
                key={acc.email}
                disabled={!!isAuthenticating}
                onClick={() => handleSelectAccount(acc)}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isAuthenticating === acc.email
                    ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300'
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
                      <GoogleLogo size={12} />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-xs text-slate-900 truncate">{acc.name}</p>
                      {acc.role === 'admin' && (
                        <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold rounded">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{acc.email}</p>
                    <p className="text-[10px] text-indigo-600 font-medium">{acc.badge}</p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
              </button>
            ))}

            {/* Use Another Google Account Button */}
            <div className="pt-2">
              <button
                onClick={() => setIsCustomMode(true)}
                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <GoogleLogo size={16} />
                <span>Sử dụng tài khoản Google khác...</span>
              </button>
            </div>
          </div>
        ) : (
          /* Custom Google Account Input Form */
          <form onSubmit={handleCustomGoogleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Địa chỉ Email Google (Gmail / Google Workspace) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="vidu@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none font-medium"
                />
                <div className="absolute left-3 top-2.5">
                  <GoogleLogo size={16} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ & Tên hiển thị</label>
                <input
                  type="text"
                  placeholder="Tự động từ Google"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Số điện thoại liên hệ</label>
                <input
                  type="tel"
                  placeholder="0908 123 456"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Trình độ DUPR tự đánh giá</label>
              <select
                value={duprRating}
                onChange={(e) => setDuprRating(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="2.0">DUPR 2.0 (Mới bắt đầu chơi)</option>
                <option value="2.5">DUPR 2.5 (Căn bản)</option>
                <option value="3.0">DUPR 3.0 (Trung cấp)</option>
                <option value="3.5">DUPR 3.5 (Nâng cao)</option>
                <option value="4.0">DUPR 4.0+ (Bán chuyên nghiệp)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Quay Lại
              </button>

              <button
                type="submit"
                disabled={!customEmail.trim() || !!isAuthenticating}
                className="flex-1 py-2.5 px-4 bg-[#11385E] hover:bg-[#0c2946] disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <GoogleLogo size={16} />
                Tiếp Tục Bằng Google
              </button>
            </div>
          </form>
        )}

        {/* Security & Privacy Notice */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" />
            Bảo mật OAuth 2.0 Google
          </span>
          <span>BSB Pickleball Hub</span>
        </div>
      </motion.div>
    </div>
  );
};
