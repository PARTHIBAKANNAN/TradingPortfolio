import type { NormalizedFill } from '../types.ts'
import type { AliceBlueTradeFill } from './client.ts'

/** Best-effort underlying extraction from a trading symbol like "NIFTY27MAR25C22000". */
function guessUnderlying(tradingSymbol: string): string {
  const match = tradingSymbol.match(/^([A-Z]+)/)
  return match ? match[1] : tradingSymbol
}

function toDateOnly(value: string | undefined): string {
  if (!value) return new Date().toISOString().slice(0, 10)
  return value.slice(0, 10)
}

export function normalizeAliceBlueFills(fills: AliceBlueTradeFill[]): NormalizedFill[] {
  return fills.map((fill) => {
    const date = toDateOnly(fill.Exchtime)
    const underlying = guessUnderlying(fill.Trsym)
    const strike = fill.Strprc ?? ''
    const optionType = fill.Optt ?? ''
    const expiry = fill.Expdate ? toDateOnly(fill.Expdate) : ''
    const contractKey =
      strike && optionType && expiry ? `${underlying}|${strike}|${optionType}|${expiry}` : fill.Trsym

    return {
      externalId: fill.Nstordno ?? `${fill.Trsym}-${date}-${fill.Avgprc}`,
      contractKey,
      side: fill.Trantype === 'B' ? 'BUY' : 'SELL',
      quantity: Number(fill.Filledqty),
      price: Number(fill.Avgprc),
      date,
      meta: {
        underlying,
        strikePrice: strike || '0',
        optionType: optionType || 'CE',
        expiryDate: expiry || date,
      },
    }
  })
}
