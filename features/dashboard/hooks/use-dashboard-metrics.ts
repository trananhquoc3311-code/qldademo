'use client'

import { useMemo } from 'react'
import type { ProjectDocument } from '@/features/documents/types/document'
import {
  calculateDashboardMetrics,
  documentsInWeek,
} from '@/features/dashboard/utils/dashboard-calculations'

export function useDashboardMetrics(
  documents: ProjectDocument[],
  weekStart: number,
  currentTime: number,
) {
  const weeklyDocuments = useMemo(
    () => documentsInWeek(documents, weekStart),
    [documents, weekStart],
  )
  const metrics = useMemo(
    () => calculateDashboardMetrics(documents, weekStart, currentTime),
    [currentTime, documents, weekStart],
  )

  return { metrics, weeklyDocuments }
}
