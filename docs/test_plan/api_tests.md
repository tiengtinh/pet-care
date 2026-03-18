# 3. Kiểm thử Backend API (API Tests)

### 3.1. Health Check

#### TC-API-001: Endpoint `/api/health`

| Mục | Chi tiết |
|---|---|
| **Bước thực hiện** | `curl http://localhost:3000/api/health` |
| **Kết quả mong đợi** | `200 OK` — Body: `{"status":"ok"}` |
| **Mức độ ưu tiên** | 🟡 Medium |

---

### 3.2. Module: Pet (Quản lý Thú cưng)

#### TC-PET-001: Tạo thú cưng mới — Happy Path

| Mục | Chi tiết |
|---|---|
| **Mô tả** | Tạo một pet mới với đầy đủ thông tin hợp lệ |
| **Bước thực hiện** | `POST /api/pets` với body: |
| **Request Body** | ```json {"name":"Corgi","type":"dog","breed":"Welsh Corgi","dob":"2024-01-15","weight":12.5,"imageUrl":"https://example.com/corgi.jpg"} ``` |
| **Kết quả mong đợi** | `201 Created` — Response chứa `id` (UUID), `name`, `type`, `breed`, `dob`, `weight`, `imageUrl`, `createdAt` |
| **Mức độ ưu tiên** | 🔴 Critical |

#### TC-PET-002: Tạo thú cưng — Chỉ trường bắt buộc

| Mục | Chi tiết |
|---|---|
| **Mô tả** | Tạo pet chỉ với `name` và `type` (các trường optional bỏ trống) |
| **Request Body** | ```json {"name":"Mèo Mướp","type":"cat"} ``` |
| **Kết quả mong đợi** | `201 Created` — `breed`, `dob`, `weight`, `imageUrl` = `null` |
| **Mức độ ưu tiên** | 🟠 High |

#### TC-PET-003: Tạo thú cưng — Thiếu trường bắt buộc `name`

| Mục | Chi tiết |
|---|---|
| **Mô tả** | Gửi request thiếu trường `name` |
| **Request Body** | ```json {"type":"fish"} ``` |
| **Kết quả mong đợi** | `500 Internal Server Error` (Prisma ném lỗi required field) — Body chứa `{"error":"Failed to create pet"}` |
| **Lưu ý** | ⚠️ Hiện tại chưa có validation layer (Zod). Nên trả `400 Bad Request` trong tương lai. |
| **Mức độ ưu tiên** | 🟠 High |

#### TC-PET-004: Lấy danh sách tất cả thú cưng

| Mục | Chi tiết |
|---|---|
| **Pre-condition** | Đã tạo ≥ 2 pets |
| **Bước thực hiện** | `GET /api/pets` |
| **Kết quả mong đợi** | `200 OK` — Mảng JSON chứa tất cả pets, sắp xếp theo `createdAt` giảm dần (pet mới nhất đứng đầu) |
| **Mức độ ưu tiên** | 🔴 Critical |

#### TC-PET-005: Lấy danh sách pets khi DB trống

| Mục | Chi tiết |
|---|---|
| **Pre-condition** | DB không có pet nào |
| **Bước thực hiện** | `GET /api/pets` |
| **Kết quả mong đợi** | `200 OK` — Body: `[]` (mảng rỗng) |
| **Mức độ ưu tiên** | 🟡 Medium |

#### TC-PET-006: Lấy chi tiết 1 pet theo ID — Có tồn tại

| Mục | Chi tiết |
|---|---|
| **Pre-condition** | Đã tạo 1 pet và có `id` |
| **Bước thực hiện** | `GET /api/pets/{id}` |
| **Kết quả mong đợi** | `200 OK` — Response chứa thông tin pet kèm `inventory: []` và `healthSchedules: []` (include relations) |
| **Mức độ ưu tiên** | 🔴 Critical |

#### TC-PET-007: Lấy chi tiết pet — ID không tồn tại

