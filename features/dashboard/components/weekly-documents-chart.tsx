import { calculateWeeklyTrend } from '@/features/dashboard/utils/dashboard-calculations'
import type { ProjectDocument } from '@/features/documents/types/document'

type Props = {
  documents: ProjectDocument[]
  loading: boolean
  error: string
}

export function WeeklyDocumentsChart({ documents, loading, error }: Props) {
  const trend = calculateWeeklyTrend(documents)
  const maximum = Math.max(0, ...trend.flatMap((item) => [item.total, item.completed]))
  const hasData = trend.some((item) => item.total > 0)

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111a30] p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div><h3 className="font-semibold">Tiến độ tiếp nhận hồ sơ</h3><p className="mt-1 text-xs text-slate-500">Hồ sơ phát hành trong tuần, phân theo trạng thái hiện tại</p></div>
        <div className="flex gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-cyan-300/80" />Hồ sơ mới</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-violet-300/80" />Hoàn thành</span>
        </div>
      </div>
      <div className="relative mt-7">
        {!loading && !error && !hasData && <p className="absolute inset-x-0 top-14 text-center text-xs text-slate-500">Không có hồ sơ trong tuần này.</p>}
        {loading && <p className="absolute inset-x-0 top-14 text-center text-xs text-slate-500">Đang tải dữ liệu biểu đồ...</p>}
        {error && <p className="absolute inset-x-0 top-14 text-center text-xs text-red-300">Không thể tải dữ liệu biểu đồ.</p>}
        <div className="flex h-48 items-end gap-3 border-b border-white/10">
          {trend.map((item) => (
            <div key={item.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div className="flex h-40 items-end gap-1.5">
                <div className="w-4 rounded-t bg-cyan-300/80 transition-[height]" style={{ height: item.total === 0 || maximum === 0 ? '0%' : `${Math.max(8, item.total / maximum * 100)}%` }} title={`${item.day}: ${item.total} hồ sơ`} />
                <div className="w-4 rounded-t bg-violet-300/80 transition-[height]" style={{ height: item.completed === 0 || maximum === 0 ? '0%' : `${Math.max(8, item.completed / maximum * 100)}%` }} title={`${item.day}: ${item.completed} hoàn thành`} />
              </div>
              <span className="text-xs text-slate-500">{item.day}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
