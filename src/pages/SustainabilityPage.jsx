import React from 'react';
import { Leaf, ShieldCheck, Users, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { ecosystemData } from '../data/ecosystem';

export default function SustainabilityPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-4 py-1.5 rounded-full mb-2.5 border border-emerald-200">
            <Leaf size={14} />
            CHIẾN LƯỢC PHÁT TRIỂN BỀN VỮNG (ESG)
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.3]">
            Trách Nhiệm Xã Hội & Chuyển Đổi Xanh
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            Tại Kim Sơn Automobiles, sự thành công của doanh nghiệp luôn song hành cùng trách nhiệm bảo vệ môi trường sinh thái và sự thịnh vượng của cộng đồng.
          </p>
        </div>

        {/* 3 Pillars of ESG */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Leaf size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">Môi Trường (Environmental)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tiên phong trang bị hạ tầng dịch vụ cho ô tô điện không phát thải. 100% chất thải nguy hại (dầu nhớt cũ, ắc quy chì, dung môi sơn) được thu gom và xử lý nghiêm ngặt bởi các đơn vị được Bộ Tài Nguyên & Môi Trường cấp phép.
            </p>
            <div className="pt-2 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Hệ thống phòng sơn sấy màng lọc than hoạt tính</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Tiết kiệm năng lượng chiếu sáng bằng đèn LED công nghiệp</div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Xã Hội (Social)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tạo lập môi trường làm việc bình đẳng, an toàn và chuyên nghiệp cho hơn 300 nhân sự kỹ thuật. Liên kết đào tạo thực tập sinh tay nghề cao với các trường cao đẳng, đại học kỹ thuật tại TP.HCM và Đồng Nai.
            </p>
            <div className="pt-2 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-500" /> Khóa đào tạo chuẩn hóa an toàn điện cao áp xe điện</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-500" /> Chế độ bảo hiểm và phúc lợi người lao động toàn diện</div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Quản Trị (Governance)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vận hành hệ thống quản trị minh bạch, kiểm soát chất lượng phụ tùng chính ngạch 100% có hóa đơn chứng từ xuất xứ rõ ràng. Tôn trọng đạo đức kinh doanh và quyền lợi cao nhất của khách hàng.
            </p>
            <div className="pt-2 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-500" /> Quy trình kiểm định chất lượng KCS độc lập</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-500" /> Minh bạch báo giá và quy tắc ứng xử chuẩn mực</div>
            </div>
          </div>
        </div>

        {/* Community Rescue Banner */}
        <div className="bg-slate-950 text-white p-8 sm:p-12 rounded-3xl border border-slate-900 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <HeartHandshake size={16} />
              CỨU TRỢ & AN SINH CỘNG ĐỒNG
            </div>
            <h3 className="text-2xl sm:text-3xl font-black">Hỗ Trợ Khẩn Cấp Mùa Mưa Bão & Sự Cố Giao Thông</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Hệ thống xe cứu hộ Kim Sơn sẵn sàng phối hợp cùng lực lượng chức năng địa phương tham gia hỗ trợ kéo xe ngập nước và giải tỏa ách tắc giao thông hoàn toàn miễn phí trong các tình huống thiên tai khẩn cấp.
            </p>
          </div>
          <div className="shrink-0 text-center">
            <p className="text-xs text-slate-400 mb-1">Hotline Phản Ứng Nhanh</p>
            <a href="tel:0908123456" className="text-2xl font-black text-amber-400 hover:underline">
              0908 123 456
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
