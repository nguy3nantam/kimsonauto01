import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  FolderOpen, 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  Building2, 
  Briefcase, 
  FileSpreadsheet, 
  FileArchive, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Pin,
  ExternalLink,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { api } from '../../services/api';
import { UNIT_OPTIONS, DEPARTMENT_OPTIONS } from './AdminLoginPage';

const emptyFile = {
  description: '',
  category: 'Biểu Mẫu Hành Chính',
  targetUnit: 'all',
  targetDepartment: 'all'
};
const normalize = (value) => String(value || '').trim().toLowerCase();
const isAll = (value) => !value || ['all', 'tất cả', 'tất cả đơn vị', 'tất cả bộ phận'].includes(normalize(value));
const formatFileSize = (bytes) => bytes >= 1024 * 1024
  ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  : `${(bytes / 1024).toFixed(1)} KB`;
const readFileData = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1]);
  reader.onerror = () => reject(new Error('Không thể đọc tệp. Vui lòng chọn lại tệp.'));
  reader.onabort = () => reject(new Error('Đã hủy đọc tệp. Vui lòng thử lại.'));
  reader.readAsDataURL(file);
});

export default function AdminPortalHub() {
  const [activeTab, setActiveTab] = useState('announcements'); // 'announcements' | 'files'
  const [currentUser, setCurrentUser] = useState(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [announcementFilterDept, setAnnouncementFilterDept] = useState('all');
  const [announcementFilterCategory, setAnnouncementFilterCategory] = useState('all');
  const [announcementSearch, setAnnouncementSearch] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    category: 'Chính Sách & Quy Định',
    priority: 'normal',
    targetUnit: 'Tất Cả Đơn Vị',
    targetDepartment: 'Tất Cả Bộ Phận',
    pinned: false
  });

  // Shared Files state
  const [sharedFiles, setSharedFiles] = useState([]);
  const [fileFilterCategory, setFileFilterCategory] = useState('all');
  const [fileFilterType, setFileFilterType] = useState('all');
  const [fileSearch, setFileSearch] = useState('');
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [newFile, setNewFile] = useState(emptyFile);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!downloadSuccess) return;
    const timer = setTimeout(() => setDownloadSuccess(''), 4000);
    return () => clearTimeout(timer);
  }, [downloadSuccess]);

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [user, annData, fileData] = await Promise.all([
        api.getMe(),
        api.getAnnouncements(),
        api.getSharedFiles()
      ]);
      setCurrentUser(user);
      setAnnouncements(annData);
      setSharedFiles(fileData);
    } catch (err) {
      setLoadError(`Không thể tải cổng thông tin: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const userRole = normalize(currentUser?.role);
  const isAdmin = ['admin', 'super admin', 'quản trị viên', 'quan tri vien'].includes(userRole);
  const isLeader = ['leader', 'trưởng bộ phận', 'truong bo phan', 'trưởng phòng', 'truong phong', 'quản lý'].includes(userRole);
  const isUser = !isAdmin && !isLeader;
  const canCreate = isAdmin || isLeader;

  const canDeleteContent = (item) => {
    if (isAdmin) return true;
    if (!isLeader) return false;
    const inScope = (isAll(item.targetUnit) || normalize(item.targetUnit) === normalize(currentUser?.unit)) &&
      (isAll(item.targetDepartment) || normalize(item.targetDepartment) === normalize(currentUser?.department));
    const fullName = currentUser?.fullName || currentUser?.name;
    const isAuthor = item.authorId ? item.authorId === currentUser?.id :
      Boolean(fullName && (item.author === fullName || item.uploadedBy === fullName));
    return inScope && isAuthor;
  };

  // -------------------------------------------------------------
  // Announcements Handlers
  // -------------------------------------------------------------
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung');
      return;
    }
    try {
      await api.createAnnouncement({
        ...newAnnouncement,
        targetUnit: isLeader ? (currentUser?.unit || 'VF Biên Hòa') : newAnnouncement.targetUnit,
        targetDepartment: isLeader ? (currentUser?.department || 'Kinh Doanh') : newAnnouncement.targetDepartment,
        author: currentUser?.fullName || currentUser?.name || (isLeader ? 'Leader Chi Nhánh' : 'Ban Quản Trị Kim Sơn')
      });
      setIsAnnouncementModalOpen(false);
      setNewAnnouncement({
        title: '',
        content: '',
        category: 'Chính Sách & Quy Định',
        priority: 'normal',
        targetUnit: isLeader ? (currentUser?.unit || 'VF Biên Hòa') : 'Tất Cả Đơn Vị',
        targetDepartment: isLeader ? (currentUser?.department || 'Kinh Doanh') : 'Tất Cả Bộ Phận',
        pinned: false
      });
      loadData();
    } catch (err) {
      alert('Lỗi tạo thông báo: ' + err.message);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      try {
        await api.deleteAnnouncement(id);
        if (selectedAnnouncement?.id === id) setSelectedAnnouncement(null);
        loadData();
      } catch (err) {
        alert('Lỗi: ' + err.message);
      }
    }
  };

  // -------------------------------------------------------------
  // Shared Files Handlers
  // -------------------------------------------------------------
  const handleSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/\.(pdf|docx|xlsx|zip)$/i.test(file.name) || !file.size || file.size > 10 * 1024 * 1024 || file.name.length > 250) {
      setUploadError('Chọn tệp PDF, DOCX, XLSX hoặc ZIP từ 1 byte đến 10 MB, tên tối đa 250 ký tự.');
      e.target.value = '';
      return;
    }
    setSelectedFile(file);
    setUploadError('');
  };

  const handleCreateSharedFile = async (e) => {
    e.preventDefault();
    if (uploading) return;
    if (!selectedFile) {
      setUploadError('Vui lòng chọn tệp tài liệu để tải lên.');
      return;
    }
    setUploadError('');
    setUploading(true);
    try {
      const data = await readFileData(selectedFile);
      const created = await api.createSharedFile({
        ...newFile,
        name: selectedFile.name,
        data,
        targetUnit: isLeader ? currentUser?.unit : newFile.targetUnit,
        targetDepartment: isLeader ? currentUser?.department : newFile.targetDepartment
      });
      setSharedFiles((previous) => [created, ...previous]);
      setIsFileModalOpen(false);
      setNewFile(emptyFile);
      setSelectedFile(null);
      setDownloadSuccess(`Đã chia sẻ tài liệu: ${created.name}`);
    } catch (err) {
      setUploadError(`Không thể tải lên tài liệu: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSharedFile = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa file dùng chung này?')) {
      try {
        await api.deleteSharedFile(id);
        loadData();
      } catch (err) {
        alert('Lỗi: ' + err.message);
      }
    }
  };

  const handleDownloadFile = async (file) => {
    if (!file.available || downloadingId) return;
    setDownloadError('');
    setDownloadSuccess('');
    setDownloadingId(file.id);
    try {
      const response = await fetch(`/api/shared-files/${encodeURIComponent(file.id)}/download`, { credentials: 'same-origin' });
      if (!response.ok) {
        if (response.status === 404) {
          setSharedFiles((previous) => previous.map((item) => item.id === file.id ? { ...item, available: false } : item));
          throw new Error('Tài liệu chưa có tệp đính kèm hoặc tệp không còn trên máy chủ.');
        }
        if (response.status === 401) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        if (response.status === 403) throw new Error('Bạn không có quyền tải tài liệu này.');
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Máy chủ không thể tải tài liệu.');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setSharedFiles((previous) => previous.map((item) => item.id === file.id ? { ...item, downloads: (item.downloads || 0) + 1 } : item));
      setDownloadSuccess(`Đã gửi tệp tới trình duyệt: ${file.name}`);
    } catch (err) {
      setDownloadError(`Không thể tải "${file.name}": ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  // -------------------------------------------------------------
  // Filters
  // -------------------------------------------------------------
  const filteredAnnouncements = announcements.filter((item) => {
    const matchCat = announcementFilterCategory === 'all' || item.category === announcementFilterCategory;
    const matchDept = announcementFilterDept === 'all' || item.targetDepartment === 'all' || item.targetDepartment === 'Tất Cả Bộ Phận' || item.targetDepartment === announcementFilterDept;
    const q = announcementSearch.toLowerCase();
    const matchSearch = !announcementSearch || 
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.content && item.content.toLowerCase().includes(q)) ||
      (item.author && item.author.toLowerCase().includes(q));

    return matchCat && matchDept && matchSearch;
  });

  const filteredFiles = sharedFiles.filter((item) => {
    const matchCat = fileFilterCategory === 'all' || item.category === fileFilterCategory;
    const matchType = fileFilterType === 'all' || item.fileType === fileFilterType;
    const q = fileSearch.toLowerCase();
    const matchSearch = !fileSearch || 
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q));

    return matchCat && matchType && matchSearch;
  });

  const getFileIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'PDF':
        return <FileText className="text-red-500" size={28} />;
      case 'XLSX':
      case 'XLS':
        return <FileSpreadsheet className="text-emerald-500" size={28} />;
      case 'ZIP':
      case 'RAR':
        return <FileArchive className="text-amber-500" size={28} />;
      default:
        return <FileText className="text-blue-500" size={28} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Download Alert Notification */}
      {downloadSuccess && (
        <div role="status" className="fixed top-16 inset-x-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold border border-emerald-400">
            <CheckCircle2 size={18} />
            <span>{downloadSuccess}</span>
          </div>
        </div>
      )}

      {loadError && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{loadError}</span>
          <button type="button" onClick={loadData} disabled={loading} className="shrink-0 font-bold underline">Thử lại</button>
        </div>
      )}

      {/* User Welcome Banner with Unit & Department */}
      <div className="bg-gradient-to-r from-slate-900 via-secondary to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-light border border-primary/30 text-[11px] font-bold tracking-wide">
              <Sparkles size={13} />
              <span>CỔNG THÔNG TIN NỘI BỘ • KIM SƠN AUTOMOBILES</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Xin chào, {currentUser?.fullName || currentUser?.name || 'Thành Viên'}!
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
                <Building2 size={14} className="text-primary-light" />
                <span>Đơn vị: <strong className="text-white">{currentUser?.unit || 'VF Biên Hòa'}</strong></span>
              </div>
              
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
                <Briefcase size={14} className="text-primary-light" />
                <span>Bộ phận: <strong className="text-white">{currentUser?.department || 'Kinh Doanh'}</strong></span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Vai trò: <strong className="text-white">{currentUser?.role || 'Thành Viên'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-center px-3 border-r border-white/10">
              <div className="text-2xl font-black text-white">{announcements.length}</div>
              <div className="text-[10px] uppercase font-bold text-slate-300">Thông Báo</div>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-black text-primary-light">{sharedFiles.length}</div>
              <div className="text-[10px] uppercase font-bold text-slate-300">File Tài Liệu</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Mode Tabs Switcher: Thông Báo vs File Dùng Chung */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex shrink-0 items-center gap-2.5 px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'announcements'
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Bell size={17} />
            <span>Thông Báo Nội Bộ</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'announcements' ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              {announcements.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`flex shrink-0 items-center gap-2.5 px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'files'
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FolderOpen size={17} />
            <span>File Dùng Chung</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'files' ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              {sharedFiles.length}
            </span>
          </button>
        </div>

        {/* Action Button for Admins & Leaders */}
        {canCreate && (
          <div className="flex items-center gap-2">
            {activeTab === 'announcements' ? (
              <button
                onClick={() => setIsAnnouncementModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white text-xs font-bold rounded-xl shadow-glow transition-all"
              >
                <Plus size={16} />
                <span>{isLeader ? 'Đăng Thông Báo Chi Nhánh' : 'Đăng Thông Báo Mới'}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsFileModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white text-xs font-bold rounded-xl shadow-glow transition-all"
              >
                <Plus size={16} />
                <span>{isLeader ? 'Tải Lên Tệp Chi Nhánh' : 'Chia Sẻ File Tài Liệu Mới'}</span>
              </button>
            )}
          </div>
        )}

        {/* Read-only indicator for regular User */}
        {isUser && (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Chế độ xem tài liệu & thông báo</span>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: THÔNG BÁO NỘI BỘ                               */}
      {/* ========================================================= */}
      {activeTab === 'announcements' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Filters & Search Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={announcementSearch}
                onChange={(e) => setAnnouncementSearch(e.target.value)}
                placeholder="Tìm kiếm thông báo theo tiêu đề, nội dung, người ban hành..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <Filter size={14} className="text-slate-400 shrink-0" />
                <select
                  value={announcementFilterCategory}
                  onChange={(e) => setAnnouncementFilterCategory(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất cả chuyên mục</option>
                  <option value="Chính Sách & Quy Định">Chính Sách & Quy Định</option>
                  <option value="Vận Hành & Dịch Vụ">Vận Hành & Dịch Vụ</option>
                  <option value="Kinh Doanh & Bán Hàng">Kinh Doanh & Bán Hàng</option>
                  <option value="Khen Thưởng & Sự Kiện">Khen Thưởng & Sự Kiện</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <Briefcase size={14} className="text-slate-400 shrink-0" />
                <select
                  value={announcementFilterDept}
                  onChange={(e) => setAnnouncementFilterDept(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất cả bộ phận</option>
                  {DEPARTMENT_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Announcements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAnnouncements.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200/90 p-8 text-slate-400">
                <Bell size={32} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-semibold">Chưa có thông báo nào phù hợp với bộ lọc hiện tại.</p>
              </div>
            ) : (
              filteredAnnouncements.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all hover:shadow-md flex flex-col justify-between ${
                    item.priority === 'urgent'
                      ? 'border-red-300 ring-1 ring-red-200/80 bg-red-50/10'
                      : item.priority === 'high'
                      ? 'border-amber-300'
                      : 'border-slate-200/90'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.pinned && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20">
                            <Pin size={11} className="rotate-45" />
                            <span>Ghim</span>
                          </span>
                        )}

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.priority === 'urgent'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : item.priority === 'high'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.priority === 'urgent' ? 'Khẩn Cấp' : item.priority === 'high' ? 'Quan Trọng' : 'Thông Thường'}
                        </span>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {item.category}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.content}
                    </p>
                  </div>

                  {/* Footer Meta & Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <Briefcase size={12} className="text-primary" />
                      <span>{item.targetDepartment || 'Toàn hệ thống'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedAnnouncement(item)}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-primary hover:text-white text-primary text-xs font-bold transition-all"
                      >
                        Đọc Chi Tiết →
                      </button>

                      {canDeleteContent(item) && (
                        <button
                          onClick={() => handleDeleteAnnouncement(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Xóa thông báo"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: FILE DÙNG CHUNG                                */}
      {/* ========================================================= */}
      {activeTab === 'files' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {downloadError && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={18} className="shrink-0" />
              <span>{downloadError}</span>
            </div>
          )}
          {/* File Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={fileSearch}
                onChange={(e) => setFileSearch(e.target.value)}
                placeholder="Tìm file theo tên tài liệu, nội dung tóm tắt..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <FolderOpen size={14} className="text-slate-400 shrink-0" />
                <select
                  value={fileFilterCategory}
                  onChange={(e) => setFileFilterCategory(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất cả danh mục file</option>
                  <option value="Biểu Mẫu Hành Chính">Biểu Mẫu Hành Chính</option>
                  <option value="Catalog & Bảng Giá">Catalog & Bảng Giá</option>
                  <option value="Tài Liệu Kỹ Thuật">Tài Liệu Kỹ Thuật</option>
                  <option value="Hợp Đồng & Pháp Lý">Hợp Đồng & Pháp Lý</option>
                  <option value="Nhận Diện Thương Hiệu">Nhận Diện Thương Hiệu</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <FileText size={14} className="text-slate-400 shrink-0" />
                <select
                  value={fileFilterType}
                  onChange={(e) => setFileFilterType(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất cả định dạng</option>
                  <option value="PDF">PDF Document</option>
                  <option value="DOCX">Word (.docx)</option>
                  <option value="XLSX">Excel (.xlsx)</option>
                  <option value="ZIP">Nén (.zip)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Files Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200/90 p-8 text-slate-400">
                <FolderOpen size={32} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-semibold">{loading ? 'Đang tải tài liệu...' : loadError ? 'Chưa tải được danh sách tài liệu.' : 'Chưa có file tài liệu nào trong danh mục này.'}</p>
              </div>
            ) : (
              filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Header Icon & Type */}
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-amber-50/50 transition-colors">
                        {getFileIcon(file.fileType)}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                          {file.fileType}
                        </span>
                        {canDeleteContent(file) && (
                          <button
                            onClick={() => handleDeleteSharedFile(file.id)}
                            className="p-1 text-slate-300 hover:text-red-600 rounded-md transition-colors"
                            title="Xóa tài liệu"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* File Title */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2 break-all">
                        {file.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {file.description || 'Tài liệu nội bộ ban hành sử dụng chung.'}
                      </p>
                    </div>

                    {/* Category & Dept Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        {file.category}
                      </span>
                      {!isAll(file.targetUnit) && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {file.targetUnit}
                        </span>
                      )}
                      {!isAll(file.targetDepartment) && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {file.targetDepartment}
                        </span>
                      )}
                    </div>
                    {!file.available && (
                      <p className="text-xs text-amber-700">Chưa có tệp đính kèm. Vui lòng liên hệ người chia sẻ để tải lại tài liệu.</p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap gap-2 items-center justify-between text-xs">
                    <div className="text-[11px] text-slate-400">
                      <span>{file.fileSize}</span>
                      <span className="mx-1">•</span>
                      <span>{file.downloads || 0} lượt tải</span>
                    </div>

                    <button
                      onClick={() => handleDownloadFile(file)}
                      disabled={!file.available || Boolean(downloadingId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white hover:bg-primary-dark font-bold text-xs shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download size={13} />
                      <span>{!file.available ? 'Chưa có tệp' : downloadingId === file.id ? 'Đang tải...' : 'Tải Xuống'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ĐỌC CHI TIẾT THÔNG BÁO                             */}
      {/* ========================================================= */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  {selectedAnnouncement.category}
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                  {selectedAnnouncement.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1">
                  <User size={13} className="text-primary" />
                  <span>Ban hành: <strong>{selectedAnnouncement.author}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={13} />
                  <span>{new Date(selectedAnnouncement.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase size={13} className="text-primary" />
                  <span>Bộ phận áp dụng: <strong>{selectedAnnouncement.targetDepartment || 'Toàn bộ'}</strong></span>
                </div>
              </div>

              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedAnnouncement.content}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ĐĂNG THÔNG BÁO MỚI                                 */}
      {/* ========================================================= */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Ban Hành Thông Báo Mới</h3>
                <p className="text-xs text-slate-500">Gửi thông báo tới các đơn vị và phòng ban hệ sinh thái</p>
              </div>
              <button
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Tiêu Đề Thông Báo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="Nhập tiêu đề thông báo..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Chuyên Mục
                  </label>
                  <select
                    value={newAnnouncement.category}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                  >
                    <option value="Chính Sách & Quy Định">Chính Sách & Quy Định</option>
                    <option value="Vận Hành & Dịch Vụ">Vận Hành & Dịch Vụ</option>
                    <option value="Kinh Doanh & Bán Hàng">Kinh Doanh & Bán Hàng</option>
                    <option value="Khen Thưởng & Sự Kiện">Khen Thưởng & Sự Kiện</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Mức Độ Ưu Tiên
                  </label>
                  <select
                    value={newAnnouncement.priority}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                  >
                    <option value="normal">Thông Thường</option>
                    <option value="high">Quan Trọng</option>
                    <option value="urgent">Khẩn Cấp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Đơn Vị Nhận
                  </label>
                  <select
                    disabled={isLeader}
                    value={isLeader ? currentUser?.unit || '' : newAnnouncement.targetUnit}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, targetUnit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                  >
                    {isLeader && !UNIT_OPTIONS.includes(currentUser?.unit) && <option value={currentUser?.unit || ''}>{currentUser?.unit || 'Chưa có đơn vị'}</option>}
                    <option value="Tất Cả Đơn Vị">Tất Cả 8 Đơn Vị</option>
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Bộ Phận Nhận
                  </label>
                  <select
                    disabled={isLeader}
                    value={isLeader ? currentUser?.department || '' : newAnnouncement.targetDepartment}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, targetDepartment: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                  >
                    {isLeader && !DEPARTMENT_OPTIONS.includes(currentUser?.department) && <option value={currentUser?.department || ''}>{currentUser?.department || 'Chưa có bộ phận'}</option>}
                    <option value="Tất Cả Bộ Phận">Tất Cả 5 Bộ Phận</option>
                    {DEPARTMENT_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Nội Dung Chi Tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  placeholder="Soạn thảo nội dung thông báo..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinNotice"
                  checked={newAnnouncement.pinned}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, pinned: e.target.checked })}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label htmlFor="pinNotice" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Ghim thông báo lên đầu danh sách
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-xl text-xs font-bold shadow-glow"
                >
                  Xuất Bản Thông Báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CHIA SẺ FILE MỚI                                   */}
      {/* ========================================================= */}
      {isFileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="shared-file-title" className="bg-white rounded-3xl max-w-lg w-full max-h-[calc(100dvh-2rem)] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 id="shared-file-title" className="text-base font-bold text-slate-900">Chia Sẻ File Dùng Chung Mới</h3>
                <p className="text-xs text-slate-500">Tải lên tài liệu, biểu mẫu, catalog dùng chung nội bộ</p>
              </div>
              <button
                onClick={() => setIsFileModalOpen(false)}
                disabled={uploading}
                aria-label="Đóng biểu mẫu chia sẻ tệp"
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSharedFile} className="p-6 space-y-4">
              {uploadError && (
                <div role="alert" className="flex items-start gap-2 p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
              <fieldset disabled={uploading} className="space-y-4 disabled:opacity-70">
              <div>
                <label htmlFor="shared-file-input" className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Tệp Tài Liệu <span className="text-red-500">*</span>
                </label>
                <input
                  id="shared-file-input"
                  type="file"
                  accept=".pdf,.docx,.xlsx,.zip"
                  aria-describedby="shared-file-help"
                  onChange={handleSelectFile}
                  className="w-full min-w-0 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:font-semibold file:text-primary"
                />
                <p id="shared-file-help" className="mt-2 text-xs text-slate-500">PDF, DOCX, XLSX hoặc ZIP. Dung lượng tối đa 10 MB.</p>
                {selectedFile && (
                  <p className="mt-2 text-xs font-semibold text-emerald-700 break-all">Đã chọn: {selectedFile.name} ({formatFileSize(selectedFile.size)})</p>
                )}
              </div>

              <div>
                <label htmlFor="shared-file-description" className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Mô Tả Tài Liệu
                </label>
                <textarea
                  id="shared-file-description"
                  rows={2}
                  maxLength={2000}
                  value={newFile.description}
                  onChange={(e) => setNewFile({ ...newFile, description: e.target.value })}
                  placeholder="Tóm tắt công dụng hoặc hướng dẫn sử dụng tài liệu..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <div>
                  <label htmlFor="shared-file-category" className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Danh Mục Tài Liệu
                  </label>
                  <select
                    id="shared-file-category"
                    value={newFile.category}
                    onChange={(e) => setNewFile({ ...newFile, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                  >
                    <option value="Biểu Mẫu Hành Chính">Biểu Mẫu Hành Chính</option>
                    <option value="Catalog & Bảng Giá">Catalog & Bảng Giá</option>
                    <option value="Tài Liệu Kỹ Thuật">Tài Liệu Kỹ Thuật</option>
                    <option value="Hợp Đồng & Pháp Lý">Hợp Đồng & Pháp Lý</option>
                    <option value="Nhận Diện Thương Hiệu">Nhận Diện Thương Hiệu</option>
                  </select>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="shared-file-unit" className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Đơn Vị Sử Dụng
                  </label>
                  <select
                    id="shared-file-unit"
                    disabled={isLeader}
                    value={isLeader ? currentUser?.unit || '' : newFile.targetUnit}
                    onChange={(e) => setNewFile({ ...newFile, targetUnit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                  >
                    {isLeader ? <option value={currentUser?.unit || ''}>{currentUser?.unit || 'Chưa có đơn vị'}</option> : (
                      <>
                        <option value="all">Tất Cả Đơn Vị</option>
                        {UNIT_OPTIONS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="shared-file-department" className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Bộ Phận Sử Dụng
                  </label>
                  <select
                    id="shared-file-department"
                    disabled={isLeader}
                    value={isLeader ? currentUser?.department || '' : newFile.targetDepartment}
                    onChange={(e) => setNewFile({ ...newFile, targetDepartment: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                  >
                    {isLeader ? <option value={currentUser?.department || ''}>{currentUser?.department || 'Chưa có bộ phận'}</option> : (
                      <>
                        <option value="all">Tất Cả Bộ Phận</option>
                        {DEPARTMENT_OPTIONS.map((department) => <option key={department} value={department}>{department}</option>)}
                      </>
                    )}
                  </select>
                </div>
              </div>
              {isLeader && <p className="text-xs text-slate-500">Tài liệu được chia sẻ trong đơn vị và bộ phận của bạn.</p>}
              </fieldset>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFileModalOpen(false)}
                  disabled={uploading}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-xl text-xs font-bold shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Đang tải lên...' : 'Tải Lên & Chia Sẻ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
