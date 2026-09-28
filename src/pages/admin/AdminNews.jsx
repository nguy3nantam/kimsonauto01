import React, { useState, useEffect } from 'react';
import { Newspaper, Plus, Edit3, Trash2, CheckCircle2, X, Calendar, Clock } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminNews() {
  const [news, setNews] = useState([]);
  const [editingArticle, setEditingArticle] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Thông Cáo Báo Chí',
    summary: '',
    content: '',
    image: '',
    status: 'published'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const data = await api.getNews(true);
      setNews(data);
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article.id);
    setIsCreating(false);
    setFormData({ ...article });
  };

  const handleCreateOpen = () => {
    setIsCreating(true);
    setEditingArticle(null);
    setFormData({
      title: '',
      category: 'Thông Cáo Báo Chí',
      summary: '',
      content: '',
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=900',
      status: 'published'
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isCreating) {
        await api.createNews(formData);
      } else {
        await api.updateNews(editingArticle, formData);
      }
      setIsCreating(false);
      setEditingArticle(null);
      loadNews();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này khỏi hệ sinh thái?')) {
      try {
        await api.deleteNews(id);
        loadNews();
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
            Tin Tức & Thông Cáo Báo Chí
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Quản trị các bài viết, sự kiện và thông điệp truyền thông của hệ sinh thái
          </p>
        </div>

        <button
          onClick={handleCreateOpen}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold rounded-xl text-xs shadow-glow hover:bg-primary-dark transition-all"
        >
          <Plus size={16} />
          <span>Đăng Bài Viết Mới</span>
        </button>
      </div>

      {/* Editor Modal Box */}
      {(isCreating || editingArticle) && (
        <div className="bg-white rounded-2xl border-2 border-primary/30 shadow-lg p-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-extrabold text-slate-900">
              {isCreating ? 'Soạn Thảo Bài Viết Mới' : 'Cập Nhật Bài Viết'}
            </h3>
            <button
              onClick={() => { setIsCreating(false); setEditingArticle(null); }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu Đề Bài Viết</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nhập tiêu đề thông cáo..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chuyên Mục</label>
                <select
                  value={formData.category || 'Thông Cáo Báo Chí'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-primary focus:outline-none focus:border-primary"
                >
                  <option value="Thông Cáo Báo Chí">Thông Cáo Báo Chí</option>
                  <option value="Phát Triển Bền Vững">Phát Triển Bền Vững</option>
                  <option value="Hạ Tầng & Cơ Sở">Hạ Tầng & Cơ Sở</option>
                  <option value="Công Nghệ & Dịch Vụ">Công Nghệ & Dịch Vụ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Đoạn Tóm Tắt Ngắn (Lead)</label>
              <textarea
                rows={2}
                required
                value={formData.summary || ''}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Tóm tắt nội dung chính trong 1-2 câu..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nội Dung Chi Tiết</label>
              <textarea
                rows={5}
                required
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Nội dung bài viết đầy đủ..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Link Ảnh Minh Họa</label>
              <input
                type="text"
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="URL hình ảnh Unsplash hoặc CDN"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => { setIsCreating(false); setEditingArticle(null); }}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors"
              >
                {isCreating ? 'Đăng Bài Viết' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* News List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100 font-bold">
              <tr>
                <th className="py-3 px-6">Bài Viết & Tiêu Đề</th>
                <th className="py-3 px-6">Chuyên Mục</th>
                <th className="py-3 px-6">Ngày Đăng</th>
                <th className="py-3 px-6">Trạng Thái</th>
                <th className="py-3 px-6 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {news.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900 max-w-md">
                    <div className="truncate">{item.title}</div>
                    <div className="text-[11px] font-normal text-slate-500 truncate mt-0.5">{item.summary}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                    {item.date}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Đã xuất bản</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
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
