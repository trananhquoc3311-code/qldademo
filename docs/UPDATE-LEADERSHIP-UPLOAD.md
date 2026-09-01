# Cập nhật nhắc việc lãnh đạo và tệp hồ sơ

## Vị trí lưu tệp

- Tệp thật: Firebase Storage tại `projects/HCM2_1/documents/{documentId}/{attachmentId}-{fileName}`.
- Metadata: field `attachments` của document tương ứng trong Firestore collection `documents`.
- Task lãnh đạo: collection `tasks`, document ID `leadership_{sourceDocumentId}`.

## Điều kiện hiển thị nhắc việc lãnh đạo

Task phải chưa hoàn thành/hủy, có `requiresLeadershipAttention: true` và thỏa một trong các điều kiện:

- `attentionType` là `manual`, `decision_required`, `blocked` hoặc `risk`;
- Đã quá `dueDate`;
- Còn tối đa 3 ngày tới hạn và `priority` là `high` hoặc `critical`.

Task cũ chưa có `requiresLeadershipAttention: true` sẽ không xuất hiện.

## Cài đặt

1. Chép toàn bộ nội dung gói cập nhật vào thư mục gốc `qldademo` và cho phép ghi đè.
2. Mở Firebase Console, kích hoạt Storage nếu dự án chưa sử dụng.
3. Xuất bản nội dung `storage.rules` tại Storage > Rules.
4. Xuất bản nội dung `firestore.rules` tại Firestore Database > Rules.
5. Chạy:

```bash
npm run lint
npm run build
npm run dev
```

Không cần cài package mới.

## Giới hạn tệp

- PDF, Word, Excel hoặc CSV.
- Tối đa 5 tệp mỗi lần chọn.
- Tối đa 25 MB mỗi tệp.
