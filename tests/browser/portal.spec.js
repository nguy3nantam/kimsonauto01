import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const admin = { id: 'admin-test', role: 'Admin', fullName: 'Quản trị thử nghiệm', unit: 'VF Biên Hòa', department: 'Kinh Doanh' };
const pdf = Buffer.from('%PDF-1.4\nPortal document\n%%EOF');
const legacyFile = { id: 'legacy', name: 'Tai-lieu-cu.pdf', category: 'Biểu Mẫu Hành Chính', fileType: 'PDF', fileSize: '2 KB', available: false, targetUnit: 'all', targetDepartment: 'all' };

async function mockPortal(page, { user = admin, files = [legacyFile], post, download } = {}) {
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;
    if (pathname === '/api/auth/me') return route.fulfill({ json: user });
    if (pathname === '/api/announcements') return route.fulfill({ json: [] });
    if (pathname === '/api/shared-files' && request.method() === 'POST' && post) return post(route);
    if (pathname === '/api/shared-files') return route.fulfill({ json: files });
    if (pathname.endsWith('/download') && download) return download(route);
    return route.fulfill({ json: pathname === '/api/settings' ? {} : [] });
  });
  await page.goto('/admin/portal');
  await page.getByRole('button', { name: /File Dùng Chung/ }).click();
}

test('uploads real file data, retains failed form and downloads the returned bytes', async ({ page }) => {
  const uploads = [];
  await mockPortal(page, {
    post: async (route) => {
      const data = route.request().postDataJSON();
      uploads.push(data);
      if (uploads.length === 1) return route.fulfill({ status: 500, json: { error: 'Lưu tệp thất bại, vui lòng thử lại.' } });
      return route.fulfill({ status: 201, json: { ...legacyFile, ...data, id: 'new-file', fileSize: '0.03 KB', available: true, downloads: 0 } });
    },
    download: (route) => route.fulfill({ contentType: 'application/pdf', body: pdf }),
  });
  await expect(page.getByRole('button', { name: 'Chưa có tệp', exact: true })).toBeDisabled();
  await expect(page.getByText('Chưa có tệp đính kèm.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Chia Sẻ File Tài Liệu Mới' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Tải Lên & Chia Sẻ' }).click();
  await expect(dialog.getByRole('alert')).toContainText('Vui lòng chọn tệp');

  await dialog.getByLabel('Tệp Tài Liệu').setInputFiles({ name: 'Bang-gia.pdf', mimeType: 'application/pdf', buffer: pdf });
  await dialog.getByLabel('Mô Tả Tài Liệu').fill('Bảng giá sử dụng nội bộ');
  await dialog.getByLabel('Đơn Vị Sử Dụng').selectOption('VF Biên Hòa');
  await dialog.getByLabel('Bộ Phận Sử Dụng').selectOption('Kinh Doanh');
  await dialog.getByRole('button', { name: 'Tải Lên & Chia Sẻ' }).click();
  await expect(dialog.getByRole('alert')).toContainText('Lưu tệp thất bại');
  await expect(dialog.getByLabel('Mô Tả Tài Liệu')).toHaveValue('Bảng giá sử dụng nội bộ');
  await expect(dialog.getByText('Đã chọn:', { exact: false })).toContainText('Bang-gia.pdf');
  expect(uploads[0]).toMatchObject({ name: 'Bang-gia.pdf', data: pdf.toString('base64'), targetUnit: 'VF Biên Hòa', targetDepartment: 'Kinh Doanh' });

  await dialog.getByRole('button', { name: 'Tải Lên & Chia Sẻ' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bang-gia.pdf' })).toBeVisible();
  expect(uploads).toHaveLength(2);
  expect(uploads[1]).toEqual(uploads[0]);
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Tải Xuống', exact: true }).click();
  const file = await downloaded;
  expect(file.suggestedFilename()).toBe('Bang-gia.pdf');
  expect(await fs.readFile(await file.path())).toEqual(pdf);
  await expect(page.getByText('1 lượt tải', { exact: true })).toBeVisible();
});

test('validates file types and sizes and constrains leader sharing and deletion', async ({ page }) => {
  const user = { ...admin, id: 'leader-test', role: 'Leader' };
  const ownFile = { ...legacyFile, id: 'mine', authorId: user.id, targetUnit: user.unit, targetDepartment: user.department };
  const someoneElseFile = { ...ownFile, id: 'theirs', authorId: 'someone-else', name: 'Tai-lieu-khac.pdf' };
  await mockPortal(page, { user, files: [ownFile, someoneElseFile] });
  await expect(page.getByRole('button', { name: 'Xóa tài liệu', exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: 'Tải Lên Tệp Chi Nhánh' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Đơn Vị Sử Dụng')).toBeDisabled();
  await expect(dialog.getByLabel('Đơn Vị Sử Dụng')).toHaveValue(user.unit);
  await expect(dialog.getByLabel('Bộ Phận Sử Dụng')).toBeDisabled();
  await expect(dialog.getByLabel('Bộ Phận Sử Dụng')).toHaveValue(user.department);
  await dialog.getByLabel('Tệp Tài Liệu').setInputFiles({ name: 'wrong.txt', mimeType: 'text/plain', buffer: Buffer.from('text') });
  await expect(dialog.getByRole('alert')).toContainText('Chọn tệp PDF, DOCX, XLSX hoặc ZIP');
  await dialog.getByLabel('Tệp Tài Liệu').setInputFiles({ name: 'too-large.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(10 * 1024 * 1024 + 1) });
  await expect(dialog.getByRole('alert')).toContainText('10 MB');
  await dialog.getByLabel('Tệp Tài Liệu').setInputFiles({ name: 'empty.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(0) });
  await expect(dialog.getByRole('alert')).toContainText('1 byte');
  await expect(dialog.getByText('Đã chọn:', { exact: false })).toHaveCount(0);
  const geometry = await dialog.evaluate((element) => ({ width: element.getBoundingClientRect().width, viewport: window.innerWidth, height: element.getBoundingClientRect().height, viewportHeight: window.innerHeight }));
  expect(geometry.width).toBeLessThanOrEqual(geometry.viewport);
  expect(geometry.height).toBeLessThanOrEqual(geometry.viewportHeight);
});

test('regular users cannot share or delete and receive a clear missing-download error', async ({ page }) => {
  await mockPortal(page, {
    user: { ...admin, role: 'User' },
    files: [{ ...legacyFile, available: true }],
    download: (route) => route.fulfill({ status: 404, json: { error: 'Missing file' } }),
  });
  await expect(page.getByRole('button', { name: 'Chia Sẻ File Tài Liệu Mới' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Xóa tài liệu', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Tải Xuống', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Tài liệu chưa có tệp đính kèm hoặc tệp không còn trên máy chủ.');
  await expect(page.getByRole('button', { name: 'Chưa có tệp', exact: true })).toBeDisabled();
  await expect(page.getByText('0 lượt tải', { exact: true })).toBeVisible();
});
