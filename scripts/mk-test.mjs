// Local Maksekeskus smoke test: validates the credentials in .env and the
// exact transaction shape the Apps Script adapter sends, then prints the
// gateway URL you can open to see the test payment page.
//
//   npm run mk:test
//
// Creates a 1.00 € transaction in the TEST environment (MK_ENV=live is
// refused on purpose — this script must never touch the live API).
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)

const { MK_SHOP_ID, MK_SECRET_KEY, MK_ENV } = env
if (!MK_SHOP_ID || !MK_SECRET_KEY) {
  console.error('MK_SHOP_ID / MK_SECRET_KEY missing from .env')
  process.exit(1)
}
if ((MK_ENV || 'test') !== 'test') {
  console.error('Refusing: this smoke test only runs against MK_ENV=test')
  process.exit(1)
}

const auth = Buffer.from(`${MK_SHOP_ID}:${MK_SECRET_KEY}`).toString('base64')
const api = 'https://api.test.maksekeskus.ee'

const shop = await fetch(`${api}/v1/shop`, { headers: { Authorization: `Basic ${auth}` } })
if (!shop.ok) {
  console.error(`GET /v1/shop → ${shop.status}: credentials rejected`)
  process.exit(1)
}
console.log(`✓ credentials OK — shop: ${(await shop.json()).name}`)

const reference = `mk-test-${Date.now()}`
const res = await fetch(`${api}/v1/transactions`, {
  method: 'POST',
  headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transaction: {
      amount: '1.00',
      currency: 'EUR',
      reference,
      merchant_data: reference,
      transaction_url: {
        return_url: { url: `https://unevalem.ee/aitah?ref=${reference}`, method: 'GET' },
        cancel_url: { url: `https://unevalem.ee/aitah?ref=${reference}`, method: 'GET' },
        notifications_url: { url: 'https://unevalem.ee/aitah', method: 'POST' },
      },
    },
    customer: { email: 'test@unevalem.ee', country: 'ee', locale: 'et', ip: '0.0.0.0' },
  }),
})
const tx = await res.json()
if (!res.ok) {
  console.error(`POST /v1/transactions → ${res.status}:`, JSON.stringify(tx).slice(0, 300))
  process.exit(1)
}

const redirect = (tx.payment_methods?.other ?? []).find(o => o.name === 'redirect')
console.log(`✓ transaction ${tx.id} (${tx.status})`)
console.log(`✓ gateway URL: ${redirect?.url ?? 'NOT FOUND'}`)
console.log('\nOpen the URL to see the test payment page (test banklinks, no real money).')
