import type { ReactNode } from 'react'

export function DashboardShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen">{children}</div>
}
