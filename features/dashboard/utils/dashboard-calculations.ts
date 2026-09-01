import type { ProjectDocument } from '@/features/documents/types/document'
import { isCompletedStatus, isDocumentOverdue } from '@/features/documents/utils/document-status'
import { addDays } from '@/features/dashboard/utils/date'

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export type DashboardMetrics = {
  newThisWeek: number
  backlog: number
  completedCumulative: number
  inProgressCumulative: number
  overdue: number
}

export function documentsInWeek(documents: ProjectDocument[], weekStart: number): ProjectDocument[] {
  const weekEnd = addDays(new Date(weekStart), 7).getTime()
  return documents.filter((document) => {
    const date = document.issuedDate ?? document.createdAt
    return Boolean(date && date.getTime() >= weekStart && date.getTime() < weekEnd)
  })
}

export function calculateDashboardMetrics(
  documents: ProjectDocument[],
  weekStart: number,
  currentTime: number,
): DashboardMetrics {
  const weekEnd = addDays(new Date(weekStart), 7).getTime()
  const evaluationTime = Math.min(currentTime, weekEnd - 1)
  return documents.reduce<DashboardMetrics>((metrics, document) => {
    const date = document.issuedDate ?? document.createdAt
    if (!date || date.getTime() >= weekEnd) return metrics

    const documentTime = date.getTime()
    const completed = isCompletedStatus(document.workflowStatus)
    if (documentTime >= weekStart) metrics.newThisWeek += 1
    if (completed) {
      metrics.completedCumulative += 1
    } else {
      metrics.inProgressCumulative += 1
      if (documentTime < weekStart) metrics.backlog += 1
      if (isDocumentOverdue(document, evaluationTime)) metrics.overdue += 1
    }
    return metrics
  }, { newThisWeek: 0, backlog: 0, completedCumulative: 0, inProgressCumulative: 0, overdue: 0 })
}

export function calculateWeeklyTrend(documents: ProjectDocument[]) {
  const trend = WEEKDAYS.map((day) => ({ day, total: 0, completed: 0 }))
  documents.forEach((document) => {
    const date = document.issuedDate ?? document.createdAt
    if (!date) return
    const dayIndex = (date.getDay() + 6) % 7
    trend[dayIndex].total += 1
    if (isCompletedStatus(document.workflowStatus)) trend[dayIndex].completed += 1
  })
  return trend
}
