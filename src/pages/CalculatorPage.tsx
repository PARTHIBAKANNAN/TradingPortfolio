import { PageContainer } from '../components/layout/PageContainer.tsx'
import { CalculatorPanel } from '../components/calculator/CalculatorPanel.tsx'
import { SellCalculatorPanel } from '../components/calculator/SellCalculatorPanel.tsx'

export function CalculatorPage() {
  return (
    <PageContainer title="Average Price Calculator">
      <CalculatorPanel />

      <div className="mt-10">
        <h2 className="mb-2 text-lg font-semibold text-slate-100">Profit Calculator</h2>
        <SellCalculatorPanel />
      </div>
    </PageContainer>
  )
}
