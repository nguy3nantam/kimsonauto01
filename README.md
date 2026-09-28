# Kim Sơn Auto

Website React/Vite và API Express. Dữ liệu được lưu trong SQLite; thư mục uploads chứa ảnh và tài liệu nội bộ.

## Chạy và kiểm tra

Dùng Node.js 22.16 trở lên (Docker dùng Node 24).

```sh
npm ci
npm run lint
npm test
npm run build
PORT=3001 npm start
```

Khi phát triển, chạy thêm `npm run dev`; Vite chuyển request API tới backend cổng 3001 theo `vite.config.js`. Nếu Docker đang dùng cổng 3001, cần dừng bản Docker hoặc đổi cả cổng backend và proxy trước khi chạy bản phát triển. Các bài test tạo dữ liệu và uploads trong thư mục tạm, không dùng dữ liệu triển khai.

Kiểm tra giao diện bằng Chromium ở kích thước desktop/mobile:

```sh
npx playwright install --with-deps chromium
npm run test:ui
```

Playwright tự mở Vite ở cổng 4173 và mock API cho các tình huống CMS, slider, tin tức, upload/download và lỗi form. Bộ này kiểm tra hành vi trình duyệt; `npm test` kiểm tra API/SQLite thật trong dữ liệu tạm. Không chạy hai bộ Playwright đồng thời trên cùng cổng. Trace khi lỗi nằm trong `test-results/` (đã được ignore).

## Dữ liệu và đăng nhập

- `DATA_DIR`: mặc định `server/data`; `UPLOADS_DIR`: mặc định `server/uploads`.
- Lần chạy đầu nhập các collection JSON seed vào `kimsonauto.sqlite`. Image Docker giữ một bản seed riêng ngoài volume, nên volume mới có thể khởi tạo an toàn. Sau đó SQLite là nguồn dữ liệu chính; sửa JSON sẽ không cập nhật database đã nhập.
- Khi danh sách users rỗng, đặt `ADMIN_USERNAME` và `ADMIN_PASSWORD` (ít nhất 12 ký tự) để tạo quản trị viên. Nếu không đặt mật khẩu, backend tạo ngẫu nhiên và lưu trong `DATA_DIR/bootstrap-credentials.txt`. Chỉ có tác dụng khi tạo tài khoản đầu tiên.
- Session dùng cookie HttpOnly. Đặt `COOKIE_SECURE=true` khi phục vụ qua HTTPS; đặt `PUBLIC_URL` thành địa chỉ website để tạo sitemap.
- `docker compose up -d --build` triển khai ở `http://localhost:3001`, dùng volumes cho data và uploads. Kiểm tra `docker compose ps` và `/api/health` sau triển khai.

## Sao lưu và phục hồi

Dừng các tiến trình ứng dụng ghi dữ liệu trước khi sao lưu để database và tài liệu cùng trạng thái. Chạy backup bằng cùng user có quyền đọc data/uploads. Với bản chạy trực tiếp:

```sh
DATA_DIR=/path/to/data UPLOADS_DIR=/path/to/uploads BACKUP_DIR=/path/to/backups npm run backup
```

Với Compose, dùng image đã build có script backup:

```sh
mkdir -p backups
docker compose stop web
docker compose run --rm --no-deps -v "$PWD/backups:/backups" -e BACKUP_DIR=/backups web npm run backup
docker compose start web
```

Thư mục backups trên host phải cho phép user `node` trong container ghi. Nếu backup lỗi, xử lý lỗi và chạy lại; không coi thư mục chưa có manifest là bản sao lưu hoàn tất.

Mỗi bản sao lưu có `data/kimsonauto.sqlite`, `uploads/`, `manifest.json`. Script lấy snapshot SQLite bao gồm dữ liệu WAL đã commit và kiểm tra toàn vẹn; không sao chép mật khẩu bootstrap. Bảo quản backup như dữ liệu nội bộ vì có tài khoản, session và tài liệu.

Để phục hồi: dừng ứng dụng, giữ lại data/uploads hiện tại làm bản dự phòng, chép hai thư mục của backup vào **thư mục hoặc volumes mới, rỗng**, cấp quyền cho user chạy ứng dụng, rồi cấu hình `DATA_DIR`/`UPLOADS_DIR` hoặc Compose mounts tới đó. Không trộn database phục hồi với file `-wal`/`-shm` cũ. Khởi động và kiểm tra đăng nhập, nội dung và tải tài liệu. Nếu cần thu hồi các phiên trong backup, xóa các hàng trong bảng `sessions` trên bản phục hồi trước khi khởi động.

## Phần còn cần hoàn thiện

Trang chủ, footer, trang mạng lưới và liên hệ dùng dữ liệu CMS cho các phần đã quản lý (thông tin công ty, thống kê, trụ cột, chi nhánh; trang chủ còn lấy ESG). Mảng rỗng hợp lệ được giữ nguyên. Preview slider chỉ hiển thị ảnh; tin tức có URL chi tiết và nội dung thuần từ CMS; cổng nội bộ tải lên/tải xuống file thật, đánh dấu tài liệu cũ chưa có tệp.

Còn cần kiểm tra trên dữ liệu triển khai và trình duyệt khác Chromium, đồng bộ nội dung tĩnh ở trang giới thiệu/ESG. Compose là cách chạy full stack được mô tả ở đây; workflow còn lại chỉ kiểm tra lint, test và build. Các thay đổi chỉ nằm ở mã nguồn cho đến khi build và triển khai image mới.
