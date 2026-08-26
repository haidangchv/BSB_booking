import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Mail, Send, CheckCircle2, Clock, Calendar, 
  ExternalLink, Copy, Check, RefreshCw, AlertCircle, 
  Sparkles, FileText, User as UserIcon
} from 'lucide-react';
import { EmailNotification } from '../../types';
import { EmailService } from '../../lib/emailService';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: EmailNotification | null;
  onResendSuccess?: () => void;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  email,
  onResendSuccess
}) => {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  if (!isOpen || !email) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(email.htmlContent);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendStatus(null);
    try {
      await EmailService.resendEmail(email.id);
      setResendStatus('Đã gửi lại email thành công!');
      onResendSuccess?.();
      setTimeout(() => setResendStatus(null), 3000);
    } catch (e) {
      setResendStatus('Lỗi khi gửi lại email.');
    } finally {
      setIsResending(false);
    }
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: 'bg-amber-100', text: 'text-amber-800' },
    CONFIRMED: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    RESCHEDULED: { bg: 'bg-blue-100', text: 'text-blue-800' },
    CANCELLED: { bg: 'bg-red-100', text: 'text-red-800' },
    REJECTED: { bg: 'bg-slate-100', text: 'text-slate-700' }
  };

  const badgeStyle = statusColors[email.templateType] || { bg: 'bg-slate-100', text: 'text-slate-700' };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[92vh] flex flex-col font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#11385E] flex items-center justify-center border border-blue-200 shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base text-[#11385E]">
                  Email Giao Dịch BSB Pickleball
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeStyle.bg} ${badgeStyle.text}`}>
                  {email.templateType}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ĐÃ GỬI (SENT)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mã: <strong className="font-mono text-slate-900">{email.bookingCode || 'BSB'}</strong> • Gửi lúc: {new Date(email.sentAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Meta Bar */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1.5 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Người gửi:</span>
            <span className="font-semibold text-slate-800">BSB Pickleball Club &lt;booking@bsbpickleball.vn&gt;</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Người nhận:</span>
            <span className="font-bold text-[#11385E] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {email.recipientName} &lt;{email.recipientEmail}&gt;
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Tiêu đề (Subject):</span>
            <span className="font-bold text-slate-900">{email.subject}</span>
          </div>
        </div>

        {/* Resend Status feedback */}
        {resendStatus && (
          <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {resendStatus}
          </div>
        )}

        {/* Rendered Email Frame */}
        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-2xl bg-slate-100 p-2 shadow-inner min-h-[350px]">
          <div 
            className="email-rendered-preview bg-white rounded-xl shadow-xs overflow-hidden mx-auto"
            dangerouslySetInnerHTML={{ __html: email.htmlContent }}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-4 text-xs">
          <span className="text-[11px] text-slate-400">
            Provider Message ID: <code className="font-mono text-slate-600">{email.providerMessageId || 'msg_simulated'}</code>
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyCode}
              className="flex-1 sm:flex-initial px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedHtml ? 'Đã Sao Chép' : 'Sao Chép HTML'}
            </button>

            <button
              onClick={handleResend}
              disabled={isResending}
              className="flex-1 sm:flex-initial px-4 py-2 bg-[#11385E] hover:bg-[#0c2946] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              {isResending ? 'Đang gửi...' : 'Gửi Lại Email'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
