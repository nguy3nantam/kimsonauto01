import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  Car, 
  Wrench, 
  Layers, 
  Sparkles, 
  ShieldAlert, 
  MapPin, 
  CheckCircle2, 
  Globe, 
  Leaf, 
  Users 
} from 'lucide-react';
import { ecosystemData } from '../data/ecosystem';
import { api } from '../services/api';
import { usePublicContent } from '../services/publicContent';

const DEFAULT_SLIDES = [
  {
    id: 'default-1',
    title: 'Kiến Tạo Chuỗi Giá Trị\nHệ Sinh Thái Ô Tô',
    subtitle: 'TẬP ĐOÀN HỆ SINH THÁI Ô TÔ KIM SƠN',
    description: 'Từ năm 2014, Kim Sơn Automobiles không ngừng mở rộng và hoàn thiện mô hình hệ sinh thái khép kín: Phân phối phương tiện, Kỹ thuật dịch vụ công nghệ cao, Chuỗi cung ứng phụ tùng, Chăm sóc xe chuyên nghiệp và Hạ tầng cứu hộ 24/7.',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=85&w=1920',
    primaryButtonText: 'Khám Phá Nền Tảng Phát Triển',
    primaryButtonLink: '#nen-tang-phat-trien',
    secondaryButtonText: 'Hành Trình 12 Năm (2014 - 2026)',
    secondaryButtonLink: '/about'
  },
  {
    id: 'default-2',
    title: 'Đại Lý Ủy Quyền VinFast\nHàng Đầu Khu Vực Phía Nam',
    subtitle: 'MẠNG LƯỚI SHOWROOM & XƯỞNG DỊCH VỤ HIỆN ĐẠI',
    description: 'Sở hữu chuỗi 11 chi nhánh và showroom 3S/1S VinFast tại các vị trí chiến lược: Biên Hòa, Long Thành, Long Khánh, Trảng Dài, Bình Thạnh, Quận 2...',
    image: '/vinfast-kimson-bienhoa.jpg',
    primaryButtonText: 'Khám Phá Mạng Lưới Chi Nhánh',
    primaryButtonLink: '/mang-luoi',
    secondaryButtonText: 'Đăng Ký Lái Thử & Tư Vấn',
    secondaryButtonLink: '/lien-he'
  },
  {
    id: 'default-3',
    title: 'Trung Tâm Kỹ Thuật Ô Tô &\nCứu Hộ Giao Thông 24/7',
    subtitle: 'NĂNG LỰC DỊCH VỤ VÀ KỸ THUẬT TIÊN TIẾN',
    description: 'Đội ngũ kỹ sư tay nghề cao, trang thiết bị chẩn đoán chuyên hãng hiện đại, cung ứng phụ tùng chính hãng và mạng lưới xe cứu hộ chuyên dụng túc trực 24/7.',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=85&w=1920',
    primaryButtonText: 'Tìm Hiểu Mạng Lưới Chi Nhánh',
    primaryButtonLink: '/mang-luoi',
    secondaryButtonText: 'Hotline Cứu Hộ 24/7',
    secondaryButtonLink: '/lien-he'
  }
];

