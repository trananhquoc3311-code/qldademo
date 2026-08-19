export type ReportStatus = 'Đã nhận' | 'Đang xử lý' | 'Chờ bổ sung' | 'Quá hạn'

export type Report = {
  id: string
  title: string
  unit: string
  owner: string
  receivedAt: string
  dueAt: string
  status: ReportStatus
  priority: 'Cao' | 'Trung bình' | 'Thấp'
}

export const reports: Report[] = [
  { id: 'BC-2026-071', title: 'Báo cáo tiến độ giải ngân quý III', unit: 'Phòng Tài chính', owner: 'Nguyễn Minh Anh', receivedAt: '18/08/2026', dueAt: '20/08/2026', status: 'Đang xử lý', priority: 'Cao' },
  { id: 'BC-2026-070', title: 'Tổng hợp chỉ tiêu cải cách hành chính', unit: 'Văn phòng', owner: 'Trần Thu Hà', receivedAt: '18/08/2026', dueAt: '22/08/2026', status: 'Đã nhận', priority: 'Trung bình' },
  { id: 'BC-2026-069', title: 'Kết quả thực hiện nhiệm vụ tháng 8', unit: 'Phòng Kế hoạch', owner: 'Lê Quốc Huy', receivedAt: '17/08/2026', dueAt: '19/08/2026', status: 'Chờ bổ sung', priority: 'Cao' },
  { id: 'BC-2026-068', title: 'Báo cáo công tác kiểm tra nội bộ', unit: 'Thanh tra', owner: 'Phạm Ngọc Lan', receivedAt: '16/08/2026', dueAt: '18/08/2026', status: 'Quá hạn', priority: 'Cao' },
  { id: 'BC-2026-067', title: 'Tình hình nhân sự và đào tạo', unit: 'Phòng Tổ chức', owner: 'Đỗ Hoàng Nam', receivedAt: '15/08/2026', dueAt: '25/08/2026', status: 'Đã nhận', priority: 'Thấp' },
]

export const weeklyTrend = [
  { day: 'T2', total: 8, completed: 5 }, { day: 'T3', total: 12, completed: 8 },
  { day: 'T4', total: 10, completed: 7 }, { day: 'T5', total: 15, completed: 10 },
  { day: 'T6', total: 13, completed: 9 }, { day: 'T7', total: 6, completed: 4 },
]
