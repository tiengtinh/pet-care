# Tài liệu Test Plan: Pet Care CRM (VibeCRM)

**Phiên bản:** 1.0  
**Ngày tạo:** 2026-03-18  
**Dựa trên:** [PRD](../../../.gemini/antigravity/brain/1aa1379a-4396-491b-90b4-211532660cc1/prd.md) & [Implementation Plan](../../../.gemini/antigravity/brain/1aa1379a-4396-491b-90b4-211532660cc1/implementation_plan.md)

---

## 1. Tổng quan (Overview)

### 1.1. Mục tiêu Test Plan
Đảm bảo toàn bộ hệ thống Pet Care CRM hoạt động đúng chức năng, ổn định, và đáp ứng các yêu cầu trong PRD, bao gồm:
- **Backend API** (NodeJS/Express + Prisma + PostgreSQL) xử lý chính xác nghiệp vụ CRUD cho 3 domain: Pet, Inventory, Schedule.
- **Logic nghiệp vụ** tính toán "Số ngày thức ăn còn lại" (Forecasting) trả về kết quả chính xác.
- **Frontend** (React + Vite) hiển thị giao diện Dashboard, điều hướng (Routing), và thẩm mỹ (UI/UX).
- **Hạ tầng** (Docker Compose) khởi chạy và liên kết các service thành công.

### 1.2. Phạm vi (Scope)

| Trong phạm vi (In Scope) | Ngoài phạm vi (Out of Scope) |
|---|---|
| API Backend: Health Check, Pet CRUD, Inventory CRUD + Logic, Schedule CRUD + Upcoming | Push Notifications (Phase 2) |
| Frontend: Routing, Dashboard UI, Sidebar Navigation | Authentication / Login (chưa implement) |
| Docker Compose: Khởi tạo 3 service | Load Testing / Performance Testing |
| Database Schema: Prisma Migration | Scan mã vạch (Phase 3) |

### 1.3. Môi trường Test

| Thành phần | Chi tiết |
|---|---|
| **OS** | macOS |
| **Runtime** | Node.js v21.7.3 |
| **Database** | PostgreSQL 16 (Docker container `pet_crm_db`) |
| **Backend** | `http://localhost:3000` |
| **Frontend** | `http://localhost:5173` |
| **Orchestration** | Docker Compose v3.8 |

### 1.4. Phân loại Test

- [Kiểm thử Hạ tầng (Infrastructure Tests)](./infrastructure_tests.md)
- [Kiểm thử Backend API (API Tests)](./api_tests.md)
- [Kiểm thử Frontend (UI Tests)](./ui_tests.md)
- [Kiểm thử Tích hợp End-to-End (E2E Integration Tests)](./e2e_tests.md)
- [Kiểm thử Boundary & Edge Cases](./edge_cases.md)

---

## Danh sách Lỗi Đã biết & Khuyến nghị Cải thiện

> [!WARNING]
> Các vấn đề sau đây đã được phát hiện trong quá trình phân tích mã nguồn. Chúng KHÔNG phải bug blocking nhưng nên được xử lý:

| # | Vấn đề | Mức độ | Khuyến nghị |
|---|---|---|---|
| 1 | **Thiếu Input Validation** — Hiện tại chưa có Zod validation middleware. Các request body không được kiểm tra trước khi đẩy vào DB. | 🟠 High | Thêm Zod schema validation cho từng endpoint trước khi xử lý nghiệp vụ |
| 2 | **Thiếu trang 404** — Frontend không có catch-all route cho URL không tồn tại | 🟡 Medium | Thêm `<Route path="*" element={<NotFound />} />` |
| 3 | **Thiếu Delete API** — Chưa có endpoint xoá Pet / Inventory / Schedule | 🟠 High | Bổ sung `DELETE /api/pets/:id`, etc. |
| 4 | **Sidebar không responsive** — Sidebar cố định 256px, không ẩn trên mobile | 🟡 Medium | Thêm hamburger menu cho viewport < 768px |
| 5 | **Dashboard hiển thị dữ liệu tĩnh (mock)** — Cards cảnh báo chưa fetch từ API thực | 🔴 Critical | Kết nối Dashboard với API `/api/schedules/upcoming` và `/api/inventory/pet/*` |
| 6 | **Unused imports** trong `Dashboard.tsx` — `React`, `useEffect`, `useState`, `axios`, `Package` | 🟢 Low | Xoá imports không sử dụng |

---

## Checklist Tổng kết Kiểm thử

| Nhóm | Tổng TC | Critical | High | Medium |
|---|---|---|---|---|
| Hạ tầng (Infrastructure) | 3 | 3 | 0 | 0 |
| API — Pet | 7 | 3 | 3 | 1 |
| API — Inventory | 7 | 4 | 2 | 0 |
| API — Schedule | 5 | 2 | 1 | 1 |
| Frontend UI | 7 | 2 | 2 | 3 |
| E2E Integration | 3 | 3 | 0 | 0 |
| Edge Cases | 5 | 0 | 0 | 5 |
| **Tổng cộng** | **37** | **17** | **8** | **10** |
