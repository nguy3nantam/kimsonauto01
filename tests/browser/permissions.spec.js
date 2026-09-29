import { test, expect } from '@playwright/test';

async function mockAdmin(page, user, users = []) {
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/auth/me') return route.fulfill({ json: user });
    if (url.pathname === '/api/users') return route.fulfill({ json: users });
    if (url.pathname === '/api/settings') return route.fulfill({ json: {} });
    return route.fulfill({ json: [] });
  });
}

test('navigation and direct routes follow assigned module permissions', async ({ page }) => {
  await mockAdmin(page, {
    id: 'editor-test', role: 'Editor', fullName: 'Biên tập viên', unit: 'VF Biên Hòa', department: 'Marketing',
    permissions: ['content.news', 'media.upload'],
  });
  await page.goto('/admin/news');
  await expect(page.getByRole('link', { name: 'Tin Tức & Thông Cáo' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Người Dùng & Phân Quyền' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Yêu Cầu Hợp Tác B2B' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Cài Đặt & Thông Tin' })).toHaveCount(0);

  await page.goto('/admin/settings');
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Bạn chưa được cấp quyền truy cập' })).toBeVisible();
});

test('administrator can apply a role template and customize individual permissions', async ({ page }) => {
  await mockAdmin(page, {
    id: 'admin-test', role: 'Admin', fullName: 'Quản trị viên', permissions: ['*'],
  });
  await page.goto('/admin/users');
  await page.getByRole('button', { name: 'Thêm Thành Viên Mới' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.locator('select').nth(2).selectOption('Editor');
  await expect(dialog.getByText('Quyền chi tiết', { exact: true })).toBeVisible();
  await expect(dialog.getByLabel('Quản lý tin tức')).toBeChecked();
  await expect(dialog.getByLabel('Quản lý yêu cầu khách hàng')).not.toBeChecked();
  await dialog.getByLabel('Quản lý yêu cầu khách hàng').check();
  await expect(dialog.getByLabel('Quản lý yêu cầu khách hàng')).toBeChecked();
});
