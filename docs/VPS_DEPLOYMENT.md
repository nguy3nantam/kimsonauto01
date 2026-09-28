# Triển khai Docker từ GitHub lên VPS

Workflow `.github/workflows/container.yml` build image Linux AMD64, chạy các kiểm tra trong `Dockerfile`, đẩy image lên GHCR và triển khai qua SSH khi được bật.

## Yêu cầu VPS

- Linux có Docker Engine và Docker Compose v2.
- Tài khoản SSH có quyền chạy Docker.
- Reverse proxy chuyển domain tới `127.0.0.1:3001`.
- Hai Docker volume `kimsonauto_data` và `kimsonauto_uploads` giữ SQLite và file upload qua các lần cập nhật.

## GitHub Secrets

Tạo trong **Settings → Secrets and variables → Actions**:

- `VPS_HOST`: IP hoặc hostname của VPS.
- `VPS_USER`: tài khoản SSH.
- `VPS_PORT`: cổng SSH, có thể bỏ trống để dùng 22.
- `VPS_SSH_KEY`: private key dành riêng cho deploy.
- `VPS_KNOWN_HOSTS`: dòng known-host đã xác minh của VPS.

Tạo Variables:

- `VPS_DEPLOY_ENABLED=true`
- `VPS_APP_DIR=kimsonauto` hoặc đường dẫn tài khoản SSH có quyền ghi.
- `VPS_PUBLIC_URL=https://ten-mien.example`

Sau khi thiết lập, chạy workflow **Build container and deploy VPS** thủ công. Mỗi lần push vào `main` sau đó sẽ build image bất biến theo commit và chỉ thay container khi image đã build thành công.
