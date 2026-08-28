import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, QrCode, CheckCircle2, Calendar, Clock, MapPin, User, Shield } from 'lucide-react';
import { Booking } from '../types';
import { BSBLogo } from './BSBLogo';

interface TicketLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
}

export const TicketLookupModal: React.FC<TicketLookupModalProps> = ({
  isOpen,
  onClose,
  bookings
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searched, setSearched] = useState(false);

  const matchedBookings = bookings.filter(b => {
    if (!searchTerm.trim()) return false;
    const term = searchTerm.trim().toLowerCase();
    return (
      b.bookingCode.toLowerCase().includes(term) ||
      b.customerPhone.replace(/\s+/g, '').includes(term.replace(/\s+/g, '')) ||
      b.customerName.toLowerCase().includes(term)
    );
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 text-slate-800"
          >
            {/* Header */}
            <div className="bg-[#11385E] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <QrCode className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-bold">Tra Cứu Vé & Mã Check-in Sân BSB</h3>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white p-1 rounded-full bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-6 space-y-4 text-xs">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Nhập Số điện thoại hoặc Mã đặt sân (VD: 0918 hoặc BSB-CAS)"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#11385E] focus:outline-hidden text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#11385E] hover:bg-blue-900 text-white rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Tìm Kiếm
                </button>
              </form>

              {/* Results */}
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {searched && matchedBookings.length === 0 && (
                  <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-2xl">
                    Không tìm thấy lịch đặt sân phù hợp với từ khóa <strong>"{searchTerm}"</strong>. Quý khách vui lòng kiểm tra lại số điện thoại hoặc liên hệ hotline BSB.
                  </div>
                )}

                {matchedBookings.map(b => (
                  <div
                    key={b.id}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                          {b.bookingType === 'casual' ? 'Vãng lai' : b.bookingType === 'fixed' ? 'Cố định' : 'Sự kiện'}
                        </span>
                        <div className="font-mono font-extrabold text-sm text-[#11385E] mt-1">
                          {b.bookingCode}
                        </div>
                      </div>
                      {b.bookingStatus === 'CHECKED_IN' ? (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-emerald-600 text-white rounded-full shadow-xs">
                          ✓ Đã Check-in
                        </span>
                      ) : b.bookingStatus === 'CHECKIN_PENDING' ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full animate-pulse">
                          ⏳ Chờ Check-in
                        </span>
                      ) : b.bookingStatus === 'NO_SHOW' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-full">
                          ⚠️ No-Show (Giải phóng sân)
                        </span>
                      ) : b.bookingStatus === 'COMPLETED' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-900 rounded-full">
                          ✓ Đã hoàn tất
                        </span>
                      ) : b.bookingStatus === 'CONFIRMED' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                          Đã xác nhận
                        </span>
                      ) : b.bookingStatus === 'CANCELLED' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                          Đã hủy
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                          Chờ duyệt
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-slate-700 text-[11px]">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span>{b.customerName} ({b.customerPhone})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        <span>{b.courtName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        <span>Ngày {b.date} • {b.startTime} - {b.endTime}</span>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400">Tổng thanh toán:</div>
                        <div className="font-extrabold text-emerald-600 text-sm">
                          {b.totalAmount.toLocaleString('vi-VN')}đ
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${b.bookingCode}`}
                          alt="QR Ticket"
                          className="w-12 h-12"
                        />
                        <span className="text-[9px] text-slate-500 max-w-[80px] leading-tight">
                          Quét tại quầy lễ tân BSB
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
