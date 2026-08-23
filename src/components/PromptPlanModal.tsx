import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, FileText, Sparkles, BookOpen, Layers, ShieldCheck, Download } from 'lucide-react';
import { BSBLogo } from './BSBLogo';

interface PromptPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromptPlanModal: React.FC<PromptPlanModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'plan' | 'prompt' | 'architecture' | 'adminGuide'>('plan');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const planText = `
# KẾ HOẠCH XÂY DỰNG WEBSITE ĐẶT SÂN PICKLEBALL BSB (BSB PICKLEBALL CLUB)
**Slogan:** BSB - Better Social Balance (Better for Yourself - Better for Society - Better Balance)
**Màu chủ đạo:** Primary Deep Navy (#11385E), Slate (#676F84), White (#FFFFFF), Accent Lime/Sky.

---

## 1. MỤC TIÊU DỰ ÁN
Xây dựng nền tảng quản trị và đặt sân Pickleball toàn diện cho thương hiệu BSB Pickleball Club, tích hợp luồng Đặt lịch linh hoạt (Vãng lai, Cố định, Sự kiện), Cộng đồng Câu Lạc Bộ (CLB), và Giải đấu Mini (Minitour).

---

## 2. PHÂN HỆ NGHIỆP VỤ CỐT LÕI

### A. PHÂN HỆ ĐẶT LỊCH SÂN (BOOKING ENGINE)
Hỗ trợ 3 loại hình đặt sân chuyên biệt:
1. **Lịch Vãng Lai (Casual Booking):**
   - Đặt theo khung giờ (05:30 - 23:00) theo từng ngày và từng sân (Sân 1 VIP, Sân 2-3 Indoor, Sân 4-5 Outdoor, Sân 6 Coaching).
   - Phân chia giá: Giờ Thường (05:30 - 16:00) & Giờ Vàng (16:00 - 23:00 / Cuối tuần).
   - Tùy chọn dịch vụ thuê vợt, rổ bóng, máy bắn bóng, nhặt bóng.
   - Thanh toán/Đặt cọc trực tuyến qua mã VietQR tự động.

2. **Lịch Cố Định (Fixed / Recurring Contract):**
   - Dành cho nhóm bạn bè, cá nhân, đội tuyển chơi định kỳ lâu dài.
   - Chọn thứ trong tuần lặp lại (Ví dụ: T2-4-6 hoặc T3-5-7 hoặc T7-CN).
   - Chọn thời lượng hợp đồng (1 tháng, 3 tháng, 6 tháng).
   - Chính sách chiết khấu tự động: Giảm 10% - 20% so với giá vãng lai.
   - Cam kết giữ cố định khung giờ vàng cho khách.

3. **Lịch Sự Kiện (Event & Tournament Venue):**
   - Đặt trọn gói nhiều sân hoặc toàn bộ cụm sân cho giải nội bộ, team building doanh nghiệp.
   - Tích hợp dịch vụ bổ sung: MC hoạt náo, Tổ trọng tài chuẩn USAPA, Livestream đa góc máy có BLV, Hệ thống âm thanh, Backdrop BSB, Catering Teabreak.
   - Báo giá tự động & kết xuất hợp đồng sự kiện.

---

### B. PHÂN HỆ CÂU LẠC BỘ (BSB CLUBS)
*Quy chuẩn nghiệp vụ: Khách hàng chỉ xem danh sách CLB & nhấn đăng ký giao lưu (chỉ cần họ tên & SĐT/Zalo), không cần điền form cấu hình rườm rà. ADMIN là người khởi tạo, thêm CLB, phân bổ sân và quản lý thông tin.*
- **Phía Khách hàng:**
  - Xem danh sách CLB (CLB Dinking Masters, CLB Queens Nữ, CLB Sunrise 6AM, CLB Doanh Nhân...).
  - Xem trình độ DUPR phù hợp, lịch sinh hoạt cố định, HLV phụ trách.
  - 1-Click "Đăng ký tham gia / Giao lưu" nhanh chóng.
- **Phía Quản trị viên (Admin):**
  - Thêm mới Câu lạc bộ (Tên, slogan, mô tả, cấp độ DUPR, HLV/Trưởng nhóm, lịch sinh hoạt).
  - Gán sân cố định và mức sinh hoạt phí.
  - Quản lý danh sách thành viên đăng ký.

---

### C. PHÂN HỆ GIẢI ĐẤU MINI (MINITOUR)
- Tổ chức các giải đấu cuối tuần (BSB Weekend Smash, BSB Night Cup, BSB Rookie Challenge 2.5).
- Phân chia hạng mục: Đôi Nam, Đôi Nữ, Đôi Nam Nữ, Open.
- Đăng ký tham gia theo cặp đấu trực tuyến + Đóng lệ phí.
- **Sơ đồ thi đấu trực quan (Interactive Bracket):**
  - Nhánh Tứ kết -> Bán kết -> Chung kết & Tranh Hạng 3.
  - Cập nhật tỷ số trận đấu thời gian thực (Live score).
  - Vinh danh đội vô địch, trao cúp & giải thưởng.

---

### D. PHÂN HỆ QUẢN TRỊ (ADMIN CONTROL CENTER)
- Dashboard trực quan: Doanh thu, tỷ lệ lấp đầy sân, lịch booking hôm nay.
- Quản lý đặt sân: Phê duyệt lịch, đổi sân linh hoạt, check-in mã QR khách đến sân.
- Quản lý CLB & Minitour: Tạo giải, bốc thăm nhánh đấu, nhập điểm trực tiếp.
- Cấu hình sân bãi, giá giờ thường/giờ cao điểm.
  `.trim();

  const promptMasterText = `
### MASTER PROMPT DÀNH CHO AI ĐỂ TẠO TRANG WEB BOOKING SÂN PICKLEBALL BSB

\`\`\`markdown
Bạn là Kiến trúc sư phần mềm kiêm Chuyên gia UI/UX cao cấp. Hãy xây dựng một ứng dụng web Booking sân Pickleball hoàn chỉnh, hiện đại và chuẩn nhận diện thương hiệu cho "BSB PICKLEBALL CLUB".

### 1. BỘ NHẬN DIỆN THƯƠNG HIỆU (BRAND GUIDELINES BSB):
- Tên thương hiệu: BSB PICKLEBALL CLUB
- Slogan: "BSB - Better Social Balance" (Better for Yourself - Better for Society - Better Balance)
- Ý nghĩa tên: B (Blue) - S (Space) - B (Blue)
- Màu sắc chủ đạo:
  + Primary: Deep Navy (#11385E)
  + Secondary Slate/Blue: #647A82, #676F84, #A0AEBC, #3E5168
  + Background: Light Cool Gray/White (#F8FAFC, #FFFFFF)
  + Accent Highlights: Sân Pickleball Lime Accent (#CCFF00 / #10B981) và Sport Court Sky Blue (#0284C7)
- Logo: Kiểu chữ 3 đường line song song (3 parallel lines) tạo thành chữ B-S-B kèm dòng chữ "PICKLEBALL CLUB" phía dưới.

### 2. YÊU CẦU NGHIỆP VỤ & TÍNH NĂNG CHI TIẾT:

#### A. ĐẶT LỊCH SÂN (BOOKING):
Phải có 3 tab chuyển đổi linh hoạt:
1. Đặt Sân Vãng Lai (Casual):
   - Chọn ngày, hiển thị ma trận 6 sân x khung giờ từ 05:30 đến 23:00.
   - Màu sắc phân biệt trạng thái: Còn trống, Đã có người đặt, Đang chọn.
   - Chọn kèm phụ kiện: Thuê vợt, Thuê bóng, Máy bắn bóng tự động, HLV/Nhặt bóng.
   - Tự động tính tổng tiền (Giờ thường < 16h vs Giờ cao điểm/Cuối tuần).
   - Modal thanh toán quét mã QR ngân hàng (VietQR) kèm mã booking duy nhất (VD: BSB-CAS-8921).

2. Đặt Sân Cố Định (Fixed Schedule):
   - Cho phép khách chọn các ngày trong tuần (Ví dụ: Thứ 2-4-6 hoặc Thứ 3-5-7).
   - Chọn khung giờ cố định và thời hạn hợp đồng (1 tháng, 3 tháng, 6 tháng).
   - Tự động áp dụng chiết khấu giảm 15% - 20% cho khách hợp đồng cố định.
   - Hiển thị số tiền đặt cọc giữ sân và hợp đồng cam kết.

3. Đặt Sân Sự Kiện (Event & Tournament):
   - Dành cho doanh nghiệp hoặc tổ chức giải: Chọn ngày, thời gian (nửa ngày / nguyên ngày), số lượng sân cần bao trọn.
   - Danh sách dịch vụ đi kèm có checkbox tính tiền: Âm thanh Micro JBL, Tổ Trọng tài USAPA, MC Hoạt náo, Teabreak Isotonic, Livestream 2 góc máy + BLV, Thiết kế Backdrop/Standee.
   - Tự động tạo báo giá sự kiện và gửi yêu cầu thẩm định.

#### B. CÂU LẠC BỘ (BSB CLUBS):
- Lưu ý đặc biệt: Người dùng/khách hàng KHÔNG cần phải điền form cấu hình phức tạp. Khách hàng chỉ xem danh sách các CLB đang sinh hoạt tại BSB, trình độ DUPR, lịch cố định và bấm nút "Đăng ký tham gia giao lưu" (chỉ cần nhập Tên + SĐT/Zalo).
- ADMIN là người có toàn quyền thêm mới Câu lạc bộ, chỉnh sửa lịch sinh hoạt, gán sân cố định và quản lý thành viên.

#### C. GIẢI ĐẤU MINITOUR (BSB MINITOURS):
- Hiển thị danh sách các giải đấu mini hàng tuần (VD: BSB Weekend Smash DUPR 3.0, BSB Mixed Doubles Night Cup, BSB Rookie Challenge 2.5).
- Thẻ thông tin giải: Thể thức thi đấu, Hạng mục, Trình độ DUPR, Lệ phí tham gia, Tổng giải thưởng & Chi tiết giải (Cúp BSB, Tiền mặt, Vợt thi đấu).
- Form đăng ký cặp đấu (VĐV 1 + VĐV 2, SĐT, Điểm DUPR).
- Sơ đồ nhánh đấu tương tác (Interactive Tournament Bracket): Hiển thị Tứ kết, Bán kết, Chung kết với tỷ số trực tiếp.

#### D. KHU VỰC ADMIN (ADMIN CONTROL PANEL):
- Bật/tắt chế độ Admin tiện lợi.
- Quản lý Lịch Đặt Sân: Xem danh sách, lọc theo Vãng lai / Cố định / Sự kiện, duyệt hoặc hủy lịch.
- Quản lý Câu Lạc Bộ: Form thêm CLB mới (Tên CLB, Tagline, Cấp độ DUPR, HLV, Lịch sinh hoạt, Sân gán, Mức phí).
- Quản lý Minitour: Tạo giải mới, quản lý danh sách đội đăng ký, cập nhật điểm số từng trận trong nhánh đấu.
- Báo cáo thống kê: Doanh thu ước tính, tỷ lệ kín sân, số lượt đặt trong ngày.

#### E. TRA CỨU MÃ ĐẶT SÂN & VÉ CHECK-IN:
- Người dùng có thể nhập Số điện thoại hoặc Mã đặt sân (BSB-XXX-XXXX) để xem lại vé điện tử có kèm mã QR Check-in trực tiếp tại quầy lễ tân.
\`\`\`
`.trim();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200"
          >
            {/* Header */}
            <div className="bg-[#11385E] text-white p-5 flex items-center justify-between relative border-b border-blue-900/50">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20">
                  <BSBLogo variant="light" size="sm" showSubtitle={false} />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    Kế Hoạch Dự Án & Master Prompt AI (BSB Booking)
                  </h2>
                  <p className="text-xs text-blue-200">
                    Tài liệu chuẩn kiến trúc nghiệp vụ, PRD & Prompt chuyển giao hệ thống
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 overflow-x-auto text-sm font-semibold">
              <button
                onClick={() => setActiveTab('plan')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'plan'
                    ? 'border-[#11385E] text-[#11385E] bg-white rounded-t-lg shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4 text-blue-700" />
                1. Kế Hoạch & Nghiệp Vụ
              </button>
              <button
                onClick={() => setActiveTab('prompt')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'prompt'
                    ? 'border-[#11385E] text-[#11385E] bg-white rounded-t-lg shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                2. Master Prompt AI
              </button>
              <button
                onClick={() => setActiveTab('architecture')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'architecture'
                    ? 'border-[#11385E] text-[#11385E] bg-white rounded-t-lg shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4 text-emerald-600" />
                3. Mô Hình Dữ Liệu & Giá
              </button>
              <button
                onClick={() => setActiveTab('adminGuide')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'adminGuide'
                    ? 'border-[#11385E] text-[#11385E] bg-white rounded-t-lg shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                4. Hướng Dẫn Vận Hành Admin
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 text-slate-800 text-sm leading-relaxed">
              {activeTab === 'plan' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-blue-50 border border-blue-200 p-4 rounded-xl">
                    <div>
                      <h3 className="font-bold text-[#11385E]">Bản Kế Hoạch Nghiệp Vụ Toàn Diện BSB</h3>
                      <p className="text-xs text-slate-600">Đầy đủ các luồng: Đặt sân (Cố định/Vãng lai/Sự kiện), Câu Lạc Bộ & Minitour</p>
                    </div>
                    <button
                      onClick={() => handleCopy(planText)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#11385E] text-white rounded-lg hover:bg-blue-900 text-xs font-semibold shadow-xs"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Đã sao chép' : 'Sao chép kế hoạch'}
                    </button>
                  </div>
                  <pre className="bg-white p-5 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 whitespace-pre-wrap shadow-inner overflow-x-auto">
                    {planText}
                  </pre>
                </div>
              )}

              {activeTab === 'prompt' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-amber-50 border border-amber-200 p-4 rounded-xl">
                    <div>
                      <h3 className="font-bold text-amber-900">Master Prompt Chuẩn AI Studio & Developers</h3>
                      <p className="text-xs text-amber-700">Dùng prompt này để sinh mã nguồn, mở rộng hệ thống hoặc tích hợp thêm API</p>
                    </div>
                    <button
                      onClick={() => handleCopy(promptMasterText)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-xs font-semibold shadow-xs"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Đã sao chép' : 'Sao chép Master Prompt'}
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 font-mono text-xs whitespace-pre-wrap shadow-inner overflow-x-auto">
                    {promptMasterText}
                  </pre>
                </div>
              )}

              {activeTab === 'architecture' && (
                <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200">
                  <h3 className="text-base font-bold text-[#11385E] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-700" />
                    Cấu Trúc Ma Trận Đặt Sân & Phân Bổ Sân BSB
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
                      <div className="font-bold text-blue-900 mb-1">1. Đặt Lịch Vãng Lai</div>
                      <p className="text-xs text-slate-600 mb-2">Đặt theo giờ linh hoạt, thanh toán theo slot 60-120 phút.</p>
                      <ul className="text-xs space-y-1 text-slate-700">
                        <li>• Giờ thường (05:30-16:00): 130k - 180k/h</li>
                        <li>• Giờ vàng (16:00-23:00): 190k - 250k/h</li>
                        <li>• Hỗ trợ thuê vợt, rổ bóng, máy bắn bóng</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                      <div className="font-bold text-emerald-900 mb-1">2. Lịch Cố Định (CLB/Hợp đồng)</div>
                      <p className="text-xs text-slate-600 mb-2">Đăng ký chu kỳ 1 - 6 tháng, giữ khung giờ vàng độc quyền.</p>
                      <ul className="text-xs space-y-1 text-slate-700">
                        <li>• Giảm 15% tổng hóa đơn tháng</li>
                        <li>• Cố định Thứ 2-4-6 hoặc 3-5-7 hoặc T7-CN</li>
                        <li>• Ưu tiên tủ locker và giữ túi vợt</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl">
                      <div className="font-bold text-purple-900 mb-1">3. Lịch Sự Kiện Doanh Nghiệp</div>
                      <p className="text-xs text-slate-600 mb-2">Bao trọn 3-6 sân cho ngày hội thể thao công ty.</p>
                      <ul className="text-xs space-y-1 text-slate-700">
                        <li>• Trọng tài USAPA chuyên nghiệp</li>
                        <li>• Âm thanh công suất lớn & MC</li>
                        <li>• Livestream 2 góc máy + Bình luận viên</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">Thực Thể Cơ Sở Dữ Liệu Chính (Data Schema):</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono text-slate-600">
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-blue-700 font-bold">Courts</span>: 6 sân chuẩn
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-blue-700 font-bold">Bookings</span>: Vãng lai / Cố định / Event
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-blue-700 font-bold">Clubs</span>: CLB BSB do Admin quản lý
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-blue-700 font-bold">Minitours</span>: Cặp đấu & Brackets
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'adminGuide' && (
                <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200">
                  <h3 className="text-base font-bold text-[#11385E] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-700" />
                    Hướng Dẫn Nghiệp Vụ Vận Hành Cho Ban Quản Trị BSB
                  </h3>

                  <div className="space-y-3 text-xs text-slate-700">
                    <div className="border-l-4 border-blue-600 pl-3 py-1">
                      <span className="font-bold text-blue-900">1. Quản lý Câu lạc bộ (CLB):</span>
                      <p>Khách hàng không cần nhập thông tin CLB phức tạp. Admin chỉ cần vào tab <strong>Quản Trị Admin &gt; Thêm CLB Mới</strong> để nhập tên CLB, mô tả, trình độ DUPR, HLV phụ trách, gán sân số mấy và lịch sinh hoạt định kỳ. CLB sẽ tự động hiển thị ra trang công khai cho hội viên đăng ký giao lưu.</p>
                    </div>

                    <div className="border-l-4 border-emerald-600 pl-3 py-1">
                      <span className="font-bold text-emerald-900">2. Điều phối Lịch Cố Định & Vãng Lai:</span>
                      <p>Khi có hợp đồng cố định mới, Admin tạo hoặc duyệt để hệ thống tự động khóa (block) khung giờ đó trên ma trận đặt sân vãng lai, đảm bảo không bao giờ bị trùng lịch.</p>
                    </div>

                    <div className="border-l-4 border-amber-600 pl-3 py-1">
                      <span className="font-bold text-amber-900">3. Vận hành Giải Minitour & Nhập điểm:</span>
                      <p>Admin tạo giải mini, mở cổng đăng ký cặp đấu. Khi đủ số đội, Admin bấm bốc thăm nhánh đấu Tứ kết/Bán kết và trực tiếp nhập điểm set đấu để hệ thống tự đẩy đội thắng vào vòng tiếp theo.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs text-slate-500">
                BSB Pickleball Club • Better Social Balance
              </span>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-[#11385E] hover:bg-blue-900 text-white rounded-xl font-medium text-xs transition-colors shadow-sm"
              >
                Đóng cửa sổ
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