| Mục | Chi tiết |
|---|---|
| **Bước thực hiện** | `GET /api/pets/non-existent-uuid-here` |
| **Kết quả mong đợi** | `404 Not Found` — Body: `{"error":"Pet not found"}` |
| **Mức độ ưu tiên** | 🟠 High |

---

### 3.3. Module: Inventory (Kho thức ăn & Khẩu phần)

#### TC-INV-001: Tạo bản ghi kho thức ăn

| Mục | Chi tiết |
|---|---|
| **Pre-condition** | Đã tạo 1 pet (lấy `petId`) |
| **Request Body** | ```json {"petId":"<UUID>","foodName":"Royal Canin Medium Adult","totalWeightGrams":3000,"dailyPortionGrams":150} ``` |
| **Bước thực hiện** | `POST /api/inventory` |
| **Kết quả mong đợi** | `201 Created` — Response chứa `id`, `petId`, `foodName`, `totalWeightGrams` = 3000, `dailyPortionGrams` = 150, `lastUpdatedDate` |
| **Mức độ ưu tiên** | 🔴 Critical |

#### TC-INV-002: Tạo inventory — petId không hợp lệ

| Mục | Chi tiết |
|---|---|
| **Request Body** | ```json {"petId":"invalid-id","foodName":"Hạt Me-O","totalWeightGrams":1500,"dailyPortionGrams":50} ``` |
| **Kết quả mong đợi** | `500 Internal Server Error` — Prisma foreign key constraint violation |
| **Mức độ ưu tiên** | 🟠 High |

#### TC-INV-003: Lấy kho thức ăn theo petId + kiểm tra logic tính toán "Số ngày còn lại"

> [!IMPORTANT]
> Đây là test case QUAN TRỌNG NHẤT — kiểm tra Killer Feature logic forecasting.

| Mục | Chi tiết |
|---|---|
| **Pre-condition** | Đã tạo inventory với `totalWeightGrams = 3000`, `dailyPortionGrams = 150`, `lastUpdatedDate = NOW()` |
| **Bước thực hiện** | `GET /api/inventory/pet/{petId}` (gọi ngay sau khi tạo) |
| **Kết quả mong đợi** | `200 OK` — Response bao gồm: <br> • `remainingWeightGrams` = 3000 (vì daysPassed = 0) <br> • `remainingDays` = 20 (3000 / 150) |
| **Mức độ ưu tiên** | 🔴 Critical |

#### TC-INV-004: Logic tính toán — Sau nhiều ngày

| Mục | Chi tiết |
|---|---|
| **Mô tả** | Kiểm tra tính chính xác của công thức sau khi thời gian trôi qua |
| **Bước thực hiện** | Giả lập bằng cách cập nhật trực tiếp `lastUpdatedDate` trong DB về **5 ngày trước**: <br> `UPDATE "Inventory" SET "lastUpdatedDate" = NOW() - INTERVAL '5 days' WHERE id = '<UUID>';` <br> Sau đó gọi `GET /api/inventory/pet/{petId}` |
| **Kết quả mong đợi** | • `remainingWeightGrams` = 3000 - (5 × 150) = **2250** <br> • `remainingDays` = floor(2250 / 150) = **15** |
| **Mức độ ưu tiên** | 🔴 Critical |

#### TC-INV-005: Logic tính toán — Khi thức ăn đã hết (quá hạn)

| Mục | Chi tiết |
|---|---|
| **Mô tả** | Kiểm tra edge case khi số ngày qua > tổng ngày dự trữ |
| **Bước thực hiện** | Cập nhật `lastUpdatedDate` về **30 ngày trước** (vượt quá 20 ngày dự trữ), gọi API |
| **Kết quả mong đợi** | • `remainingWeightGrams` = **0** (không được trả số âm!) <br> • `remainingDays` = **0** |
| **Mức độ ưu tiên** | 🔴 Critical |

#### TC-INV-006: Logic tính toán — `dailyPortionGrams = 0`

