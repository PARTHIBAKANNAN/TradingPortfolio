import { useState } from 'react'
import type { ImportResult } from '../../lib/apiClient.ts'
import { PrimaryButton, SecondaryButton } from './FormControls.tsx'

export function CsvUploadWidget<T>({
  importFn,
  renderPreviewRow,
  onImported,
}: {
  importFn: (file: File, mode: 'preview' | 'commit') => Promise<ImportResult<T>>
  renderPreviewRow: (row: T, idx: number) => React.ReactNode
  onImported: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportResult<T> | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePreview = async () => {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      setPreview(await importFn(file, 'preview'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse file')
    } finally {
      setBusy(false)
    }
  }

  const handleCommit = async () => {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const result = await importFn(file, 'commit')
      setPreview(result)
      onImported()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to import file')
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setError(null)
  }

  return (
    <div className="rounded-lg border border-dashed border-[#2a3f5f] bg-[#111d3c] p-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null)
            setPreview(null)
          }}
          className="text-sm text-[#cbd5e1]"
        />
        <SecondaryButton type="button" disabled={!file || busy} onClick={handlePreview}>
          Preview import
        </SecondaryButton>
        {preview && preview.preview.length > 0 && (
          <PrimaryButton type="button" disabled={busy} onClick={handleCommit}>
            Confirm import ({preview.preview.length} rows)
          </PrimaryButton>
        )}
        {(file || preview) && (
          <SecondaryButton type="button" onClick={reset}>
            Reset
          </SecondaryButton>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-[#f87171]">{error}</p>}
      {preview && (
        <div className="mt-3 text-sm">
          <p className="text-slate-600">
            {preview.insertedCount > 0
              ? `Imported ${preview.insertedCount} transactions.`
              : `Parsed ${preview.preview.length} rows, ready to import.`}
            {preview.skippedCount > 0 && ` ${preview.skippedCount} row(s) had errors.`}
          </p>
          {preview.errors.length > 0 && (
            <ul className="mt-1 list-inside list-disc text-xs text-red-600">
              {preview.errors.slice(0, 10).map((err, i) => (
                <li key={i}>
                  Row {err.row}: {err.message}
                </li>
              ))}
            </ul>
          )}
          {preview.preview.length > 0 && (
            <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs text-slate-600">
              {preview.preview.slice(0, 20).map((row, idx) => (
                <li key={idx}>{renderPreviewRow(row, idx)}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
