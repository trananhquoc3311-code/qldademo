'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-slate-400" role="status">Đang kiểm tra phiên đăng nhập...</div>
      </div>
    )
  }

  return user ? <>{children}</> : (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="text-slate-400" role="status">Đang chuyển đến trang đăng nhập...</div>
    </div>
  )
}
