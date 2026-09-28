import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ChevronRight, Globe, ShieldCheck } from 'lucide-react';
import { usePublicContent } from '../../services/publicContent';

export default function Footer() {
  const { settings, pillars } = usePublicContent();
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand & Mission (Col 1-2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
                <img 
                  src={settings.logoWhite || '/logo-kimson-white.png'}
                  alt="Kim Sơn Automobiles" 
                  className="h-11 w-auto object-contain"
                />
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              Hệ sinh thái ô tô Kim Sơn (Kim Sơn Automobiles) là tổ hợp dịch vụ và kỹ thuật ô tô toàn diện hàng đầu khu vực Đông Nam Bộ, kiến tạo chuỗi giá trị khép kín từ kinh doanh, sửa chữa kỹ thuật cao, phụ tùng chính phẩm đến cứu hộ giao thông 24/7.
            </p>

            <div className="pt-2 space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                <span>Trụ sở chính: {settings.headquarters}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-primary shrink-0" />
                <span>Tổng Đài Điều Hành: <strong className="text-amber-400">{settings.hotline}</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-primary shrink-0" />
                <span>Email Hợp Tác: {settings.email}</span>
              </div>
            </div>
          </div>

          {/* Nền Tảng Phát Triển (Col 3) */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-primary pl-2.5">
              Nền Tảng Phát Triển
            </h4>
            <ul className="space-y-2 text-xs">
              {pillars.map((p) => (
                <li key={p.id}>
                  <Link to="/about" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <ChevronRight size={12} className="text-primary-light" />
                    <span>{p.subtitle}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liên Kết Tập Đoàn (Col 4) */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-primary pl-2.5">
              Thông Tin Tập Đoàn
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-primary-light" />
                  <span>Về Kim Sơn</span>
                </Link>
              </li>
              <li>
                <Link to="/mang-luoi" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-primary-light" />
                  <span>Mạng Lưới Cơ Sở & Chi Nhánh</span>
                </Link>
              </li>
              <li>
                <Link to="/phat-trien-ben-vung" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-primary-light" />
                  <span>Phát Triển Bền Vững & ESG</span>
                </Link>
              </li>
              <li>
                <Link to="/tin-tuc" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-primary-light" />
                  <span>Thông Cáo Báo Chí & Tin Tức</span>
                </Link>
              </li>
              <li>
                <Link to="/lien-he" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-primary-light" />
                  <span>Quan Hệ Đối Tác Doanh Nghiệp</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Cam kết & Pháp lý (Col 5) */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-primary pl-2.5">
              Chuẩn Mực Vận Hành
            </h4>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                <span>Quy Chuẩn ISO & Chính Hãng</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Toàn bộ xưởng dịch vụ và kho vận trực thuộc hệ sinh thái Kim Sơn tuân thủ quy chuẩn kỹ thuật nghiêm ngặt và bảo vệ môi trường.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2026 KIM SƠN AUTOMOBILES ECOSYSTEM. Bảo lưu mọi quyền.</p>
          <div className="flex gap-6 text-[11px]">
            <span>Chính sách bảo mật</span>
            <span>Điều khoản sử dụng</span>
            <span>Cam kết trách nhiệm xã hội</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
