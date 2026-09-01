'use client'

import { useRef } from 'react'
import { FileText, Paperclip, Trash2 } from 'lucide-react'
import {
  ACCEPTED_ATTACHMENT_EXTENSIONS,
  MAX_ATTACHMENT_COUNT,
  MAX_ATTACHMENT_SIZE,
} from '@/features/documents/services/attachment-service'

type Props = {
  files: File[]
  onChange: (files: File[]) => void
  disabled?: boolean
}

function formatFileSize(size: number): string {
  return size >= 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(2)} MB` : `${Math.ceil(size / 1024)} KB`
}

export function DocumentFilePicker({ files, onChange, disabled = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(fileList: FileList | null) {
    if (!fileList) return
    const candidates = [...files, ...Array.from(fileList)]
    const uniqueFiles = candidates.filter((file, index, list) => (
      list.findIndex((item) => item.name === file.name && item.size === file.size) === index
    )).slice(0, MAX_ATTACHMENT_COUNT)
    onChange(uniqueFiles)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <section className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 sm:col-span-2">
      <input ref={inputRef} type="file" multiple accept={ACCEPTED_ATTACHMENT_EXTENSIONS} className="hidden" onChange={(event) => addFiles(event.target.files)} />
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div><p className="flex items-center gap-2 text-sm font-medium"><Paperclip size={15} className="text-cyan-300" /> Tệp hồ sơ đính kèm</p><p className="mt-1 text-[11px] text-slate-500">PDF, Word, Excel hoặc CSV · tối đa {MAX_ATTACHMENT_COUNT} tệp · mỗi tệp tối đa {MAX_ATTACHMENT_SIZE / 1024 / 1024} MB</p></div>
        <button type="button" disabled={disabled || files.length >= MAX_ATTACHMENT_COUNT} onClick={() => inputRef.current?.click()} className="rounded-lg border border-cyan-300/20 px-3 py-2 text-xs text-cyan-300 hover:bg-cyan-300/5 disabled:cursor-not-allowed disabled:opacity-50">Chọn tệp</button>
      </div>
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}`} className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
              <FileText size={14} className="shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="text-slate-500">{formatFileSize(file.size)}</span>
              <button type="button" disabled={disabled} onClick={() => onChange(files.filter((_, fileIndex) => fileIndex !== index))} className="rounded p-1 text-slate-500 hover:bg-red-300/10 hover:text-red-300" aria-label={`Bỏ tệp ${file.name}`}><Trash2 size={14} /></button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
