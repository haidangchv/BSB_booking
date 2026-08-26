import { Booking, EmailNotification, BookingStatus } from '../types';
import { BSB_INFO } from '../data/mockData';

const EMAIL_OUTBOX_KEY = 'bsb_email_outbox_v2';

// Safe Local Storage Helper
function getStoredEmails(): EmailNotification[] {
  try {
    const data = localStorage.getItem(EMAIL_OUTBOX_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    console.warn('Error reading email outbox from storage:', e);
    return [];
  }
}

function saveStoredEmails(emails: EmailNotification[]): void {
  try {
    localStorage.setItem(EMAIL_OUTBOX_KEY, JSON.stringify(emails));
    // Dispatch event so UI can react in real time
    window.dispatchEvent(new CustomEvent('bsb_email_outbox_updated', { detail: emails }));
  } catch (e) {
    console.warn('Error saving email outbox to storage:', e);
  }
}

export const EmailService = {
  // Get all emails in outbox
  getEmailOutbox(): EmailNotification[] {
    return getStoredEmails();
  },

  // Get email for a specific booking
  getEmailByBookingId(bookingId: string): EmailNotification | undefined {
    const emails = getStoredEmails();
    return emails.find(e => e.bookingId === bookingId);
  },

  // Generate responsive HTML template for BSB Transactional Emails
  generateEmailHtml(
    booking: Booking,
    templateType: 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'REJECTED'
  ): { subject: string; html: string } {
    const isPending = templateType === 'PENDING';
    const isConfirmed = templateType === 'CONFIRMED';
    const isRescheduled = templateType === 'RESCHEDULED';
    const isCancelled = templateType === 'CANCELLED';
    const isRejected = templateType === 'REJECTED';

    let statusTitle = 'ĐÃ NHẬN YÊU CẦU ĐẶT SÂN';
    let statusSubtitle = 'BSB đang kiểm tra và sẽ phản hồi trong vòng 15 phút.';
    let statusBadgeColor = '#F59E0B'; // Amber
    let statusBadgeBg = '#FEF3C7';
    let subject = `[BSB Pickleball] BSB đã nhận yêu cầu đặt sân #${booking.bookingCode}`;

    if (isConfirmed) {
      statusTitle = 'LỊCH ĐẶT SÂN ĐÃ ĐƯỢC XÁC NHẬN';
      statusSubtitle = 'Lịch của bạn đã được đưa vào hệ thống và sẵn sàng phục vụ.';
      statusBadgeColor = '#10B981'; // Emerald
      statusBadgeBg = '#D1FAE5';
      subject = `[BSB Pickleball] Lịch đặt sân #${booking.bookingCode} đã được XÁC NHẬN`;
    } else if (isRescheduled) {
      statusTitle = 'THÔNG BÁO THAY ĐỔI GIỜ / SÂN';
      statusSubtitle = 'Lịch đặt sân của bạn vừa được cập nhật thời gian / sân thi đấu mới.';
      statusBadgeColor = '#3B82F6'; // Blue
      statusBadgeBg = '#DBEAFE';
      subject = `[BSB Pickleball] Thông báo đổi lịch đặt sân #${booking.bookingCode}`;
    } else if (isCancelled) {
      statusTitle = 'LỊCH ĐẶT SÂN ĐÃ ĐƯỢC HỦY';
      statusSubtitle = 'Lịch đặt sân đã được hủy theo yêu cầu.';
      statusBadgeColor = '#EF4444'; // Red
      statusBadgeBg = '#FEE2E2';
      subject = `[BSB Pickleball] Thông báo HỦY lịch đặt sân #${booking.bookingCode}`;
    } else if (isRejected) {
      statusTitle = 'YÊU CẦU ĐẶT SÂN KHÔNG ĐƯỢC CHẤP NHẬN';
      statusSubtitle = 'Khung giờ bạn yêu cầu hiện không thể bố trí sân. Xin quý khách thông cảm.';
      statusBadgeColor = '#6B7280'; // Slate
      statusBadgeBg = '#F3F4F6';
      subject = `[BSB Pickleball] Thông báo từ chối yêu cầu đặt sân #${booking.bookingCode}`;
    }

    const typeLabels: Record<string, string> = {
      clb: 'Câu Lạc Bộ (Chiết khấu 10%)',
      minitour: 'Minitour Giải Đấu',
      fixed: 'Lịch Cố Định Hàng Tuần',
      casual: 'Vãng Lai (Slot 30 phút)',
      event: 'Sự Kiện / Hội Thao'
    };

    const qrUrl = `https://api.vietqr.io/image/970422-${BSB_INFO.bankInfo.accountNumber}-${BSB_INFO.bankInfo.qrTemplate}.jpg?amount=${booking.depositAmount || booking.totalAmount}&addInfo=${booking.bookingCode}&accountName=${encodeURIComponent(BSB_INFO.bankInfo.accountHolder)}`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #11385E 0%, #0c2946 100%); padding: 30px 24px; text-align: center; color: #ffffff; }
    .logo-badge { display: inline-block; background-color: #ffffff; padding: 8px 18px; border-radius: 10px; font-weight: 900; font-size: 20px; color: #11385E; letter-spacing: 1.5px; border: 2px solid #F59E0B; margin-bottom: 12px; }
    .header-slogan { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #93c5fd; font-weight: 700; margin: 0; }
    .body { padding: 28px 24px; }
    .status-card { background-color: ${statusBadgeBg}; border: 1px solid ${statusBadgeColor}40; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center; }
    .status-badge { display: inline-block; background-color: ${statusBadgeColor}; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 12px; border-radius: 999px; letter-spacing: 1px; margin-bottom: 6px; }
    .status-title { font-size: 16px; font-weight: 800; color: #0f172a; margin: 4px 0; }
    .status-desc { font-size: 12px; color: #475569; margin: 0; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .info-table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
    .info-table td.label { color: #64748b; font-weight: 500; width: 38%; }
    .info-table td.value { color: #0f172a; font-weight: 700; text-align: right; }
    .code-box { background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 14px; text-align: center; margin-bottom: 24px; }
    .code-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; }
    .code-val { font-family: monospace; font-size: 22px; font-weight: 900; color: #11385E; letter-spacing: 2px; }
    .qr-section { background-color: #f8fafc; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; border: 1px solid #e2e8f0; }
    .qr-img { width: 180px; height: 180px; border-radius: 12px; border: 1px solid #cbd5e1; margin-bottom: 12px; }
    .cta-btn { display: inline-block; background-color: #11385E; color: #ffffff !important; text-decoration: none; padding: 12px 28px; font-size: 13px; font-weight: 800; border-radius: 10px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 10px rgba(17, 56, 94, 0.25); }
    .footer { background-color: #f8fafc; padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .footer-hotline { font-weight: 700; color: #11385E; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo-badge">BSB PICKLEBALL</div>
      <p class="header-slogan">Better Social Balance</p>
    </div>

    <!-- Body -->
    <div class="body">
      <!-- Status Box -->
      <div class="status-card">
        <span class="status-badge">${templateType}</span>
        <div class="status-title">${statusTitle}</div>
        <p class="status-desc">${statusSubtitle}</p>
      </div>

      <p style="font-size: 14px; margin-top: 0;">Xin chào <strong>${booking.customerName || 'Quý Khách Hàng'}</strong>,</p>
      <p style="font-size: 13px; color: #475569; line-height: 1.6;">
        Cảm ơn bạn đã tin chọn <strong>BSB Pickleball Club</strong>. Dưới đây là thông tin chi tiết về lịch đặt sân của bạn:
      </p>

      <!-- Booking Code Card -->
      <div class="code-box">
        <div class="code-title">Mã Booking Tra Cứu</div>
        <div class="code-val">${booking.bookingCode}</div>
      </div>

      <!-- Details Table -->
      <table class="info-table">
        <tr>
          <td class="label">Loại hình lịch:</td>
          <td class="value">${typeLabels[booking.bookingType] || booking.bookingType}</td>
        </tr>
        <tr>
          <td class="label">Sân thi đấu:</td>
          <td class="value">${booking.courtName}</td>
        </tr>
        <tr>
          <td class="label">Ngày sử dụng:</td>
          <td class="value">${booking.date}</td>
        </tr>
        <tr>
          <td class="label">Khung giờ:</td>
          <td class="value">${booking.startTime} - ${booking.endTime}</td>
        </tr>
        ${booking.clubName ? `
        <tr>
          <td class="label">Câu Lạc Bộ:</td>
          <td class="value">${booking.clubName}</td>
        </tr>
        ` : ''}
        ${booking.title ? `
        <tr>
          <td class="label">Tên giải / Sự kiện:</td>
          <td class="value">${booking.title}</td>
        </tr>
        ` : ''}
        <tr>
          <td class="label">Số điện thoại:</td>
          <td class="value">${booking.customerPhone}</td>
        </tr>
        <tr>
          <td class="label">Email nhận thông báo:</td>
          <td class="value">${booking.customerEmail || 'Chưa cập nhật'}</td>
        </tr>
        <tr>
          <td class="label">Tổng chi phí:</td>
          <td class="value" style="color: #11385E; font-size: 15px;">${booking.totalAmount.toLocaleString('vi-VN')} VNĐ</td>
        </tr>
        <tr>
          <td class="label">Số tiền cọc / thanh toán:</td>
          <td class="value" style="color: #059669; font-size: 15px;">${(booking.depositAmount || booking.totalAmount).toLocaleString('vi-VN')} VNĐ</td>
        </tr>
        <tr>
          <td class="label">Trạng thái thanh toán:</td>
          <td class="value">${booking.paymentStatus === 'paid' ? 'Đã thanh toán đủ' : booking.paymentStatus === 'deposit_paid' ? 'Đã cọc 30-50%' : 'Chờ thanh toán'}</td>
        </tr>
        ${booking.notes ? `
        <tr>
          <td class="label">Ghi chú kèm theo:</td>
          <td class="value" style="font-weight: 500; color: #475569;">${booking.notes}</td>
        </tr>
        ` : ''}
      </table>

      <!-- VietQR Payment Info if not fully paid -->
      ${!isCancelled && !isRejected ? `
      <div class="qr-section">
        <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
          MÃ THANH TOÁN VIETQR TỰ ĐỘNG
        </div>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 12px;">
          Quét mã bằng app ngân hàng bất kỳ để hoàn tất thanh toán giữ chỗ
        </div>
        <img src="${qrUrl}" alt="VietQR BSB" class="qr-img" />
        <div style="font-size: 12px; color: #334155;">
          Ngân hàng: <strong>${BSB_INFO.bankInfo.bankName}</strong><br>
          STK: <strong style="font-family: monospace; font-size: 14px;">${BSB_INFO.bankInfo.accountNumber}</strong><br>
          Chủ tài khoản: <strong>${BSB_INFO.bankInfo.accountHolder}</strong><br>
          Nội dung: <strong style="color: #11385E; font-family: monospace;">${booking.bookingCode}</strong>
        </div>
      </div>
      ` : ''}

      <!-- CTA -->
      <div style="text-align: center; margin: 30px 0 10px;">
        <a href="http://localhost:3001/" class="cta-btn">Tra Cứu Lịch Của Tôi</a>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 6px 0;"><strong>BSB PICKLEBALL CLUB</strong> • ${BSB_INFO.address}</p>
      <p style="margin: 0 0 6px 0;">Hotline hỗ trợ: <span class="footer-hotline">${BSB_INFO.hotline}</span> • Zalo: ${BSB_INFO.zalo}</p>
      <p style="margin: 0; color: #94a3b8; font-size: 10px;">Đây là email giao dịch tự động được gửi từ hệ thống đặt sân BSB Pickleball. Vui lòng không trả lời trực tiếp email này.</p>
    </div>
  </div>
</body>
</html>
    `;

    return { subject, html };
  },

  // Send / Record Email Notification
  async sendBookingConfirmationEmail(
    booking: Booking,
    templateType: 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'REJECTED' = 'PENDING'
  ): Promise<EmailNotification> {
    const recipientEmail = booking.customerEmail || 'khachhang@bsbpickleball.vn';
    const { subject, html } = this.generateEmailHtml(booking, templateType);

    const emailItem: EmailNotification = {
      id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      recipientEmail,
      recipientName: booking.customerName || 'Khách Hàng',
      subject,
      templateType,
      htmlContent: html,
      status: 'SENT',
      sentAt: new Date().toISOString(),
      providerMessageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    };

    const currentEmails = getStoredEmails();
    const updated = [emailItem, ...currentEmails];
    saveStoredEmails(updated);

    console.log(`[EmailService] Sent email '${subject}' to ${recipientEmail}`);
    return emailItem;
  },

  // Resend an email
  async resendEmail(emailId: string): Promise<EmailNotification | null> {
    const emails = getStoredEmails();
    const target = emails.find(e => e.id === emailId);
    if (!target) return null;

    const resentItem: EmailNotification = {
      ...target,
      id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sentAt: new Date().toISOString(),
      status: 'SENT',
      providerMessageId: `resend_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    };

    const updated = [resentItem, ...emails];
    saveStoredEmails(updated);
    return resentItem;
  }
};
