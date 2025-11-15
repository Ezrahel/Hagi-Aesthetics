export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import Stripe from 'stripe'
import { auth } from '@clerk/nextjs/server'
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
			}))
			.filter((item) => typeof item.productId === 'string' && item.productId.trim().length > 0)
	}
	const productId = typeof payload.productId === 'string' ? payload.productId.trim() : null
	const quantity = Math.max(1, Number(payload.quantity) || 1)
	if (!productId) return []
	return [ { productId, quantity } ]
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
		const { userId } = auth()
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
		const { data: products, error: productsError } = await supabase
			.from('products')
			.select('id, name, price, image')
			.in('id', productIds)

		if (productsError) {
			console.error('Supabase products error', productsError)
			return errorJson('Failed to load products', 500)
		}
		if (!products || products.length !== productIds.length) {
			return errorJson('One or more products not found', 400)
		}
		const productMap = new Map(products.map((product) => [ product.id, product ]))

		const orderItems = items.map((item) => {
			const product = productMap.get(item.productId)
			return {
				product_id: product.id,
				name: product.name,
				price: Number(product.price || 0),
				image: product.image,
				qty: item.quantity,
			}
		})

		const lineItems = items.map((item) => {
			const product = productMap.get(item.productId)
			const unitAmount = Math.round(Number(product.price || 0) * 100)
			if (!product || !Number.isFinite(unitAmount) || unitAmount <= 0) {
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
		})

		const itemsSubtotalCents = lineItems.reduce((sum, lineItem) => sum + (lineItem.price_data.unit_amount * lineItem.quantity), 0)
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

