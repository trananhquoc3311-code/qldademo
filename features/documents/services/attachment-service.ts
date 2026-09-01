'use client'

import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { Timestamp } from 'firebase/firestore'
import { getFirebaseStorage } from '@/lib/firebase'
import type { DocumentActor, DocumentAttachment } from '@/features/documents/types/document'

export const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024
export const MAX_ATTACHMENT_COUNT = 5
export const ACCEPTED_ATTACHMENT_EXTENSIONS = '.pdf,.doc,.docx,.xls,.xlsx,.csv'
const ALLOWED_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv'])

function safeFileName(fileName: string): string {
  const extensionIndex = fileName.lastIndexOf('.')
  const rawExtension = extensionIndex >= 0 ? fileName.slice(extensionIndex + 1).toLowerCase() : ''
  const extension = ALLOWED_EXTENSIONS.has(rawExtension) ? `.${rawExtension}` : ''
  const baseName = extensionIndex >= 0 ? fileName.slice(0, extensionIndex) : fileName
  const safeBaseName = baseName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'document'
  return `${safeBaseName}${extension}`
}

function inferContentType(file: File): string {
  if (file.type) return file.type
  const types: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
  }
  return types[file.name.split('.').pop()?.toLowerCase() ?? ''] ?? 'application/octet-stream'
}

export function validateAttachments(files: File[]): void {
  if (files.length > MAX_ATTACHMENT_COUNT) throw new Error(`Chỉ được tải tối đa ${MAX_ATTACHMENT_COUNT} tệp mỗi lần.`)
  files.forEach((file) => {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!ALLOWED_EXTENSIONS.has(extension)) throw new Error(`Tệp ${file.name} không đúng định dạng hỗ trợ.`)
    if (file.size > MAX_ATTACHMENT_SIZE) throw new Error(`Tệp ${file.name} vượt quá giới hạn 25 MB.`)
  })
}

function uploadOneAttachment(
  projectId: string,
  documentId: string,
  file: File,
  actor: DocumentActor,
  onProgress?: (progress: number) => void,
): Promise<DocumentAttachment> {
  const attachmentId = `${Date.now()}-${crypto.randomUUID()}`
  const storagePath = `projects/${projectId}/documents/${documentId}/${attachmentId}-${safeFileName(file.name)}`
  const storageReference = ref(getFirebaseStorage(), storagePath)
  const contentType = inferContentType(file)
  const uploadTask = uploadBytesResumable(storageReference, file, {
    contentType,
    customMetadata: { projectId, documentId, uploadedBy: actor.uid },
  })

  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed', (snapshot) => {
      onProgress?.(snapshot.totalBytes ? Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100) : 0)
    }, reject, () => resolve({
      id: attachmentId,
      fileName: file.name,
      storagePath: storageReference.fullPath,
      contentType,
      size: file.size,
      uploadedAt: Timestamp.now().toDate(),
      uploadedByUid: actor.uid,
    }))
  })
}

export async function uploadDocumentAttachments(
  projectId: string,
  documentId: string,
  files: File[],
  actor: DocumentActor,
  onProgress?: (progress: number) => void,
): Promise<DocumentAttachment[]> {
  validateAttachments(files)
  const uploaded: DocumentAttachment[] = []
  try {
    for (let index = 0; index < files.length; index += 1) {
      const attachment = await uploadOneAttachment(projectId, documentId, files[index], actor, (fileProgress) => {
        onProgress?.(Math.round((index * 100 + fileProgress) / files.length))
      })
      uploaded.push(attachment)
    }
    return uploaded
  } catch (error) {
    await Promise.all(uploaded.map((attachment) => deleteObject(ref(getFirebaseStorage(), attachment.storagePath)).catch(() => undefined)))
    throw error
  }
}

export async function deleteUploadedAttachments(attachments: DocumentAttachment[]): Promise<void> {
  await Promise.all(attachments.map((attachment) => deleteObject(ref(getFirebaseStorage(), attachment.storagePath)).catch(() => undefined)))
}

export async function downloadDocumentAttachment(attachment: DocumentAttachment): Promise<void> {
  const downloadUrl = await getDownloadURL(ref(getFirebaseStorage(), attachment.storagePath))
  const anchor = window.document.createElement('a')
  anchor.href = downloadUrl
  anchor.download = attachment.fileName
  anchor.target = '_blank'
  anchor.rel = 'noopener noreferrer'
  anchor.style.display = 'none'
  window.document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}
