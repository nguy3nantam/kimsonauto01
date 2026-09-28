import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layers, 
  MapPin, 
  Newspaper, 
  Mail, 
  Users, 
  Building2,
  Briefcase,
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPillars: 5,
    totalBranches: 7,
    totalNews: 3,
    totalContacts: 2,
    pendingContacts: 1,
    totalUsers: 8,
    totalEngineers: 300,
    totalCustomers: 50000,
    satisfactionRate: '99%'
  });
  const [recentContacts, setRecentContacts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, contactsData, usersData] = await Promise.all([
          api.getStats().catch(() => null),
          api.getContacts().catch(() => []),
          api.getUsers().catch(() => [])
        ]);

        if (statsData) setStats(statsData);
        if (contactsData) setRecentContacts(contactsData.slice(0, 5));
        if (usersData) setRecentUsers(usersData.slice(0, 5));
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const kpis = [
    {
      title: 'Trụ Cột Hệ Sinh Thái',
      value: stats.totalPillars,
      desc: 'Chuỗi giá trị khép kín',
      icon: Layers,
      color: 'from-blue-600 to-blue-700',
      link: '/admin/pillars'
    },
    {
      title: 'Mạng Lưới Chi Nhánh',
      value: stats.totalBranches,
      desc: 'Bao phủ TP.HCM & Đồng Nai',
      icon: MapPin,
      color: 'from-cyan-600 to-cyan-700',
      link: '/admin/branches'
    },
    {
      title: 'Tin Tức & Báo Chí',
      value: stats.totalNews,
      desc: 'Thông cáo đã xuất bản',
      icon: Newspaper,
      color: 'from-indigo-600 to-indigo-700',
      link: '/admin/news'
    },
    {
      title: 'Yêu Cầu B2B Mới',
      value: stats.pendingContacts,
      desc: `Tổng số: ${stats.totalContacts} liên hệ`,
      icon: Mail,
      color: 'from-amber-600 to-amber-700',
      link: '/admin/contacts'
    },
    {
      title: 'Người Đăng Ký',
      value: stats.totalUsers || 8,
      desc: '8 đơn vị & 5 bộ phận',
      icon: Users,
      color: 'from-rose-600 to-rose-700',
      link: '/admin/users'
    }
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={idx}
              to={kpi.link}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} text-white flex items-center justify-center shadow-xs`}>
                  <Icon size={22} />
                </div>
                <ArrowUpRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900 tracking-tight mb-1 font-display">
                  {kpi.value}
                </div>
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">{kpi.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{kpi.desc}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent B2B Inquiries Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Yêu Cầu Hợp Tác B2B Mới Nhất
            </h3>
            <p className="text-xs text-slate-500">
              Đối tác doanh nghiệp gửi yêu cầu từ trang Liên hệ website
            </p>
          </div>
          <Link
            to="/admin/contacts"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            Xem tất cả yêu cầu ({stats.totalContacts})
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100 font-bold">
              <tr>
                <th className="py-3 px-6">Đối Tác / Doanh Nghiệp</th>
                <th className="py-3 px-6">Điện Thoại / Email</th>
                <th className="py-3 px-6">Dịch Vụ Quan Tâm</th>
                <th className="py-3 px-6">Trạng Thái</th>
                <th className="py-3 px-6">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentContacts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    Chưa có yêu cầu liên hệ nào mới.
                  </td>
                </tr>
              ) : (
                recentContacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      <div>{c.name}</div>
                      <div className="text-[11px] font-normal text-slate-500">{c.company || 'Cá nhân / Đối tác'}</div>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-[11px]">
                      <div>{c.phone}</div>
                      <div className="text-slate-400 text-[10px]">{c.email}</div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      {c.service}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        c.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : c.status === 'contacted'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {c.status === 'pending' ? 'Chờ xử lý' : c.status === 'contacted' ? 'Đã liên hệ' : 'Hoàn tất'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-400 text-[11px]">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Registered Users Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Người Đăng Ký Hệ Thống Gần Đây</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                {stats.totalUsers || 8} thành viên
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Nhân sự và thành viên đăng ký theo 8 Đơn Vị và 5 Bộ Phận trực thuộc
            </p>
          </div>
          <Link
            to="/admin/users"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            Quản lý tất cả người đăng ký →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100 font-bold">
              <tr>
                <th className="py-3 px-6">Họ và Tên</th>
                <th className="py-3 px-6">Đơn Vị</th>
                <th className="py-3 px-6">Bộ Phận</th>
                <th className="py-3 px-6">Email / SĐT</th>
                <th className="py-3 px-6">Ngày Đăng Ký</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    Chưa có thành viên đăng ký nào.
                  </td>
                </tr>
              ) : (
                recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px] border border-slate-200">
                          {(u.fullName || u.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div>{u.fullName || u.name}</div>
                          <div className="text-[10px] font-normal text-slate-400 font-mono">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        <Building2 size={11} className="text-primary" />
                        <span>{u.unit || 'Chưa thiết lập'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <Briefcase size={11} />
                        <span>{u.department || 'Chưa thiết lập'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-[11px]">
                      <div>{u.email || '—'}</div>
                      <div className="text-slate-400 text-[10px]">{u.phone || ''}</div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-400 text-[11px]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'Mặc định'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
