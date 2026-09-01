'use client'

import { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import type { ProjectDocument } from '@/features/documents/types/document'
import { DocumentStatusBadge } from '@/features/documents/components/document-status-badge'
import { formatVnDate } from '@/features/documents/utils/document-formatters'
import { documentTypeLabel } from '@/features/documents/config/document-types'
import { isDocumentOverdue } from '@/features/documents/utils/document-status'
import { downloadDocumentAttachment } from '@/features/documents/services/attachment-service'
import { leadershipAttentionLabel } from '@/features/tasks/utils/leadership-reminder'

type Props = {
  document: ProjectDocument | null
  currentTime: number
  loading: boolean
  error: string
}

export function DocumentDetails({ document, currentTime, loading, error }: Props) {
  const [downloadingId, setDownloadingId] = useState('')
  const [downloadError, setDownloadError] = useState('')

  async function download(attachment: ProjectDocument['attachments'][number]) {
    setDownloadingId(attachment.id)
    setDownloadError('')
    try {
      await downloadDocumentAttachment(attachment)
    } catch (caughtError) {
      console.error('Không thể tải tệp hồ sơ:', caughtError)
      setDownloadError(caughtError instanceof Error ? caughtError.message : 'Không thể tải tệp hồ sơ.')
    } finally {
      setDownloadingId('')
    }
  }

  return (
    <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-5">
      <h3 className="font-semibold text-cyan-300">Chi tiết đang chọn</h3>
      {loading && <p className="mt-5 text-sm text-slate-500">Đang tải hồ sơ...</p>}
      {!loading && error && <p className="mt-5 text-sm text-red-300">{error}</p>}
      {!loading && !error && !document && <p className="mt-5 text-sm text-slate-500">Chưa có hồ sơ để hiển thị.</p>}
      {!loading && !error && document && (
        <>
          <h4 className="mt-5 text-lg font-semibold">{document.title}</h4>
          <p className="mt-2 text-sm text-slate-400">{document.documentNumber} · {documentTypeLabel(document.documentType)}</p>
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-slate-500">Đơn vị gửi</dt><dd className="mt-1">{document.originatorName}</dd></div>
            <div><dt className="text-xs text-slate-500">Bên nhận</dt><dd className="mt-1">{document.recipientNames.length ? document.recipientNames.join(', ') : 'Chưa xác định'}</dd></div>
            <div><dt className="text-xs text-slate-500">Đơn vị phụ trách</dt><dd className="mt-1">{document.responsibleUnitName}</dd></div>
            <div><dt className="text-xs text-slate-500">Người phụ trách</dt><dd className="mt-1">{document.assigneeName}</dd></div>
            <div><dt className="text-xs text-slate-500">Hạn xử lý</dt><dd className="mt-1">{formatVnDate(document.handlingDueDate, 'Chưa đặt hạn')}</dd></div>
            <div><dt className="text-xs text-slate-500">Ngày ban hành</dt><dd className="mt-1">{formatVnDate(document.issuedDate, 'Chưa cập nhật')}</dd></div>
          </dl>
          <div className="mt-5"><DocumentStatusBadge status={document.workflowStatus} overdue={isDocumentOverdue(document, currentTime)} /></div>
          {document.requiresLeadershipAttention && <div className="mt-4 rounded-lg border border-amber-300/15 bg-amber-300/[0.04] p-3"><p className="text-xs font-medium text-amber-200">{leadershipAttentionLabel(document.attentionType)}</p>{document.leadershipNote && <p className="mt-1 text-xs leading-5 text-slate-400">{document.leadershipNote}</p>}</div>}
          <div className="mt-5"><p className="text-xs text-slate-500">Tóm tắt</p><p className="mt-2 text-sm leading-6 text-slate-300">{document.summary || 'Chưa có nội dung tóm tắt.'}</p></div>
          <div className="mt-5">
            <p className="text-xs text-slate-500">Tệp hồ sơ ({document.attachments?.length || 0})</p>
            {document.attachments?.length === 0 && <p className="mt-2 text-xs text-slate-500">Chưa có tệp đính kèm.</p>}
            <div className="mt-2 space-y-2">
              {(document.attachments ?? []).map((attachment) => (
                <button key={attachment.id} type="button" disabled={downloadingId === attachment.id} onClick={() => download(attachment)} className="flex w-full items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-left text-xs hover:border-cyan-300/30 hover:bg-cyan-300/[0.03] disabled:opacity-50">
                  <FileText size={14} className="shrink-0 text-cyan-300" /><span className="min-w-0 flex-1 truncate">{attachment.fileName}</span><Download size={14} className="shrink-0 text-slate-400" />
                </button>
              ))}
            </div>
            {downloadError && <p className="mt-2 text-xs text-red-300">{downloadError}</p>}
          </div>
        </>
      )}
    </section>
  )
}
