import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, Calendar, Clock, QrCode, CheckCircle2, AlertCircle, 
  MapPin, Shield, Phone, CreditCard, ChevronRight, RefreshCw,
  Award, Ticket, Flame, Trash2, ArrowUpRight, Mail, Send
} from 'lucide-react';
import { Booking, User, EmailNotification } from '../../types';
import { EmailService } from '../../lib/emailService';
import { EmailPreviewModal } from '../Email/EmailPreviewModal';
import { BSBLogo } from '../BSBLogo';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  bookings: Booking[];
  onOpenBookingTab: () => void;
  onCancelBooking?: (bookingId: string) => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  bookings,
  onOpenBookingTab,
  onCancelBooking
}) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'upcoming' | 'history'>('upcoming');
  const [previewEmail, setPreviewEmail] = useState<EmailNotification | null>(null);
  const [isPreviewEmailOpen, setIsPreviewEmailOpen] = useState(false);

  if (!isOpen) return null;

  // Filter user bookings based on current user's phone, email or name
  const userBookings = bookings.filter(b => {
    if (!currentUser) return false;
    const phoneMatch = b.customerPhone && currentUser.phone && b.customerPhone.replace(/\s+/g, '') === currentUser.phone.replace(/\s+/g, '');
    const emailMatch = b.customerEmail && currentUser.email && b.customerEmail.toLowerCase() === currentUser.email.toLowerCase();
    const nameMatch = b.customerName && currentUser.name && b.customerName.toLowerCase() === currentUser.name.toLowerCase();
    return phoneMatch || emailMatch || nameMatch;
  });

  const today = new Date().toISOString().split('T')[0];

  const upcomingBookings = userBookings.filter(b => {
    return b.bookingStatus !== 'CANCELLED' && b.bookingStatus !== 'COMPLETED' && b.date >= today;
  });

  const historyBookings = userBookings.filter(b => {
    return b.bookingStatus === 'CANCELLED' || b.bookingStatus === 'COMPLETED' || b.date < today;
  });

  const displayList = activeSubTab === 'upcoming' ? upcomingBookings : historyBookings;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-7 shadow-2xl border border-slate-200 relative max-h-[90vh] flex flex-col font-sans"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-[#11385E] text-white flex items-center justify-center shadow-xs">
            <Ticket className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#11385E]">
              Lịch Đặt Sân Của Tôi (Hội Viên / Khách Hàng)
            </h2>
            <p className="text-xs text-slate-500">
              {currentUser ? (
                <>Tài khoản: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.phone})</>
              ) : (
                'Vui lòng đăng nhập để xem danh sách lịch đặt sân của bạn'
              )}
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex border border-slate-200 bg-slate-100 rounded-xl p-1 mb-4 gap-1">
          <button
            onClick={() => setActiveSubTab('upcoming')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubTab === 'upcoming'
                ? 'bg-white text-[#11385E] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Lịch Sắp Diễn Ra ({upcomingBookings.length})
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-white text-[#11385E] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Lịch Sử Đặt Sân ({historyBookings.length})
          </button>
        </div>

        {/* Booking List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {displayList.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6 space-y-3">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">
                {activeSubTab === 'upcoming' 
                  ? 'Bạn chưa có lịch đặt sân sắp tới nào.' 
                  : 'Chưa có lịch sử đặt sân hoàn tất.'}
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Hệ thống 6 sân USAPA của BSB luôn sẵn sàng phục vụ từ 05:30 - 23:00 mỗi ngày.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenBookingTab();
                }}
                className="px-4 py-2.5 bg-[#11385E] hover:bg-[#0c2946] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                Đặt Sân Ngay Bây Giờ
              </button>
            </div>
          ) : (
            displayList.map(b => (
              <div
                key={b.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#11385E] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {b.bookingCode}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      b.bookingType === 'clb' ? 'bg-[#11385E] text-white' :
                      b.bookingType === 'minitour' ? 'bg-amber-500 text-slate-950' :
                      b.bookingType === 'fixed' ? 'bg-slate-700 text-white' :
                      b.bookingType === 'casual' ? 'bg-blue-100 text-blue-900' :
                      'bg-indigo-100 text-indigo-900'
                    }`}>
                      {b.bookingType}
                    </span>
                    {b.bookingStatus === 'CHECKED_IN' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-xs">
                        ✓ Đã Check-in
                      </span>
                    ) : b.bookingStatus === 'CHECKIN_PENDING' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                        ⏳ Chờ Check-in
                      </span>
                    ) : b.bookingStatus === 'NO_SHOW' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        ⚠️ Khách Không Đến (No-Show)
                      </span>
                    ) : b.bookingStatus === 'COMPLETED' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900">
                        ✓ Hoàn Tất
                      </span>
                    ) : b.bookingStatus === 'CONFIRMED' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                        Đã Duyệt
                      </span>
                    ) : b.bookingStatus === 'HOLD' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                        Giữ Chỗ (5p)
                      </span>
                    ) : b.bookingStatus === 'CANCELLED' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                        Đã Hủy
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Chờ Duyệt
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    {b.courtName}
                  </h4>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {b.date}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-indigo-700">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      {b.startTime} - {b.endTime}
                    </span>
                    <span className="font-bold text-emerald-700">
                      {b.totalAmount.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                  <button
                    onClick={() => setSelectedBooking(b)}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-indigo-200 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-indigo-600" />
                    Xem Vé & QR
                  </button>

                  <button
                    onClick={async () => {
                      let em = EmailService.getEmailByBookingId(b.id);
                      if (!em) {
                        em = await EmailService.sendBookingConfirmationEmail(b, b.bookingStatus === 'CONFIRMED' ? 'CONFIRMED' : 'PENDING');
                      }
                      setPreviewEmail(em);
                      setIsPreviewEmailOpen(true);
                    }}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-emerald-600" />
                    Email Xác Nhận
                  </button>

                  {b.bookingStatus !== 'CANCELLED' && onCancelBooking && (
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn hủy lịch đặt ${b.bookingCode}?`)) {
                          onCancelBooking(b.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hủy đặt sân"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal QR Code Detail */}
        {selectedBooking && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center relative border border-slate-200">
              <button
                onClick={() => setSelectedBooking(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <BSBLogo variant="navy" size="sm" />
              
              <h3 className="text-base font-extrabold text-[#11385E] mt-3">
                VÉ VÀO SÂN BSB PICKLEBALL
              </h3>
              <p className="text-xs text-slate-500 font-mono font-bold mt-0.5">
                Mã Vé: {selectedBooking.bookingCode}
              </p>

              {/* QR Image */}
              <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl my-4 inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`BSB_TICKET_${selectedBooking.bookingCode}`)}`}
                  alt="QR Code Checkin"
                  className="w-36 h-36 mx-auto rounded-lg"
                />
                <span className="text-[10px] text-slate-400 mt-2 block font-medium">Quét tại quầy lễ tân để nhận sân</span>
              </div>

              <div className="text-left bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Sân:</span>
                  <span className="font-bold text-slate-900">{selectedBooking.courtName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời gian:</span>
                  <span className="font-bold text-indigo-700">{selectedBooking.startTime} - {selectedBooking.endTime} ({selectedBooking.date})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Người đặt:</span>
                  <span className="font-bold text-slate-900">{selectedBooking.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-700">{selectedBooking.customerEmail || 'Chưa có'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trạng thái:</span>
                  <span className="font-bold text-emerald-600">{selectedBooking.bookingStatus}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full mt-4 py-2.5 bg-[#11385E] text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Email Preview Modal */}
        <EmailPreviewModal
          isOpen={isPreviewEmailOpen}
          onClose={() => setIsPreviewEmailOpen(false)}
          email={previewEmail}
        />
      </motion.div>
    </div>
  );
};
