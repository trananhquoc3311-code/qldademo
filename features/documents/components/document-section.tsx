'use client'

import { useMemo, useState } from 'react'
import { FileUp, Search } from 'lucide-react'
import type {
  CreatedDocument,
  DocumentActor,
  DocumentTypeFilter,
  ProjectDocument,
  UpdatedDocument,
} from '@/features/documents/types/document'
import { filterDocuments } from '@/features/documents/utils/document-filters'
import { DOCUMENT_TYPE_OPTIONS } from '@/features/documents/config/document-types'
import { DocumentTable } from '@/features/documents/components/document-table'
import { DocumentDetails } from '@/features/documents/components/document-details'
import { CreateDocumentDialog } from '@/features/documents/components/create-document-dialog'
import { EditDocumentDialog } from '@/features/documents/components/edit-document-dialog'

type Props = {
  documents: ProjectDocument[]
  loading: boolean
  error: string
  currentTime: number
  actor: DocumentActor
  onDocumentDateChange: (date: Date) => void
}

export function DocumentSection({ documents, loading, error, currentTime, actor, onDocumentDateChange }: Props) {
  const [query, setQuery] = useState('')
  const [documentType, setDocumentType] = useState<DocumentTypeFilter>('all')
  const [selectedDocumentId, setSelectedDocumentId] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingDocument, setEditingDocument] = useState<ProjectDocument | null>(null)
  const [message, setMessage] = useState('')

  const visibleDocuments = useMemo(
    () => filterDocuments(documents, query, documentType),
    [documentType, documents, query],
  )
  const selectedDocument = documents.find((document) => document.id === selectedDocumentId) ?? documents[0] ?? null

  function handleCreated(created: CreatedDocument) {
    setSelectedDocumentId(created.id)
    setMessage(created.warning ?? `Đã tạo hồ sơ ${created.documentNumber}.`)
    setCreating(false)
    onDocumentDateChange(created.issuedDate)
  }

  function handleUpdated(document: ProjectDocument, result: UpdatedDocument) {
    setSelectedDocumentId(document.id)
    setMessage(result.warning ?? `Đã cập nhật hồ sơ ${document.documentNumber}.`)
    setEditingDocument(null)
    onDocumentDateChange(result.issuedDate)
  }

  return (
    <>
      <section className="rounded-2xl border border-white/10 bg-[#111a30] p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div><h3 className="font-semibold">Hồ sơ mới nhất</h3><p className="mt-1 text-xs text-slate-500">Danh sách hồ sơ cập nhật gần đây</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2">
              <Search size={15} className="text-slate-500" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm hồ sơ..." className="w-44 bg-transparent text-sm outline-none" />
            </label>
            <select
              value={documentType}
              onChange={(event) => setDocumentType(event.target.value as DocumentTypeFilter)}
              className="rounded-xl border border-white/10 bg-[#111a30] px-3 py-2 text-sm"
              aria-label="Lọc theo loại hồ sơ"
            >
              <option value="all">Tất cả</option>
              {DOCUMENT_TYPE_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
        </div>
        {message && <p className="mt-4 rounded-lg bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300">{message}</p>}
        <DocumentTable
          documents={visibleDocuments}
          selectedId={selectedDocument?.id ?? ''}
          currentTime={currentTime}
          loading={loading}
          error={error}
          onSelect={setSelectedDocumentId}
          onEdit={setEditingDocument}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <DocumentDetails document={selectedDocument} currentTime={currentTime} loading={loading} error={error} />
        <section className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 p-6 text-center">
          <FileUp className="text-cyan-300" />
          <p className="mt-3 font-medium">Tạo hồ sơ mới</p>
          <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">Nhập thông tin hồ sơ trực tiếp vào hệ thống. Bảng, KPI và biểu đồ sẽ tự cập nhật sau khi lưu.</p>
          <button type="button" onClick={() => { setMessage(''); setCreating(true) }} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-200"><FileUp size={14} /> Mở biểu mẫu</button>
        </section>
      </div>

      {creating && <CreateDocumentDialog actor={actor} onClose={() => setCreating(false)} onCreated={handleCreated} />}
      {editingDocument && <EditDocumentDialog document={editingDocument} actor={actor} onClose={() => setEditingDocument(null)} onUpdated={handleUpdated} />}
    </>
  )
}
