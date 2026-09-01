'use client'

import { useRef } from 'react'
import { CalendarDays } from 'lucide-react'
import { formatDateInputVn } from '@/features/documents/utils/document-formatters'

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  fallback?: string
}

export function DatePickerField({ label, value, onChange, required = false, fallback = 'Chưa chọn' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function openDatePicker() {
    const input = inputRef.current
    if (!input) return
    input.focus({ preventScroll: true })
    if (typeof input.showPicker === 'function') input.showPicker()
    else input.click()
  }

  return (
    <div className="relative text-sm">
      <span className="mb-1.5 block text-xs text-slate-400">{label}{required ? ' *' : ''}</span>
      <button
        type="button"
        onClick={openDatePicker}
        className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 text-left outline-none hover:border-cyan-300/30 focus-visible:border-cyan-300/50 focus-visible:ring-2 focus-visible:ring-cyan-300/20"
        aria-label={`${label}: ${formatDateInputVn(value, fallback)}. Bấm để mở lịch`}
      >
        <span className={value ? 'text-slate-100' : 'text-slate-500'}>{formatDateInputVn(value, fallback)}</span>
        <CalendarDays size={16} className="shrink-0 text-cyan-300" />
      </button>
      <input ref={inputRef} required={required} type="date" lang="vi-VN" value={value} onChange={(event) => onChange(event.target.value)} tabIndex={-1} aria-label={label} className="pointer-events-none absolute bottom-0 right-0 h-px w-px opacity-0" />
    </div>
  )
}
