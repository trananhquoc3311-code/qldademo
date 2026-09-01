import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { getFirebaseFirestore } from '@/lib/firebase'
import type {
  CreatedDocument,
  DocumentActor,
  DocumentForm,
  DocumentAttachment,
  ProjectDocument,
  UpdatedDocument,
} from '@/features/documents/types/document'
import { formatDocumentNumber, nextDocumentSequence } from '@/features/documents/utils/document-number'
import { safeString, safeStringArray, toDate } from '@/features/documents/utils/document-formatters'
import {
  deleteUploadedAttachments,
  uploadDocumentAttachments,
} from '@/features/documents/services/attachment-service'

const PROJECT_ID = 'HCM2_1'

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
  if (form.requiresLeadershipAttention && form.attentionType === 'due_soon') {
    if (!form.handlingDueDate) throw new Error('Nhắc việc sắp đến hạn phải có hạn xử lý.')
    if (form.leadershipPriority === 'normal') throw new Error('Nhắc việc sắp đến hạn phải có mức độ Cao hoặc Khẩn cấp.')
  }
  return { title, originatorName, responsibleUnitName, issuedDate }
}

function mapAttachments(data: Record<string, unknown>, documentId: string): DocumentAttachment[] {
  if (Array.isArray(data.attachments)) {
    return data.attachments.flatMap((value) => {
      if (!value || typeof value !== 'object') return []
      const attachment = value as Record<string, unknown>
      const storagePath = safeString(attachment.storagePath)
      if (!storagePath) return []
      return [{
        id: safeString(attachment.id, storagePath),
        fileName: safeString(attachment.fileName, 'Hồ sơ đính kèm'),
        storagePath,
        contentType: safeString(attachment.contentType, 'application/octet-stream'),
        size: typeof attachment.size === 'number' ? attachment.size : 0,
        uploadedAt: toDate(attachment.uploadedAt),
        uploadedByUid: safeString(attachment.uploadedByUid),
      }]
    })
  }

  const legacyStoragePath = safeString(data.storagePath)
  return legacyStoragePath ? [{
    id: `legacy-${documentId}`,
    fileName: safeString(data.fileName, 'Hồ sơ đính kèm'),
    storagePath: legacyStoragePath,
    contentType: safeString(data.contentType, 'application/octet-stream'),
    size: typeof data.fileSize === 'number' ? data.fileSize : 0,
    uploadedAt: toDate(data.createdAt),
    uploadedByUid: safeString(data.createdByUid),
  }] : []
}

function leadershipTaskData(
  form: DocumentForm,
  documentId: string,
  documentNumber: string,
  actor: DocumentActor,
) {
  return {
    projectId: PROJECT_ID,
    sourceDocumentId: documentId,
    sourceDocumentNumber: documentNumber,
    sourceDocumentTitle: form.title.trim(),
    title: form.leadershipTaskTitle.trim() || form.title.trim(),
    assignee: form.assigneeName.trim() || form.responsibleUnitName.trim() || 'Chưa phân công',
    responsiblePerson: form.assigneeName.trim(),
    responsibleUnit: form.responsibleUnitName.trim(),
    dueDate: dateInputToTimestamp(form.handlingDueDate),
    priority: form.leadershipPriority,
    requiresLeadershipAttention: form.requiresLeadershipAttention,
    attentionType: form.attentionType,
    leadershipNote: form.leadershipNote.trim(),
    updatedAt: serverTimestamp(),
    updatedByUid: actor.uid,
    updatedByEmail: actor.email,
  }
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
    attachments: mapAttachments(data, documentSnapshot.id),
    requiresLeadershipAttention: data.requiresLeadershipAttention === true,
    attentionType: safeString(data.attentionType, 'manual') as ProjectDocument['attentionType'],
    leadershipTaskTitle: safeString(data.leadershipTaskTitle),
    leadershipNote: safeString(data.leadershipNote),
    leadershipPriority: safeString(data.leadershipPriority, 'normal') as ProjectDocument['leadershipPriority'],
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
  files: File[] = [],
  onProgress?: (progress: number) => void,
): Promise<CreatedDocument> {
  const { title, originatorName, responsibleUnitName, issuedDate } = validateForm(form)
  const db = getFirebaseFirestore()
  const sources = await readDocumentNumberSources()
  const startingSequence = nextDocumentSequence(sources, form.documentType)

  const createdDocument = await runTransaction(db, async (transaction) => {
    for (let offset = 0; offset < 100; offset += 1) {
      const documentNumber = formatDocumentNumber(form.documentType, startingSequence + offset)
      const documentReference = doc(db, 'documents', documentNumber)
      const existingDocument = await transaction.get(documentReference)
      if (existingDocument.exists()) continue

      transaction.set(documentReference, {
        projectId: PROJECT_ID,
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
        attachments: [],
        uploadStatus: files.length ? 'pending' : 'not_required',
        requiresLeadershipAttention: form.requiresLeadershipAttention,
        attentionType: form.attentionType,
        leadershipTaskTitle: form.leadershipTaskTitle.trim(),
        leadershipNote: form.leadershipNote.trim(),
        leadershipPriority: form.leadershipPriority,
        createdAt: serverTimestamp(),
        createdByUid: actor.uid,
        createdByEmail: actor.email,
      })

      if (form.requiresLeadershipAttention) {
        const taskReference = doc(db, 'tasks', `leadership_${documentReference.id}`)
        transaction.set(taskReference, {
          ...leadershipTaskData(form, documentReference.id, documentNumber, actor),
          status: 'open',
          readBy: [],
          createdAt: serverTimestamp(),
          createdByUid: actor.uid,
          createdByEmail: actor.email,
        })
      }
      return { id: documentReference.id, documentNumber, issuedDate: issuedDate.toDate() }
    }
    throw new Error('Không thể cấp số hồ sơ tự động. Vui lòng thử lại.')
  })

  if (!files.length) return createdDocument

  try {
    const attachments = await uploadDocumentAttachments(PROJECT_ID, createdDocument.id, files, actor, onProgress)
    await updateDoc(doc(db, 'documents', createdDocument.id), {
      attachments,
      uploadStatus: 'completed',
      updatedAt: serverTimestamp(),
    })
    return createdDocument
  } catch (error) {
    console.error('Hồ sơ đã tạo nhưng tải tệp thất bại:', error)
    await setDoc(doc(db, 'documents', createdDocument.id), {
      uploadStatus: 'failed',
      uploadError: error instanceof Error ? error.message : 'Không thể tải tệp lên Storage.',
      updatedAt: serverTimestamp(),
    }, { merge: true }).catch(() => undefined)
    return { ...createdDocument, warning: 'Hồ sơ đã được tạo nhưng tệp đính kèm chưa tải lên thành công. Hãy mở Chỉnh sửa để tải lại.' }
  }
}

