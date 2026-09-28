import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Phone, 
  Mail, 
  UserPlus,
  LogIn,
  Building2,
  Briefcase
} from 'lucide-react';
import { api } from '../../services/api';
import { useBranding } from '../../services/branding';

export const UNIT_OPTIONS = [
  'VF Biên Hòa',
  'VF Bửu Long',
  'VF Trảng Dài',
  'VF Long Thành',
  'VF Long Khánh',
  'VF Tân Hiệp',
  'VF Bình Thạnh',
  'VF GF Q2'
];

export const DEPARTMENT_OPTIONS = [
  'Kinh Doanh',
  'Dịch Vụ',
  'Kế Toán',
  'Nhân Sự',
  'Marketing'
];

export default function AdminLoginPage({ initialMode = 'login' }) {
  const branding = useBranding();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paramMode = searchParams.get('mode') || (location.pathname === '/register' ? 'register' : initialMode);

  const [mode, setMode] = useState(paramMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [unit, setUnit] = useState('VF Biên Hòa');
  const [department, setDepartment] = useState('Kinh Doanh');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (paramMode) {
      setMode(paramMode);
    }
  }, [paramMode]);

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login({ username, password });
        localStorage.setItem('kimson_admin_user', JSON.stringify(res.user));
        navigate('/admin');
      } else {
        const res = await api.register({
          fullName,
          name: fullName,
          username,
          password,
          unit,
          department,
          phone,
          email
        });
        localStorage.setItem('kimson_admin_user', JSON.stringify(res.user));
        setSuccess('Đăng ký tài khoản thành công! Đang chuyển tiếp...');
        setTimeout(() => {
          navigate('/admin');
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Thao tác không thành công');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/40 to-yellow-50/30 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-primary selection:text-white">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 my-8">
        {/* Brand Card Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block hover:scale-105 transition-transform mb-3">
            <img 
              src={branding.logo || '/logo-kimson.png'} 
              alt="Kim Sơn Automobiles" 
              className="h-16 sm:h-20 w-auto object-contain mx-auto"
            />
          </Link>
          <p className="text-xs uppercase tracking-widest text-primary font-bold">
            {mode === 'login' ? 'Cổng Quản Trị Hệ Sinh Thái' : 'Đăng Ký Tài Khoản Hệ Sinh Thái'}
          </p>
        </div>

        {/* Form Box - Style Màu Trắng & Viền Vàng Hoàng Kim */}
        <div className="bg-white border-2 border-primary rounded-3xl p-6 sm:p-8 shadow-xl shadow-primary/10 backdrop-blur-md">
          {/* Mode Tabs Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-amber-50/80 rounded-2xl mb-6 border border-amber-200/80">
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'text-slate-600 hover:text-primary hover:bg-white/80'
              }`}
            >
              <LogIn size={15} />
              <span>Đăng Nhập</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('register')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'text-slate-600 hover:text-primary hover:bg-white/80'
              }`}
            >
              <UserPlus size={15} />
              <span>Đăng Ký</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Họ và Tên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary">
                      <User size={17} />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-amber-200/80 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                </div>

                {/* Đơn Vị & Bộ Phận */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Đơn Vị <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary">
                        <Building2 size={16} />
                      </div>
                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-amber-200/80 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-slate-800 text-xs sm:text-sm font-semibold focus:outline-none transition-all cursor-pointer shadow-2xs appearance-none"
                      >
                        {UNIT_OPTIONS.map((u) => (
                          <option key={u} value={u} className="bg-white text-slate-800">
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Bộ Phận <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary">
                        <Briefcase size={16} />
                      </div>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-amber-200/80 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-slate-800 text-xs sm:text-sm font-semibold focus:outline-none transition-all cursor-pointer shadow-2xs appearance-none"
                      >
                        {DEPARTMENT_OPTIONS.map((d) => (
                          <option key={d} value={d} className="bg-white text-slate-800">
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-amber-200/80 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs"
                        placeholder="email@kimsonauto.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Số Điện Thoại
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary">
                        <Phone size={16} />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-amber-200/80 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs"
                        placeholder="0908 xxx xxx"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tên Tài Khoản <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary">
                  <User size={17} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-amber-200/80 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs"
                  placeholder={mode === 'login' ? 'Nhập tên đăng nhập' : 'Tạo tên đăng nhập (viết liền)'}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mật Khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary">
                  <Lock size={17} />
                </div>
                <input
                  type="password"
                  minLength={mode === 'register' ? 12 : undefined}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-amber-200/80 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs"
                  placeholder={mode === 'login' ? 'Nhập mật khẩu' : 'Mật khẩu tối thiểu 6 ký tự'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold rounded-xl text-sm shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 border border-primary-light/30"
            >
              <span>
                {loading
                  ? 'Đang xử lý...'
                  : mode === 'login'
                    ? 'Đăng Nhập Quản Trị'
                    : 'Hoàn Tất Đăng Ký Tài Khoản'}
              </span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Helper Credentials or Alternate Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            <div className="text-center">
              <Link to="/" className="text-xs text-slate-500 hover:text-primary transition-colors inline-block mt-1 font-medium">
                ← Quay lại trang chủ Kim Sơn
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
