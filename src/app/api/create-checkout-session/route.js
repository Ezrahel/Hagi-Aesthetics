export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { getEnvVar, getOriginFromRequestUrl } from '@/lib/config'
import { json, errorJson } from '@/lib/http'

const stripe = new Stripe(getEnvVar('STRIPE_SECRET_KEY'))

function getSupabaseAdmin() {
	const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
	const key = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
	return createClient(url, key)
}

function normalizeItems(payload) {
	if (Array.isArray(payload.items) && payload.items.length > 0) {
		return payload.items
			.map((item) => ({
				productId: item?.productId,
				quantity: Math.max(1, Number(item?.quantity) || 1),
				// allow client to send fallback metadata (name, price, image)
				name: typeof item?.name === 'string' ? item.name : null,
				price: Number.isFinite(Number(item?.price)) ? Number(item.price) : null,
				image: typeof item?.image === 'string' ? item.image : null,
			}))
			.filter((item) => typeof item.productId === 'string' && item.productId.trim().length > 0)
	}
	const productId = typeof payload.productId === 'string' ? payload.productId.trim() : null
	const quantity = Math.max(1, Number(payload.quantity) || 1)
	if (!productId) return []
	// Also capture price and name from top-level payload for single-item requests
	const price = Number.isFinite(Number(payload.price)) ? Number(payload.price) : null
	const name = typeof payload.name === 'string' ? payload.name : null
	const image = typeof payload.image === 'string' ? payload.image : null
	return [ { productId, quantity, price, name, image } ]
}

function sanitizeMetadata(value) {
	if (!value || typeof value !== 'object') return {}
	return Object.entries(value).reduce((acc, [ key, val ]) => {
		if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
			acc[key] = String(val)
		}
		return acc
	}, {})
}

