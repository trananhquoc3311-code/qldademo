'use client'

import { useMemo, useState } from 'react'
import { Bell, CheckCircle2, ClipboardList, FileUp, Filter, LayoutDashboard, Menu, Search, ShieldAlert, Upload, Users, X } from 'lucide-react'
import { reports, reminders, weeklyTrend, type ReportStatus } from '../lib/data'
import { useAuth } from '@/components/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { UserMenu } from '@/components/UserMenu'

const statusClasses: Record<ReportStatus, string> = {
  'Đã nhận': 'bg-emerald-400/10 text-emerald-300',
  'Đang xử lý': 'bg-blue-400/10 text-blue-300',
  'Chờ bổ sung': 'bg-amber-400/10 text-amber-300',
  'Quá hạn': 'bg-red-400/10 text-red-300',
}

function StatusBadge({ status }: { status: ReportStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${statusClasses[status]}`}>{status}</span>
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'Tất cả' | ReportStatus>('Tất cả')
  const [selectedId, setSelectedId] = useState(reports[0]?.id ?? '')
  const [completedReminders, setCompletedReminders] = useState<number[]>([])
  const [mobileMenu, setMobileMenu] = useState(false)
  const [fileName, setFileName] = useState('')

  const visibleReports = useMemo(() => reports.filter((report) => {
    const text = `${report.title} ${report.unit} ${report.owner}`.toLowerCase()
    return text.includes(query.toLowerCase()) && (status === 'Tất cả' || report.status === status)
  }), [query, status])
  const selected = reports.find((report) => report.id === selectedId) ?? reports[0]
  const unread = reminders.length - completedReminders.length

  if (!selected) {
    return <main className="grid min-h-screen place-items-center bg-slate-950 text-white">Chưa có dữ liệu báo cáo.</main>
  }

  return (
    <main className="min-h-screen bg-[#0b1020] text-slate-100">
      <div className="flex min-h-screen">
        <aside className={`${mobileMenu ? 'fixed inset-y-0 left-0 z-40 flex' : 'hidden'} w-64 shrink-0 flex-col border-r border-white/10 bg-[#10172b] p-5 lg:flex`}>
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-xl bg-cyan-300 text-slate-950"><LayoutDashboard size={18} /></div><div><p className="font-semibold">Báo cáo số</p><p className="text-xs text-slate-500">Trung tâm điều hành</p></div></div>
            <button className="lg:hidden" onClick={() => setMobileMenu(false)} aria-label="Đóng menu"><X size={18} /></button>
          </div>
          <nav className="space-y-1 text-sm">
            <button className="flex w-full items-center gap-3 rounded-xl bg-cyan-300/10 px-3 py-2.5 text-left text-cyan-300"><LayoutDashboard size={17} /> Tổng quan</button>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-400 hover:bg-white/5"><ClipboardList size={17} /> Báo cáo</button>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-400 hover:bg-white/5"><Users size={17} /> Đơn vị gửi</button>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-400 hover:bg-white/5"><Bell size={17} /> Nhắc việc <span className="ml-auto rounded-full bg-red-400 px-2 py-0.5 text-[10px] text-white">{unread}</span></button>
          </nav>
          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="flex items-center gap-2 text-sm font-medium"><ShieldAlert size={16} className="text-amber-300" /> Trạng thái hệ thống</p><p className="mt-2 text-xs leading-5 text-slate-500">Dữ liệu mẫu đã sẵn sàng để theo dõi.</p><p className="mt-3 text-xs text-emerald-300">● Hoạt động bình thường</p></div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="border-b border-white/10 bg-[#0d1426] px-5 py-4 lg:px-8"><div className="mx-auto flex max-w-[1400px] items-center justify-between"><div className="flex items-center gap-3"><button className="lg:hidden" onClick={() => setMobileMenu(true)} aria-label="Mở menu"><Menu size={20} /></button><div><p className="text-xs text-slate-500">Thứ Ba, 18 tháng 8, 2026</p><h1 className="mt-1 text-xl font-semibold">Tổng quan báo cáo</h1></div></div><div className="flex items-center gap-4"><span className="hidden text-xs text-slate-400 sm:block">{user?.email}</span><UserMenu /><Bell className="text-slate-400" size={19} /></div></div></header>

          <div className="mx-auto max-w-[1400px] space-y-6 p-5 lg:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm text-slate-400">Theo dõi tiến độ tiếp nhận và xử lý</p><h2 className="mt-1 text-2xl font-semibold">Hiệu suất tuần này</h2></div><label className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300"><Filter size={15} className="text-cyan-300" /> Tuần này <select className="bg-transparent outline-none"><option>18/08 - 24/08/2026</option></select></label></div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Tổng báo cáo" value="64" icon={<ClipboardList className="text-cyan-300" />} />
              <StatCard label="Đã xử lý" value="42" icon={<CheckCircle2 className="text-emerald-300" />} />
              <StatCard label="Đang chờ xử lý" value="17" icon={<Bell className="text-amber-300" />} />
              <StatCard label="Quá hạn" value="05" icon={<ShieldAlert className="text-red-300" />} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              <section className="rounded-2xl border border-white/10 bg-[#111a30] p-5"><h3 className="font-semibold">Tiến độ tiếp nhận báo cáo</h3><p className="mt-1 text-xs text-slate-500">Số lượng báo cáo theo ngày trong tuần</p><div className="mt-8 flex h-48 items-end gap-3 border-b border-white/10">{weeklyTrend.map((item) => <div key={item.day} className="flex flex-1 flex-col items-center gap-2"><div className="flex h-40 items-end gap-1"><div className="w-3 rounded-t bg-cyan-300/80" style={{ height: `${item.total / 15 * 100}%` }} /><div className="w-3 rounded-t bg-violet-300/80" style={{ height: `${item.completed / 15 * 100}%` }} /></div><span className="text-xs text-slate-500">{item.day}</span></div>)}</div></section>
              <section className="rounded-2xl border border-white/10 bg-[#111a30] p-5"><div className="flex items-center justify-between"><div><h3 className="font-semibold">Nhắc việc lãnh đạo</h3><p className="mt-1 text-xs text-slate-500">Các việc cần lưu ý hôm nay</p></div><span className="text-xs text-red-300">{unread} chưa đọc</span></div><div className="mt-5 space-y-3">{reminders.map((item) => { const done = completedReminders.includes(item.id); return <button key={item.id} onClick={() => setCompletedReminders((current) => done ? current.filter((id) => id !== item.id) : [...current, item.id])} className="flex w-full items-start gap-3 rounded-xl border border-white/10 p-3 text-left hover:bg-white/5"><span className="mt-1 size-2 rounded-full bg-amber-300" /><span><span className={`block text-sm ${done ? 'line-through opacity-60' : ''}`}>{item.title}</span><span className="mt-1 block text-xs text-slate-500">{item.meta}</span></span></button> })}</div></section>
            </div>

            <section className="rounded-2xl border border-white/10 bg-[#111a30] p-5"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"><div><h3 className="font-semibold">Báo cáo mới nhất</h3><p className="mt-1 text-xs text-slate-500">Danh sách báo cáo cập nhật gần đây</p></div><div className="flex gap-2"><label className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2"><Search size={15} className="text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm báo cáo..." className="w-44 bg-transparent text-sm outline-none" /></label><select value={status} onChange={(event) => setStatus(event.target.value as 'Tất cả' | ReportStatus)} className="rounded-xl border border-white/10 bg-[#111a30] px-3 text-sm"><option>Tất cả</option><option>Đã nhận</option><option>Đang xử lý</option><option>Chờ bổ sung</option><option>Quá hạn</option></select></div></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-y border-white/10 text-xs text-slate-500"><tr><th className="px-3 py-3">Mã / Tên báo cáo</th><th className="px-3 py-3">Đơn vị</th><th className="px-3 py-3">Phụ trách</th><th className="px-3 py-3">Hạn xử lý</th><th className="px-3 py-3">Trạng thái</th></tr></thead><tbody>{visibleReports.map((report) => <tr key={report.id} className="border-b border-white/5 hover:bg-white/[0.03]"><td className="px-3 py-4"><button className="text-left" onClick={() => setSelectedId(report.id)}><span className="block text-xs text-cyan-300">{report.id}</span><span className="mt-1 block font-medium">{report.title}</span></button></td><td className="px-3 py-4 text-slate-400">{report.unit}</td><td className="px-3 py-4 text-slate-400">{report.owner}</td><td className="px-3 py-4 text-slate-400">{report.dueAt}</td><td className="px-3 py-4"><StatusBadge status={report.status} /></td></tr>)}</tbody></table>{visibleReports.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Không tìm thấy báo cáo phù hợp.</p>}</div></section>

            <div className="grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-5"><h3 className="font-semibold text-cyan-300">Chi tiết đang chọn</h3><h4 className="mt-5 text-lg font-semibold">{selected.title}</h4><p className="mt-2 text-sm text-slate-400">{selected.id} · {selected.unit}</p><p className="mt-4 text-sm">Phụ trách: {selected.owner}</p><div className="mt-4"><StatusBadge status={selected.status} /></div></section><label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 p-6 text-center hover:border-cyan-300/50"><input type="file" accept=".xlsx,.xls,.csv,.pdf" className="hidden" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')} /><Upload className="text-cyan-300" /><p className="mt-3 font-medium">Tải lên báo cáo mới</p><p className="mt-1 text-xs text-slate-500">Excel, CSV hoặc PDF</p>{fileName && <p className="mt-3 text-xs text-emerald-300">Đã chọn: {fileName}</p>}<span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-3 py-2 text-xs font-semibold text-slate-950"><FileUp size={14} /> Chọn tệp</span></label></div>
          </div>
        </section>
      </div>
    </main>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-[#111a30] p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-400">{label}</span>{icon}</div><p className="mt-4 text-3xl font-semibold">{value}</p></div>
}
