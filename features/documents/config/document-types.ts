import type { DocumentTypeFilter } from '@/features/documents/types/document'

export type DocumentTypeConfig = {
  value: Exclude<DocumentTypeFilter, 'all'>
  label: string
  prefix: string
}

/** Add future document types here; consumers derive labels, filters, and prefixes from this list. */
export const DOCUMENT_TYPE_CONFIGS: readonly DocumentTypeConfig[] = [
  { value: 'meeting_minutes', label: 'Biên bản họp', prefix: 'MOM' },
  { value: 'correspondence', label: 'Công văn', prefix: 'LTR' },
  { value: 'weekly_report', label: 'Báo cáo tuần', prefix: 'WRP' },
  { value: 'monthly_report', label: 'Báo cáo tháng', prefix: 'MRP' },
  { value: 'audit_report', label: 'Báo cáo kiểm tra/audit', prefix: 'ADP' },
]

export const DOCUMENT_TYPE_OPTIONS = DOCUMENT_TYPE_CONFIGS

export function documentTypeLabel(documentType: string): string {
  return DOCUMENT_TYPE_CONFIGS.find((item) => item.value === documentType)?.label ?? 'Loại khác'
}

export function documentCodePrefix(documentType: string): string {
  return DOCUMENT_TYPE_CONFIGS.find((item) => item.value === documentType)?.prefix ?? 'DOC'
}
