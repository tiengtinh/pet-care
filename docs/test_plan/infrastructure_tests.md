# 2. Kiểm thử Hạ tầng (Infrastructure Tests)

### TC-INFRA-001: Docker Compose khởi tạo thành công

| Mục | Chi tiết |
|---|---|
| **Mô tả** | Kiểm tra toàn bộ 3 container (db, backend, frontend) khởi động thành công bằng `docker compose up --build -d` |
| **Pre-condition** | Docker Desktop đang chạy, port 5432/3000/5173 trống |
| **Bước thực hiện** | 1. `cd /Users/tinhngo/go/vibe` <br> 2. `docker compose up --build -d` <br> 3. `docker compose ps` |
| **Kết quả mong đợi** | Cả 3 container đều có STATUS = `Up` hoặc `Running` |
| **Mức độ ưu tiên** | 🔴 Critical |

### TC-INFRA-002: Database volume persistence

| Mục | Chi tiết |
|---|---|
| **Mô tả** | Dữ liệu Database không bị mất khi restart container |
| **Pre-condition** | Đã tạo ít nhất 1 Pet record qua API |
| **Bước thực hiện** | 1. Tạo pet qua `POST /api/pets` <br> 2. `docker compose down` <br> 3. `docker compose up -d` <br> 4. `GET /api/pets` |
| **Kết quả mong đợi** | Pet đã tạo ở bước 1 vẫn còn tồn tại sau restart |
| **Mức độ ưu tiên** | 🔴 Critical |

### TC-INFRA-003: Prisma schema migration tự động

| Mục | Chi tiết |
|---|---|
| **Mô tả** | Khi backend khởi động, Prisma tự động `db push` schema lên PostgreSQL |
| **Pre-condition** | Container `db` đang running |
| **Bước thực hiện** | 1. Kiểm tra logs: `docker logs pet_crm_backend` <br> 2. Kết nối vào DB và kiểm tra bảng: `docker exec -it pet_crm_db psql -U user -d pet_crm -c "\dt"` |
| **Kết quả mong đợi** | Logs chứa "🚀 Your database is now in sync with your Prisma schema". DB có 3 bảng: `Pet`, `Inventory`, `HealthSchedule` |
| **Mức độ ưu tiên** | 🔴 Critical |
