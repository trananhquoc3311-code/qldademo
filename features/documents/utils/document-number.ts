import type { ProjectDocument } from '@/features/documents/types/document'

export const DOCUMENT_TYPE_OPTIONS = [
  { value: 'meeting_minutes', label: 'Biên bản họp', prefix: 'MOM' },
  { value: 'correspondence', label: 'Công văn', prefix: 'LTR' },
  { value: 'weekly_report', label: 'Báo cáo tuần', prefix: 'WRP' },
  { value: 'monthly_report', label: 'Báo cáo tháng', prefix: 'MRP' },
  { value: 'audit_report', label: 'Báo cáo kiểm tra/audit', prefix: 'ADP' },
] as const

type DocumentNumberSource = Pick<ProjectDocument, 'id' | 'documentNumber'>

export function documentTypeLabel(documentType: string): string {
  return DOCUMENT_TYPE_OPTIONS.find((item) => item.value === documentType)?.label ?? 'Loại khác'
}

export function documentCodePrefix(documentType: string): string {
  return DOCUMENT_TYPE_OPTIONS.find((item) => item.value === documentType)?.prefix ?? 'DOC'
}

export function extractDocumentSequence(value: string, prefix: string): number | null {
  const normalizedValue = value
    .normalize('NFKC')
    .toUpperCase()
    .replace(/[‐‑‒–—−]/g, '-')
    .replace(/[\s\u200B-\u200D\uFEFF]+/g, '')
  const normalizedPrefix = prefix.toUpperCase()
  const simpleMatch = normalizedValue.match(new RegExp(`^${normalizedPrefix}[-_]?(\\d+)$`))
  const fullCodeMatch = normalizedValue.match(new RegExp(`(?:^|-)${normalizedPrefix}[-_](\\d+)(?:-|$)`))
  const sequence = Number((simpleMatch ?? fullCodeMatch)?.[1])
  return Number.isSafeInteger(sequence) && sequence > 0 ? sequence : null
}

export function nextDocumentSequence(documents: DocumentNumberSource[], documentType: string): number {
  const prefix = documentCodePrefix(documentType)
  const highestSequence = documents.reduce((highest, document) => {
    const sequences = [document.documentNumber, document.id]
      .map((value) => extractDocumentSequence(value, prefix))
      .filter((value): value is number => value !== null)
    return Math.max(highest, ...sequences)
  }, 0)
  return highestSequence + 1
}

export function formatDocumentNumber(documentType: string, sequence: number): string {
  return `${documentCodePrefix(documentType)}-${String(sequence).padStart(5, '0')}`
}
