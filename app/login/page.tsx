'use client'

import { FormEvent, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('Đây là giao diện mẫu. Chức năng Firebase sẽ được kết nối sau khi bật Email/Password trong Firebase Console.')
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-12 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-cyan-300 font-bold text-slate-950">BC</span>
              <span className="font-semibold">Dashboard Báo Cáo</span>
            </Link>
            <div className="mb-8">
              <h1 className="text-3xl font-semibold tracking-tight">Đăng nhập hệ thống</h1>
              <p className="mt-2 text-sm text-slate-400">Quản lý báo cáo và nhắc việc lãnh đạo.</p>
            </div>
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium">Email công vụ</label>
                <div className="relative"><Mail className="absolute left-3 top-3 size-4 text-slate-500" /><input id="email" type="email" required placeholder="ten@donvi.gov.vn" className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-300" /></div>
              </div>
              <div>
                <div className="mb-2 flex justify-between"><label htmlFor="password" className="text-sm font-medium">Mật khẩu</label><button type="button" className="text-xs text-cyan-300">Quên mật khẩu?</button></div>
                <div className="relative"><LockKeyhole className="absolute left-3 top-3 size-4 text-slate-500" /><input id="password" type={showPassword ? 'text' : 'password'} required placeholder="Nhập mật khẩu" className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-10 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-300" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-3 text-slate-500" aria-label="Hiện hoặc ẩn mật khẩu">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-400"><input type="checkbox" className="accent-cyan-300" /> Ghi nhớ đăng nhập</label>
              <button type="submit" className="h-11 w-full rounded-lg bg-cyan-300 text-sm font-semibold text-slate-950 hover:bg-cyan-200">Đăng nhập</button>
              {message && <p role="status" className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-5 text-amber-200">{message}</p>}
            </form>
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
