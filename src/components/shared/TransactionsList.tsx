import { Fragment, useState } from 'react'
import { SecondaryButton } from './FormControls.tsx'

export interface TransactionColumn<T> {
  header: string
  align?: 'left' | 'right'
  render: (t: T) => React.ReactNode
}

export function TransactionsList<T extends { id: number }>({
  transactions,
  columns,
  onDelete,
  renderEditForm,
}: {
  transactions: T[]
  columns: TransactionColumn<T>[]
  onDelete: (t: T) => Promise<void>
  renderEditForm?: (t: T, close: () => void) => React.ReactNode
}) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  if (transactions.length === 0) {
    return <p className="text-sm text-[#94a3b8]">No transactions yet.</p>
  }

  const handleDelete = async (t: T) => {
    if (!confirm('Delete this transaction? This cannot be undone.')) return
    setDeletingId(t.id)
    try {
      await onDelete(t)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="table-premium overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.header} className={`${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                {col.header}
              </th>
            ))}
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {[...transactions].reverse().map((t) => (
            <Fragment key={t.id}>
              <tr>
                {columns.map((col) => (
                  <td key={col.header} className={`${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                    {col.render(t)}
                  </td>
                ))}
                <td className="whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
                    {renderEditForm && (
                      <button
                        onClick={() => setEditingId(editingId === t.id ? null : t.id)}
                        className="text-xs font-semibold text-[#60a5fa] hover:text-[#93c5fd] transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    <SecondaryButton
                      type="button"
                      className="px-2 py-1 text-xs"
                      disabled={deletingId === t.id}
                      onClick={() => handleDelete(t)}
                    >
                      {deletingId === t.id ? 'Deleting…' : 'Delete'}
                    </SecondaryButton>
                  </div>
                </td>
              </tr>
              {editingId === t.id && renderEditForm && (
                <tr>
                  <td colSpan={columns.length + 1} className="bg-[#111d3c] px-4 py-4">
                    {renderEditForm(t, () => setEditingId(null))}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
