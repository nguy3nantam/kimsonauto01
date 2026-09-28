import { test, expect } from '@playwright/test';

const article = {
  id: 'cms-news-42',
  title: 'Thông cáo cập nhật từ CMS',
  category: 'Thông Cáo Báo Chí',
  date: '28/09/2026',
  readTime: '3 phút đọc',
  summary: 'Tóm tắt của bài viết được biên tập trong CMS.',
  content: 'Đây là nội dung chi tiết được lưu từ CMS.\n\nĐoạn thứ hai giữ nguyên tiếng Việt và xuống dòng.',
  image: '',
  status: 'published',
};

async function mockApi(page, handleNews) {
  await page.route('**/api/**', async route => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname === '/api/news' || pathname.startsWith('/api/news/')) {
      return handleNews(route, pathname);
    }
    if (pathname === '/api/auth/me') {
      return route.fulfill({ status: 401, json: { error: 'Chưa đăng nhập' } });
    }
    return route.fulfill({ json: pathname === '/api/settings' ? {} : [] });
  });
}

test('news cards open full CMS articles and return to the list', async ({ page }) => {
  await mockApi(page, (route, pathname) => route.fulfill({
    json: pathname === '/api/news' ? [article] : article,
  }));

  await page.goto('/tin-tuc');
  const card = page.getByRole('main').getByRole('link', { name: new RegExp(article.title) });
  await expect(card).toHaveAttribute('href', `/tin-tuc/${article.id}`);
  await expect(page.getByText(article.content, { exact: true })).toHaveCount(0);
  await card.click();

  await expect(page).toHaveURL(`/tin-tuc/${article.id}`);
  await expect(page.getByRole('heading', { level: 1, name: article.title })).toBeVisible();
  await expect(page.getByText(article.content, { exact: true })).toBeVisible();
  await expect(page).toHaveTitle(`${article.title} - Kim Sơn Automobiles`);

  await page.getByRole('link', { name: 'Tất cả tin tức' }).click();
  await expect(page).toHaveURL('/tin-tuc');
  await expect(card).toBeVisible();
});

test('direct article URLs preserve plain text and never execute saved HTML', async ({ page }) => {
  const content = 'Dòng đầu tiên\n\n<img id="cms-injected-image" src="x" onerror="window.__newsExecuted = true">\n<script>window.__newsExecuted = true</script>\nDòng cuối cùng';
  await mockApi(page, (route, pathname) => route.fulfill({
    json: pathname === '/api/news' ? [article] : { ...article, content },
  }));

  await page.goto(`/tin-tuc/${article.id}`);
  const body = page.getByText(content, { exact: true });
  await expect(body).toBeVisible();
  await expect(body).toHaveCSS('white-space', 'pre-wrap');
  await expect(page.locator('article script, #cms-injected-image')).toHaveCount(0);
  expect(await page.evaluate(() => window.__newsExecuted)).toBeUndefined();

  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: article.title })).toBeVisible();
  await expect(body).toBeVisible();
});

test('missing or unpublished articles show a useful 404 state', async ({ page }) => {
  await mockApi(page, route => route.fulfill({
    status: 404,
    json: { error: 'Không tìm thấy bài viết' },
  }));

  await page.goto('/tin-tuc/khong-ton-tai');
  await expect(page.getByRole('heading', { level: 1, name: 'Không tìm thấy bài viết' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Bài viết không tồn tại hoặc chưa được xuất bản.');
  await expect(page.getByRole('link', { name: 'Tất cả tin tức' })).toHaveAttribute('href', '/tin-tuc');
  await expect(page.getByRole('button', { name: 'Thử lại', exact: true })).toHaveCount(0);
  await expect(page.locator('article')).toHaveCount(0);
});

test('news list errors can be retried without showing sample articles', async ({ page }) => {
  let available = false;
  await mockApi(page, route => route.fulfill(available
    ? { json: [article] }
    : { status: 503, json: { error: 'Tạm thời không khả dụng' } }));

  await page.goto('/tin-tuc');
  await expect(page.getByRole('alert')).toContainText('Chưa thể tải tin tức.');
  await expect(page.getByRole('main').locator('a[href^="/tin-tuc/"]')).toHaveCount(0);

  available = true;
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await expect(page.getByRole('heading', { level: 2, name: article.title })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('article errors can be retried to load the saved content', async ({ page }) => {
  let available = false;
  await mockApi(page, route => route.fulfill(available
    ? { json: article }
    : { status: 503, json: { error: 'Tạm thời không khả dụng' } }));

  await page.goto(`/tin-tuc/${article.id}`);
  await expect(page.getByRole('heading', { level: 1, name: 'Không thể tải bài viết' })).toBeVisible();
  await expect(page.locator('article')).toHaveCount(0);

  available = true;
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: article.title })).toBeVisible();
  await expect(page.getByText(article.content, { exact: true })).toBeVisible();
  await expect(page).toHaveTitle(`${article.title} - Kim Sơn Automobiles`);
});

test('an empty CMS list remains empty instead of restoring sample articles', async ({ page }) => {
  await mockApi(page, route => route.fulfill({ json: [] }));

  await page.goto('/tin-tuc');
  await expect(page.getByRole('status')).toHaveText('Chưa có tin tức được xuất bản.');
  await expect(page.getByRole('main').locator('a[href^="/tin-tuc/"]')).toHaveCount(0);
  await expect(page.getByRole('main').getByRole('heading', { level: 2 })).toHaveCount(0);
});
