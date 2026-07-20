import type { ReactNode } from 'react'

export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-[#cbd5e1]">{label}</span>
      {children}
    </label>
  )
}

const baseInputClass =
  'rounded-lg border border-[#475569] bg-[#1e293b] px-3 py-2 text-sm text-[#e0f2fe] placeholder-[#64748b] focus:border-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 transition-all duration-200'

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" {...props} className={`${baseInputClass} ${props.className ?? ''}`} />
}

export function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="number" step="any" {...props} className={`${baseInputClass} ${props.className ?? ''}`} />
}

export function DateInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="date" {...props} className={`${baseInputClass} ${props.className ?? ''}`} />
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${baseInputClass} ${props.className ?? ''}`} />
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-lg bg-gradient-to-r from-[#1e40af] to-[#3b82f6] px-4 py-2 text-sm font-semibold text-white hover:shadow-lg hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 transition-all duration-200 ${props.className ?? ''}`}
    />
  )
}

export function SecondaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-lg border border-[#475569] bg-[#334155] px-4 py-2 text-sm font-semibold text-[#e0f2fe] hover:border-[#3b82f6] hover:bg-[#475569] disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 transition-all duration-200 ${props.className ?? ''}`}
    />
  )
}
