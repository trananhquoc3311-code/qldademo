import { Bell, CheckCircle2, ClipboardList, Clock3, ShieldAlert } from 'lucide-react'
import type { DashboardMetrics } from '@/features/dashboard/utils/dashboard-calculations'

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111a30] p-5">
      <div className="flex items-center justify-between"><span className="text-sm text-slate-400">{label}</span>{icon}</div>
      <p className="mt-4 text-3xl font-semibold">{value}</p>
    </div>
  )
}

export function DashboardKpis({ metrics, unavailable }: { metrics: DashboardMetrics; unavailable: boolean }) {
  const show = (value: number) => unavailable ? '—' : String(value)
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard label="Hồ sơ mới trong tuần" value={show(metrics.newThisWeek)} icon={<ClipboardList className="text-cyan-300" />} />
      <StatCard label="Tồn đọng từ trước" value={show(metrics.backlog)} icon={<Clock3 className="text-orange-300" />} />
      <StatCard label="Hoàn thành lũy kế" value={show(metrics.completedCumulative)} icon={<CheckCircle2 className="text-emerald-300" />} />
      <StatCard label="Đang xử lý lũy kế" value={show(metrics.inProgressCumulative)} icon={<Bell className="text-amber-300" />} />
      <StatCard label="Quá hạn" value={show(metrics.overdue)} icon={<ShieldAlert className="text-red-300" />} />
    </div>
  )
}
