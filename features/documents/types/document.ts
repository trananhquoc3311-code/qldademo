export type WorkflowStatus =
  | 'received'
  | 'assigned'
  | 'in_progress'
  | 'pending_response'
  | 'pending_information'
  | 'completed'
  | 'closed'
  | string

export type DocumentTypeFilter =
  | 'all'
  | 'meeting_minutes'
  | 'correspondence'
  | 'weekly_report'
  | 'monthly_report'
  | 'audit_report'

export type LeadershipAttentionType =
  | 'manual'
  | 'decision_required'
  | 'blocked'
  | 'risk'
  | 'due_soon'

export type LeadershipPriority = 'normal' | 'high' | 'critical'

export type DocumentAttachment = {
  id: string
  fileName: string
  storagePath: string
  contentType: string
  size: number
  uploadedAt: Date | null
  uploadedByUid: string
}

export type ProjectDocument = {
  id: string
  projectId: string
  documentNumber: string
  title: string
  documentType: string
  summary: string
  originatorName: string
  recipientNames: string[]
  responsibleUnitName: string
  assigneeName: string
  issuedDate: Date | null
  handlingDueDate: Date | null
  processingStatus: string
  workflowStatus: WorkflowStatus
  createdAt: Date | null
  attachments: DocumentAttachment[]
  requiresLeadershipAttention: boolean
  attentionType: LeadershipAttentionType
  leadershipTaskTitle: string
  leadershipNote: string
  leadershipPriority: LeadershipPriority
}

export type DocumentForm = {
  title: string
  documentType: string
  issuedDate: string
  originatorName: string
  recipientNames: string
  responsibleUnitName: string
  assigneeName: string
  handlingDueDate: string
  workflowStatus: string
  summary: string
  requiresLeadershipAttention: boolean
  attentionType: LeadershipAttentionType
  leadershipTaskTitle: string
  leadershipNote: string
  leadershipPriority: LeadershipPriority
}

export type DocumentActor = {
  uid: string
  email: string
}

export type CreatedDocument = {
  id: string
  documentNumber: string
  issuedDate: Date
  warning?: string
}

export type UpdatedDocument = {
  issuedDate: Date
  warning?: string
}
