'use client'

import { useState } from 'react'
import { toggleTaskRead } from '@/features/tasks/services/task-service'
import type { TaskReminder } from '@/features/tasks/types/task'
import { formatVnDate } from '@/features/documents/utils/document-formatters'
import { leadershipAttentionLabel } from '@/features/tasks/utils/leadership-reminder'

function priorityDotClass(priority: string): string {
  if (priority === 'critical') return 'bg-red-400'
  if (priority === 'high') return 'bg-amber-300'
  return 'bg-emerald-300'
}

type Props = {
  reminders: TaskReminder[]
  loading: boolean
  error: string
  uid: string
}

export function LeadershipReminders({ reminders, loading, error, uid }: Props) {
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)
  const [toggleError, setToggleError] = useState('')
  const unread = reminders.filter((item) => !item.readBy.includes(uid)).length

  async function handleToggle(task: TaskReminder) {
    if (!uid || updatingTaskId) return
    setUpdatingTaskId(task.id)
    setToggleError('')
    try {
      await toggleTaskRead(task, uid)
    } catch (caughtError) {
      console.error('Không thể cập nhật readBy:', caughtError)
      setToggleError(caughtError instanceof Error ? caughtError.message : 'Không thể cập nhật trạng thái đã đọc.')
    } finally {
      setUpdatingTaskId(null)
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111a30] p-5">
      <div className="flex items-center justify-between">
        <div><h3 className="font-semibold">Nhắc việc lãnh đạo</h3><p className="mt-1 text-xs text-slate-500">Các việc cần lưu ý hôm nay</p></div>
        <span className="text-xs text-red-300">{unread} chưa đọc</span>
      </div>
      <div className="mt-5 space-y-3">
        {loading && <p className="text-xs text-slate-500">Đang tải nhắc việc...</p>}
        {error && <p className="text-xs text-red-300">{error}</p>}
        {toggleError && <p className="text-xs text-red-300">{toggleError}</p>}
        {reminders.length === 0 && !loading && !error && <p className="text-xs text-slate-500">Hiện không có công việc cần nhắc.</p>}
        {reminders.map((item) => {
          const isUpdating = updatingTaskId === item.id
          const isRead = item.readBy.includes(uid)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleToggle(item)}
              disabled={isUpdating || !uid}
              className="relative flex w-full items-start gap-3 rounded-xl border border-white/10 p-3 text-left hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating && <span className="absolute inset-0 z-10 grid place-items-center bg-black/20"><span className="size-5 animate-spin rounded-full border-b-2 border-white" /></span>}
              <span className={`mt-1 size-2 rounded-full ${priorityDotClass(item.priority)}`} />
              <span>
                <span className={`block text-sm ${isRead ? 'line-through opacity-60' : ''}`}>{item.title}</span>
                <span className="mt-1 block text-[11px] text-amber-300/80">{leadershipAttentionLabel(item.attentionType)}</span>
                <span className="mt-1 block text-xs text-slate-500">{item.assignee} · Hạn {formatVnDate(item.dueDate)} · {item.sourceDocumentNumber}</span>
                {item.leadershipNote && <span className="mt-1 block text-xs leading-5 text-slate-400">{item.leadershipNote}</span>}
              </span>
              {isRead && <span className="ml-auto text-xs text-emerald-300">Đã đọc</span>}
            </button>
          )
        })}
      </div>
    </section>
  )
}
