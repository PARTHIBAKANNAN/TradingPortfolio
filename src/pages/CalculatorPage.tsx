import { PageContainer } from '../components/layout/PageContainer.tsx'
import { CalculatorPanel } from '../components/calculator/CalculatorPanel.tsx'

export function CalculatorPage() {
  return (
    <PageContainer title="Average Price Calculator">
      <CalculatorPanel />
    </PageContainer>
  )
}
