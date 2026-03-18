# 5. Kiểm thử Tích hợp End-to-End (E2E UI Tests)

*Ghi chú: Kịch bản được thiết kế mô phỏng hành vi của người dùng thật (hoặc Browser Subagent) khi tương tác trực tiếp lên giao diện ứng dụng (UI).*

#### TC-E2E-001: Luồng hoàn chỉnh — Tạo Pet → Tạo Kho Thức Ăn → Kiểm tra Dự Báo (Forecasting)

| Bước | Hành động (UI Interaction) | Kết quả mong đợi |
|---|---|---|
| 1 | Mở trình duyệt, truy cập `http://localhost:5173/pets` (hoặc click 'Thú Cưng' trên Sidebar). Nhấp vào nút "Thêm Thú Cưng". | Popup/Form thêm thú cưng hiển thị. |
| 2 | Nhập tên "Chó Corgi", chọn loại "Chó" (dog), và nhập cân nặng 12. Nhấp nút "Lưu". | Popup đóng, danh sách cập nhật hiển thị "Chó Corgi". |
| 3 | Chuyển sang trang `Kho Thức Ăn` (`/inventory`). Nhấp nút "Thêm Kho" / "Cập Nhật". | Form quản lý thức ăn hiển thị. |
| 4 | Chọn thú cưng "Chó Corgi" từ Dropdown. Nhập tên thức ăn "Royal Canin", Tổng khối lượng "3000", Khẩu phần ăn hàng ngày "150". Nhấp "Lưu". | Danh sách kho thức ăn hiển thị Royal Canin của Chó Corgi. |
| 5 | Kiểm tra thông tin hiển thị tại dòng của Chó Corgi trong danh sách thức ăn. | Ứng dụng tự động tính và hiển thị "Còn 20 ngày" và "3000g". |
| 6 | Quay lại màn hình chủ (Dashboard `http://localhost:5173/`). Cuộn qua các thẻ thông tin cảnh báo. | Dashboard hiển thị cảnh báo tương ứng nếu sắp hết hoặc các số liệu tổng quan chuẩn xác. |
| **Mức độ ưu tiên** | 🔴 Critical | |

#### TC-E2E-002: Luồng hoàn chỉnh — Tạo Pet → Tạo Lịch Trình → Kiểm tra Upcoming

| Bước | Hành động (UI Interaction) | Kết quả mong đợi |
|---|---|---|
| 1 | Truy cập trang `Thú Cưng` (`/pets`) và nhấp "Thêm Thú Cưng". | Popup/Form thêm thú cưng hiển thị. |
| 2 | Nhập tên "Cá Neon", chọn loại "Cá" (fish). Nhấp nút "Lưu". | Danh sách hiển thị thêm "Cá Neon". |
| 3 | Chuyển sang trang `Lịch Trình` (`/schedules`). Nhấp "Thêm Lịch". | Form hẹn/lịch trình hiển thị. |
| 4 | Chọn thú cưng "Cá Neon", chọn loại sự kiện "Thay nước" (water_change), và chọn ngày hẹn là **Ngày mai**. Nhấp "Lưu". | Lịch trình mới được thêm vào danh sách quản lý. |
| 5 | Quay lại màn hình `Dashboard`. Kiểm tra phần thẻ "Sắp tới hạn" hoặc "Lịch Y tế". | Thấy hiển thị sự kiện thay nước của Cá Neon ở trạng thái sắp tới hạn. |
| **Mức độ ưu tiên** | 🔴 Critical | |

#### TC-E2E-003: Luồng — Update Inventory reset lại Forecasting

| Bước | Hành động (UI Interaction) | Kết quả mong đợi |
|---|---|---|
| 1 | Tại trang `Kho Thức Ăn` (`/inventory`), xem danh sách kho của "Chó Corgi" (Đang có 3000g, 150g/ngày). | Hiển thị còn 3000g / 20 ngày. |
| 2 | *Hành động hệ thống (Mô phỏng)*: Database cập nhật `lastUpdatedDate` là 10 ngày trước, sau đó reload lại trang (F5). | Giao diện tự động trừ số lượng thức ăn đi 10 ngày, hiển thị còn lại "1500g" và "10 ngày". |
| 3 | Nhấp "Sửa" hoặc "Cập nhật Kho" trên dòng của Chó Corgi. | Form chỉnh sửa mở ra kèm dữ liệu hiện tại. |
| 4 | Sửa ô Tổng khối lượng thành "5000" (người dùng mới mua thêm thức ăn dự trữ), các thông số khác giữ nguyên. Nhấp "Lưu". | Giao diện tự động tính toán lại và hiển thị số lượng đúng: "5000g", dự báo "Còn 33 ngày" (5000/150). |
| **Mức độ ưu tiên** | 🔴 Critical | |
