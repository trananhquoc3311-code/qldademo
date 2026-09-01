import type { ProjectDocument } from '@/features/documents/types/document'

export const WORKFLOW_STATUS_OPTIONS = [
  { value: 'received', label: 'Đã nhận' },
  { value: 'assigned', label: 'Đã phân công' },
  { value: 'in_progress', label: 'Đang xử lý' },
  { value: 'pending_response', label: 'Chờ phản hồi' },
  { value: 'pending_information', label: 'Chờ bổ sung' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'closed', label: 'Đã đóng' },
] as const

const STATUS_LABELS = Object.fromEntries(WORKFLOW_STATUS_OPTIONS.map((item) => [item.value, item.label]))

export function workflowStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? (status ? status.replaceAll('_', ' ') : 'Đã nhận')
}

export function isCompletedStatus(status: string): boolean {
  return status === 'completed' || status === 'closed'
}

export function isDocumentOverdue(document: ProjectDocument, evaluationTime: number): boolean {
  return Boolean(
    document.handlingDueDate
      && !isCompletedStatus(document.workflowStatus)
      && document.handlingDueDate.getTime() < evaluationTime,
  )
}
