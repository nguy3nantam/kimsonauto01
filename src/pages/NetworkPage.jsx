import React from 'react';
import { MapPin, Phone, ShieldCheck, ChevronRight, Navigation, CheckCircle2 } from 'lucide-react';
import { usePublicContent } from '../services/publicContent';

export default function NetworkPage() {
  const { branches: branchesList, loading } = usePublicContent();

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-block text-xs font-bold text-primary uppercase tracking-[0.15em] border-b-2 border-primary pb-1 mb-2.5">
            HẠ TẦNG & CƠ SỞ
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.3]">
            Mạng Lưới Chi Nhánh & Trung Tâm Dịch Vụ
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            Hệ thống chi nhánh & cơ sở quy mô lớn trải dài tại các vị trí kinh tế chiến lược kết nối giữa TP. Hồ Chí Minh và tỉnh Đồng Nai, đảm bảo năng lực phục vụ kịp thời và chuẩn mực.
          </p>
        </div>

        {/* Network Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {!branchesList.length && <p role="status" className="text-slate-500">{loading.branches ? 'Đang tải chi nhánh...' : 'Danh sách chi nhánh đang được cập nhật.'}</p>}
          {branchesList.map((b) => (
            <div 
              key={b.id}
              className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {b.image && (
                <div className="relative aspect-[16/9] -mx-8 -mt-8 mb-6 overflow-hidden">
                  <img 
                    src={b.image} 
                    alt={b.name} 
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                </div>
              )}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-primary bg-primary-subtle px-3 py-1 rounded-full uppercase tracking-wider">
                    {b.id === 'gf-kim-son-hcm' ? 'Trụ Sở & Văn Phòng' : b.role?.includes('Xưởng') ? 'Xưởng Kỹ Thuật' : 'Showroom & Dịch Vụ'}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">Đông Nam Bộ</span>
                </div>

                <h3 className="text-xl font-black text-slate-900 leading-tight">
                  {b.name}
                </h3>

                <p className="text-xs font-semibold text-primary italic">
                  {b.role}
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                    <span>{b.address}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone size={16} className="text-primary shrink-0" />
                    <span>Hotline: <strong className="text-slate-900">{b.hotline}</strong></span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Hạng mục phục vụ chính:</p>
                  <div className="space-y-1.5">
                    {(b.features || []).map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`tel:${b.hotline.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1.5 text-primary hover:text-primary-dark font-bold text-xs"
                >
                  <Phone size={14} />
                  <span>Gọi kết nối trực tiếp</span>
                </a>
                <span className="text-[11px] text-slate-400">Trực thuộc Kim Sơn Auto</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
