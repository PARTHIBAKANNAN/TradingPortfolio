const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

/** Decodes an RFC 4648 base32 string (e.g. a TOTP seed) into raw bytes. */
export function base32Decode(input: string): Uint8Array {
  const clean = input.replace(/=+$/, '').toUpperCase().replace(/\s/g, '')
  const bytes: number[] = []
  let bits = 0
  let value = 0
  for (const char of clean) {
    const idx = BASE32_ALPHABET.indexOf(char)
    if (idx === -1) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      bits -= 8
      bytes.push((value >> bits) & 0xff)
    }
  }
  return new Uint8Array(bytes)
}

async function hotp(secretBase32: string, counter: bigint): Promise<string> {
  const key = base32Decode(secretBase32)
  const counterBytes = new ArrayBuffer(8)
  new DataView(counterBytes).setBigUint64(0, counter, false)
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key.buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  )
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, counterBytes))
  const offset = signature[signature.length - 1] & 0x0f
  const binCode =
    ((signature[offset] & 0x7f) << 24) |
    (signature[offset + 1] << 16) |
    (signature[offset + 2] << 8) |
    signature[offset + 3]
  return String(binCode % 1_000_000).padStart(6, '0')
}

/** Computes the current RFC 6238 TOTP code for a base32-encoded seed. */
export async function currentTotp(secretBase32: string, stepSeconds = 30): Promise<string> {
  const counter = BigInt(Math.floor(Date.now() / 1000 / stepSeconds))
  return hotp(secretBase32, counter)
}
