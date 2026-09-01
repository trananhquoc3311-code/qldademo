import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { getFirebaseFirestore } from '@/lib/firebase'
import type {
  CreatedDocument,
  DocumentActor,
  DocumentForm,
  ProjectDocument,
} from '@/features/documents/types/document'
import { formatDocumentNumber, nextDocumentSequence } from '@/features/documents/utils/document-number'
import { safeString, safeStringArray, toDate } from '@/features/documents/utils/document-formatters'

function dateInputToTimestamp(value: string): Timestamp | null {
  if (!value) return null
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime()) ? null : Timestamp.fromDate(date)
}

function validateForm(form: DocumentForm) {
  const title = form.title.trim()
  const originatorName = form.originatorName.trim()
  const responsibleUnitName = form.responsibleUnitName.trim()
  const issuedDate = dateInputToTimestamp(form.issuedDate)
  if (!title || !originatorName || !responsibleUnitName || !issuedDate) {
    throw new Error('Vui lòng nhập đầy đủ các trường bắt buộc có dấu *.')
  }
  return { title, originatorName, responsibleUnitName, issuedDate }
}

function mapDocumentSnapshot(documentSnapshot: { id: string; data: () => Record<string, unknown> }): ProjectDocument {
  const data = documentSnapshot.data()
  return {
    id: documentSnapshot.id,
    projectId: safeString(data.projectId),
    documentNumber: safeString(data.documentNumber, documentSnapshot.id),
    title: safeString(data.title, 'Không có tiêu đề'),
    documentType: safeString(data.documentType),
    summary: safeString(data.summary),
    originatorName: safeString(data.originatorName, 'Chưa xác định'),
    recipientNames: safeStringArray(data.recipientNames),
    responsibleUnitName: safeString(data.responsibleUnitName, 'Chưa xác định'),
    assigneeName: safeString(data.assigneeName, 'Chưa phân công'),
    issuedDate: toDate(data.issuedDate),
    handlingDueDate: toDate(data.handlingDueDate),
    processingStatus: safeString(data.processingStatus ?? data.status, 'processed'),
    workflowStatus: safeString(data.workflowStatus, 'received'),
    createdAt: toDate(data.createdAt),
  }
}

async function readDocumentNumberSources() {
  const db = getFirebaseFirestore()
  const snapshot = await getDocs(collection(db, 'documents'))
  return snapshot.docs.map((documentSnapshot) => ({
    id: documentSnapshot.id,
    documentNumber: safeString(documentSnapshot.data().documentNumber, documentSnapshot.id),
  }))
}

export function subscribeDocuments(
  onDocuments: (documents: ProjectDocument[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  const db = getFirebaseFirestore()
  return onSnapshot(
    collection(db, 'documents'),
    (snapshot) => {
      const documents = snapshot.docs.map(mapDocumentSnapshot)
      documents.sort((left, right) => {
        const leftDate = left.issuedDate ?? left.createdAt
        const rightDate = right.issuedDate ?? right.createdAt
        return (rightDate?.getTime() ?? 0) - (leftDate?.getTime() ?? 0)
      })
      onDocuments(documents)
    },
    (error) => {
      console.error('Không thể đọc documents:', error)
      onError('Không thể tải dữ liệu hồ sơ.')
    },
  )
}

export async function getNextDocumentNumber(documentType: string): Promise<string> {
  const sources = await readDocumentNumberSources()
  return formatDocumentNumber(documentType, nextDocumentSequence(sources, documentType))
}

export async function createProjectDocument(
  form: DocumentForm,
  actor: DocumentActor,
): Promise<CreatedDocument> {
  const { title, originatorName, responsibleUnitName, issuedDate } = validateForm(form)
  const db = getFirebaseFirestore()
  const sources = await readDocumentNumberSources()
  const startingSequence = nextDocumentSequence(sources, form.documentType)

  return runTransaction(db, async (transaction) => {
    for (let offset = 0; offset < 100; offset += 1) {
      const documentNumber = formatDocumentNumber(form.documentType, startingSequence + offset)
      const documentReference = doc(db, 'documents', documentNumber)
      const existingDocument = await transaction.get(documentReference)
      if (existingDocument.exists()) continue

      transaction.set(documentReference, {
        projectId: 'HCM2_1',
        documentNumber,
        title,
        documentType: form.documentType,
        issuedDate,
        summary: form.summary.trim(),
        originatorName,
        recipientNames: form.recipientNames.split(',').map((name) => name.trim()).filter(Boolean),
        responsibleUnitName,
        assigneeName: form.assigneeName.trim() || 'Chưa phân công',
        handlingDueDate: dateInputToTimestamp(form.handlingDueDate),
        processingStatus: 'processed',
        workflowStatus: form.workflowStatus,
        createdAt: serverTimestamp(),
        createdByUid: actor.uid,
        createdByEmail: actor.email,
      })
      return { id: documentReference.id, documentNumber, issuedDate: issuedDate.toDate() }
    }
    throw new Error('Không thể cấp số hồ sơ tự động. Vui lòng thử lại.')
  })
}

export async function updateProjectDocument(
  documentId: string,
  form: DocumentForm,
  actor: DocumentActor,
): Promise<Date> {
  const { title, originatorName, responsibleUnitName, issuedDate } = validateForm(form)
  const db = getFirebaseFirestore()
  await updateDoc(doc(db, 'documents', documentId), {
    title,
    issuedDate,
    summary: form.summary.trim(),
    originatorName,
    recipientNames: form.recipientNames.split(',').map((name) => name.trim()).filter(Boolean),
    responsibleUnitName,
    assigneeName: form.assigneeName.trim() || 'Chưa phân công',
    handlingDueDate: dateInputToTimestamp(form.handlingDueDate),
    workflowStatus: form.workflowStatus,
    updatedAt: serverTimestamp(),
    updatedByUid: actor.uid,
    updatedByEmail: actor.email,
  })
  return issuedDate.toDate()
}