export async function updateProjectDocument(
  projectDocument: ProjectDocument,
  form: DocumentForm,
  actor: DocumentActor,
  files: File[] = [],
  onProgress?: (progress: number) => void,
): Promise<UpdatedDocument> {
  const { title, originatorName, responsibleUnitName, issuedDate } = validateForm(form)
  const db = getFirebaseFirestore()
  const uploadedAttachments = files.length
    ? await uploadDocumentAttachments(projectDocument.projectId || PROJECT_ID, projectDocument.id, files, actor, onProgress)
    : []

  try {
    await runTransaction(db, async (transaction) => {
      const documentReference = doc(db, 'documents', projectDocument.id)
      const taskReference = doc(db, 'tasks', `leadership_${projectDocument.id}`)
      const taskSnapshot = await transaction.get(taskReference)

      transaction.update(documentReference, {
        title,
        issuedDate,
        summary: form.summary.trim(),
        originatorName,
        recipientNames: form.recipientNames.split(',').map((name) => name.trim()).filter(Boolean),
        responsibleUnitName,
        assigneeName: form.assigneeName.trim() || 'Chưa phân công',
        handlingDueDate: dateInputToTimestamp(form.handlingDueDate),
        workflowStatus: form.workflowStatus,
        attachments: [...projectDocument.attachments, ...uploadedAttachments],
        uploadStatus: 'completed',
        requiresLeadershipAttention: form.requiresLeadershipAttention,
        attentionType: form.attentionType,
        leadershipTaskTitle: form.leadershipTaskTitle.trim(),
        leadershipNote: form.leadershipNote.trim(),
        leadershipPriority: form.leadershipPriority,
        updatedAt: serverTimestamp(),
        updatedByUid: actor.uid,
        updatedByEmail: actor.email,
      })

      if (form.requiresLeadershipAttention) {
        const previousStatus = safeString(taskSnapshot.data()?.status)
        transaction.set(taskReference, {
          ...leadershipTaskData(form, projectDocument.id, projectDocument.documentNumber, actor),
          status: !taskSnapshot.exists() || previousStatus === 'cancelled' ? 'open' : previousStatus,
          ...(!taskSnapshot.exists() ? {
            readBy: [],
            createdAt: serverTimestamp(),
            createdByUid: actor.uid,
            createdByEmail: actor.email,
          } : {}),
        }, { merge: true })
      } else if (taskSnapshot.exists()) {
        transaction.update(taskReference, {
          requiresLeadershipAttention: false,
          status: 'cancelled',
          updatedAt: serverTimestamp(),
          updatedByUid: actor.uid,
        })
      }
    })
    return { issuedDate: issuedDate.toDate() }
  } catch (error) {
    await deleteUploadedAttachments(uploadedAttachments)
    throw error
  }
}
