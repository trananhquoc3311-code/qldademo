import type { DocumentTypeFilter, ProjectDocument } from '@/features/documents/types/document'

export function filterDocuments(
  documents: ProjectDocument[],
  query: string,
  documentType: DocumentTypeFilter,
): ProjectDocument[] {
  const normalizedQuery = query.trim().toLowerCase()
  return documents.filter((document) => {
    const searchableText = [
      document.documentNumber,
      document.title,
      document.summary,
      document.originatorName,
      document.responsibleUnitName,
      document.assigneeName,
      ...document.recipientNames,
    ].join(' ').toLowerCase()
    const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery)
    const matchesType = documentType === 'all' || document.documentType === documentType
    return matchesQuery && matchesType
  })
}
