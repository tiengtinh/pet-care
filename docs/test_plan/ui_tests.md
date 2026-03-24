# 4. Kiểm thử Frontend (UI Tests)

### 4.1. Routing & Navigation

#### TC-UI-001: Trang Dashboard load mặc định

| Mục | Chi tiết |
|---|---|
| **Bước thực hiện** | Truy cập `http://localhost:5173/` |
| **Kết quả mong đợi** | Dashboard hiển thị với Banner hình ảnh thiên nhiên + 3 Cards cảnh báo. NavItem "Dashboard" ở Sidebar được highlight (active state). |
| **Mức độ ưu tiên** | 🔴 Critical |

#### TC-UI-002: Điều hướng giữa các trang

| Mục | Chi tiết |
|---|---|
| **Bước thực hiện** | Click lần lượt: "Thú Cưng" → "Kho Thức Ăn" → "Lịch Trình" → "Dashboard" trên Sidebar |
| **Kết quả mong đợi** | Mỗi lần click: <br> 1. URL thay đổi tương ứng (`/pets`, `/inventory`, `/schedules`, `/`) <br> 2. NavItem active highlight đúng mục đang chọn (màu warm/cam) <br> 3. Nội dung main content thay đổi |
| **Mức độ ưu tiên** | 🔴 Critical |

#### TC-UI-003: Truy cập URL không tồn tại

| Mục | Chi tiết |
|---|---|
| **Bước thực hiện** | Truy cập `http://localhost:5173/nonexistent` |
| **Kết quả mong đợi** | Trang trắng hoặc hiển thị nội dung default (hiện tại chưa có 404 page) |
| **Lưu ý** | ⚠️ Nên bổ sung trang 404 trong tương lai |
| **Mức độ ưu tiên** | 🟡 Medium |

### 4.2. Dashboard UI/UX

#### TC-UI-004: Banner hiển thị đúng

| Mục | Chi tiết |
|---|---|
| **Bước thực hiện** | Quan sát phần Banner trên Dashboard |
| **Kết quả mong đợi** | 1. Hình ảnh thiên nhiên/thú cưng chất lượng cao load thành công (không bị broken image) <br> 2. Text "Chào buổi sáng!" hiển thị rõ trên nền gradient tối <br> 3. Hover vào banner → hình ảnh zoom nhẹ (scale animation) |
| **Mức độ ưu tiên** | 🟠 High |

#### TC-UI-005: Thẻ cảnh báo (Warning Cards) hiển thị đúng

| Mục | Chi tiết |
|---|---|
| **Bước thực hiện** | Quan sát 3 thẻ Cards dưới Banner |
| **Kết quả mong đợi** | 1. Card "Cảnh báo khẩn cấp" — icon AlertCircle màu đỏ, text "Chỉ còn đủ dùng trong 3 ngày!" <br> 2. Card "Sắp tới hạn" — icon CalendarClock màu xanh nature <br> 3. Card "Lịch Y tế" — có hình ảnh mèo làm background mờ <br> 4. Hover vào mỗi card → card di chuyển lên nhẹ (-translate-y-1) |
| **Mức độ ưu tiên** | 🟠 High |

#### TC-UI-006: Sidebar — Branding & hình ảnh

| Mục | Chi tiết |
|---|---|
| **Bước thực hiện** | Kiểm tra Sidebar bên trái |
| **Kết quả mong đợi** | 1. Logo "PetCare" gradient text hiển thị rõ kèm icon PawPrint <br> 2. Ảnh thiên nhiên ở cuối Sidebar load thành công <br> 3. Hover vào ảnh → zoom nhẹ <br> 4. Text "CARE WITH LOVE" hiển thị trên ảnh |
| **Mức độ ưu tiên** | 🟡 Medium |

### 4.3. Responsive

#### TC-UI-007: Dashboard responsive trên mobile viewport

| Mục | Chi tiết |
|---|---|
| **Bước thực hiện** | Thu nhỏ trình duyệt xuống viewport ≤ 768px |
| **Kết quả mong đợi** | 1. Banner giảm chiều cao (h-64 thay vì h-80) <br> 2. 3 Cards cảnh báo xếp dọc (1 cột) thay vì 3 cột |
| **Lưu ý** | ⚠️ Sidebar hiện tại chưa có hamburger menu cho mobile. Cần bổ sung trong version sau. |
| **Mức độ ưu tiên** | 🟡 Medium |
