import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image as ImageIcon, Plus, Edit3, Trash2, CheckCircle2, AlertCircle,
  X, Eye, EyeOff, ArrowUp, ArrowDown, RefreshCw, Sliders,
} from 'lucide-react';
import { api } from '../../services/api';

const INITIAL_FORM = {
  title: '',
  image: '',
  order: 1,
  active: true,
};
const sortSlides = (slides) => [...slides].sort((a, b) => Number(a.order) - Number(b.order));

function SlideImage({ src, title, className }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`${className} flex items-center justify-center gap-2 bg-slate-100 text-slate-500 text-sm p-4`}>
        <ImageIcon size={22} />
        <span>{src ? 'Không tải được hình ảnh' : 'Chưa chọn hình ảnh'}</span>
      </div>
    );
  }
  return <img src={src} alt={title} className={className} onError={() => setFailed(true)} />;
}

export default function AdminSliders() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewId, setPreviewId] = useState(null);
  const [message, setMessage] = useState(null);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState(INITIAL_FORM);
  const notificationTimer = useRef(null);
  const mutationPending = useRef(false);
  const previewSlide = sliders.find(slide => slide.id === previewId)
    || sliders.find(slide => slide.active !== false) || sliders[0];
  const controlsDisabled = loading || busy;

  const showNotification = useCallback((text, type = 'success') => {
    clearTimeout(notificationTimer.current);
    setMessage({ text, type });
    notificationTimer.current = setTimeout(() => setMessage(null), 5000);
  }, []);

  const loadSliders = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await api.getSliders('all=true');
      if (!Array.isArray(data)) throw new Error('Dữ liệu slider không hợp lệ');
      setSliders(sortSlides(data));
    } catch (err) {
      setLoadError('Không thể tải danh sách slider: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSliders();
    return () => clearTimeout(notificationTimer.current);
  }, [loadSliders]);

  const startMutation = () => {
    if (mutationPending.current) return false;
    mutationPending.current = true;
    setBusy(true);
    return true;
  };
  const finishMutation = () => {
    mutationPending.current = false;
    setBusy(false);
  };

  const handleCreateOpen = () => {
    setIsCreating(true);
    setEditingSlide(null);
    setFormError('');
    setFormData({
      ...INITIAL_FORM,
      order: Math.min(10000, Math.max(0, ...sliders.map(slide => Number(slide.order) || 0)) + 1),
    });
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide.id);
    setIsCreating(false);
    setFormError('');
    setFormData({
      title: slide.title || '',
      image: slide.image || '',
      order: Number(slide.order) || 0,
      active: slide.active !== false,
    });
  };

  const handleCloseModal = () => {
    if (mutationPending.current) return;
    setIsCreating(false);
    setEditingSlide(null);
    setFormError('');
  };

  const handleToggleActive = async (slide) => {
    if (!startMutation()) return;
    try {
      const updated = await api.updateSlider(slide.id, { active: slide.active === false });
      setSliders(current => sortSlides(current.map(item => item.id === slide.id ? updated : item)));
      showNotification(`Đã ${updated.active ? 'bật' : 'tắt'} hiển thị slide "${updated.title}"`);
    } catch (err) {
      showNotification('Không thể cập nhật trạng thái: ' + err.message, 'error');
    } finally {
      finishMutation();
    }
  };

  const handleMoveOrder = async (slide, direction) => {
    const currentIndex = sliders.findIndex(item => item.id === slide.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= sliders.length || !startMutation()) return;
    const ids = sliders.map(item => item.id);
    [ids[currentIndex], ids[targetIndex]] = [ids[targetIndex], ids[currentIndex]];
    try {
      const updated = await api.reorderSliders(ids);
      setSliders(sortSlides(updated));
      showNotification('Đã thay đổi thứ tự hiển thị slider');
    } catch (err) {
      if (err.status === 409) await loadSliders();
      showNotification('Không thể đổi thứ tự: ' + err.message, 'error');
    } finally {
      finishMutation();
    }
  };

  const handleDelete = async (slide) => {
    if (!window.confirm(`Bạn có chắc muốn xóa slider "${slide.title}" không?`) || !startMutation()) return;
    try {
      await api.deleteSlider(slide.id);
      setSliders(current => current.filter(item => item.id !== slide.id));
      showNotification('Đã xóa slider thành công');
    } catch (err) {
      showNotification('Không thể xóa slider: ' + err.message, 'error');
    } finally {
      finishMutation();
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const payload = { ...formData, title: formData.title.trim(), image: formData.image.trim(), order: Number(formData.order) };
    if (!payload.title || !payload.image) {
      setFormError('Vui lòng nhập tên slide và đường dẫn hình ảnh.');
      return;
    }
    if (!/^https:\/\//.test(payload.image) && !/^\/(?!\/)/.test(payload.image)) {
      setFormError('Đường dẫn ảnh phải bắt đầu bằng https:// hoặc / cho ảnh trên website.');
      return;
    }
    if (formData.order === '' || !Number.isInteger(payload.order) || payload.order < 0 || payload.order > 10000) {
      setFormError('Thứ tự phải là số nguyên từ 0 đến 10000.');
      return;
    }
    if (!startMutation()) return;
    setFormError('');
    try {
      const saved = isCreating
        ? await api.createSlider(payload)
        : await api.updateSlider(editingSlide, payload);
      setSliders(current => sortSlides(isCreating ? [...current, saved] : current.map(slide => slide.id === editingSlide ? saved : slide)));
      setPreviewId(saved.id);
      setIsCreating(false);
      setEditingSlide(null);
      showNotification(isCreating ? 'Thêm slide mới thành công!' : 'Cập nhật slide thành công!');
    } catch (err) {
      setFormError('Không thể lưu slide: ' + err.message);
    } finally {
      finishMutation();
    }
  };

  return (
    <div className="space-y-8">
      {message && (
        <div role={message.type === 'error' ? 'alert' : 'status'} className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
          <div className="flex items-center gap-2">
            {message.type === 'error' ? <AlertCircle size={18} className="shrink-0" /> : <CheckCircle2 size={18} className="shrink-0" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} aria-label="Đóng thông báo"><X size={16} /></button>
        </div>
      )}

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-primary rounded-xl"><Sliders size={24} /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản Lý Slider Trang Chủ</h1>
            <p className="text-sm text-slate-500 mt-0.5">Quản lý hình ảnh, thứ tự và trạng thái hiển thị của banner trang chủ.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={loadSliders} disabled={controlsDisabled} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium disabled:opacity-50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Làm Mới
          </button>
          <button onClick={handleCreateOpen} disabled={controlsDisabled || Boolean(loadError)} className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50">
            <Plus size={18} /> Thêm Slide Mới
          </button>
        </div>
      </div>

      {loadError && <p role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{loadError} Bấm Làm Mới để thử lại.</p>}

      {previewSlide && (
        <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
          <div className="px-4 sm:px-6 py-3 bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
            <span className="break-words">Xem trước: <strong>{previewSlide.title}</strong></span>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <span className={`px-2.5 py-0.5 rounded-full font-semibold ${previewSlide.active !== false ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {previewSlide.active !== false ? 'Hiển thị trên trang chủ' : 'Đang ẩn trên trang chủ'}
              </span>
              <span>Thứ tự #{previewSlide.order}</span>
            </div>
          </div>
          <div className="relative h-[320px] lg:h-[360px] overflow-hidden">
            <SlideImage key={previewSlide.image} src={previewSlide.image} title={previewSlide.title} className="w-full h-full object-cover object-center" />
          </div>
          <p className="px-4 sm:px-6 py-3 text-xs text-slate-400">Banner trang chủ chỉ hiển thị hình ảnh, căn giữa và cắt theo khung màn hình. Tên slide dùng để quản lý và làm văn bản thay thế cho ảnh.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Danh Sách Slide ({sliders.length})</h2>
          <p className="text-xs text-slate-500 mt-0.5">Chỉ các slide đang hiển thị được tự động chuyển trên trang chủ theo thứ tự đã sắp xếp.</p>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-400" role="status"><RefreshCw size={28} className="animate-spin mx-auto mb-3 text-primary" /><p className="text-sm">Đang tải danh sách slide...</p></div>
        ) : loadError && sliders.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">Danh sách chưa tải được. Vui lòng thử lại.</p>
        ) : sliders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ImageIcon size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-700">Chưa có slider nào</p>
            <p className="text-sm mt-1">Bấm "Thêm Slide Mới" để tạo slide đầu tiên.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left border-collapse">
              <thead><tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-20 text-center">Thứ tự</th>
                <th className="py-3.5 px-4 w-44">Hình ảnh</th>
                <th className="py-3.5 px-4">Tên slide</th>
                <th className="py-3.5 px-4 w-36 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 w-36 text-center">Thao tác</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {sliders.map((slide, index) => (
                  <tr key={slide.id} className={`hover:bg-slate-50/80 ${previewSlide?.id === slide.id ? 'bg-blue-50/40' : ''}`}>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="w-8 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">{slide.order}</span>
                        <div className="flex items-center gap-0.5">
                          <button disabled={controlsDisabled || Boolean(loadError) || index === 0} onClick={() => handleMoveOrder(slide, 'up')} className="p-1 text-slate-500 hover:text-primary disabled:opacity-30" aria-label={`Di chuyển ${slide.title} lên trên`}><ArrowUp size={16} /></button>
                          <button disabled={controlsDisabled || Boolean(loadError) || index === sliders.length - 1} onClick={() => handleMoveOrder(slide, 'down')} className="p-1 text-slate-500 hover:text-primary disabled:opacity-30" aria-label={`Di chuyển ${slide.title} xuống dưới`}><ArrowDown size={16} /></button>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button onClick={() => setPreviewId(slide.id)} aria-label={`Xem trước ${slide.title}`} className="block w-36 h-20 rounded-xl overflow-hidden border border-slate-200">
                        <SlideImage key={slide.image} src={slide.image} title={slide.title} className="w-full h-full object-cover object-center" />
                      </button>
                    </td>
                    <td className="py-4 px-4"><h3 className="font-bold text-slate-900 break-words">{slide.title}</h3></td>
                    <td className="py-4 px-4 text-center">
                      <button disabled={controlsDisabled || Boolean(loadError)} onClick={() => handleToggleActive(slide)} aria-label={`${slide.active !== false ? 'Ẩn' : 'Hiển thị'} slide ${slide.title}`} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border disabled:opacity-50 ${slide.active !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}>
                        {slide.active !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                        {slide.active !== false ? 'Hiển thị' : 'Đang ẩn'}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setPreviewId(slide.id)} className="p-2 text-slate-500 hover:text-primary hover:bg-blue-50 rounded-lg" aria-label={`Xem trước ${slide.title}`}><Eye size={17} /></button>
                        <button disabled={controlsDisabled || Boolean(loadError)} onClick={() => handleEdit(slide)} className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg disabled:opacity-50" aria-label={`Chỉnh sửa ${slide.title}`}><Edit3 size={17} /></button>
                        <button disabled={controlsDisabled || Boolean(loadError)} onClick={() => handleDelete(slide)} className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-50" aria-label={`Xóa ${slide.title}`}><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(isCreating || editingSlide !== null) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="slider-dialog-title" className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
              <h2 id="slider-dialog-title" className="text-lg font-bold text-slate-900">{isCreating ? 'Thêm Slider Mới' : 'Chỉnh Sửa Slider'}</h2>
              <button onClick={handleCloseModal} disabled={busy} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg disabled:opacity-50" aria-label="Đóng cửa sổ"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {formError && <p role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{formError}</p>}
              <fieldset disabled={busy} className="space-y-5 disabled:opacity-60">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-3 space-y-1.5">
                    <label htmlFor="slide-title" className="block text-xs font-bold uppercase tracking-wider text-slate-700">Tên slide <span className="text-rose-500">*</span></label>
                    <input id="slide-title" type="text" required maxLength={250} autoFocus value={formData.title} onChange={event => setFormData({ ...formData, title: event.target.value })} placeholder="VD: Showroom VinFast Kim Sơn Biên Hòa" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                    <p className="text-xs text-slate-500">Tên dùng để quản lý và mô tả ảnh cho người dùng trình đọc màn hình.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="slide-order" className="block text-xs font-bold uppercase tracking-wider text-slate-700">Thứ tự</label>
                    <input id="slide-order" type="number" required min="0" max="10000" step="1" value={formData.order} onChange={event => setFormData({ ...formData, order: event.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="slide-image" className="block text-xs font-bold uppercase tracking-wider text-slate-700">Đường dẫn hình ảnh <span className="text-rose-500">*</span></label>
                  <input id="slide-image" type="text" required maxLength={2048} value={formData.image} onChange={event => setFormData({ ...formData, image: event.target.value })} placeholder="https://... hoặc /uploads/ten-anh.webp" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                  <p className="text-xs text-slate-500">Dùng ảnh ngang, rõ nét. Nội dung chính nên nằm giữa ảnh để hiển thị tốt trên điện thoại.</p>
                  <div className="h-48 sm:h-64 rounded-xl overflow-hidden border border-slate-200">
                    <SlideImage key={formData.image.trim()} src={formData.image.trim()} title={formData.title || 'Xem trước hình ảnh slider'} className="w-full h-full object-cover object-center" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="activeSlide" checked={formData.active} onChange={event => setFormData({ ...formData, active: event.target.checked })} className="w-4 h-4 text-primary rounded-sm border-slate-300 focus:ring-primary" />
                  <label htmlFor="activeSlide" className="text-sm font-semibold text-slate-700 cursor-pointer">Hiển thị slide trên trang chủ sau khi lưu</label>
                </div>
              </fieldset>
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3">
                <button type="button" onClick={handleCloseModal} disabled={busy} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-medium disabled:opacity-50">Hủy Bỏ</button>
                <button type="submit" disabled={busy} className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm disabled:opacity-50">{busy ? 'Đang lưu...' : isCreating ? 'Tạo Slide Mới' : 'Lưu Thay Đổi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
