import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, ShieldAlert, ChevronRight, Navigation, Loader2 } from 'lucide-react';
import { usePublicContent } from '../services/publicContent';
import { api } from '../services/api';

export default function ContactPage({ onOpenBooking }) {
  const { settings, branches: branchesData, loading } = usePublicContent();
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    branch: '',
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!form.name || !form.phone) {
      alert('Vui lòng nhập Họ tên và Số điện thoại!');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitContact({
        fullName: form.name,
        name: form.name,
        phone: form.phone,
        email: form.email || '',
        branch: branchesData.some(branch => branch.name === form.branch) ? form.branch : '',
        message: form.message || '',
        subject: `Yêu cầu tư vấn từ website (${form.branch || 'Tổng đài'})`,
        type: 'contact',
        createdAt: new Date().toISOString()
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || 'Không gửi được yêu cầu. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">LIÊN HỆ & MẠNG LƯỚI CHI NHÁNH</span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-2 mb-4">
            Đồng Hành Cùng Bạn Mọi Lúc Mọi Nơi
          </h1>
          <p className="text-base text-slate-600">
            Hệ thống chi nhánh & cơ sở rộng khắp Đồng Nai và TP. Hồ Chí Minh luôn sẵn sàng phục vụ và giải quyết mọi nhu cầu của Quý khách.
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Phone size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Hotline Tổng Đài</p>
              <a href={settings.hotline ? `tel:${settings.hotline.replace(/[^+\d]/g, '')}` : undefined} className="text-xl font-black text-slate-900 hover:text-primary transition-colors">
                {settings.hotline}
              </a>
              <p className="text-xs text-slate-500 mt-1">Hỗ trợ tư vấn mua xe & dịch vụ 24/7</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <ShieldAlert size={24} className="animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-red-500 font-bold uppercase">Cứu Hộ Khẩn Cấp</p>
              <a href={settings.hotline ? `tel:${settings.hotline.replace(/[^+\d]/g, '')}` : undefined} className="text-xl font-black text-red-600 hover:text-red-700 transition-colors">
                {settings.hotline}
              </a>
              <p className="text-xs text-slate-500 mt-1">Xe sàn trượt, kích bình, kéo xe 15-30 phút</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Hộp Thư Điện Tử</p>
              <a href={settings.email ? `mailto:${settings.email}` : undefined} className="text-lg font-bold text-slate-900 hover:text-primary transition-colors">
                {settings.email}
              </a>
              <p className="text-xs text-slate-500 mt-1">Phản hồi yêu cầu trong 2 giờ làm việc</p>
            </div>
          </div>
        </div>

        {/* 11 Branches Directory */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Danh Sách Chi Nhánh & Cơ Sở Kim Sơn</h2>
            <p className="text-xs text-slate-500 mt-2">Bấm vào số điện thoại để gọi ngay hoặc bấm "Chỉ đường" để mở Google Maps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!branchesData.length && <p role="status" className="text-slate-500">{loading.branches ? 'Đang tải chi nhánh...' : 'Danh sách chi nhánh đang được cập nhật.'}</p>}
            {branchesData.map((branch) => (
              <div 
                key={branch.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-primary px-3 py-1 bg-primary-subtle/60 rounded-full">
                      {branch.area}
                    </span>
                    {branch.isMain && (
                      <span className="text-xs font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded-full">
                        Trụ Sở
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-slate-900 mb-3">{branch.name}</h3>

                  <div className="space-y-2 text-xs text-slate-600 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                      <span>{branch.address}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-primary shrink-0" />
                      <a href={`tel:${branch.hotline.replace(/\s+/g, '')}`} className="font-bold text-slate-900 hover:text-primary">
                        {branch.hotline}
                      </a>
                    </div>

                    {branch.hours && <div className="flex items-center gap-2">
                      <Clock size={16} className="text-primary shrink-0" />
                      <span>{branch.hours}</span>
                    </div>}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(branch.features || []).map((svc, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                  <a
                    href={branch.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Navigation size={14} />
                    <span>Chỉ Đường</span>
                  </a>

                  <a
                    href={`tel:${branch.hotline.replace(/\s+/g, '')}`}
                    className="py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Phone size={14} />
                    <span>Gọi Ngay</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Inquiry Form */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-primary uppercase">GỬI PHẢN HỒI / TƯ VẤN</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 mb-4">
                Chúng Tôi Luôn Sẵn Sàng Lắng Nghe
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Quý khách có nhu cầu báo giá xe lăn bánh, tư vấn thủ tục vay trả góp, bảo hiểm thân vỏ hoặc góp ý chất lượng dịch vụ? Hãy điền thông tin vào biểu mẫu bên cạnh, chuyên viên Kim Sơn sẽ liên hệ phản hồi ngay.
              </p>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <span>Báo giá chính xác, minh bạch, không phát sinh chi phí</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <span>Hỗ trợ lái thử xe tận nhà theo yêu cầu</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <span>Bảo mật 100% dữ liệu thông tin khách hàng</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200">
              {submitted ? (
                <div className="text-center py-8 space-y-4">
                  <CheckCircle2 size={48} className="text-emerald-500 mx-auto" />
                  <h4 className="text-xl font-bold text-slate-900">Cảm Ơn Quý Khách!</h4>
                  <p className="text-xs text-slate-600">
                    Tin nhắn của Quý khách đã được gửi thành công đến ban điều hành Kim Sơn Automobiles. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-bold"
                  >
                    Gửi tin nhắn khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                  {submitError && <p role="alert" className="text-red-600">{submitError}</p>}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Họ và Tên *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Số Điện Thoại *</label>
                      <input
                        type="tel"
                        required
                        placeholder="0908 xxx xxx"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Chi Nhánh Cần Liên Hệ</label>
                    <select
                      value={branchesData.some(branch => branch.name === form.branch) ? form.branch : ''}
                      onChange={(e) => setForm({ ...form, branch: e.target.value })}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Tổng đài / Chưa chọn chi nhánh</option>
                      {branchesData.map((b) => (
                        <option key={b.id} value={b.name}>{b.name} ({b.area})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nội Dung Yêu Cầu</label>
                    <textarea
                      rows="3"
                      placeholder="Quý khách muốn tìm hiểu xe gì hoặc cần hỗ trợ dịch vụ nào?..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Đang Gửi Yêu Cầu...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Gửi Yêu Cầu Cho Kim Sơn</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
