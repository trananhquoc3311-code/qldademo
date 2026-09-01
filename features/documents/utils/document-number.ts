import type { ProjectDocument } from '@/features/documents/types/document'
import { DOCUMENT_TYPE_OPTIONS, documentTypeLabel, documentCodePrefix } from '@/features/documents/config/document-types'

export { DOCUMENT_TYPE_OPTIONS, documentTypeLabel, documentCodePrefix }

type DocumentNumberSource = Pick<ProjectDocument, 'id' | 'documentNumber'>

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
