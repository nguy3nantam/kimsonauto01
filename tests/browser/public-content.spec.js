import { test, expect } from '@playwright/test';

const settings = { headquarters: 'Địa chỉ CMS mới', hotline: '0987 654 321', email: 'cms@example.test', foundingYear: 2020, totalEngineers: 0, totalCustomers: 1234, satisfactionRate: '95%', siteTitle: 'Website CMS' };
const branch = { id: 'new-branch', name: 'Chi nhánh CMS mới', address: 'Đường CMS mới', hotline: '0912345678', area: 'Khu vực mới', features: ['Dịch vụ CMS'] };
const pillar = { id: 'new-pillar', title: 'Nền tảng CMS mới', subtitle: 'Phụ đề CMS', description: 'Mô tả nền tảng đã cập nhật', image: '/logo-kimson.png', capabilities: ['Năng lực CMS'] };

async function mockContent(page, overrides = {}) {
  const data = { settings, branches: [branch], pillars: [pillar], esg: [{ id: 'esg', title: 'Cam kết CMS', desc: 'Nội dung ESG mới' }], news: [], sliders: [], ...overrides };
  await page.route('**/api/**', route => {
    const key = new URL(route.request().url()).pathname.split('/')[2];
    return route.fulfill({ json: data[key] ?? [] });
  });
  return data;
}

test('homepage and footer reflect CMS values, including zero statistics', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await mockContent(page);
  await page.goto('/');
  await expect(page).toHaveTitle('Website CMS');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByText('Mô tả nền tảng đã cập nhật')).toBeVisible();
  await expect(page.getByText('Năng lực CMS', { exact: true })).toBeVisible();
  await expect(page.getByText('1.234', { exact: true })).toBeVisible();
  await expect(page.getByText('0', { exact: true })).toBeVisible();
  await expect(page.getByText('Cam kết CMS', { exact: true })).toBeVisible();
  await expect(page.getByText(branch.name, { exact: true })).toBeVisible();
  await expect(page.locator('footer')).toContainText(settings.headquarters);
  await expect(page.locator('footer')).toContainText(settings.hotline);
  await expect(page.locator('footer')).toContainText(settings.email);
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('homepage.png'), fullPage: true });
});

test('contact uses API branch features and retains input when sending fails', async ({ page }) => {
  await mockContent(page);
  await page.route('**/api/contacts', route => route.fulfill({ status: 500, json: { error: 'Gửi thất bại, thử lại' } }));
  await page.goto('/lien-he');
  await expect(page.getByRole('heading', { name: branch.name })).toBeVisible();
  await expect(page.getByText('Dịch vụ CMS', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: settings.hotline }).first()).toHaveAttribute('href', 'tel:0987654321');
  await expect(page.getByRole('link', { name: 'Chỉ Đường' })).toHaveAttribute('href', /query=%C4%90/);
  await page.getByPlaceholder('Nguyễn Văn A').fill('Khách thử nghiệm');
  await page.locator('input[type="tel"]').fill('0901234567');
  await page.getByRole('combobox').selectOption(branch.name);
  await page.getByRole('button', { name: 'Gửi Yêu Cầu Cho Kim Sơn' }).click();
  await expect(page.getByRole('alert')).toContainText('Gửi thất bại');
  await expect(page.getByPlaceholder('Nguyễn Văn A')).toHaveValue('Khách thử nghiệm');
  await expect(page.getByRole('heading', { name: 'Cảm Ơn Quý Khách!' })).toHaveCount(0);
});

test('empty CMS collections do not show sample slides, pillars or branches', async ({ page }) => {
  await mockContent(page, { pillars: [], branches: [], esg: [] });
  await page.goto('/');
  await expect(page.getByText('Nội dung đang được cập nhật.', { exact: true })).toBeVisible();
  await expect(page.getByText('Chưa có tin tức được công bố.', { exact: true })).toBeVisible();
  await expect(page.getByRole('img', { name: /Kiến Tạo Chuỗi Giá Trị/ })).toHaveCount(0);
  await expect(page.locator('footer').getByText('Kim Sơn Auto Distribution')).toHaveCount(0);
  await page.goto('/lien-he');
  await expect(page.getByText('Danh sách chi nhánh đang được cập nhật.')).toBeVisible();
  await expect(page.getByRole('combobox').locator('option')).toHaveCount(1);
  await page.goto('/mang-luoi');
  await expect(page.getByText('Danh sách chi nhánh đang được cập nhật.')).toBeVisible();
});

test('public shell deduplicates CMS and session requests across navigation', async ({ page }) => {
  const counts = new Map();
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    counts.set(path, (counts.get(path) || 0) + 1);
    if (path === '/api/auth/me') return route.fulfill({ status: 401, json: { error: 'Unauthenticated' } });
    if (path === '/api/settings') return route.fulfill({ json: settings });
    if (path === '/api/pillars') return route.fulfill({ json: [pillar] });
    if (path === '/api/branches') return route.fulfill({ json: [branch] });
    return route.fulfill({ json: [] });
  });
  await page.goto('/');
  await expect(page).toHaveTitle('Website CMS');
  await expect.poll(() => counts.get('/api/esg')).toBe(1);
  for (const path of ['/api/auth/me', '/api/settings', '/api/pillars', '/api/branches', '/api/esg']) {
    expect(counts.get(path), path).toBe(1);
  }
  await page.getByRole('link', { name: /Tìm hiểu thêm về tầm nhìn/i }).click();
  await expect(page).toHaveURL('/about');
  for (const path of ['/api/auth/me', '/api/settings', '/api/pillars', '/api/branches', '/api/esg']) {
    expect(counts.get(path), path).toBe(1);
  }
});
