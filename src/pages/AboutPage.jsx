import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, ShieldCheck, Users, Target, Clock, Wrench, CheckCircle2, 
  MapPin, Phone, Sparkles, ChevronRight, Zap, ExternalLink 
} from 'lucide-react';

export default function AboutPage() {
  const milestones = [
    {
      year: '2014',
      title: 'Khởi Đầu Vững Chắc',
      desc: 'Thành lập trung tâm dịch vụ kỹ thuật ô tô đầu tiên tại TP. Biên Hòa, tập trung vào sửa chữa máy gầm và phục hồi xe tai nạn.'
    },
    {
      year: '2017',
      title: 'Hợp Tác Chiến Lược Chevrolet & Nissan',
      desc: 'Trở thành đơn vị ủy quyền bảo dưỡng, sửa chữa và phân phối phụ tùng chính hãng cho các dòng xe Mỹ và Nhật Bản.'
    },
    {
      year: '2020',
      title: 'Mở Rộng Mạng Lưới Chi Nhánh',
      desc: 'Phát triển hệ thống các trạm dịch vụ tại Bửu Long, Trảng Dài, Long Thành và Nhơn Trạch nhằm phục vụ khách hàng thuận tiện nhất.'
    },
    {
      year: '2023',
      title: 'Chuyển Đổi Xanh Cùng VinFast',
      desc: 'Hợp tác chiến lược cùng VinFast, chính thức vận hành Đại Lý 3S VinFast Kim Sơn Biên Hoà quy mô bậc nhất khu vực, thúc đẩy giao thông xanh.'
    },
    {
      year: '2026',
      title: 'Hệ Sinh Thái Ô Tô Toàn Diện',
      desc: 'Hoàn thiện hệ sinh thái 11 chi nhánh & cơ sở khắp Đồng Nai và TP.HCM, mang đến trải nghiệm dịch vụ xe toàn diện và cứu hộ 24/7 hoàn hảo.'
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">VỀ CHÚNG TÔI</span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-2 mb-4 font-display">
            Kim Sơn Automobiles
          </h1>
          <p className="text-base text-slate-600">
            Hơn 12 năm kiến tạo niềm tin và khẳng định vị thế dẫn đầu trong lĩnh vực kinh doanh xe và chăm sóc kỹ thuật ô tô tại Đông Nam Bộ.
          </p>
        </div>

        {/* Featured Showcase: VinFast Kim Sơn Biên Hoà */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Image Box */}
            <div className="lg:col-span-7 relative group overflow-hidden min-h-[340px] sm:min-h-[440px] flex items-center bg-black">
              <img 
                src="/vinfast-kimson-bienhoa.jpg" 
                alt="Showroom VinFast Kim Sơn Biên Hoà" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              
              {/* Badge Over Photo */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap gap-2 z-10">
                <span className="bg-primary/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-300" />
                  <span>Showroom 3S Trọng Điểm</span>
                </span>
                <span className="bg-slate-900/80 backdrop-blur-md text-slate-200 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/10 hidden sm:inline-flex items-center gap-1.5">
                  <Zap size={13} className="text-emerald-400" />
                  <span>Trạm Sạc Nhanh 24/7</span>
                </span>
              </div>

              {/* Bottom Caption on mobile */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 lg:hidden z-10">
                <p className="text-lg font-black text-white drop-shadow-md">VinFast Kim Sơn Biên Hoà</p>
                <p className="text-xs text-slate-200 drop-shadow">643 Quốc Lộ 1, P. Long Bình, TP. Biên Hòa, Đồng Nai</p>
              </div>
            </div>

            {/* Content Box */}
            <div className="lg:col-span-5 p-7 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-primary-light text-xs font-bold uppercase tracking-widest border-b border-primary/30 pb-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>Cơ Sở Nổi Bật Hiện Nay</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight font-display">
                  VinFast Kim Sơn Biên Hoà
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Tọa lạc tại mặt tiền Quốc Lộ 1 huyết mạch của TP. Biên Hòa, <strong className="text-white">VinFast Kim Sơn Biên Hoà</strong> là một trong những showroom và trung tâm dịch vụ 3S quy mô bậc nhất trong hệ thống Kim Sơn Automobiles. 
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Trưng bày & trải nghiệm đầy đủ các dòng ô tô điện VinFast (VF 3, VF 5, VF 6, VF 7, VF 8, VF 9).</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Trạm sạc nhanh công suất lớn sẵn sàng phục vụ 24/7.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Xưởng dịch vụ kỹ thuật chính hãng, chẩn đoán điện áp cao và bảo dưỡng định kỳ tiêu chuẩn.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <MapPin size={16} className="text-primary-light shrink-0 mt-0.5" />
                    <span>643 Quốc Lộ 1, KP. 27, P. Long Bình, TP. Biên Hòa, Tỉnh Đồng Nai</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <Phone size={16} className="text-primary-light shrink-0" />
                    <span>Hotline: <strong className="text-white font-mono">0908 123 456</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="https://maps.google.com/?q=643+Quốc+Lộ+1,+P.Long+Bình,+TP.+Biên+Hòa,+Đồng+Nai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-glow transition-all hover:scale-105"
                >
                  <MapPin size={14} />
                  <span>Chỉ Đường Google Maps</span>
                  <ExternalLink size={12} className="opacity-70" />
                </a>
                <Link
                  to="/mang-luoi"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <span>11 Chi Nhánh</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
            <img 
              src="https://images.unsplash.com/photo-1562141961-b5d7d7665637?auto=format&fit=crop&q=80&w=900" 
              alt="Xưởng Kỹ Thuật Kim Sơn" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex items-end p-8">
              <div>
                <span className="text-[11px] font-bold text-primary-light uppercase tracking-wider">Hạ Tầng Kỹ Thuật</span>
                <p className="text-white font-bold text-lg mt-0.5">Xưởng dịch vụ đạt chuẩn quốc tế tại Đồng Nai</p>
                <p className="text-slate-300 text-xs mt-1">Đầy đủ cầu nâng, phòng sơn sấy và thiết bị chẩn đoán điện toán</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-primary uppercase">Sứ mệnh</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 mb-3">
                Đồng Hành An Toàn Trên Mọi Chặng Đường
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tại Kim Sơn Automobiles, chúng tôi không chỉ bán xe hay sửa chữa phương tiện, mà chúng tôi trao gửi sự an tâm tuyệt đối cho khách hàng và gia đình. Mọi chiếc xe lăn bánh từ xưởng đều được chăm sóc bằng sự tỉ mỉ của những người thợ tâm huyết nhất.
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-primary uppercase">Tầm nhìn</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 mb-3">
                Hệ Sinh Thái Ô Tô Số 1 Khu Vực Đông Nam Bộ
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Đón đầu làn sóng chuyển đổi năng lượng xanh, Kim Sơn tiếp tục mở rộng quy mô, nâng cao chất lượng dịch vụ xe điện và xe truyền thống, trở thành điểm đến tin cậy của hàng trăm nghìn chủ xe.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-md">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Giá Trị Cốt Lõi</h3>
            <p className="text-xs text-slate-500 mt-2">Bốn nguyên tắc định hình văn hóa phục vụ của Kim Sơn Automobiles</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <Target size={24} />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Tận Tâm</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Lắng nghe khách hàng, tư vấn đúng bệnh, đúng giá, đặt sự an toàn lên hàng đầu.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={24} />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Minh Bạch</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Báo giá rõ ràng trước khi làm, bàn giao phụ tùng cũ thay ra tận tay khách hàng.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <Wrench size={24} />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Chất Lượng</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Phụ tùng chính phẩm 100%, bảo hành dài hạn với tiêu chuẩn khắt khe.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <Clock size={24} />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Tốc Độ</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Quy trình tối ưu, giao xe đúng hẹn, cứu hộ nhanh chóng 15-30 phút.</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-secondary text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-primary-light uppercase tracking-wider">HÀNH TRÌNH PHÁT TRIỂN</span>
            <h3 className="text-3xl font-black mt-1">Cột Mốc Lịch Sử (2014 - 2026)</h3>
          </div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 md:before:left-1/2 before:w-0.5 before:bg-slate-700">
            {milestones.map((m, idx) => (
              <div key={m.year} className={`relative flex items-center gap-6 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="hidden md:block w-1/2"></div>
                
                {/* Dot */}
                <div className="z-10 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-glow">
                  {idx + 1}
                </div>

                {/* Card */}
                <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700 flex-1">
                  <span className="text-primary-light font-black text-xl">{m.year}</span>
                  <h4 className="text-base font-bold text-white mt-1 mb-2">{m.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
