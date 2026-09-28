import React, { useState, useEffect } from 'react';
import { Mail, Phone, Building2, CheckCircle2, Clock, Trash2, Search, Filter } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await api.getContacts();
      setContacts(data);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateContact(id, { status: newStatus });
      loadContacts();
    } catch (err) {
      alert('Lỗi cập nhật trạng thái: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa yêu cầu liên hệ này?')) {
      try {
        await api.deleteContact(id);
        loadContacts();
      } catch (err) {
        alert('Lỗi: ' + err.message);
      }
    }
  };

  const filtered = contacts.filter((c) => {
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesSearch = 
      (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.phone && c.phone.includes(searchQuery)) ||
      (c.service && c.service.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Yêu Cầu Hợp Tác B2B & Liên Hệ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Quản trị và theo dõi phản hồi các yêu cầu từ đối tác doanh nghiệp và khách hàng
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, công ty, SĐT..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={15} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-primary"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="contacted">Đã liên hệ</option>
            <option value="completed">Hoàn tất</option>
          </select>
        </div>
      </div>

      {/* Contacts List */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
            Không tìm thấy yêu cầu liên hệ nào phù hợp.
          </div>
        ) : (
          filtered.map((item) => (
            <div 
              key={item.id}
              className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-slate-900">{item.name}</h3>
                    {item.company && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <Building2 size={12} />
                        <span>{item.company}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Phone size={13} className="text-primary" />
                      <strong>{item.phone}</strong>
                    </span>
                    {item.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={13} className="text-primary" />
                        <span>{item.email}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none ${
                      item.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : item.status === 'contacted'
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    }`}
                  >
                    <option value="pending">⏳ Chờ xử lý</option>
                    <option value="contacted">📞 Đã liên hệ</option>
                    <option value="completed">✅ Hoàn tất</option>
                  </select>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa yêu cầu"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Message Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500 font-medium">
                  <span>Dịch vụ / Hạng mục: <strong className="text-slate-900">{item.service || 'Hợp tác B2B'}</strong></span>
                  <span className="text-slate-400">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'Mới gửi'}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-100">
                  "{item.message || 'Không có ghi chú thêm.'}"
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