export default function HomePage() {
  const { settings, pillars, branches, esg, loading } = usePublicContent();
  const [activePillarId, setActivePillarId] = useState(null);
  const activePillar = pillars.find(pillar => pillar.id === activePillarId) || pillars[0];
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [homeNews, setHomeNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(false);
  const years = Math.max(0, new Date().getFullYear() - (settings.foundingYear ?? new Date().getFullYear()));
  const numbers = [loading.settings ? '—' : years, loading.pillars ? '—' : pillars.length, loading.branches ? '—' : branches.length, loading.settings ? '—' : (settings.totalEngineers ?? 0).toLocaleString('vi-VN'), loading.settings ? '—' : (settings.totalCustomers ?? 0).toLocaleString('vi-VN'), loading.settings ? '—' : (settings.satisfactionRate ?? '')];
  const stats = ecosystemData.stats.map((stat, index) => ({ ...stat, number: numbers[index], ...(index === 0 ? { desc: settings.foundingYear ? `Từ năm ${settings.foundingYear}` : '' } : {}) }));

  useEffect(() => {
    let isMounted = true;
    api.getSliders()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setSlides(data);
          setCurrentSlideIndex(0);
        }
      })
      .catch((err) => {
        console.warn('Failed to load sliders from API, using defaults:', err);
        if (isMounted) setSlides(DEFAULT_SLIDES);
      });

    api.getNews()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setHomeNews(data);
        }
      })
      .catch(() => { if (isMounted) setNewsError(true); })
      .finally(() => { if (isMounted) setNewsLoading(false); });

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-play slide every 6 seconds
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  const getPillarIcon = (iconName) => {
    switch(iconName) {
      case 'Car': return <Car size={24} />;
      case 'Wrench': return <Wrench size={24} />;
      case 'Layers': return <Layers size={24} />;
      case 'Sparkles': return <Sparkles size={24} />;
      case 'ShieldAlert': return <ShieldAlert size={24} />;
      default: return <ShieldCheck size={24} />;
    }
  };

  return (
    <div className="bg-white text-slate-800">
      {/* 1. Dynamic Corporate Hero Slider */}
      {slides.length > 0 && <section
        className="relative min-h-[640px] lg:min-h-[720px] flex items-center justify-center text-white overflow-hidden bg-slate-950"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background Images for all slides with smooth opacity crossfade */}
        {slides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img 
              src={slide.image} 
              alt={slide.title}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}

      </section>}

      {/* 2. Overview Introduction (Về Hệ Sinh Thái Kim Sơn) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-5">
              <div className="inline-block text-xs font-bold text-primary uppercase tracking-[0.15em] border-b-2 border-primary pb-1">
                TỔNG QUAN HỆ SINH THÁI
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.3]">
                Mô Hình Hệ Sinh Thái Ô Tô Toàn Diện & Khép Kín
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Được xây dựng trên triết lý lấy chất lượng kỹ thuật làm nền tảng và sự hài lòng của khách hàng làm trung tâm, Kim Sơn Automobiles đã khẳng định vị thế là một trong những hệ sinh thái dịch vụ ô tô phát triển nhanh và uy tín nhất tại khu vực kinh tế trọng điểm Đông Nam Bộ.
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Chúng tôi kết nối liền mạch từ khâu phân phối xe ô tô thế hệ mới (hợp tác chiến lược cùng VinFast), bảo dưỡng đại tu đạt chuẩn quốc tế, cung cấp phụ tùng linh kiện chính ngạch, đến chăm sóc thẩm mỹ xe và bảo vệ an toàn giao thông trên mọi cung đường.
              </p>

              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-primary font-bold text-xs sm:text-sm uppercase tracking-wider hover:gap-3 transition-all"
                >
                  <span>Tìm hiểu thêm về tầm nhìn & sứ mệnh Kim Sơn</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="relative group">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
                <img 
                  src="/vinfast-kimson-bienhoa.jpg" 
                  alt="VinFast Kim Sơn Biên Hoà" 
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute -bottom-5 -left-5 bg-slate-900/95 backdrop-blur-md text-white p-5 rounded-2xl shadow-xl border border-slate-800 hidden sm:block max-w-xs">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>Showroom 3S Trọng Điểm</span>
                </div>
                <p className="text-base font-black text-white font-display">VinFast Kim Sơn Biên Hoà</p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">Cơ sở quy mô hiện đại kết nối trục kinh tế Đông Nam Bộ.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. By The Numbers (Các Con Số Ấn Tượng) */}
      <section className="py-14 bg-slate-950 text-white border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-6 sm:gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
            {stats.map((stat, i) => (
              <div key={i} className="pt-4 sm:pt-0">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary-light mb-1 font-display tracking-tight">
                  {stat.number}
                </div>
                <div className="text-xs font-semibold text-white uppercase tracking-wider mb-1">
                  {stat.label}
                </div>
                <div className="text-[11px] text-slate-400">
                  {stat.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Nền Tảng Phát Triển */}
      <section id="nen-tang-phat-trien" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold text-primary uppercase tracking-[0.15em] border-b-2 border-primary pb-1 mb-2.5">
              NỀN TẢNG PHÁT TRIỂN
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.3]">
              Nền Tảng Phát Triển Của Hệ Sinh Thái
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              Mỗi đơn vị thành viên đóng vai trò là một mắt xích hoàn hảo trong việc mang lại giá trị trọn đời cho chiếc xe và sự an tâm của khách hàng.
            </p>
          </div>

          {/* Interactive Pillar Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Pillars Navigation (Left - 5 Cols) */}
            <div className="lg:col-span-5 space-y-3">
              {pillars.map((pillar) => {
                const isSelected = activePillar.id === pillar.id;
                return (
                  <button
                    key={pillar.id}
                    onClick={() => setActivePillarId(pillar.id)}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl transition-all duration-300 border flex items-center gap-4 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xl translate-x-1.5'
                        : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-primary text-white shadow-glow' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {getPillarIcon(pillar.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                        isSelected ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        {pillar.badge}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base leading-snug mt-0.5 truncate">{pillar.title}</h4>
                      <p className={`text-xs mt-0.5 truncate ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}>
                        {pillar.subtitle}
                      </p>
                    </div>
                    <ChevronRight size={18} className={isSelected ? 'text-primary-light' : 'text-slate-300'} />
                  </button>
                );
              })}
            </div>

            {/* Pillar Active Detail Card (Right - 7 Cols) */}
            {activePillar ? <div className="lg:col-span-7 bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl flex flex-col justify-between">
              <div className="relative aspect-[16/9] overflow-hidden">
                <img 
                  src={activePillar.image} 
                  alt={activePillar.title} 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/30">
                    {activePillar.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold mt-2 text-white leading-snug">{activePillar.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 italic font-light">{activePillar.tagline}</p>
                </div>
              </div>

              <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between space-y-5">
                <div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                    {activePillar.description}
                  </p>

                  <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                    Năng Lực Vận Hành Trọng Yếu:
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(activePillar.capabilities || []).map((cap, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">{activePillar.subtitle}</span>
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-1.5 text-primary hover:text-primary-dark font-bold uppercase tracking-wider"
                  >
                    <span>Tìm hiểu thêm về Kim Sơn</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div> : <p className="lg:col-span-7 text-slate-500" role="status">{loading.pillars ? 'Đang tải nền tảng phát triển...' : 'Nội dung đang được cập nhật.'}</p>}
          </div>
        </div>
      </section>

      {/* 5. Infrastructure Network */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-5">
              <div className="inline-block text-xs font-bold text-primary uppercase tracking-[0.15em] border-b-2 border-primary pb-1">
                QUY MÔ HẠ TẦNG
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.3]">
                Mạng Lưới Chi Nhánh & Cơ Sở Kết Nối Vùng Trọng Điểm
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Hệ thống cơ sở của Kim Sơn Automobiles tọa lạc tại các vị trí chiến lược dọc theo trục kinh tế TP. Hồ Chí Minh - Đồng Nai (Biên Hòa, Long Khánh, Long Thành, Nhơn Trạch, Trảng Bom, Bình Thạnh, Thủ Đức), sẵn sàng tiếp nhận và phục vụ với diện tích xưởng dịch vụ hàng nghìn mét vuông.
              </p>

              <div className="space-y-2.5 pt-2">
                {branches.slice(0, 4).map((b) => (
                  <div key={b.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <MapPin size={17} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{b.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{b.address}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  to="/mang-luoi"
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <span>Xem toàn bộ mạng lưới chi nhánh & bản đồ</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            <div className="bg-slate-950 text-white p-8 sm:p-10 rounded-3xl border border-slate-900 space-y-6">
              <div className="border-b border-slate-800 pb-5">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">TIÊU CHUẨN CƠ SỞ VẬT CHẤT</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1 leading-snug">Đồng Bộ Quy Chuẩn Kỹ Thuật Số</h3>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary-light flex items-center justify-center font-bold shrink-0 mt-0.5">1</div>
                  <span>100% trạm dịch vụ có cầu nâng chuyên dụng và máy quét chẩn đoán thế hệ mới.</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary-light flex items-center justify-center font-bold shrink-0 mt-0.5">2</div>
                  <span>Phòng sơn sấy hấp hồng ngoại khép kín đạt chuẩn khí thải môi trường.</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary-light flex items-center justify-center font-bold shrink-0 mt-0.5">3</div>
                  <span>Hệ thống trụ sạc xe điện nhanh phục vụ hệ sinh thái VinFast.</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary-light flex items-center justify-center font-bold shrink-0 mt-0.5">4</div>
                  <span>Đội xe cứu hộ sàn trượt ứng trực 24/7/365 trên toàn tuyến cao tốc lân cận.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Sustainability Commitment */}
      <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/80 px-4 py-1.5 rounded-full border border-emerald-800 mb-2.5">
              <Leaf size={14} />
              PHÁT TRIỂN BỀN VỮNG & TRÁCH NHIỆM XÃ HỘI
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.3]">
              Đồng Hành Cùng Kỷ Nguyên Di Chuyển Xanh
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
              Kim Sơn cam kết hướng tới mục tiêu phát triển bền vững thông qua việc đẩy mạnh dịch vụ ô tô điện không phát thải và đào tạo nhân tài kỹ thuật cho tương lai.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {esg.map((item, idx) => (
              <div key={idx} className="bg-slate-900/90 p-7 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all">
                <div className="text-amber-400 font-black text-xl mb-3 font-display">0{idx + 1}</div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Corporate Press & News */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-14">
            <div>
              <div className="inline-block text-xs font-bold text-primary uppercase tracking-[0.15em] border-b-2 border-primary pb-1 mb-2">
                TRUYỀN THÔNG & ĐỐI NGOẠI
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.3]">
                Tin Tức & Sự Kiện Hệ Sinh Thái
              </h2>
            </div>
            <Link to="/tin-tuc" className="text-primary font-bold text-xs uppercase tracking-wider hover:underline flex items-center gap-1">
              Xem tất cả thông cáo <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {!homeNews.length && <p role="status" className="text-slate-500 md:col-span-3">{newsLoading ? 'Đang tải tin tức...' : newsError ? 'Chưa thể tải tin tức. Vui lòng thử lại ở trang tin tức.' : 'Chưa có tin tức được công bố.'}</p>}
            {homeNews.slice(0, 3).map((item) => (
              <div key={item.id} className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-200/90 hover:shadow-xl transition-all flex flex-col justify-between">
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={item.image} alt={item.title} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                      <span className="font-bold text-primary uppercase">{item.category}</span>
                      <span>{item.date}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base mb-2 hover:text-primary transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                  <Link to={`/tin-tuc/${encodeURIComponent(item.id)}`} className="pt-4 text-primary font-bold text-xs flex items-center gap-1">
                    Đọc tiếp <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Corporate Partnership CTA */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-950 text-white py-14 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-[1.3]">
            Kết Nối Hợp Tác Cùng Kim Sơn Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Chúng tôi luôn chào đón các cơ hội hợp tác chiến lược cùng các nhà sản xuất ô tô, đối tác phụ trợ, chuỗi cung ứng và doanh nghiệp vận tải.
          </p>
          <div className="pt-2">
            <Link
              to="/lien-he"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-7 py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-glow transition-all"
            >
              <span>Liên Hệ Hợp Tác Doanh Nghiệp</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
