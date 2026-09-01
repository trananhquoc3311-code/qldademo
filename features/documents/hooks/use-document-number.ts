'use client'

import { useCallback, useRef, useState } from 'react'
import { getNextDocumentNumber } from '@/features/documents/services/document-service'

export function useDocumentNumber() {
  const [number, setNumber] = useState('Đang xác định...')
  const [error, setError] = useState('')
  const requestRef = useRef(0)

  const refresh = useCallback(async (documentType: string) => {
    const requestId = requestRef.current + 1
    requestRef.current = requestId
    setNumber('Đang xác định...')
    setError('')
    try {
      const nextNumber = await getNextDocumentNumber(documentType)
      if (requestRef.current === requestId) setNumber(nextNumber)
    } catch (caughtError) {
      console.error('Không thể xác định mã hồ sơ tiếp theo:', caughtError)
      if (requestRef.current === requestId) {
        setNumber('Không thể xác định mã')
        setError('Không thể đọc danh sách mã hồ sơ từ Firestore.')
      }
    }
  }, [])

  return { number, error, refresh }
}
