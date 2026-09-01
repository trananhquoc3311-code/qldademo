'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { getFirebaseFirestore } from '@/lib/firebase'
import { ProtectedRoute } from '@/components/ProtectedRoute'

type TaskRecord = {
  id: string
  title: string
  description: string
  assignee: string
  status: string
  priority: string
  projectId: string
  sourceDocumentId: string
  sourceDocumentNumber: string
}

export default function FirestoreTestPage() {
  return (
    <ProtectedRoute>
      <FirestoreTestContent />
    </ProtectedRoute>
  )
}

function FirestoreTestContent() {
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTasks() {
      try {
        const db = getFirebaseFirestore()

        const tasksCollection = collection(db, 'tasks')

        const snapshot = await getDocs(tasksCollection)

        const taskList: TaskRecord[] = snapshot.docs.map((taskDocument) => {
          const data = taskDocument.data()

          return {
            id: taskDocument.id,
            title: data.title ?? '',
            description: data.description ?? '',
            assignee: data.assignee ?? '',
            status: data.status ?? '',
            priority: data.priority ?? '',
            projectId: data.projectId ?? '',
            sourceDocumentId: data.sourceDocumentId ?? '',
            sourceDocumentNumber: data.sourceDocumentNumber ?? '',
          }
        })

        setTasks(taskList)
      } catch (caughtError) {
        console.error('Không thể đọc tasks:', caughtError)

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Không thể đọc dữ liệu Firestore.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        Đang đọc dữ liệu Firestore...
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-red-300">
        <h1 className="text-xl font-semibold">Có lỗi xảy ra</h1>
        <p className="mt-3">{error}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="text-2xl font-semibold">Kiểm tra Firestore</h1>

      <p className="mt-2 text-slate-400">
        Số task đọc được: {tasks.length}
      </p>

      <div className="mt-6 space-y-4">
        {tasks.map((task) => (
          <article
            key={task.id}
            className="rounded-xl border border-white/10 bg-slate-900 p-5"
          >
            <p className="text-xs text-cyan-300">
              {task.sourceDocumentNumber}
            </p>

            <h2 className="mt-2 text-lg font-semibold">
              {task.title}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {task.description}
            </p>

            <div className="mt-4 space-y-1 text-sm">
              <p>Phụ trách: {task.assignee}</p>
              <p>Trạng thái: {task.status}</p>
              <p>Ưu tiên: {task.priority}</p>
              <p>Dự án: {task.projectId}</p>
            </div>

            <p className="mt-4 break-all text-xs text-slate-500">
              Document nguồn: {task.sourceDocumentId}
            </p>
          </article>
        ))}
      </div>

      {tasks.length === 0 && (
        <p className="mt-6 text-amber-300">
          Không tìm thấy dữ liệu trong collection tasks.
        </p>
      )}
    </main>
  )
}