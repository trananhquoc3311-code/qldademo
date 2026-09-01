export type TaskReminder = {
  id: string
  projectId: string
  title: string
  assignee: string
  status: string
  priority: string
  dueDate: Date | null
  sourceDocumentId: string
  sourceDocumentNumber: string
  requiresLeadershipAttention: boolean
  attentionType: string
  leadershipNote: string
  readBy: string[]
}
