import type { ReactNode } from 'react'

export function PageContainer({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#e0f2fe] to-[#cbd5e1] bg-clip-text text-transparent">{title}</h1>
        <div className="mt-2 h-1 w-20 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] rounded-full" />
      </div>
      <div className="space-y-8">{children}</div>
    </div>
  )
}
