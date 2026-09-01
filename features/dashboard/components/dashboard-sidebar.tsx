import { Bell, ClipboardList, LayoutDashboard, ShieldAlert, Users, X } from 'lucide-react'

type Props = { open: boolean; unread: number; onClose: () => void }

export function DashboardSidebar({ open, unread, onClose }: Props) {
  return (
    <aside className={`${open ? 'fixed inset-y-0 left-0 z-40 flex' : 'hidden'} w-64 shrink-0 flex-col border-r border-white/10 bg-[#10172b] p-5 lg:flex`}>
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-xl bg-cyan-300 text-slate-950"><LayoutDashboard size={18} /></div><div><p className="font-semibold">Báo cáo số</p><p className="text-xs text-slate-500">Trung tâm điều hành</p></div></div>
        <button type="button" className="lg:hidden" onClick={onClose} aria-label="Đóng menu"><X size={18} /></button>
      </div>
      <nav className="space-y-1 text-sm">
        <button type="button" className="flex w-full items-center gap-3 rounded-xl bg-cyan-300/10 px-3 py-2.5 text-left text-cyan-300"><LayoutDashboard size={17} /> Tổng quan</button>
        <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-400 hover:bg-white/5"><ClipboardList size={17} /> Báo cáo</button>
        <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-400 hover:bg-white/5"><Users size={17} /> Đơn vị gửi</button>
        <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-400 hover:bg-white/5"><Bell size={17} /> Nhắc việc <span className="ml-auto rounded-full bg-red-400 px-2 py-0.5 text-[10px] text-white">{unread}</span></button>
      </nav>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="flex items-center gap-2 text-sm font-medium"><ShieldAlert size={16} className="text-amber-300" /> Trạng thái hệ thống</p><p className="mt-2 text-xs leading-5 text-slate-500">Dữ liệu Firestore đang được đồng bộ theo thời gian thực.</p><p className="mt-3 text-xs text-emerald-300">● Hoạt động bình thường</p></div>
    </aside>
  )
}
