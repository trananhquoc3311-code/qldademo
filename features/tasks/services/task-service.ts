import { arrayRemove, arrayUnion, collection, doc, onSnapshot, updateDoc, type Unsubscribe } from 'firebase/firestore'
import { getFirebaseFirestore } from '@/lib/firebase'
import type { TaskReminder } from '@/features/tasks/types/task'
import { safeString, safeStringArray, toDate } from '@/features/documents/utils/document-formatters'

export function subscribeTaskReminders(
  onTasks: (tasks: TaskReminder[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  const db = getFirebaseFirestore()
  return onSnapshot(
    collection(db, 'tasks'),
    (snapshot) => {
      const tasks = snapshot.docs
        .map((taskDocument) => {
          const data = taskDocument.data()
          return {
            id: taskDocument.id,
            projectId: safeString(data.projectId),
            title: safeString(data.title, 'Không có tiêu đề'),
            assignee: safeString(data.assignee ?? data.responsiblePerson ?? data.responsibleUnit, 'Chưa phân công'),
            status: safeString(data.status),
            priority: safeString(data.priority, 'normal'),
            dueDate: toDate(data.dueDate),
            sourceDocumentId: safeString(data.sourceDocumentId),
            sourceDocumentNumber: safeString(data.sourceDocumentNumber ?? data.sourceDocumentCode),
            requiresLeadershipAttention: data.requiresLeadershipAttention === true,
            attentionType: safeString(data.attentionType),
            leadershipNote: safeString(data.leadershipNote),
            readBy: safeStringArray(data.readBy),
          } satisfies TaskReminder
        })
      onTasks(tasks)
    },
    (error) => {
      console.error('Không thể đọc tasks:', error)
      onError(error.message || 'Không thể đọc dữ liệu Firestore.')
    },
  )
}

export async function toggleTaskRead(task: TaskReminder, uid: string): Promise<void> {
  const db = getFirebaseFirestore()
  await updateDoc(doc(db, 'tasks', task.id), {
    readBy: task.readBy.includes(uid) ? arrayRemove(uid) : arrayUnion(uid),
  })
}
