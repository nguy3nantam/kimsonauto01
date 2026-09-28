import React, { useState, useEffect } from 'react';
import { Layers, Edit3, Check, X, CheckCircle2, Car, Wrench, Sparkles, ShieldAlert, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminPillars() {
  const [pillars, setPillars] = useState([]);
  const [editingPillar, setEditingPillar] = useState(null);
  const [formData, setFormData] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPillars();
  }, []);

  const loadPillars = async () => {
    try {
      const data = await api.getPillars();
      setPillars(data);
    } catch (err) {
      console.error('Failed to load pillars:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pillar) => {
    setEditingPillar(pillar.id);
    setFormData({ ...pillar });
    setSaveSuccess(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.updatePillar(editingPillar, formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setEditingPillar(null);
      loadPillars();
    } catch (err) {
      alert('Lỗi cập nhật: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            5 Trụ Cột Hoạt Động Cốt Lõi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Quản lý và chỉnh sửa thông tin các lĩnh vực kinh doanh trong hệ sinh thái
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Cập nhật trụ cột thành công! Dữ liệu đã được lưu trữ vào hệ thống.</span>
        </div>
      )}

      {/* Pillars List */}
      <div className="grid grid-cols-1 gap-6">
        {pillars.map((pillar, index) => {
          const isEditing = editingPillar === pillar.id;

          return (
            <div 
              key={pillar.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 overflow-hidden transition-all"
            >
              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-primary uppercase">Chỉnh Sửa: Trụ Cột 0{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => setEditingPillar(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tên Tiếng Việt</label>
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tên Thương Hiệu Con</label>
                      <input
                        type="text"
                        value={formData.subtitle || ''}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Khẩu Hiệu / Tagline</label>
                    <input
                      type="text"
                      value={formData.tagline || ''}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mô Tả Chi Tiết</label>
                    <textarea
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Link Ảnh Bìa (Image URL)</label>
                    <input
                      type="text"
                      value={formData.image || ''}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setEditingPillar(null)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors"
                    >
                      Lưu Thay Đổi
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                      0{index + 1}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-primary uppercase tracking-wider">{pillar.subtitle}</span>
                      <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">{pillar.title}</h3>
                      <p className="text-xs text-slate-500 italic mt-1 font-medium">"{pillar.tagline}"</p>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 max-w-3xl leading-relaxed">{pillar.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
                    <button
                      onClick={() => handleEdit(pillar)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-primary hover:text-white rounded-xl text-xs font-bold text-slate-700 transition-colors"
                    >
                      <Edit3 size={14} />
                      <span>Chỉnh Sửa</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
