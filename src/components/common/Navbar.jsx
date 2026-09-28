import { api } from '../../services/api';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ChevronRight, 
  ChevronDown,
  Building2, 
  Layers, 
  MapPin, 
  Leaf, 
  Newspaper, 
  Mail,
  User,
  UserPlus,
  LogIn,
  LogOut,
  ShieldCheck
} from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.logout();
      localStorage.removeItem('kimson_admin_user');
      localStorage.removeItem('kimson_admin_token');
      setIsLoggedIn(false); setCurrentUser(null); navigate('/login');
    } catch (error) { alert(error.message); }
  };
  useEffect(() => {
    let active = true;
    api.getMe().then(user => {
      if (active) { setIsLoggedIn(true); setCurrentUser(user); }
    }).catch(() => { if (active) { setIsLoggedIn(false); setCurrentUser(null); } });
    return () => { active = false; };
  }, []);
  const isAdmin = currentUser?.role === 'Admin';

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 6 mục menu chuẩn: Giới Thiệu, Hoạt Động, Hệ Thống, Phát Triển Bền Vững, Tin Tức, Liên Hệ
  const navLinks = [
    { 
      name: 'Giới Thiệu', 
      path: '/about', 
      desc: 'Lịch sử phát triển & giá trị cốt lõi',
      icon: Building2 
    },
    { 
      name: 'Hoạt Động', 
      path: '/linh-vuc', 
      desc: '5 trụ cột kỹ thuật & công nghệ ô tô',
      icon: Layers 
    },
    { 
      name: 'Hệ Thống', 
      path: '/mang-luoi', 
      desc: 'Mạng lưới 11 chi nhánh & cơ sở tại Đồng Nai & TP.HCM',
      icon: MapPin 
    },
    { 
      name: 'Phát Triển Bền Vững', 
      path: '/phat-trien-ben-vung', 
      desc: 'Chuyển đổi xanh & chuẩn mực ESG',
      icon: Leaf 
    },
    { 
      name: 'Tin Tức', 
      path: '/tin-tuc', 
      desc: 'Thông cáo báo chí & sự kiện hệ sinh thái',
      icon: Newspaper 
    },
    { 
      name: 'Liên Hệ', 
      path: '/lien-he', 
      desc: 'Trụ sở điều hành & hợp tác B2B',
      icon: Mail 
    },
  ];

  const isActive = (path) => {
    if (location.pathname === path || (path !== '/' && location.pathname.startsWith(path))) {
      return true;
    }
    return false;
  };

  // Đóng drawer khi chuyển trang
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Khóa cuộn màn hình khi drawer mở và lắng nghe phím Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const offcanvasDrawer = (
    <div 
      className={`fixed inset-0 z-[99999] transition-all duration-300 ${
        isOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      }`}
    >
      {/* 1. Backdrop mờ đen toàn trang */}
      <div 
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* 2. Drawer Panel trượt từ phải sang, chiếm 100% chiều cao viewport */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[440px] max-w-full h-screen bg-white shadow-2xl flex flex-col justify-between overflow-hidden transform transition-transform duration-300 ease-in-out z-10 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu Hệ Sinh Thái"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <Link to="/" onClick={() => setIsOpen(false)}>
              <img 
                src="/logo-kimson.png" 
                alt="Kim Sơn Automobiles" 
                className="h-10 w-auto object-contain hover:scale-105 transition-transform"
              />
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
            aria-label="Đóng menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Drawer Body - Toàn bộ các mục đồng bộ chuẩn Header Menu */}
        <div className="p-6 space-y-2 flex-1 overflow-y-auto">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">
            Mục Lục Hệ Sinh Thái
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                  active 
                    ? 'bg-primary-subtle/80 text-primary font-bold shadow-xs' 
                    : 'text-slate-700 hover:bg-slate-50 hover:text-primary'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                    active ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-primary-subtle group-hover:text-primary'
                  }`}>
                    <Icon size={19} />
                  </div>
                  <div>
                    <div className="text-sm font-bold leading-snug">{link.name}</div>
                    <div className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5">{link.desc}</div>
                  </div>
                </div>
                <ChevronRight size={16} className={`transition-transform group-hover:translate-x-1 shrink-0 ${active ? 'text-primary' : 'text-slate-300'}`} />
              </Link>
            );
          })}

          {/* Cổng Đăng Nhập & Đăng Ký trong Offcanvas Menu */}
          <div className="pt-2">
            {!isLoggedIn ? (
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-xs shadow-xs hover:shadow-glow transition-all"
                >
                  <LogIn size={15} />
                  <span>Đăng Nhập</span>
                </Link>

                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-800 transition-all"
                >
                  <UserPlus size={15} />
                  <span>Đăng Ký</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 border border-slate-800 transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 bg-emerald-600">
                      <ShieldCheck size={19} />
                    </div>
                    <div>
                      <div className="text-sm font-bold leading-snug">
                        Bảng Quản Trị Hệ Thống
                      </div>
                      <div className="text-[11px] text-emerald-400 font-semibold leading-tight mt-0.5">
                        Đang đăng nhập • Quản lý ngay
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-white/80 group-hover:translate-x-1 transition-transform shrink-0" />
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                >
                  <LogOut size={14} />
                  <span>Đăng Xuất Khỏi Thiết Bị</span>
                </button>
              </div>
            )}
          </div>

          {/* Card giới thiệu quy mô hệ sinh thái */}
          <div className="pt-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-primary-light uppercase tracking-wider block">QUY MÔ TẬP ĐOÀN</span>
              <div className="text-xs font-semibold text-slate-200">5 Trụ Cột Chiến Lược • 11 Cơ Sở Trọng Điểm</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Định vị tổ hợp kỹ thuật và công nghiệp ô tô đa lĩnh vực hàng đầu khu vực kinh tế trọng điểm phía Nam.
              </p>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/70 space-y-3 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Ngôn ngữ hiển thị</span>
            <div className="flex items-center bg-white border border-slate-200 p-0.5 rounded-lg text-xs font-bold text-slate-600">
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-200/60">
            © 2026 Kim Sơn Automobiles. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <header 
      className={`sticky top-0 z-40 h-12 max-h-12 relative flex items-center transition-all duration-500 ease-in-out ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-md border-b border-slate-200/80 text-slate-800'
          : 'bg-gradient-to-r from-white/95 via-amber-50/70 via-yellow-50/45 to-white/95 backdrop-blur-md border-b border-amber-200/50 text-slate-800 animate-header-gradient'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo Kim Sơn Automobiles */}
          <Link 
            to="/" 
            className="flex items-center group shrink-0 py-1" 
            title="Kim Sơn Automobiles"
            aria-label="Trang Chủ Kim Sơn Automobiles"
          >
            <img 
              src="/logo-kimson.png" 
              alt="Kim Sơn Automobiles" 
              className="h-8 sm:h-9 w-auto object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation Links với hiệu ứng hover chuyển màu gradient */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-300 ${
                  isActive(link.path)
                    ? 'text-primary bg-gradient-to-r from-primary/15 via-primary-light/10 to-primary/15 font-bold shadow-xs'
                    : 'text-slate-700 hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary-light/10'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Phía bên phải: Chuyển đổi ngôn ngữ & Nút mở Offcanvas Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Language Switcher */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold text-slate-600">
            </div>

            {/* Dropdown Menu Tài Khoản (Đăng Nhập / Đăng Ký) khi rê chuột (Hover) */}
            <div className="relative group">
              <Link
                to={isLoggedIn ? "/admin" : "/login"}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-300 shadow-xs ${
                  isLoggedIn
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200'
                    : 'bg-primary-subtle text-primary hover:bg-primary hover:text-white border border-primary/20 hover:border-primary'
                }`}
                title={isLoggedIn ? (isAdmin ? "Bảng quản trị hệ thống" : "Cổng thông tin & file dùng chung") : "Tài khoản hệ thống"}
                aria-label={isLoggedIn ? "Cổng thành viên" : "Tài khoản"}
              >
                <User size={13} className="shrink-0" />
                <span className="hidden sm:inline-block">
                  {isLoggedIn ? (isAdmin ? "Quản Trị" : "Cổng Nội Bộ") : "Đăng Nhập"}
                </span>
                <ChevronDown size={11} className="transition-transform duration-200 group-hover:rotate-180 opacity-70 shrink-0" />
              </Link>

              {/* Popover Flyout hiển thị Đăng Ký và Đăng Nhập khi rê chuột vào */}
              <div className="absolute right-0 top-full pt-1.5 w-60 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/90 p-2 text-slate-800 space-y-1">
                  {!isLoggedIn ? (
                    <>
                      <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Tài Khoản Hệ Sinh Thái
                      </div>

                      {/* Mục Đăng Nhập */}
                      <Link
                        to="/login"
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary-subtle/80 text-slate-700 hover:text-primary transition-all group/item"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                          <LogIn size={15} />
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight">Đăng Nhập</div>
                          <div className="text-[10px] text-slate-400 leading-tight mt-0.5">Truy cập hệ thống & quản trị</div>
                        </div>
                      </Link>

                      {/* Mục Đăng Ký */}
                      <Link
                        to="/register"
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-all group/item"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover/item:bg-emerald-600 group-hover/item:text-white transition-colors">
                          <UserPlus size={15} />
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight">Đăng Ký</div>
                          <div className="text-[10px] text-slate-400 leading-tight mt-0.5">Tạo tài khoản đối tác & B2B</div>
                        </div>
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-2 bg-slate-50 rounded-xl mb-1 border border-slate-100">
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          {currentUser?.fullName || currentUser?.name || 'Thành Viên Kim Sơn'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                          {currentUser?.unit ? `${currentUser.unit} • ${currentUser.department}` : 'Đang đăng nhập hệ thống'}
                        </div>
                      </div>

                      <Link
                        to={isAdmin ? "/admin/dashboard" : "/admin/portal"}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-700 hover:text-primary transition-all"
                      >
                        <ShieldCheck size={15} className="text-primary" />
                        <span>{isAdmin ? "Bảng Quản Trị CMS" : "Thông Báo & File Dùng Chung"}</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-red-50 text-xs font-bold text-red-600 transition-all text-left"
                      >
                        <LogOut size={15} />
                        <span>Đăng Xuất</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Nút kích hoạt Offcanvas Menu với hiệu ứng chuyển màu khi hover */}
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-slate-700 hover:text-primary rounded-lg hover:bg-gradient-to-r hover:from-slate-100 hover:to-amber-50/80 transition-all duration-300 border border-transparent hover:border-amber-200/60"
              title="Mở menu hệ sinh thái"
              aria-label="Mở menu"
            >
              <Menu size={18} />
              <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider text-slate-700">
                Menu
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Hiệu ứng dải viền chuyển màu đa sắc động liên tục (Animated Gradient Color Shift Bar) */}
      <div 
        className={`absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-500 pointer-events-none bg-gradient-to-r from-primary via-cyan-400 via-indigo-500 to-primary animate-border-gradient ${
          isScrolled ? 'opacity-100 shadow-[0_1px_8px_rgba(0,98,210,0.35)]' : 'opacity-75'
        }`} 
      />

      {/* Render Offcanvas Drawer qua React Portal trực tiếp vào document.body để không bị chặn bởi backdrop-filter của header */}
      {mounted && createPortal(offcanvasDrawer, document.body)}
    </header>
  );
}

