'use client'

import { FormEvent, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole, LogIn, Mail } from 'lucide-react'
import { useAuth } from '@/components/AuthContext'

function firebaseErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : ''
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
    'auth/invalid-login-credentials': 'Email hoặc mật khẩu không đúng.',
    'auth/user-not-found': 'Tài khoản chưa tồn tại.',
    'auth/wrong-password': 'Email hoặc mật khẩu không đúng.',
    'auth/invalid-email': 'Email không hợp lệ.',
    'auth/too-many-requests': 'Có quá nhiều lần thử. Vui lòng thử lại sau.',
    'auth/popup-closed-by-user': 'Bạn đã đóng cửa sổ đăng nhập Google.',
    'auth/popup-blocked': 'Trình duyệt đã chặn cửa sổ Google. Hãy cho phép popup rồi thử lại.',
    'auth/operation-not-allowed': 'Phương thức đăng nhập này chưa được bật trong Firebase Console.',
    'auth/unauthorized-domain': 'Tên miền hiện tại chưa được thêm vào Authorized domains trong Firebase Console.',
  }
  return messages[code] ?? (error instanceof Error ? error.message : 'Đăng nhập thất bại.')
}

export default function LoginPage() {
  const router = useRouter()
  const { user, loading, loginWithEmail, loginWithGoogle, error } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user && !loading) router.replace('/')
  }, [user, loading, router])

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    try {
      await loginWithEmail(email, password)
      router.replace('/')
    } catch (loginError) {
      setMessage(firebaseErrorMessage(loginError))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogleLogin() {
    setIsSubmitting(true)
    setMessage('')
    try {
      await loginWithGoogle()
      router.replace('/')
    } catch (loginError) {
      setMessage(firebaseErrorMessage(loginError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayedError = message || error
  const busy = loading || isSubmitting

  if (loading && !user) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-slate-100">
        <div className="flex items-center gap-3 text-slate-300" role="status">
          <Loader2 className="size-5 animate-spin text-cyan-300" /> Đang kiểm tra phiên đăng nhập...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <Link href="/login" className="mb-12 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-cyan-300 font-bold text-slate-950">BC</span>
              <span className="font-semibold">Dashboard Báo Cáo</span>
            </Link>
            <div className="mb-8">
              <h1 className="text-3xl font-semibold tracking-tight">Đăng nhập hệ thống</h1>
              <p className="mt-2 text-sm text-slate-400">Quản lý báo cáo và nhắc việc lãnh đạo.</p>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium">Email công vụ</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 size-4 text-slate-500" />
                  <input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ten@donvi.gov.vn" className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-300" />
                </div>
              </div>
              <div>
                <div className="mb-2 flex justify-between">
                  <label htmlFor="password" className="text-sm font-medium">Mật khẩu</label>
                  <button type="button" className="text-xs text-cyan-300" onClick={() => setMessage('Nhập email rồi liên hệ quản trị viên để đặt lại mật khẩu.')}>Quên mật khẩu?</button>
                </div>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-3 size-4 text-slate-500" />
                  <input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nhập mật khẩu" className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-10 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-300" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-3 text-slate-500" aria-label="Hiện hoặc ẩn mật khẩu">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-400"><input type="checkbox" className="accent-cyan-300" /> Ghi nhớ đăng nhập</label>
              <button type="submit" disabled={busy} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 text-sm font-semibold text-slate-950 hover:bg-cyan-200 disabled:opacity-70">
                {busy ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />} Đăng nhập
              </button>
            </form>

            <button type="button" onClick={handleGoogleLogin} disabled={busy} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 text-sm font-medium hover:bg-white/10 disabled:opacity-70">
              <span className="grid size-4 place-items-center rounded-full bg-white text-[10px] font-bold text-blue-600">G</span>
              Đăng nhập bằng Google
            </button>

            {displayedError && (
              <div role="alert" className="mt-5 flex gap-2 rounded-lg border border-red-300/20 bg-red-300/10 p-3 text-xs leading-5 text-red-200">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {displayedError}
              </div>
            )}
            <p className="mt-8 text-center text-xs text-slate-500">Chưa có tài khoản? Liên hệ quản trị hệ thống.</p>
          </div>
        </section>
        <section className="relative hidden min-h-screen lg:block">
          <Image src="/images/qlda.avif" alt="Hình ảnh hệ thống QDA" fill priority sizes="50vw" className="object-cover" />
          <div className="absolute inset-0 bg-slate-950/40" />
        </section>
      </div>
    </main>
  )
}
