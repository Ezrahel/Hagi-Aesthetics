export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import Stripe from 'stripe'
import { getEnvVar } from '@/lib/config'
import { json } from '@/lib/http'

export async function GET(request) {
  try {
    const key = process.env.STRIPE_SECRET_KEY || ''
    if (!key) return json({ ok: false, error: 'STRIPE_SECRET_KEY not set' }, 400)
    const stripe = new Stripe(key)
    // If a fallback price id is configured, try to retrieve it
    const priceId = process.env.SPIN_CREDIT_PRICE_ID || process.env.NEXT_PUBLIC_SPIN_CREDIT_PRICE_ID || null
    let price = null
    if (priceId) {
      try {
        price = await stripe.prices.retrieve(priceId)
      } catch (err) {
        return json({ ok: false, error: 'Failed to retrieve price', detail: String(err.message) }, 502)
      }
    }
    return json({ ok: true, price: price || null })
  } catch (err) {
    return json({ ok: false, error: String(err.message) }, 500)
  }
}
