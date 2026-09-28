import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  Image as ImageIcon,
  Upload,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Layout,
  Check,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { DEFAULT_BRANDING, applyFavicon } from '../../services/branding';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('branding'); // 'branding' | 'general'
  const [settings, setSettings] = useState({
    name: 'KIM SƠN ECOSYSTEM',
    legalName: 'HỆ SINH THÁI Ô TÔ KIM SƠN (KIM SƠN AUTOMOBILES)',
    foundingYear: 2014,
    headquarters: 'Số 18 Đường Số 7, Phường An Phú, TP. Thủ Đức, TP. Hồ Chí Minh',
    hotline: '0908 123 456',
    email: 'contact@kimsonauto.com',
    website: 'kimsonauto.com',
    slogan: 'Kiến Tạo Giá Trị - Nâng Tầm Trải Nghiệm Ô Tô Việt',
    totalEngineers: 300,
    totalCustomers: 50000,
    satisfactionRate: '99%',
    logo: DEFAULT_BRANDING.logo,
    logoWhite: DEFAULT_BRANDING.logoWhite,
    favicon: DEFAULT_BRANDING.favicon,
    siteTitle: DEFAULT_BRANDING.siteTitle
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingField, setUploadingField] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputLogoRef = useRef(null);
  const fileInputLogoWhiteRef = useRef(null);
  const fileInputFaviconRef = useRef(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      if (data && typeof data === 'object') {
        setSettings(prev => ({
          ...prev,
          ...data,
          logo: data.logo || DEFAULT_BRANDING.logo,
          logoWhite: data.logoWhite || DEFAULT_BRANDING.logoWhite,
          favicon: data.favicon || DEFAULT_BRANDING.favicon,
          siteTitle: data.siteTitle || DEFAULT_BRANDING.siteTitle
        }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (field) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size < 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Tệp tải lên vượt quá dung lượng cho phép (tối đa 10MB)');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    try {
      setUploadingField(field);
      setErrorMsg('');

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result;
          // Upload to server
          const res = await api.uploadImage({
            name: file.name,
            data: base64Data,
            type: file.type
          });

          if (res?.url) {
            setSettings(prev => ({ ...prev, [field]: res.url }));
            if (field === 'favicon') {
              applyFavicon(res.url);
            }
          }
        } catch (uploadErr) {
          // Fallback to direct base64 data URL if upload fails
          console.warn('API upload failed, using Data URL fallback:', uploadErr);
          setSettings(prev => ({ ...prev, [field]: reader.result }));
          if (field === 'favicon') {
            applyFavicon(reader.result);
          }
        } finally {
          setUploadingField(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Upload error:', err);
      setErrorMsg('Không thể đọc tệp ảnh: ' + err.message);
      setUploadingField(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updated = await api.updateSettings(settings);
      
      // Update local storage and dispatch event for immediate UI reflection
      const brandingData = {
        logo: settings.logo,
        logoWhite: settings.logoWhite,
        favicon: settings.favicon,
        siteTitle: settings.siteTitle
      };
      localStorage.setItem('kimson_branding', JSON.stringify(brandingData));
      window.dispatchEvent(new CustomEvent('kimson-branding-updated', { detail: brandingData }));

      // Apply favicon to browser tab
      applyFavicon(settings.favicon);
      if (settings.siteTitle) {
        document.title = settings.siteTitle;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      alert('Lỗi lưu cài đặt: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const presets = {
    logoDefault: '/logo-kimson.png',
    logoWhite: '/logo-kimson-white.png',
    favicon3D: '/favicon.png',
    favicon32: '/favicon-32x32.png',
    faviconApple: '/apple-touch-icon.png'
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-primary rounded-xl">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Cài Đặt Hệ Thống & Nhận Diện Thương Hiệu
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Thay đổi Logo, Favicon tab trình duyệt và các thông tin liên hệ của Kim Sơn Automobiles
            </p>
          </div>
        </div>

        <button
          onClick={loadSettings}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
          title="Tải lại cài đặt"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Tải Lại</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'branding'
              ? 'bg-primary text-white shadow-md shadow-primary/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ImageIcon size={16} />
          <span>Nhận Diện: Logo & Favicon</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'bg-primary text-white shadow-md shadow-primary/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 size={16} />
          <span>Thông Tin Tập Đoàn & Liên Hệ</span>
        </button>
      </div>

      {/* Toast Alert Messages */}
      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>Đã lưu toàn bộ cấu hình Logo, Favicon và thông tin website thành công!</span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <AlertCircle size={18} className="text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* ==================================================== */}
        {/* TAB 1: BRANDING (LOGO & FAVICON)                     */}
        {/* ==================================================== */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            {/* 1. LOGO NỀN SÁNG (PRIMARY LOGO) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    1. Logo Website Bản Nền Sáng (Primary Logo)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  Hiển thị trên Header / Navbar và Form đăng nhập
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Inputs & Controls (Col 1-7) */}
                <div className="lg:col-span-7 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Đường Dẫn Hình Ảnh (URL Logo)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={settings.logo || ''}
                        onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                        placeholder="/logo-kimson.png hoặc https://..."
                        className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      />
                      <input 
                        type="file" 
                        ref={fileInputLogoRef} 
                        onChange={handleFileUpload('logo')} 
                        accept="image/png,image/jpeg,image/svg+xml,image/webp" 
                        className="hidden" 
                      />
                      <button
                        type="button"
                        onClick={() => fileInputLogoRef.current?.click()}
                        disabled={uploadingField === 'logo'}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer shrink-0"
                      >
                        <Upload size={14} />
                        <span>{uploadingField === 'logo' ? 'Đang tải...' : 'Tải Từ Máy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex items-center gap-2 pt-1 text-[11px]">
                    <span className="text-slate-400 font-medium">Mẫu có sẵn:</span>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, logo: presets.logoDefault })}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-primary text-slate-600 hover:text-primary transition"
                    >
                      Mẫu Logo Vàng Kim + Đen gốc
                    </button>
                  </div>
                </div>

                {/* Live Preview (Col 8-12) */}
                <div className="lg:col-span-5">
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-center space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Xem Trước Trên Nền Sáng (Navbar Header)
                    </span>
                    <div className="h-16 flex items-center justify-center bg-white rounded-lg border border-slate-200 p-2 shadow-2xs">
                      {settings.logo ? (
                        <img 
                          src={settings.logo} 
                          alt="Logo Preview" 
                          className="max-h-12 w-auto object-contain"
                          onError={(e) => { e.target.src = presets.logoDefault; }}
                        />
                      ) : (
                        <span className="text-xs text-slate-400 italic">Chưa có logo</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. LOGO NỀN TỐI (DARK / WHITE LOGO) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    2. Logo Website Bản Nền Tối (Dark / White Logo)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  Hiển thị trên Footer chân trang và Menu Quản trị Admin
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Inputs & Controls */}
                <div className="lg:col-span-7 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Đường Dẫn Hình Ảnh (URL Logo Nền Tối)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={settings.logoWhite || ''}
                        onChange={(e) => setSettings({ ...settings, logoWhite: e.target.value })}
                        placeholder="/logo-kimson-white.png hoặc https://..."
                        className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      />
                      <input 
                        type="file" 
                        ref={fileInputLogoWhiteRef} 
                        onChange={handleFileUpload('logoWhite')} 
                        accept="image/png,image/jpeg,image/svg+xml,image/webp" 
                        className="hidden" 
                      />
                      <button
                        type="button"
                        onClick={() => fileInputLogoWhiteRef.current?.click()}
                        disabled={uploadingField === 'logoWhite'}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer shrink-0"
                      >
                        <Upload size={14} />
                        <span>{uploadingField === 'logoWhite' ? 'Đang tải...' : 'Tải Từ Máy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex items-center gap-2 pt-1 text-[11px]">
                    <span className="text-slate-400 font-medium">Mẫu có sẵn:</span>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, logoWhite: presets.logoWhite })}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-primary text-slate-600 hover:text-primary transition"
                    >
                      Mẫu Logo Trắng Bạc + Vàng Kim
                    </button>
                  </div>
                </div>

                {/* Live Preview trên nền tối */}
                <div className="lg:col-span-5">
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-center space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Xem Trước Trên Nền Tối (Footer & Admin Sidebar)
                    </span>
                    <div className="h-16 flex items-center justify-center bg-slate-950 rounded-lg border border-slate-800 p-2 shadow-2xs">
                      {settings.logoWhite ? (
                        <img 
                          src={settings.logoWhite} 
                          alt="White Logo Preview" 
                          className="max-h-12 w-auto object-contain"
                          onError={(e) => { e.target.src = presets.logoWhite; }}
                        />
                      ) : (
                        <span className="text-xs text-slate-500 italic">Chưa có logo</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. FAVICON TAB TRÌNH DUYỆT (FAVICON & APP ICON) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    3. Biểu Tượng Favicon & App Icon
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  Icon hiển thị trên tab trình duyệt Chrome/Edge/Safari & Bookmark
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Inputs & Controls */}
                <div className="lg:col-span-7 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Đường Dẫn Favicon (.png, .ico, .jpg)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={settings.favicon || ''}
                        onChange={(e) => {
                          setSettings({ ...settings, favicon: e.target.value });
                          applyFavicon(e.target.value);
                        }}
                        placeholder="/favicon.png hoặc https://..."
                        className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      />
                      <input 
                        type="file" 
                        ref={fileInputFaviconRef} 
                        onChange={handleFileUpload('favicon')} 
                        accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/jpeg" 
                        className="hidden" 
                      />
                      <button
                        type="button"
                        onClick={() => fileInputFaviconRef.current?.click()}
                        disabled={uploadingField === 'favicon'}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer shrink-0"
                      >
                        <Upload size={14} />
                        <span>{uploadingField === 'favicon' ? 'Đang tải...' : 'Tải Từ Máy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    <span className="text-slate-400 font-medium">Mẫu có sẵn:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSettings({ ...settings, favicon: presets.favicon3D });
                        applyFavicon(presets.favicon3D);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-primary text-slate-600 hover:text-primary transition"
                    >
                      Huy Hiệu 3D Vàng Kim Sơn
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSettings({ ...settings, favicon: presets.favicon32 });
                        applyFavicon(presets.favicon32);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-primary text-slate-600 hover:text-primary transition"
                    >
                      Bản Vuông Chuẩn 32x32
                    </button>
                  </div>
                </div>

                {/* Live Preview: Browser Tab Mockup */}
                <div className="lg:col-span-5">
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-center space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Mô Phỏng Tab Trình Duyệt Thực Tế
                    </span>
                    <div className="bg-slate-200/80 p-2 rounded-xl text-left shadow-2xs">
                      {/* Browser Tab Component */}
                      <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-t-lg border-t border-x border-slate-300/80 shadow-xs max-w-full">
                        {settings.favicon ? (
                          <img 
                            src={settings.favicon} 
                            alt="Favicon Preview" 
                            className="w-4 h-4 rounded-xs object-contain shrink-0"
                            onError={(e) => { e.target.src = presets.favicon3D; }}
                          />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-primary/20 shrink-0" />
                        )}
                        <span className="text-[11px] font-medium text-slate-800 truncate max-w-[180px]">
                          {settings.siteTitle || 'Kim Sơn Automobiles'}
                        </span>
                        <span className="text-slate-400 text-xs ml-1 hover:text-slate-600 cursor-pointer">×</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. TIÊU ĐỀ WEBSITE (SITE TITLE) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                4. Tiêu Đề Thẻ Trình Duyệt (Website Title)
              </h3>
              <p className="text-xs text-slate-500">
                Tên hiển thị trên thanh tab trình duyệt và kết quả tìm kiếm Google (SEO)
              </p>
              <input
                type="text"
                value={settings.siteTitle || ''}
                onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                placeholder="VD: Kim Sơn Automobiles - Cổng Thông Tin Hệ Sinh Thái Ô Tô"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: GENERAL SETTINGS (THÔNG TIN TẬP ĐOÀN)         */}
        {/* ==================================================== */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                1. Định Danh Doanh Nghiệp
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên Thương Hiệu</label>
                  <input
                    type="text"
                    value={settings.name || ''}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên Pháp Lý Đầy Đủ</label>
                  <input
                    type="text"
                    value={settings.legalName || ''}
                    onChange={(e) => setSettings({ ...settings, legalName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                2. Trụ Sở & Kênh Liên Hệ
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Địa Chỉ Trụ Sở Chính</label>
                  <input
                    type="text"
                    value={settings.headquarters || ''}
                    onChange={(e) => setSettings({ ...settings, headquarters: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hotline Điều Hành</label>
                    <input
                      type="text"
                      value={settings.hotline || ''}
                      onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Tiếp Nhận</label>
                    <input
                      type="email"
                      value={settings.email || ''}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tên Miền Website</label>
                    <input
                      type="text"
                      value={settings.website || ''}
                      onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                3. Khẩu Hiệu & Quy Mô Thống Kê
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Slogan Tập Đoàn</label>
                  <input
                    type="text"
                    value={settings.slogan || ''}
                    onChange={(e) => setSettings({ ...settings, slogan: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Đội Ngũ Kỹ Sư</label>
                    <input
                      type="number"
                      value={settings.totalEngineers || 300}
                      onChange={(e) => setSettings({ ...settings, totalEngineers: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Khách Hàng Phục Vụ</label>
                    <input
                      type="number"
                      value={settings.totalCustomers || 50000}
                      onChange={(e) => setSettings({ ...settings, totalCustomers: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Chỉ Số Hài Lòng</label>
                    <input
                      type="text"
                      value={settings.satisfactionRate || '99%'}
                      onChange={(e) => setSettings({ ...settings, satisfactionRate: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-7 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-glow transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
          >
            <Save size={16} />
            <span>{loading ? 'Đang Lưu...' : 'Lưu Toàn Bộ Cấu Hình'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
