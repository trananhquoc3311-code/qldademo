import { Pencil } from 'lucide-react'
import type { ProjectDocument } from '@/features/documents/types/document'
import { formatVnDate } from '@/features/documents/utils/document-formatters'
import { isDocumentOverdue } from '@/features/documents/utils/document-status'
import { DocumentStatusBadge } from '@/features/documents/components/document-status-badge'

type Props = {
  documents: ProjectDocument[]
  selectedId: string
  currentTime: number
  loading: boolean
  error: string
  onSelect: (documentId: string) => void
  onEdit: (document: ProjectDocument) => void
}

export function DocumentTable({ documents, selectedId, currentTime, loading, error, onSelect, onEdit }: Props) {
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[950px] text-left text-sm">
        <thead className="border-y border-white/10 text-xs text-slate-500">
          <tr>
            <th className="px-3 py-3">Mã / Tên hồ sơ</th>
            <th className="px-3 py-3">Đơn vị gửi</th>
            <th className="px-3 py-3">Đơn vị / Người phụ trách</th>
            <th className="px-3 py-3">Hạn xử lý</th>
            <th className="px-3 py-3">Trạng thái</th>
            <th className="px-3 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-500">Đang tải hồ sơ...</td></tr>}
          {!loading && error && <tr><td colSpan={6} className="px-3 py-8 text-center text-red-300">{error}</td></tr>}
          {!loading && !error && documents.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-500">Không tìm thấy hồ sơ phù hợp.</td></tr>}
          {!loading && !error && documents.map((document) => (
            <tr
              key={document.id}
              className={`cursor-pointer border-b border-white/5 hover:bg-white/[0.03] ${selectedId === document.id ? 'bg-cyan-300/[0.04]' : ''}`}
              onClick={() => onSelect(document.id)}
            >
              <td className="px-3 py-4">
                <span className="block text-xs text-cyan-300">{document.documentNumber}</span>
                <span className="mt-1 block font-medium">{document.title}</span>
              </td>
              <td className="px-3 py-4 text-slate-400">{document.originatorName}</td>
              <td className="px-3 py-4">
                <span className="block text-slate-300">{document.responsibleUnitName}</span>
                <span className="mt-1 block text-xs text-slate-500">{document.assigneeName}</span>
              </td>
              <td className="px-3 py-4 text-slate-400">{formatVnDate(document.handlingDueDate, 'Chưa đặt hạn')}</td>
              <td className="px-3 py-4"><DocumentStatusBadge status={document.workflowStatus} overdue={isDocumentOverdue(document, currentTime)} /></td>
              <td className="px-3 py-4 text-right">
                <button
                  type="button"
                  onClick={(event) => { event.stopPropagation(); onEdit(document) }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-300 hover:border-cyan-300/30 hover:bg-cyan-300/5 hover:text-cyan-300"
                  aria-label={`Chỉnh sửa ${document.documentNumber}`}
                >
                  <Pencil size={13} /> Chỉnh sửa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
