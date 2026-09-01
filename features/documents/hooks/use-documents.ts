'use client'

import { useEffect, useState } from 'react'
import { subscribeDocuments } from '@/features/documents/services/document-service'
import type { ProjectDocument } from '@/features/documents/types/document'

export function useDocuments() {
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      return subscribeDocuments(
        (nextDocuments) => {
          setDocuments(nextDocuments)
          setError('')
          setLoading(false)
        },
        (message) => {
          setError(message)
          setLoading(false)
        },
      )
    } catch (caughtError) {
      console.error('Không thể khởi tạo listener documents:', caughtError)
      queueMicrotask(() => {
        setError('Không thể tải dữ liệu hồ sơ.')
        setLoading(false)
      })
      return () => {}
    }
  }, [])

  return { documents, loading, error }
}
