export const ROLE_OPTIONS = [
  { value: 'Admin', label: 'Admin', description: 'Toàn quyền hệ thống' },
  { value: 'Leader', label: 'Quản lý đơn vị', description: 'Quản lý nhân viên, thông báo và file trong phạm vi đơn vị' },
  { value: 'Editor', label: 'Biên tập viên', description: 'Quản lý nội dung website và hình ảnh' },
  { value: 'Support', label: 'Chăm sóc khách hàng', description: 'Xử lý liên hệ và xem báo cáo' },
  { value: 'User', label: 'Thành viên', description: 'Xem thông báo và file được chia sẻ' },
];

export const PERMISSION_GROUPS = [
  { label: 'Cổng nội bộ', items: [
    ['portal.read', 'Xem thông báo và file'],
    ['portal.publish.scope', 'Đăng thông báo trong đơn vị'],
    ['portal.publish.all', 'Đăng thông báo toàn hệ thống'],
    ['files.upload.scope', 'Tải file lên trong đơn vị'],
    ['files.upload.all', 'Tải file lên toàn hệ thống'],
  ] },
  { label: 'Người dùng', items: [
    ['users.read.scope', 'Xem người dùng trong đơn vị'],
    ['users.read.all', 'Xem toàn bộ người dùng'],
    ['users.manage.scope', 'Quản lý người dùng trong đơn vị'],
    ['users.manage.all', 'Quản lý toàn bộ người dùng và phân quyền'],
  ] },
  { label: 'Nội dung website', items: [
    ['content.sliders', 'Quản lý slider'],
    ['content.pillars', 'Quản lý nền tảng phát triển'],
    ['content.branches', 'Quản lý chi nhánh'],
    ['content.news', 'Quản lý tin tức'],
    ['content.esg', 'Quản lý nội dung ESG'],
    ['media.upload', 'Tải hình ảnh lên'],
  ] },
  { label: 'Vận hành', items: [
    ['dashboard.view', 'Xem dashboard'],
    ['contacts.manage', 'Quản lý yêu cầu khách hàng'],
    ['settings.manage', 'Thay đổi cấu hình hệ thống'],
  ] },
];

export const ROLE_PERMISSIONS = {
  Admin: ['*'],
  Leader: ['portal.read', 'portal.publish.scope', 'files.upload.scope', 'users.read.scope', 'users.manage.scope'],
  Editor: ['portal.read', 'dashboard.view', 'content.sliders', 'content.pillars', 'content.branches', 'content.news', 'content.esg', 'media.upload'],
  Support: ['portal.read', 'dashboard.view', 'contacts.manage'],
  User: ['portal.read'],
};

export const hasPermission = (user, ...permissions) => {
  const assigned = user?.permissions || ROLE_PERMISSIONS[user?.role] || [];
  return assigned.includes('*') || permissions.some(permission => assigned.includes(permission));
};

export const permissionsForRole = role => [...(ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.User)];
