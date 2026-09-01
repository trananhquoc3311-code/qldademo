'use client'

import { useEffect, useMemo, useState } from 'react'
import { subscribeTaskReminders } from '@/features/tasks/services/task-service'
import type { TaskReminder } from '@/features/tasks/types/task'
import {
  isLeadershipReminder,
  leadershipReminderScore,
} from '@/features/tasks/utils/leadership-reminder'

export function useTaskReminders() {
  const [tasks, setTasks] = useState<TaskReminder[]>([])
  const [currentTime, setCurrentTime] = useState(() => Date.now())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      return subscribeTaskReminders(
        (nextTasks) => {
          setTasks(nextTasks)
          setError('')
          setLoading(false)
        },
        (message) => {
          setError(message)
          setLoading(false)
        },
      )
    } catch (caughtError) {
      console.error('Không thể khởi tạo listener tasks:', caughtError)
      const message = caughtError instanceof Error ? caughtError.message : 'Không thể đọc dữ liệu Firestore.'
      queueMicrotask(() => {
        setError(message)
        setLoading(false)
      })
      return () => {}
    }
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const reminders = useMemo(
    () => tasks
      .filter((task) => isLeadershipReminder(task, currentTime))
      .sort((left, right) => {
        const scoreDifference = leadershipReminderScore(right, currentTime) - leadershipReminderScore(left, currentTime)
        if (scoreDifference) return scoreDifference
        return (left.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER) - (right.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER)
      }),
    [currentTime, tasks],
  )

  return { reminders, loading, error }
}
