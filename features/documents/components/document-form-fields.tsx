'use client'

import type { Dispatch, SetStateAction } from 'react'
import type { DocumentForm } from '@/features/documents/types/document'
import { DOCUMENT_TYPE_OPTIONS } from '@/features/documents/utils/document-number'
import { WORKFLOW_STATUS_OPTIONS } from '@/features/documents/utils/document-status'
import { DatePickerField } from '@/features/documents/components/date-picker-field'
import {
  LEADERSHIP_ATTENTION_OPTIONS,
  LEADERSHIP_PRIORITY_OPTIONS,
} from '@/features/tasks/utils/leadership-reminder'

type Props = {
  form: DocumentForm
  setForm: Dispatch<SetStateAction<DocumentForm>>
  allowDocumentType?: boolean
  onDocumentTypeChange?: (value: string) => void
}

export function DocumentFormFields({ form, setForm, allowDocumentType = false, onDocumentTypeChange }: Props) {
  function update<K extends keyof DocumentForm>(field: K, value: DocumentForm[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {allowDocumentType && (
        <label className="text-sm">
          <span className="mb-1.5 block text-xs text-slate-400">Loại hồ sơ *</span>
          <select value={form.documentType} onChange={(event) => onDocumentTypeChange?.(event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 outline-none focus:border-cyan-300/50">
            {DOCUMENT_TYPE_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label} ({item.prefix})</option>)}
          </select>
        </label>
      )}
      <label className={`text-sm ${allowDocumentType ? 'sm:col-span-2' : 'sm:col-span-2'}`}><span className="mb-1.5 block text-xs text-slate-400">Tên hồ sơ *</span><input required value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Nhập tên hồ sơ" className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 outline-none focus:border-cyan-300/50" /></label>
      <DatePickerField label="Ngày ban hành" required value={form.issuedDate} fallback="Chọn ngày" onChange={(value) => update('issuedDate', value)} />
      <DatePickerField label="Hạn xử lý" value={form.handlingDueDate} onChange={(value) => update('handlingDueDate', value)} />
      <label className="text-sm"><span className="mb-1.5 block text-xs text-slate-400">Đơn vị gửi *</span><input required value={form.originatorName} onChange={(event) => update('originatorName', event.target.value)} placeholder="MAUR_TCJV" className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 outline-none focus:border-cyan-300/50" /></label>
      <label className="text-sm"><span className="mb-1.5 block text-xs text-slate-400">Bên nhận</span><input value={form.recipientNames} onChange={(event) => update('recipientNames', event.target.value)} placeholder="PICC, THAC_CRSG" className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 outline-none focus:border-cyan-300/50" /><span className="mt-1 block text-[11px] text-slate-600">Phân cách nhiều đơn vị bằng dấu phẩy.</span></label>
      <label className="text-sm"><span className="mb-1.5 block text-xs text-slate-400">Đơn vị phụ trách *</span><input required value={form.responsibleUnitName} onChange={(event) => update('responsibleUnitName', event.target.value)} placeholder="Phòng Kế hoạch" className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 outline-none focus:border-cyan-300/50" /></label>
      <label className="text-sm"><span className="mb-1.5 block text-xs text-slate-400">Người phụ trách</span><input value={form.assigneeName} onChange={(event) => update('assigneeName', event.target.value)} placeholder="Chưa phân công" className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 outline-none focus:border-cyan-300/50" /></label>
      <label className="text-sm"><span className="mb-1.5 block text-xs text-slate-400">Trạng thái *</span><select value={form.workflowStatus} onChange={(event) => update('workflowStatus', event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 outline-none focus:border-cyan-300/50">{WORKFLOW_STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
      <label className="text-sm sm:col-span-2"><span className="mb-1.5 block text-xs text-slate-400">Tóm tắt</span><textarea value={form.summary} onChange={(event) => update('summary', event.target.value)} rows={3} placeholder="Nội dung chính và yêu cầu xử lý" className="w-full resize-y rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 outline-none focus:border-cyan-300/50" /></label>
      <section className="rounded-xl border border-amber-300/15 bg-amber-300/[0.025] p-4 sm:col-span-2">
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={form.requiresLeadershipAttention} onChange={(event) => update('requiresLeadershipAttention', event.target.checked)} className="mt-0.5 size-4 accent-amber-300" />
          <span><span className="block text-sm font-medium text-amber-200">Cần lãnh đạo lưu ý</span><span className="mt-1 block text-[11px] leading-5 text-slate-500">Chỉ chọn khi hồ sơ cần quyết định, đang vướng mắc, có rủi ro hoặc sắp đến hạn quan trọng.</span></span>
        </label>
        {form.requiresLeadershipAttention && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm"><span className="mb-1.5 block text-xs text-slate-400">Lý do cần lưu ý *</span><select value={form.attentionType} onChange={(event) => update('attentionType', event.target.value as DocumentForm['attentionType'])} className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 outline-none focus:border-amber-300/50">{LEADERSHIP_ATTENTION_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label className="text-sm"><span className="mb-1.5 block text-xs text-slate-400">Mức độ *</span><select value={form.leadershipPriority} onChange={(event) => update('leadershipPriority', event.target.value as DocumentForm['leadershipPriority'])} className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 outline-none focus:border-amber-300/50">{LEADERSHIP_PRIORITY_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label className="text-sm sm:col-span-2"><span className="mb-1.5 block text-xs text-slate-400">Nội dung nhắc việc</span><input value={form.leadershipTaskTitle} onChange={(event) => update('leadershipTaskTitle', event.target.value)} placeholder="Bỏ trống để sử dụng tên hồ sơ" className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 outline-none focus:border-amber-300/50" /></label>
            <label className="text-sm sm:col-span-2"><span className="mb-1.5 block text-xs text-slate-400">Nội dung cần lãnh đạo xem xét</span><textarea value={form.leadershipNote} onChange={(event) => update('leadershipNote', event.target.value)} rows={2} placeholder="Nêu rõ vấn đề, quyết định hoặc hỗ trợ cần thiết" className="w-full resize-y rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 outline-none focus:border-amber-300/50" /></label>
          </div>
        )}
      </section>
    </div>
  )
}