export async function POST(request) {
	try {
		// Authenticate the incoming request using Supabase server client (reads cookies)
		let userId = null
		try {
			const supabaseServer = createServerClient(
				getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
				getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
				{
					cookies: {
						get(name) {
							const cookieHeader = request.headers.get('cookie') || ''
							const match = cookieHeader.split(/;\s*/).find(c => c.startsWith(name + '='))
							if (!match) return undefined
							return decodeURIComponent(match.split('=')[1])
						},
						set() { /* not needed server-side */ },
						remove() { /* not needed server-side */ },
					},
				}
			)
			const { data: authData, error: authErr } = await supabaseServer.auth.getUser()
			if (authErr) {
				console.error('Supabase auth.getUser error', authErr)
			}
			userId = authData?.user?.id ?? null
		} catch (e) {
			console.error('Supabase server auth failed in create-checkout-session:', e)
			return errorJson('Unauthorized', 401)
		}
		if (!userId) {
			return errorJson('Unauthorized', 401)
		}

		const payload = await request.json().catch(() => ({}))
		const items = normalizeItems(payload)
		if (items.length === 0) {
			return errorJson('No products supplied', 400)
		}

		const supabase = getSupabaseAdmin()
		const productIds = Array.from(new Set(items.map((item) => item.productId)))
		let products = []
		try {
			const resp = await supabase
				.from('products')
				.select('id, name, price, image')
				.in('id', productIds)
			if (resp.error) throw resp.error
			products = resp.data || []
		} catch (productsError) {
			// If the products table doesn't exist in the Supabase project (PGRST205),
			// or if product IDs are not valid UUIDs (22P02 - invalid UUID syntax),
			// allow fallback to client-supplied item details (price/name). Otherwise fail.
			if (productsError && (productsError.code === 'PGRST205' || productsError.code === '22P02')) {
				console.warn('Products lookup failed; falling back to client-supplied item data')
				products = []
			} else {
				console.error('Supabase products error', productsError)
				return errorJson('Failed to load products', 500)
			}
		}

		const productMap = new Map((products || []).map((product) => [ product.id, product ]))
		const missingProductIds = productIds.filter((id) => !productMap.has(id))
		let fallbackPriceId = process.env.SPIN_CREDIT_PRICE_ID || process.env.NEXT_PUBLIC_SPIN_CREDIT_PRICE_ID || null
		let fallbackPrice = null
		if (missingProductIds.length > 0) {
			if (!fallbackPriceId) {
				return errorJson('One or more products not found', 400)
			}
			try {
				fallbackPrice = await stripe.prices.retrieve(fallbackPriceId)
			} catch (err) {
				// If Stripe auth fails (invalid key) or other price retrieval errors occur,
				// log the error and disable the Stripe price fallback so we can rely on
				// client-supplied item prices instead. Do not crash the whole request.
				console.error('Failed to retrieve fallback price', err)
				// If this is an authentication error, the secret key may be invalid.
				if (err && (err.type === 'StripeAuthenticationError' || err.statusCode === 401)) {
					console.warn('Stripe authentication failed when retrieving fallback price. Please verify STRIPE_SECRET_KEY in your environment.')
				}
				fallbackPrice = null
				fallbackPriceId = null
				// disable using the configured fallback price id since retrieval failed
				// (this will force using client-supplied `price` or error later)
				// Note: we don't `return` here to allow client price fallbacks.
				
			}
		}

		const fallbackProductName = process.env.SPIN_CREDIT_PRODUCT_NAME || 'Spin Credits'

		const orderItems = items.map((item) => {
			const product = productMap.get(item.productId)
			if (product) {
				return {
					product_id: product.id,
					name: product.name,
					price: Number(product.price || 0),
					image: product.image,
					qty: item.quantity,
				}
			}
			// fallback to client-supplied item metadata when product row is missing
			return {
				product_id: item.productId,
				name: item.name || fallbackProductName,
				price: typeof item.price === 'number' ? item.price : (fallbackPrice?.unit_amount ? Number(fallbackPrice.unit_amount) / 100 : 0),
				image: item.image || null,
				qty: item.quantity,
			}
		})

		const lineItems = items.map((item) => {
			const product = productMap.get(item.productId)
			if (product) {
				const unitAmount = Math.round(Number(product.price || 0) * 100)
				if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
					throw new Error(`Invalid product or price for ${item.productId}`)
				}
				return {
					price_data: {
						currency: 'usd',
						product_data: {
							name: product.name,
							images: product.image ? [ product.image ] : undefined,
						},
						unit_amount: unitAmount,
					},
					quantity: item.quantity,
				}
			}
			// If client supplied a price, use inline price_data fallback (preferred)
			if (typeof item.price === 'number' && item.price >= 0) {
				const unitAmount = Math.round(Number(item.price) * 100)
				return {
					price_data: {
						currency: 'usd',
						product_data: { name: item.name || fallbackProductName, images: item.image ? [ item.image ] : undefined },
						unit_amount: unitAmount,
					},
					quantity: item.quantity,
				}
			}
			// fallback: use configured Stripe Price ID if available and retrieval succeeded
			if (fallbackPriceId && fallbackPrice) {
				return {
					price: fallbackPriceId,
					quantity: item.quantity,
				}
			}
			// If all else fails, log clear error
			console.error(`Unable to resolve price for product ${item.productId}. No product row, no client price, and no valid Stripe fallback price.`)
			throw new Error(`Unable to resolve price for product ${item.productId}. Please ensure products table is created or client sends a price.`)
		})

		const itemsSubtotalCents = lineItems.reduce((sum, lineItem) => {
			if (lineItem.price_data && Number.isFinite(lineItem.price_data.unit_amount)) {
				return sum + (lineItem.price_data.unit_amount * lineItem.quantity)
			}
			if (lineItem.price && fallbackPrice && Number.isFinite(fallbackPrice.unit_amount)) {
				return sum + (Number(fallbackPrice.unit_amount) * lineItem.quantity)
			}
			return sum
		}, 0)
		const shippingCents = Math.max(0, Math.round(Number(payload.shipping || 0) * 100))
		let discountCents = Math.max(0, Math.round(Number(payload.discount || 0) * 100))
		if (discountCents > itemsSubtotalCents) {
			discountCents = itemsSubtotalCents
		}

		if (shippingCents > 0) {
			lineItems.push({
				price_data: {
					currency: 'usd',
					product_data: { name: 'Shipping' },
					unit_amount: shippingCents,
				},
				quantity: 1,
			})
		}

		const supabaseOrderPayload = {
			orderId: `STR-${Date.now()}`,
			status: 'pending',
			items: orderItems,
			subtotal: itemsSubtotalCents / 100,
			shipping: shippingCents / 100,
			discount: discountCents / 100,
			total: (itemsSubtotalCents - discountCents + shippingCents) / 100,
			couponCode: payload.couponCode || null,
			customerEmail: payload.customerEmail || null,
			customerName: payload.customerName || null,
			createdAt: new Date().toISOString(),
			provider: 'stripe',
			providerPayload: null,
			user_id: userId,
			product_id: items[0]?.productId || null,
			session_id: null,
			payment_intent: null,
			amount: (itemsSubtotalCents - discountCents + shippingCents) / 100,
		}

		const { data: orderRecord, error: orderError } = await supabase
			.from('orders')
			.insert(supabaseOrderPayload)
			.select()
			.single()

		if (orderError) {
			console.error('Supabase order insert error', orderError)
			return errorJson('Failed to create order record', 500)
		}

		const origin = getOriginFromRequestUrl(request.url)
		const discounts = []

		if (discountCents > 0) {
			const coupon = await stripe.coupons.create({
				amount_off: discountCents,
				currency: 'usd',
				duration: 'once',
			})
			discounts.push({ coupon: coupon.id })
		}

		const metadata = {
			user_id: userId,
			order_id: orderRecord?.id ?? orderRecord?.orderId ?? '',
			...sanitizeMetadata(payload.metadata),
		}

		const session = await stripe.checkout.sessions.create({
			mode: 'payment',
			payment_method_types: [ 'card' ],
			line_items: lineItems,
			success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${origin}/checkout?cancelled=1`,
			metadata,
			discounts: discounts.length ? discounts : undefined,
		})

		const orderIdentifier = orderRecord?.id ? { id: orderRecord.id } : { orderId: orderRecord?.orderId }
		const { error: updateError } = await supabase
			.from('orders')
			.update({
				session_id: session.id,
				orderId: session.id,
			})
			.match(orderIdentifier)

		if (updateError) {
			console.error('Supabase order update error', updateError)
		}

		return json({ url: session.url }, 200)
	} catch (error) {
		console.error('Stripe session error', error)
		return errorJson('Failed to create Stripe checkout session', 500)
	}
}

