'use client'

import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { DocumentActor, DocumentForm, ProjectDocument, UpdatedDocument } from '@/features/documents/types/document'
import { updateProjectDocument } from '@/features/documents/services/document-service'
import { documentCodePrefix, documentTypeLabel } from '@/features/documents/utils/document-number'
import { formatDateInput } from '@/features/documents/utils/document-formatters'
import { DocumentFormFields } from '@/features/documents/components/document-form-fields'
import { DocumentFilePicker } from '@/features/documents/components/document-file-picker'
import { validateAttachments } from '@/features/documents/services/attachment-service'

function formFromDocument(document: ProjectDocument): DocumentForm {
  return {
    title: document.title,
    documentType: document.documentType,
    issuedDate: document.issuedDate ? formatDateInput(document.issuedDate) : '',
    originatorName: document.originatorName === 'Chưa xác định' ? '' : document.originatorName,
    recipientNames: document.recipientNames.join(', '),
    responsibleUnitName: document.responsibleUnitName === 'Chưa xác định' ? '' : document.responsibleUnitName,
    assigneeName: document.assigneeName === 'Chưa phân công' ? '' : document.assigneeName,
    handlingDueDate: document.handlingDueDate ? formatDateInput(document.handlingDueDate) : '',
    workflowStatus: document.workflowStatus,
    summary: document.summary,
    requiresLeadershipAttention: document.requiresLeadershipAttention,
    attentionType: document.attentionType,
    leadershipTaskTitle: document.leadershipTaskTitle,
    leadershipNote: document.leadershipNote,
    leadershipPriority: document.leadershipPriority,
  }
}

type Props = {
  document: ProjectDocument
  actor: DocumentActor
  onClose: () => void
  onUpdated: (document: ProjectDocument, result: UpdatedDocument) => void
}

export function EditDocumentDialog({ document, actor, onClose, onUpdated }: Props) {
  const [form, setForm] = useState<DocumentForm>(() => formFromDocument(document))
  const [saving, setSaving] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!actor.uid) {
      setError('Không xác định được người dùng đăng nhập.')
      return
    }
    setSaving(true)
    setError('')
    try {
      validateAttachments(files)
      const result = await updateProjectDocument(document, form, actor, files, setUploadProgress)
      onUpdated(document, result)
    } catch (caughtError) {
      console.error('Không thể cập nhật hồ sơ:', caughtError)
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể cập nhật hồ sơ.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-document-title">
      <form onSubmit={submit} className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111a30] p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div><h2 id="edit-document-title" className="text-lg font-semibold">Chỉnh sửa hồ sơ</h2><p className="mt-1 text-xs text-slate-500">Mã và loại hồ sơ được khóa để bảo toàn hệ thống đánh số.</p></div>
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-50" aria-label="Đóng biểu mẫu chỉnh sửa"><X size={18} /></button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm"><span className="mb-1.5 block text-xs text-slate-400">Loại hồ sơ</span><input readOnly value={`${documentTypeLabel(document.documentType)} (${documentCodePrefix(document.documentType)})`} className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-slate-400 outline-none" /></label>
          <label className="text-sm"><span className="mb-1.5 block text-xs text-slate-400">Mã hồ sơ</span><input readOnly value={document.documentNumber} className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 font-medium text-cyan-300 outline-none" /></label>
        </div>
        <div className="mt-4"><DocumentFormFields form={form} setForm={setForm} /></div>
        <div className="mt-4"><DocumentFilePicker files={files} onChange={setFiles} disabled={saving} /></div>
        {error && <p className="mt-4 rounded-lg bg-red-400/10 px-3 py-2 text-xs text-red-300">{error}</p>}
        {saving && files.length > 0 && <div className="mt-4" role="status"><div className="flex justify-between text-xs text-slate-400"><span>Đang tải tệp bổ sung lên Firebase Storage...</span><span>{uploadProgress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-cyan-300 transition-[width]" style={{ width: `${uploadProgress}%` }} /></div></div>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-50">Hủy</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Đang cập nhật...' : 'Cập nhật hồ sơ'}</button>
        </div>
      </form>
    </div>
  )
}