| Mục | Chi tiết |
|---|---|
| **Mô tả** | Edge case khi khẩu phần = 0 (tránh chia cho 0) |
| **Bước thực hiện** | Tạo inventory với `dailyPortionGrams = 0`, gọi `GET /api/inventory/pet/{petId}` |
| **Kết quả mong đợi** | • `remainingWeightGrams` = `totalWeightGrams` (không tiêu hao) <br> • `remainingDays` = **0** (theo logic hiện tại) |
| **Mức độ ưu tiên** | 🟠 High |

#### TC-INV-007: Cập nhật thông tin kho thức ăn

| Mục | Chi tiết |
|---|---|
| **Pre-condition** | Đã tạo 1 inventory record |
| **Bước thực hiện** | `PUT /api/inventory/{id}` với body: ```json {"foodName":"Royal Canin Mini","totalWeightGrams":5000,"dailyPortionGrams":100} ``` |
| **Kết quả mong đợi** | `200 OK` — `totalWeightGrams` = 5000, `dailyPortionGrams` = 100, `lastUpdatedDate` được **reset về thời điểm hiện tại** |
| **Mức độ ưu tiên** | 🔴 Critical |

---

### 3.4. Module: Schedule (Lịch trình Y tế & Vệ sinh)

#### TC-SCH-001: Tạo lịch tiêm phòng (vaccine)

| Mục | Chi tiết |
|---|---|
| **Pre-condition** | Đã tạo 1 pet type = "dog" |
| **Request Body** | ```json {"petId":"<UUID>","eventType":"vaccine","eventName":"Tiêm phòng dại","lastDate":"2026-03-18","nextDueDate":"2027-02-18"} ``` |
| **Kết quả mong đợi** | `201 Created` — Response chứa đầy đủ thông tin với `eventType = "vaccine"` |
| **Mức độ ưu tiên** | 🔴 Critical |

#### TC-SCH-002: Tạo lịch thay nước (water_change)

| Mục | Chi tiết |
|---|---|
| **Pre-condition** | Đã tạo 1 pet type = "fish" |
| **Request Body** | ```json {"petId":"<UUID>","eventType":"water_change","eventName":"Thay 30% nước bể","lastDate":null,"nextDueDate":"2026-03-25"} ``` |
| **Kết quả mong đợi** | `201 Created` — `lastDate = null`, `nextDueDate` hợp lệ |
| **Mức độ ưu tiên** | 🔴 Critical |

#### TC-SCH-003: Lấy lịch trình sắp tới (Upcoming) — trong vòng 7 ngày

| Mục | Chi tiết |
|---|---|
| **Pre-condition** | Tạo 3 schedule: 1 event `nextDueDate` = ngày mai, 1 event = 5 ngày nữa, 1 event = 15 ngày nữa |
| **Bước thực hiện** | `GET /api/schedules/upcoming` |
| **Kết quả mong đợi** | `200 OK` — Response chỉ chứa **2 schedule** (ngày mai & 5 ngày nữa). Event 15 ngày nữa KHÔNG nằm trong kết quả. Sắp xếp theo `nextDueDate` tăng dần. Response include `pet.name` và `pet.type`. |
| **Mức độ ưu tiên** | 🔴 Critical |

#### TC-SCH-004: Lấy lịch trình — Không có event upcoming

| Mục | Chi tiết |
|---|---|
| **Pre-condition** | Tất cả schedule có `nextDueDate` > 7 ngày nữa |
| **Bước thực hiện** | `GET /api/schedules/upcoming` |
| **Kết quả mong đợi** | `200 OK` — Body: `[]` |
| **Mức độ ưu tiên** | 🟡 Medium |

#### TC-SCH-005: Lấy lịch trình theo petId

| Mục | Chi tiết |
|---|---|
| **Pre-condition** | Đã tạo ≥ 2 schedule cho cùng 1 pet |
| **Bước thực hiện** | `GET /api/schedules/pet/{petId}` |
| **Kết quả mong đợi** | `200 OK` — Danh sách schedule chỉ thuộc về pet đó, sắp xếp theo `nextDueDate` tăng dần |
| **Mức độ ưu tiên** | 🟠 High |
