import { Bell, Menu } from 'lucide-react'
import { UserMenu } from '@/components/UserMenu'
import { formatHeaderDate } from '@/features/dashboard/utils/date'

type Props = { currentTime: number; email: string; onOpenMenu: () => void }

export function DashboardHeader({ currentTime, email, onOpenMenu }: Props) {
  return (
    <header className="border-b border-white/10 bg-[#0d1426] px-5 py-4 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between">
        <div className="flex items-center gap-3"><button type="button" className="lg:hidden" onClick={onOpenMenu} aria-label="Mở menu"><Menu size={20} /></button><div><p className="text-xs text-slate-500">{formatHeaderDate(currentTime)}</p><h1 className="mt-1 text-xl font-semibold">Tổng quan báo cáo</h1></div></div>
        <div className="flex items-center gap-4"><span className="hidden text-xs text-slate-400 sm:block">{email}</span><UserMenu /><Bell className="text-slate-400" size={19} /></div>
      </div>
    </header>
  )
}
