import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';

// Layout & Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import FloatingCTA from './components/common/FloatingCTA';

// Corporate Ecosystem Public Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NetworkPage = lazy(() => import('./pages/NetworkPage'));
const SustainabilityPage = lazy(() => import('./pages/SustainabilityPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Admin Backend Portal Components & Pages
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminPortalHub = lazy(() => import('./pages/admin/AdminPortalHub'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminPillars = lazy(() => import('./pages/admin/AdminPillars'));
const AdminBranches = lazy(() => import('./pages/admin/AdminBranches'));
const AdminNews = lazy(() => import('./pages/admin/AdminNews'));
const AdminContacts = lazy(() => import('./pages/admin/AdminContacts'));
const AdminSliders = lazy(() => import('./pages/admin/AdminSliders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
import { PublicContentProvider, usePublicContent } from './services/publicContent';

const ROUTE_TITLES = {
  '/': 'Kim Sơn Automobiles - Cổng Thông Tin Hệ Sinh Thái Ô Tô',
  '/about': 'Giới Thiệu - Kim Sơn Automobiles',
  '/mang-luoi': 'Mạng Lưới 11 Chi Nhánh & Cơ Sở - Kim Sơn Automobiles',
  '/phat-trien-ben-vung': 'Phát Triển Bền Vững (ESG) - Kim Sơn Automobiles',
  '/tin-tuc': 'Tin Tức & Thông Cáo Báo Chí - Kim Sơn Automobiles',
  '/lien-he': 'Liên Hệ & Hợp Tác B2B - Kim Sơn Automobiles',
  '/login': 'Đăng Nhập Quản Trị - Kim Sơn Automobiles',
  '/register': 'Đăng Ký Thành Viên - Kim Sơn Automobiles',
  '/admin': 'Cổng Quản Trị - Kim Sơn Automobiles',
  '/admin/portal': 'Thông Báo & File Dùng Chung - Kim Sơn Portal',
  '/admin/dashboard': 'Tổng Quan Hệ Sinh Thái - Kim Sơn Admin',
  '/admin/sliders': 'Quản Lý Slider Trang Chủ - Kim Sơn Admin',
  '/admin/users': 'Quản Lý Người Đăng Ký - Kim Sơn Admin',
  '/admin/pillars': 'Nền Tảng Phát Triển - Kim Sơn Admin',
  '/admin/branches': 'Mạng Lưới Chi Nhánh - Kim Sơn Admin',
  '/admin/news': 'Quản Lý Tin Tức - Kim Sơn Admin',
  '/admin/contacts': 'Yêu Cầu Hợp Tác - Kim Sơn Admin',
  '/admin/settings': 'Cài Đặt Hệ Thống - Kim Sơn Admin',
};

// Scroll to top and title helper on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!pathname.startsWith('/tin-tuc/')) {
      document.title = ROUTE_TITLES[pathname] || (pathname.startsWith('/admin') ? 'Quản Trị - Kim Sơn Automobiles' : 'Kim Sơn Automobiles');
    }
  }, [pathname]);

  return null;
}

function PublicMetadata() {
  const { pathname } = useLocation();
  const { settings } = usePublicContent();
  useEffect(() => {
    if (pathname === '/' && settings.siteTitle) document.title = settings.siteTitle;
  }, [pathname, settings.siteTitle]);
  return null;
}

// Public Website Layout Wrapper
function PublicLayout() {
  return (
    <PublicContentProvider>
    <PublicMetadata />
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans selection:bg-primary selection:text-white">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <FloatingCTA />
    </div>
    </PublicContentProvider>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<div className="p-12 text-center" role="status">Đang tải...</div>}>
      <Routes>
        {/* ==================================================== */}
        {/* PUBLIC WEBSITE ROUTES                                */}
        {/* ==================================================== */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/mang-luoi" element={<NetworkPage />} />
          <Route path="/phat-trien-ben-vung" element={<SustainabilityPage />} />
          <Route path="/tin-tuc" element={<NewsPage />} />
          <Route path="/tin-tuc/:id" element={<NewsPage />} />
          <Route path="/lien-he" element={<ContactPage />} />

          {/* Aliases & Redirects */}
          <Route path="/linh-vuc" element={<Navigate to="/about" replace />} />
          <Route path="/hoat-dong" element={<Navigate to="/about" replace />} />
          <Route path="/vehicles" element={<Navigate to="/about" replace />} />
          <Route path="/services" element={<Navigate to="/about" replace />} />
          <Route path="/contact" element={<Navigate to="/lien-he" replace />} />
          <Route path="/news" element={<Navigate to="/tin-tuc" replace />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* ==================================================== */}
        {/* BACKEND ADMIN PORTAL ROUTES                          */}
        {/* ==================================================== */}
        <Route path="/login" element={<AdminLoginPage initialMode="login" />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<AdminLoginPage initialMode="register" />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminPortalHub />} />
          <Route path="portal" element={<AdminPortalHub />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="sliders" element={<AdminSliders />} />
          <Route path="pillars" element={<AdminPillars />} />
          <Route path="branches" element={<AdminBranches />} />
          <Route path="news" element={<AdminNews />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
      </Suspense>
    </Router>
  );
}
