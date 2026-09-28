import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  MapPin, 
  Newspaper, 
  Mail, 
  Users,
  FolderOpen,
  Settings, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X,
  Bell,
  ShieldCheck,
  Building2,
  Briefcase,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../../services/api';
import { useBranding } from '../../services/branding';

export default function AdminLayout() {
  const branding = useBranding();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = currentUser?.role || ((currentUser?.id === '1' || currentUser?.username === 'admin') ? 'Admin' : 'User');
  const isAdmin = userRole === 'Admin';
  const isLeader = userRole === 'Leader';
  const isUser = !isAdmin && !isLeader;

  useEffect(() => {
    let active = true;
    api.getMe().then(user => {
      if (!active) return;
      setCurrentUser(user);
      localStorage.setItem('kimson_admin_user', JSON.stringify(user));
    }).catch(() => {
      if (active) { localStorage.removeItem('kimson_admin_user'); navigate('/login', { replace: true }); }
    }).finally(() => { if (active) setCheckingSession(false); });
    return () => { active = false; };
  }, [navigate]);

  useEffect(() => {
    if (checkingSession || !currentUser) return;
    const allowed = currentUser.role === 'Admin' || location.pathname === '/admin' || location.pathname === '/admin/portal' || (currentUser.role === 'Leader' && location.pathname === '/admin/users');
    if (!allowed) navigate('/admin', { replace: true });
  }, [checkingSession, currentUser, location.pathname, navigate]);

  const handleLogout = async () => {
    try {
      await api.logout();
      localStorage.removeItem('kimson_admin_user');
      localStorage.removeItem('kimson_admin_token');
      navigate('/login');
    } catch (error) { alert(error.message); }
  };

  const adminNavItems = [
    { name: 'Thông Báo & File Dùng Chung', path: '/admin/portal', icon: FolderOpen },
    { name: 'Tổng Quan Hệ Sinh Thái', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Slider Trang Chủ', path: '/admin/sliders', icon: ImageIcon },
    { name: 'Người Đăng Ký & Phân Quyền', path: '/admin/users', icon: Users },
    { name: 'Nền Tảng Phát Triển', path: '/admin/pillars', icon: Layers },
    { name: 'Mạng Lưới 11 Chi Nhánh', path: '/admin/branches', icon: MapPin },
    { name: 'Tin Tức & Thông Cáo', path: '/admin/news', icon: Newspaper },
    { name: 'Yêu Cầu Hợp Tác B2B', path: '/admin/contacts', icon: Mail },
    { name: 'Cài Đặt & Thông Tin', path: '/admin/settings', icon: Settings },
  ];

  const leaderNavItems = [
    { name: 'Thông Báo & File Dùng Chung', path: '/admin/portal', icon: FolderOpen },
    { 
      name: `Quản Lý User (${currentUser?.unit || 'Chi Nhánh'})`, 
      path: '/admin/users', 
      icon: Users 
    },
  ];

  const userNavItems = [
    { name: 'Thông Báo & File Dùng Chung', path: '/admin/portal', icon: FolderOpen },
  ];

  const navItems = isAdmin ? adminNavItems : isLeader ? leaderNavItems : userNavItems;

  const isActive = (path) => {
    if (path === '/admin/portal' && (location.pathname === '/admin/portal' || location.pathname === '/admin')) return true;
    return location.pathname === path;
  };

  const getRoleBadge = () => {
    if (isAdmin) {
      return (
        <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 shrink-0">
          ADMIN
        </span>
      );
    }
    if (isLeader) {
      return (
        <span className="text-[9px] font-black text-blue-300 uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 shrink-0">
          LEADER
        </span>
      );
    }
    return (
      <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 shrink-0">
        USER
      </span>
    );
  };

  const getHeaderRoleBadge = () => {
    if (isAdmin) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-xs font-black">
          Toàn Quyền Admin
        </span>
      );
    }
    if (isLeader) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-300 text-blue-700 text-xs font-bold">
          Leader: {currentUser?.unit || 'Chi Nhánh'}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-bold">
        User: Xem Thông Báo & File
      </span>
    );
  };

  if (checkingSession || !currentUser) return <div className="p-12 text-center" role="status">?ang ki?m tra phi?n ??ng nh?p...</div>;
  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-white flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo Header */}
          <div className="h-20 px-6 border-b border-slate-800 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5">
              <img 
                src={branding.logoWhite || '/logo-kimson-white.png'} 
                alt="Kim Sơn Automobiles" 
                className="h-10 w-auto object-contain"
              />
              {getRoleBadge()}
            </Link>

            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              {isAdmin ? 'Quản Trị Hệ Sinh Thái' : isLeader ? 'Quản Trị Cấp Chi Nhánh' : 'Cổng Thông Tin Thành Viên'}
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    active 
                      ? 'bg-primary text-white shadow-glow' 
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={15} />
              <span>Xem Website Trực Tiếp</span>
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Client</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} />
            <span>Đăng Xuất Khỏi Hệ Thống</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3">
              <Link to="/admin" className="lg:hidden">
                <img src={branding.logo || '/logo-kimson.png'} alt="Kim Sơn Automobiles" className="h-7 w-auto object-contain" />
              </Link>
              <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {isAdmin ? 'Bảng Quản Trị Hệ Sinh Thái Kim Sơn' : isLeader ? `Quản Trị Chi Nhánh: ${currentUser?.unit || ''}` : 'Cổng Thông Tin & File Dùng Chung'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              {getHeaderRoleBadge()}
            </div>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser?.fullName || currentUser?.name || 'Ban Quản Trị'}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5 font-medium">
                  {currentUser?.unit || 'VF GF Q2'} • {currentUser?.department || 'Ban Giám Đốc'}
                </div>
              </div>

              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-xs ${
                isAdmin 
                  ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white'
                  : isLeader 
                  ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white'
                  : 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white'
              }`}>
                {(currentUser?.fullName || currentUser?.name || 'K').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="p-4 sm:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
