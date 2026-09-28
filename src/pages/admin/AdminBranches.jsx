import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit3, Trash2, Phone, CheckCircle2, X } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminBranches() {
  const [branches, setBranches] = useState([]);
  const [editingBranch, setEditingBranch] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    address: '',
    hotline: '',
    features: ['']
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const data = await api.getBranches();
      setBranches(data);
    } catch (err) {
      console.error('Failed to load branches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch.id);
    setIsCreating(false);
    setFormData({ ...branch });
  };

  const handleCreateOpen = () => {
    setIsCreating(true);
    setEditingBranch(null);
    setFormData({
      name: '',
      role: '',
      address: '',
      hotline: '',
      features: ['']
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isCreating) {
        await api.createBranch(formData);
      } else {
        await api.updateBranch(editingBranch, formData);
      }
      setIsCreating(false);
      setEditingBranch(null);
      loadBranches();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chi nhánh này khỏi hệ thống?')) {
      try {
        await api.deleteBranch(id);
        loadBranches();
      } catch (err) {
        alert('Lỗi: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Mạng Lưới Chi Nhánh & Cơ Sở
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Quản lý hệ thống 7 trung tâm dịch vụ kỹ thuật tại TP.HCM & Đồng Nai
          </p>
        </div>

        <button
          onClick={handleCreateOpen}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold rounded-xl text-xs shadow-glow hover:bg-primary-dark transition-all"
        >
          <Plus size={16} />
          <span>Thêm Chi Nhánh Mới</span>
        </button>
      </div>

      {/* Create / Edit Form Modal Box */}
      {(isCreating || editingBranch) && (
        <div className="bg-white rounded-2xl border-2 border-primary/30 shadow-lg p-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-extrabold text-slate-900">
              {isCreating ? 'Thêm Chi Nhánh / Cơ Sở Mới' : 'Cập Nhật Thông Tin Chi Nhánh'}
            </h3>
            <button
              onClick={() => { setIsCreating(false); setEditingBranch(null); }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Chi Nhánh / Cơ Sở</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Chi Nhánh Kỹ Thuật Long Thành"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vai Trò Hoạt Động</label>
                <input
                  type="text"
                  required
                  value={formData.role || ''}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="VD: Trung tâm kỹ thuật công nghệ cao"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Địa Chỉ Chi Tiết</label>
                <input
                  type="text"
                  required
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Số nhà, tên đường, phường/xã, tỉnh thành"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số Điện Thoại Trực</label>
                <input
                  type="text"
                  required
                  value={formData.hotline || ''}
                  onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                  placeholder="VD: 0908 123 456"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => { setIsCreating(false); setEditingBranch(null); }}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors"
              >
                {isCreating ? 'Tạo Chi Nhánh' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Branches Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100 font-bold">
              <tr>
                <th className="py-3 px-6">Tên Chi Nhánh & Cơ Sở</th>
                <th className="py-3 px-6">Địa Chỉ</th>
                <th className="py-3 px-6">Hotline</th>
                <th className="py-3 px-6">Vai Trò Hoạt Động</th>
                <th className="py-3 px-6 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <MapPin size={15} className="text-primary shrink-0" />
                      <span>{b.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600 max-w-xs truncate">
                    {b.address}
                  </td>
                  <td className="py-4 px-6 font-mono font-semibold text-primary">
                    {b.hotline}
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    {b.role}
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(b)}
                      className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
