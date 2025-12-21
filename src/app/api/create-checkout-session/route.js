export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getEnvVar, getOriginFromRequestUrl } from '@/lib/config'
import { json, errorJson } from '@/lib/http'
import { productData } from '@/utils/index'

// Initialize Stripe with validation
let stripe
try {
	const stripeKey = getEnvVar('STRIPE_SECRET_KEY')
	if (!stripeKey || !stripeKey.trim()) {
		throw new Error('STRIPE_SECRET_KEY is not set or is empty')
	}
	// Remove any whitespace that might cause issues
	const cleanKey = stripeKey.trim()
	// Validate key format (should start with sk_test_ or sk_live_)
	if (!cleanKey.startsWith('sk_test_') && !cleanKey.startsWith('sk_live_')) {
		throw new Error('STRIPE_SECRET_KEY format is invalid. Must start with sk_test_ or sk_live_')
	}
	stripe = new Stripe(cleanKey)
} catch (err) {
	console.error('Failed to initialize Stripe:', err.message)
	// Create a dummy stripe instance to prevent crashes, but it will fail on API calls
	stripe = new Stripe('sk_test_invalid')
}

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
			// Use Next.js cookies() helper for better cookie handling
			const cookieStore = await cookies()
			
			const supabaseServer = createServerClient(
				getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
				getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
				{
					cookies: {
						get(name) {
							return cookieStore.get(name)?.value
						},
						set() { /* not needed server-side */ },
						remove() { /* not needed server-side */ },
					},
				}
			)
			const { data: authData, error: authErr } = await supabaseServer.auth.getUser()
			if (authErr) {
				console.error('Supabase auth.getUser error', authErr)
				// Log for debugging
				if (process.env.NODE_ENV === 'development') {
					console.log('Auth error details:', authErr.message)
				}
			}
			userId = authData?.user?.id ?? null
		} catch (e) {
			console.error('Supabase server auth failed in create-checkout-session:', e)
			// If cookies() fails, try fallback to manual cookie parsing
			try {
				const cookieHeader = request.headers.get('cookie') || ''
				if (cookieHeader) {
					const supabaseServer = createServerClient(
						getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
						getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
						{
							cookies: {
								get(name) {
									if (!cookieHeader) return undefined
									const cookies = cookieHeader.split(';').map(c => c.trim())
									const cookie = cookies.find(c => c.startsWith(name + '='))
									if (!cookie) return undefined
									const value = cookie.substring(name.length + 1)
									try {
										return decodeURIComponent(value)
									} catch {
										return value
									}
								},
								set() { /* not needed */ },
								remove() { /* not needed */ },
							},
						}
					)
					const { data: authData } = await supabaseServer.auth.getUser()
					userId = authData?.user?.id ?? null
				}
			} catch (fallbackError) {
				console.error('Fallback auth also failed:', fallbackError)
		}
		}
		
		// For now, require authentication - but provide better error message
		if (!userId) {
			return errorJson('Authentication required. Please sign in to continue with checkout.', 401)
		}

		const payload = await request.json().catch(() => ({}))
		const items = normalizeItems(payload)
		if (items.length === 0) {
			return errorJson('No products supplied', 400)
		}

		const supabase = getSupabaseAdmin()
		// Use Set directly for better performance (no Array.from needed)
		const productIdsSet = new Set(items.map((item) => item.productId))
		const productIds = Array.from(productIdsSet)
		
		// Parallelize product lookup and prepare productMap efficiently
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
				// Only log in development
				if (process.env.NODE_ENV === 'development') {
					console.warn('Products lookup failed; falling back to client-supplied item data')
				}
				products = []
			} else {
				console.error('Supabase products error', productsError)
				return errorJson('Failed to load products', 500)
			}
		}

		// Build productMap efficiently - use for...of for better performance
		const productMap = new Map()
		for (const product of products || []) {
			productMap.set(product.id, product)
		}
		
		// Enhance productMap with productData for missing products (single pass)
		for (const id of productIdsSet) {
			if (!productMap.has(id) && productData[id]) {
				productMap.set(id, {
					id: id,
					name: productData[id].name,
					price: productData[id].price,
					image: productData[id].image,
				})
			}
		}
		
		// Check for missing products (only if needed for validation)
		const missingProductIds = Array.from(productIdsSet).filter((id) => !productMap.has(id))
		// Skip Stripe fallback price retrieval since we have productData fallback
		// This avoids unnecessary Stripe API calls and potential auth errors
		let fallbackPriceId = null
		let fallbackPrice = null
		if (missingProductIds.length > 0 && process.env.NODE_ENV === 'development') {
			console.warn('Some products not found in database or productData:', missingProductIds)
		}

		const fallbackProductName = process.env.SPIN_CREDIT_PRODUCT_NAME || 'Spin Credits'

		const orderItems = items.map((item) => {
			const product = productMap.get(item.productId)
			// Check productData as additional fallback
			const productFromData = productData[item.productId]
			
			if (product) {
				// Use productData price if available (authoritative source)
				const finalPrice = productFromData && typeof productFromData.price === 'number' 
					? productFromData.price 
					: Number(product.price || 0)
				return {
					product_id: product.id,
					name: product.name,
					price: finalPrice,
					image: product.image,
					qty: item.quantity,
				}
			}
			// fallback to client-supplied item metadata when product row is missing
			// Prioritize productData price over client-supplied price
			const finalPrice = productFromData && typeof productFromData.price === 'number'
				? productFromData.price
				: (typeof item.price === 'number' ? item.price : (fallbackPrice?.unit_amount ? Number(fallbackPrice.unit_amount) / 100 : 0))
			
			return {
				product_id: item.productId,
				name: item.name || productFromData?.name || fallbackProductName,
				price: finalPrice,
				image: item.image || productFromData?.image || null,
				qty: item.quantity,
			}
		})

		const lineItems = items.map((item) => {
			const product = productMap.get(item.productId)
			// Check productData as authoritative source for prices
			const productFromData = productData[item.productId]
			
			// Determine the price to use (prioritize productData)
			let priceToUse = null
			if (productFromData && typeof productFromData.price === 'number') {
				priceToUse = productFromData.price
			} else if (product && typeof product.price === 'number') {
				priceToUse = product.price
			} else if (typeof item.price === 'number' && item.price >= 0) {
				priceToUse = item.price
			}
			
			// If we have a valid price, use it
			if (priceToUse !== null && priceToUse >= 0) {
				const unitAmount = Math.round(Number(priceToUse) * 100)
				if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
					throw new Error(`Invalid price for product ${item.productId}: ${priceToUse}`)
				}
				
				const productName = product?.name || productFromData?.name || item.name || fallbackProductName
				let productImage = product?.image || productFromData?.image || item.image
				
				// Stripe requires absolute URLs for images, not relative paths
				// Convert relative paths to absolute URLs
				if (productImage) {
					// If it's already a full URL (starts with http:// or https://), use it as is
					if (productImage.startsWith('http://') || productImage.startsWith('https://')) {
						// Already a full URL, use as is
					} else if (productImage.startsWith('/')) {
						// Relative path starting with /, convert to absolute URL
						const origin = getOriginFromRequestUrl(request.url)
						productImage = `${origin}${productImage}`
					} else {
						// Relative path without /, add origin and /
						const origin = getOriginFromRequestUrl(request.url)
						productImage = `${origin}/${productImage}`
					}
				}
				
				return {
					price_data: {
						currency: 'usd',
						product_data: {
							name: productName,
							images: productImage ? [ productImage ] : undefined,
						},
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
			
			// If all else fails, throw error (no console.log needed - error will be logged by error handler)
			throw new Error(`Unable to resolve price for product ${item.productId}. Please ensure productData has this product or client sends a price.`)
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

		// Build order payload - use minimal required fields first
		// We'll add orderId after the record is created to avoid schema issues
		const supabaseOrderPayload = {
			status: 'pending',
			items: orderItems,
			subtotal: itemsSubtotalCents / 100,
			shipping: shippingCents / 100,
			discount: discountCents / 100,
			total: (itemsSubtotalCents - discountCents + shippingCents) / 100,
			provider: 'stripe',
			user_id: userId,
			product_id: items[0]?.productId || null,
		}
		
		// Only add optional fields if they have values (to avoid column errors)
		if (payload.couponCode) {
			supabaseOrderPayload.couponCode = payload.couponCode
		}
		if (payload.customerEmail) {
			supabaseOrderPayload.customerEmail = payload.customerEmail
		}
		if (payload.customerName) {
			supabaseOrderPayload.customerName = payload.customerName
		}
		
		// Remove null/undefined values - use Object.entries for better performance
		const cleanedPayload = Object.fromEntries(
			Object.entries(supabaseOrderPayload).filter(([_, value]) => 
				value !== null && value !== undefined
			)
		)

		const { data: orderRecord, error: orderError } = await supabase
			.from('orders')
			.insert(cleanedPayload)
			.select()
			.single()

		if (orderError) {
			console.error('Supabase order insert error', orderError)
			// Provide more helpful error message
			if (orderError.code === 'PGRST204') {
				// Only log detailed info in development
				if (process.env.NODE_ENV === 'development') {
					console.error('Column mismatch detected. Missing column:', orderError.message)
					console.error('Attempted to insert columns:', Object.keys(cleanedPayload))
				}
				const missingColumn = orderError.message.match(/'([^']+)'/)?.[1] || 'unknown'
				return errorJson(`Database schema mismatch: Column '${missingColumn}' not found. Please run create-orderId-column.sql in your Supabase SQL Editor.`, 500)
			}
			return errorJson(`Failed to create order record: ${orderError.message}`, 500)
		}
		
		// Try to add orderId after creation (non-blocking if column doesn't exist)
		const orderIdValue = `STR-${Date.now()}`
		if (orderRecord?.id) {
			try {
				const { error: updateOrderIdError } = await supabase
					.from('orders')
					.update({ orderId: orderIdValue })
					.eq('id', orderRecord.id)
				if (updateOrderIdError) {
					// Silently fail - orderId column might not exist, that's okay
					// Only log in development
					if (process.env.NODE_ENV === 'development') {
						console.warn('Could not update orderId (column may not exist):', updateOrderIdError.message)
					}
				}
			} catch (err) {
				// Silently fail - orderId column might not exist, that's okay
				// Only log in development
				if (process.env.NODE_ENV === 'development') {
					console.warn('Could not update orderId (column may not exist):', err.message)
				}
			}
		}

		const origin = getOriginFromRequestUrl(request.url)
		
		// Parallelize Stripe coupon creation and order update (they're independent)
		const [couponResult] = await Promise.allSettled([
			discountCents > 0 
				? stripe.coupons.create({
				amount_off: discountCents,
				currency: 'usd',
				duration: 'once',
			})
				: Promise.resolve(null)
		])
		
		const discounts = []
		if (couponResult.status === 'fulfilled' && couponResult.value) {
			discounts.push({ coupon: couponResult.value.id })
		}

		const metadata = {
			user_id: userId,
			order_id: orderRecord?.id ?? orderRecord?.orderId ?? '',
			...sanitizeMetadata(payload.metadata),
		}

		// Create Stripe checkout session with error handling
		let session
		try {
			session = await stripe.checkout.sessions.create({
			mode: 'payment',
			payment_method_types: [ 'card' ],
			line_items: lineItems,
			success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${origin}/checkout?cancelled=1`,
			metadata,
			discounts: discounts.length ? discounts : undefined,
		})
		} catch (stripeError) {
			console.error('Stripe checkout session creation failed:', stripeError)
			// Provide helpful error message for authentication errors
			if (stripeError.type === 'StripeAuthenticationError' || stripeError.statusCode === 401) {
				return errorJson(`Stripe authentication failed: Invalid API key. Please verify your STRIPE_SECRET_KEY in your .env file. Make sure it's a valid key starting with 'sk_test_' (for test mode) or 'sk_live_' (for live mode), and that there's no extra whitespace.`, 500)
			}
			// Re-throw other Stripe errors
			throw stripeError
		}

		const orderIdentifier = orderRecord?.id ? { id: orderRecord.id } : { orderId: orderRecord?.orderId }
		// Update with session info - try orderId but don't fail if column doesn't exist
		const updatePayload = {
			session_id: session.id,
		}
		// Only try to update orderId if we think the column exists (non-blocking)
		try {
			updatePayload.orderId = session.id
		} catch {}
		
		const { error: updateError } = await supabase
			.from('orders')
			.update(updatePayload)
			.match(orderIdentifier)

		if (updateError) {
			// Only log critical errors
			console.error('Supabase order update error', updateError)
		}

		return json({ url: session.url }, 200)
	} catch (error) {
		console.error('Stripe session error', error)
		return errorJson('Failed to create Stripe checkout session', 500)
	}
}

