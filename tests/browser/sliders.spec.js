import { test, expect } from '@playwright/test';

async function mockAdminSliders(page, options = {}) {
  let slides = [
    { id: 'slide-visible', title: 'Banner đang hiển thị', image: '/logo-kimson.png', order: 1, active: true },
    { id: 'slide-hidden', title: 'Banner đang ẩn', image: '/logo-kimson-white.png', order: 2, active: false },
  ];
  const requests = [];
  const mutations = [];
  const state = { rejectSave: Boolean(options.rejectSave) };

  await page.route('**/api/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const reply = (json, status = 200) => route.fulfill({ status, json });
    if (url.pathname === '/api/auth/me') {
      return reply({ id: 'admin-test', username: 'admin-test', role: 'Admin', fullName: 'Quản trị kiểm thử' });
    }
    if (url.pathname === '/api/settings') return reply({});
    if (['/api/pillars', '/api/branches', '/api/esg', '/api/news'].includes(url.pathname)) return reply([]);
    if (url.pathname.startsWith('/api/sliders')) {
      requests.push({ method, pathname: url.pathname, all: url.searchParams.get('all') });
      if (method === 'GET') return reply(url.searchParams.get('all') === 'true' ? slides : slides.filter(slide => slide.active));
      const payload = request.postDataJSON();
      mutations.push({ method, pathname: url.pathname, payload });
      if (url.pathname === '/api/sliders/reorder' && method === 'POST') {
        slides = payload.ids.map((id, index) => ({ ...slides.find(slide => slide.id === id), order: index + 1 }));
        return reply(slides);
      }
      if (state.rejectSave) return reply({ error: 'Không thể ghi dữ liệu kiểm thử' }, 500);
      if (url.pathname === '/api/sliders' && method === 'POST') {
        const created = { ...payload, id: 'slide-created' };
        slides.push(created);
        return reply(created, 201);
      }
      if (method === 'PUT') {
        const id = url.pathname.split('/').pop();
        const updated = { ...slides.find(slide => slide.id === id), ...payload };
        slides = slides.map(slide => slide.id === id ? updated : slide);
        return reply(updated);
      }
    }
    return reply({ error: 'Unexpected API request in slider test' }, 404);
  });

  await page.goto('/admin/sliders');
  await expect(page.getByRole('heading', { name: 'Danh Sách Slide (2)' })).toBeVisible();
  return { requests, mutations, state };
}

test('admin can manage inactive slides and the selected preview follows visibility changes', async ({ page }) => {
  const mock = await mockAdminSliders(page);
  const reads = mock.requests.filter(request => request.method === 'GET');
  expect(reads.length).toBeGreaterThan(0);
  expect(reads.every(request => request.pathname === '/api/sliders' && request.all === 'true')).toBe(true);
  const hiddenRow = page.getByRole('row').filter({ has: page.getByRole('heading', { name: 'Banner đang ẩn', exact: true }) });
  await expect(hiddenRow).toBeVisible();
  await expect(hiddenRow.getByRole('button', { name: 'Hiển thị slide Banner đang ẩn', exact: true })).toHaveText('Đang ẩn');
  await hiddenRow.getByRole('button', { name: 'Xem trước Banner đang ẩn', exact: true }).last().click();
  await expect(page.getByText('Đang ẩn trên trang chủ', { exact: true })).toBeVisible();

  await hiddenRow.getByRole('button', { name: 'Hiển thị slide Banner đang ẩn', exact: true }).click();
  await expect(page.getByText('Hiển thị trên trang chủ', { exact: true })).toBeVisible();
  await expect(hiddenRow.getByRole('button', { name: 'Ẩn slide Banner đang ẩn', exact: true })).toHaveText('Hiển thị');
  expect(mock.mutations).toEqual([
    { method: 'PUT', pathname: '/api/sliders/slide-hidden', payload: { active: true } },
  ]);
});

test('creating a slide sends only supported fields and a numeric order', async ({ page }) => {
  const mock = await mockAdminSliders(page);
  await page.getByRole('button', { name: 'Thêm Slide Mới', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Thêm Slider Mới' });
  await dialog.getByLabel('Tên slide').fill('  Banner mới từ CMS  ');
  await dialog.getByLabel('Đường dẫn hình ảnh').fill('/logo-kimson.png');
  await dialog.getByLabel('Thứ tự', { exact: true }).fill('7');
  await dialog.getByLabel('Hiển thị slide trên trang chủ sau khi lưu').uncheck();
  await dialog.getByRole('button', { name: 'Tạo Slide Mới', exact: true }).click();

  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Banner mới từ CMS', exact: true })).toBeVisible();
  await expect(page.getByText('Đang ẩn trên trang chủ', { exact: true })).toBeVisible();
  expect(mock.mutations).toEqual([
    {
      method: 'POST', pathname: '/api/sliders',
      payload: { title: 'Banner mới từ CMS', image: '/logo-kimson.png', order: 7, active: false },
    },
  ]);
});

test('a rejected save keeps the dialog and user input available for retry', async ({ page }) => {
  const mock = await mockAdminSliders(page, { rejectSave: true });
  await page.getByRole('button', { name: 'Chỉnh sửa Banner đang ẩn', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Chỉnh Sửa Slider' });
  await dialog.getByLabel('Tên slide').fill('Banner cần lưu lại');
  await dialog.getByLabel('Thứ tự', { exact: true }).fill('9');
  await dialog.getByRole('button', { name: 'Lưu Thay Đổi', exact: true }).click();

  await expect(dialog.getByRole('alert')).toContainText('Không thể ghi dữ liệu kiểm thử');
  await expect(dialog.getByLabel('Tên slide')).toHaveValue('Banner cần lưu lại');
  await expect(dialog.getByLabel('Thứ tự', { exact: true })).toHaveValue('9');
  await expect(dialog.getByLabel('Đường dẫn hình ảnh')).toHaveValue('/logo-kimson-white.png');
  await expect(dialog.getByRole('button', { name: 'Lưu Thay Đổi', exact: true })).toBeEnabled();
  await expect(page.getByRole('heading', { name: 'Banner đang ẩn', exact: true })).toBeAttached();

  mock.state.rejectSave = false;
  await dialog.getByRole('button', { name: 'Lưu Thay Đổi', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Banner cần lưu lại', exact: true })).toBeVisible();
  expect(mock.mutations).toHaveLength(2);
  expect(mock.mutations[1].payload).toEqual({ title: 'Banner cần lưu lại', image: '/logo-kimson-white.png', order: 9, active: false });
});

test('reorder uses one atomic request and updates the selected slide order', async ({ page }) => {
  const mock = await mockAdminSliders(page);
  await page.getByRole('button', { name: 'Di chuyển Banner đang ẩn lên trên', exact: true }).click();
  await expect(page.getByText('Thứ tự #2', { exact: true })).toBeVisible();
  const rows = page.getByRole('row');
  await expect(rows.nth(1).getByRole('heading')).toHaveText('Banner đang ẩn');
  await expect(rows.nth(2).getByRole('heading')).toHaveText('Banner đang hiển thị');
  expect(mock.mutations).toEqual([
    { method: 'POST', pathname: '/api/sliders/reorder', payload: { ids: ['slide-hidden', 'slide-visible'] } },
  ]);
});
