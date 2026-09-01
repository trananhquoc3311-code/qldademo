'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { createProjectDocument } from '@/features/documents/services/document-service'
import type { CreatedDocument, DocumentActor, DocumentForm } from '@/features/documents/types/document'
import { DOCUMENT_TYPE_OPTIONS } from '@/features/documents/config/document-types'
import { formatDateInput } from '@/features/documents/utils/document-formatters'
import { DocumentFormFields } from '@/features/documents/components/document-form-fields'
import { useDocumentNumber } from '@/features/documents/hooks/use-document-number'
import { DocumentFilePicker } from '@/features/documents/components/document-file-picker'
import { validateAttachments } from '@/features/documents/services/attachment-service'

function initialForm(): DocumentForm {
  return {
    title: '',
    documentType: 'meeting_minutes',
    issuedDate: formatDateInput(new Date()),
    originatorName: '',
    recipientNames: '',
    responsibleUnitName: '',
    assigneeName: '',
    handlingDueDate: '',
    workflowStatus: 'received',
    summary: '',
    requiresLeadershipAttention: false,
    attentionType: 'manual',
    leadershipTaskTitle: '',
    leadershipNote: '',
    leadershipPriority: 'normal',
  }
}

type Props = {
  actor: DocumentActor
  onClose: () => void
  onCreated: (document: CreatedDocument) => void
}

export function CreateDocumentDialog({ actor, onClose, onCreated }: Props) {
  const [form, setForm] = useState<DocumentForm>(initialForm)
  const [saving, setSaving] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const { number: suggestedNumber, error: numberError, refresh: refreshNumber } = useDocumentNumber()

  useEffect(() => {
    void refreshNumber('meeting_minutes')
  }, [refreshNumber])

  function changeDocumentType(documentType: string) {
    setForm((current) => ({ ...current, documentType }))
    setError('')
    void refreshNumber(documentType)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!actor.uid) {
      setError('Không xác định được người dùng đăng nhập.')
      return
    }
    if (suggestedNumber === 'Đang xác định...' || suggestedNumber === 'Không thể xác định mã') {
      setError('Chưa thể xác nhận mã hồ sơ. Vui lòng thử lại.')
      return
    }
    setSaving(true)
    setError('')
    try {
      validateAttachments(files)
      onCreated(await createProjectDocument(form, actor, files, setUploadProgress))
    } catch (caughtError) {
      console.error('Không thể tạo hồ sơ:', caughtError)
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể tạo hồ sơ mới.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4" role="dialog" aria-modal="true" aria-labelledby="create-document-title">
      <form onSubmit={submit} className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111a30] p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div><h2 id="create-document-title" className="text-lg font-semibold">Tạo hồ sơ mới</h2><p className="mt-1 text-xs text-slate-500">Các trường có dấu * là bắt buộc.</p></div>
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-50" aria-label="Đóng biểu mẫu"><X size={18} /></button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm"><span className="mb-1.5 block text-xs text-slate-400">Loại hồ sơ *</span><select value={form.documentType} onChange={(event) => changeDocumentType(event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 outline-none focus:border-cyan-300/50">{DOCUMENT_TYPE_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label} ({item.prefix})</option>)}</select></label>
          <label className="text-sm"><span className="mb-1.5 block text-xs text-slate-400">Mã hồ sơ tự động</span><input readOnly value={suggestedNumber} className="w-full cursor-not-allowed rounded-lg border border-cyan-300/20 bg-cyan-300/[0.04] px-3 py-2 font-medium text-cyan-300 outline-none" /><span className="mt-1 block text-[11px] text-slate-600">Đọc trực tiếp Firestore và được kiểm tra lại khi lưu.</span></label>
        </div>
        <div className="mt-4"><DocumentFormFields form={form} setForm={setForm} /></div>
        <div className="mt-4"><DocumentFilePicker files={files} onChange={setFiles} disabled={saving} /></div>
        {(error || numberError) && <p className="mt-4 rounded-lg bg-red-400/10 px-3 py-2 text-xs text-red-300">{error || numberError}</p>}
        {saving && files.length > 0 && <div className="mt-4" role="status"><div className="flex justify-between text-xs text-slate-400"><span>Đang tải tệp lên Firebase Storage...</span><span>{uploadProgress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-cyan-300 transition-[width]" style={{ width: `${uploadProgress}%` }} /></div></div>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-50">Hủy</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Đang lưu và tải tệp...' : 'Lưu hồ sơ'}</button>
        </div>
      </form>
    </div>
  )
}
