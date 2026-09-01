'use client'

import { useEffect, useMemo, useState } from 'react'
import { Filter } from 'lucide-react'
import { useAuth } from '@/components/AuthContext'
import { useDocuments } from '@/features/documents/hooks/use-documents'
import { useTaskReminders } from '@/features/tasks/hooks/use-task-reminders'
import { useDashboardMetrics } from '@/features/dashboard/hooks/use-dashboard-metrics'
import { addDays, formatWeekRange, startOfWeek } from '@/features/dashboard/utils/date'
import { DashboardSidebar } from '@/features/dashboard/components/dashboard-sidebar'
import { DashboardHeader } from '@/features/dashboard/components/dashboard-header'
import { DashboardKpis } from '@/features/dashboard/components/dashboard-kpis'
import { WeeklyDocumentsChart } from '@/features/dashboard/components/weekly-documents-chart'
import { LeadershipReminders } from '@/features/tasks/components/leadership-reminders'
import { DocumentSection } from '@/features/documents/components/document-section'

const WEEK_OPTION_COUNT = 8

export function Dashboard() {
  const { user } = useAuth()
  const { documents, loading: documentsLoading, error: documentsError } = useDocuments()
  const { reminders, loading: remindersLoading, error: remindersError } = useTaskReminders()
  const [currentTime, setCurrentTime] = useState(() => Date.now())
  const [selectedWeekStart, setSelectedWeekStart] = useState<number | null>(null)
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const uid = user?.uid ?? ''
  const email = user?.email ?? ''
  const unread = reminders.filter((item) => !item.readBy.includes(uid)).length
  const latestDocumentWithDate = documents.find((document) => document.issuedDate || document.createdAt)
  const latestDocumentDate = latestDocumentWithDate?.issuedDate ?? latestDocumentWithDate?.createdAt
  const currentWeekStart = startOfWeek(new Date(currentTime)).getTime()
  const defaultWeekStart = startOfWeek(latestDocumentDate ?? new Date(currentTime)).getTime()
  const effectiveWeekStart = selectedWeekStart ?? defaultWeekStart

  const weekOptions = useMemo(() => {
    const options = Array.from({ length: WEEK_OPTION_COUNT }, (_, index) => addDays(new Date(currentWeekStart), -index * 7).getTime())
    if (!options.includes(defaultWeekStart)) options.push(defaultWeekStart)
    return options.sort((left, right) => right - left)
  }, [currentWeekStart, defaultWeekStart])

  const { metrics, weeklyDocuments } = useDashboardMetrics(documents, effectiveWeekStart, currentTime)

  return (
    <main className="min-h-screen bg-[#0b1020] text-slate-100">
      <div className="flex min-h-screen">
        <DashboardSidebar open={mobileMenu} unread={unread} onClose={() => setMobileMenu(false)} />
        <section className="min-w-0 flex-1">
          <DashboardHeader currentTime={currentTime} email={email} onOpenMenu={() => setMobileMenu(true)} />
          <div className="mx-auto max-w-[1400px] space-y-6 p-5 lg:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div><p className="text-sm text-slate-400">Theo dõi tiến độ tiếp nhận và xử lý</p><h2 className="mt-1 text-2xl font-semibold">Hiệu suất theo tuần</h2></div>
              <label className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300">
                <Filter size={15} className="text-cyan-300" /> Theo tuần
                <select value={effectiveWeekStart} onChange={(event) => setSelectedWeekStart(Number(event.target.value))} className="bg-[#0b1020] outline-none" aria-label="Chọn tuần báo cáo">
                  {weekOptions.map((weekStart) => <option key={weekStart} value={weekStart}>{formatWeekRange(weekStart)}</option>)}
                </select>
              </label>
            </div>
            <DashboardKpis metrics={metrics} unavailable={documentsLoading || Boolean(documentsError)} />
            <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              <WeeklyDocumentsChart documents={weeklyDocuments} loading={documentsLoading} error={documentsError} />
              <LeadershipReminders reminders={reminders} loading={remindersLoading} error={remindersError} uid={uid} />
            </div>
            <DocumentSection documents={documents} loading={documentsLoading} error={documentsError} currentTime={currentTime} actor={{ uid, email }} onDocumentDateChange={(date) => setSelectedWeekStart(startOfWeek(date).getTime())} />
          </div>
        </section>
      </div>
    </main>
  )
}
