# 6. Kiểm thử Boundary & Edge Cases

| TC ID | Tên | Mô tả | Kết quả mong đợi |
|---|---|---|---|
| TC-EDGE-001 | Giá trị âm cho `totalWeightGrams` | POST inventory với `totalWeightGrams = -100` | Hiện tại: `201` (chưa validate). Mong muốn: `400 Bad Request` |
| TC-EDGE-002 | Giá trị lớn cho `dailyPortionGrams` | POST inventory `dailyPortionGrams = 999999` | `201` — nhưng `remainingDays` sẽ rất nhỏ (< 1) |
| TC-EDGE-003 | UUID format sai cho `petId` | POST inventory với `petId = "abc123"` | `500` — Prisma foreign key error |
| TC-EDGE-004 | `nextDueDate` trong quá khứ | POST Schedule với `nextDueDate` đã qua | `201` — tạo thành công nhưng sẽ không xuất hiện trong `upcoming` |
| TC-EDGE-005 | Tạo nhiều inventory cho cùng 1 pet | POST 3 inventory khác nhau cho 1 pet | `200` — Get by petId trả về mảng 3 items, mỗi item có `remainingDays` riêng |
