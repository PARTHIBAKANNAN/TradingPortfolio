import { PageContainer } from '../components/layout/PageContainer.tsx'
import { ExpenseForm, type ExpenseFormValues } from '../components/shared/ExpenseForm.tsx'
import { TransactionsList } from '../components/shared/TransactionsList.tsx'
import { CsvUploadWidget } from '../components/shared/CsvUploadWidget.tsx'
import { useExpenses } from '../hooks/useExpenses.ts'
import * as api from '../lib/apiClient.ts'
import { formatCurrency, formatDate } from '../lib/formatters.ts'
import type { Expense } from '@shared/types.ts'

export function ExpensesPage() {
  const { expenses, refresh } = useExpenses()

  const handleCreate = async (values: ExpenseFormValues) => {
    await api.createExpense({
      expenseDate: values.expenseDate,
      category: values.category,
      amount: Number(values.amount),
      description: values.description || null,
      notes: values.notes || null,
    })
    await refresh()
  }

  return (
    <PageContainer title="Expenses">
      <section className="mb-8">
        <h2 className="mb-2 text-sm font-semibold text-slate-600">Add expense</h2>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <ExpenseForm onSubmit={handleCreate} />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-semibold text-slate-600">Import from Axio (CSV)</h2>
        <p className="mb-2 text-xs text-slate-500">
          Axio has no live sync — export a statement from within the app and import it here whenever you like.
          Re-importing an overlapping period will create duplicate rows; delete them manually if that happens.
        </p>
        <CsvUploadWidget
          importFn={api.importExpensesCsv}
          onImported={refresh}
          renderPreviewRow={(row: Partial<Expense>) => `${row.expenseDate} — ${row.category}: ${row.amount}`}
        />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-600">Expense history</h2>
        <TransactionsList
          transactions={expenses}
          onDelete={async (e) => {
            await api.deleteExpense(e.id)
            await refresh()
          }}
          renderEditForm={(e, close) => (
            <ExpenseForm
              submitLabel="Save changes"
              initial={{
                expenseDate: e.expenseDate,
                category: e.category,
                amount: String(e.amount),
                description: e.description ?? '',
                notes: e.notes ?? '',
              }}
              onCancel={close}
              onSubmit={async (values) => {
                await api.updateExpense(e.id, {
                  expenseDate: values.expenseDate,
                  category: values.category,
                  amount: Number(values.amount),
                  description: values.description || null,
                  notes: values.notes || null,
                })
                await refresh()
                close()
              }}
            />
          )}
          columns={[
            { header: 'Date', render: (e) => formatDate(e.expenseDate) },
            { header: 'Category', render: (e) => e.category },
            { header: 'Description', render: (e) => e.description ?? '—' },
            { header: 'Amount', align: 'right', render: (e) => formatCurrency(e.amount) },
          ]}
        />
      </section>
    </PageContainer>
  )
}
