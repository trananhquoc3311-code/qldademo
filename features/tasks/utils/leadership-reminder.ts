import type { TaskReminder } from '@/features/tasks/types/task'

const HIDDEN_STATUSES = new Set(['done', 'completed', 'closed', 'cancelled'])
const IMMEDIATE_ATTENTION_TYPES = new Set(['manual', 'decision_required', 'blocked', 'risk'])
const THREE_DAYS = 3 * 24 * 60 * 60 * 1000

export const LEADERSHIP_ATTENTION_OPTIONS = [
  { value: 'manual', label: 'Lãnh đạo cần lưu ý' },
  { value: 'decision_required', label: 'Chờ lãnh đạo quyết định' },
  { value: 'blocked', label: 'Công việc đang vướng mắc' },
  { value: 'risk', label: 'Có rủi ro cần báo cáo' },
  { value: 'due_soon', label: 'Sắp đến hạn xử lý' },
] as const

export const LEADERSHIP_PRIORITY_OPTIONS = [
  { value: 'normal', label: 'Bình thường' },
  { value: 'high', label: 'Cao' },
  { value: 'critical', label: 'Khẩn cấp' },
] as const

export function leadershipAttentionLabel(value: string): string {
  return LEADERSHIP_ATTENTION_OPTIONS.find((item) => item.value === value)?.label ?? 'Cần lãnh đạo lưu ý'
}

export function isLeadershipReminder(task: TaskReminder, currentTime: number): boolean {
  if (!task.requiresLeadershipAttention || HIDDEN_STATUSES.has(task.status)) return false
  if (IMMEDIATE_ATTENTION_TYPES.has(task.attentionType)) return true
  if (!task.dueDate) return false

  const remainingTime = task.dueDate.getTime() - currentTime
  if (remainingTime < 0) return true
  return ['high', 'critical'].includes(task.priority) && remainingTime <= THREE_DAYS
}

export function leadershipReminderScore(task: TaskReminder, currentTime: number): number {
  const overdue = Boolean(task.dueDate && task.dueDate.getTime() < currentTime)
  if (overdue && task.priority === 'critical') return 600
  if (overdue) return 500
  if (task.attentionType === 'decision_required') return 400
  if (task.attentionType === 'blocked') return 350
  if (task.attentionType === 'risk') return 300
  if (task.priority === 'critical') return 250
  if (task.priority === 'high') return 200
  return 100
}
