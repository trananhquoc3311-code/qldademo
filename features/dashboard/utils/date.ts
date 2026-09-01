import { formatVnDate } from '@/features/documents/utils/document-formatters'

export function startOfWeek(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7))
  return result
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function formatWeekRange(weekStartTime: number): string {
  const weekStart = new Date(weekStartTime)
  return `${formatVnDate(weekStart)} - ${formatVnDate(addDays(weekStart, 6))}`
}

export function formatHeaderDate(currentTime: number): string {
  const formatted = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(currentTime))
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}
