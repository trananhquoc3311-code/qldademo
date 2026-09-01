import { workflowStatusLabel } from '@/features/documents/utils/document-status'

const STATUS_CLASSES: Record<string, string> = {
  received: 'bg-emerald-400/10 text-emerald-300',
  assigned: 'bg-cyan-400/10 text-cyan-300',
  in_progress: 'bg-blue-400/10 text-blue-300',
  pending_response: 'bg-violet-400/10 text-violet-300',
  pending_information: 'bg-amber-400/10 text-amber-300',
  completed: 'bg-emerald-400/10 text-emerald-300',
  closed: 'bg-slate-400/10 text-slate-300',
  overdue: 'bg-red-400/10 text-red-300',
}

export function DocumentStatusBadge({ status, overdue = false }: { status: string; overdue?: boolean }) {
  const key = overdue ? 'overdue' : status
  const label = overdue ? 'Quá hạn' : workflowStatusLabel(status)
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${STATUS_CLASSES[key] ?? 'bg-slate-400/10 text-slate-300'}`}>{label}</span>
}
