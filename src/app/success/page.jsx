import Stripe from 'stripe'
import Link from 'next/link'
// switched from Clerk to Supabase auth; we infer linked user from order record
import { createClient } from '@supabase/supabase-js'
import { getEnvVar } from '@/lib/config'

function getSupabaseAdmin() {
	const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
	const key = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
	return createClient(url, key)
}

async function sendOrderEmail({ order, session, deliveryInfo }) {
	const recipientEmail = 'hagiaesthetics@gmail.com'

	// Basic safety checks – never throw if email data is incomplete
	if (!order && !session) {
		console.warn('sendOrderEmail called without order/session')
		return
	}

	const customerEmail =
		order?.customerEmail ||
		deliveryInfo?.email ||
		(session?.customer_details?.email ?? 'Unknown')
	const customerName =
		order?.customerName ||
		deliveryInfo?.fullName ||
		(session?.customer_details?.name ?? 'Customer')

	const items = Array.isArray(order?.items) ? order.items : []

	const subtotal = typeof order?.subtotal === 'number' ? order.subtotal : null
	const shipping = typeof order?.shipping === 'number' ? order.shipping : null
	const discount = typeof order?.discount === 'number' ? order.discount : null
	const total =
		typeof order?.total === 'number'
			? order.total
			: typeof session?.amount_total === 'number'
				? session.amount_total / 100
				: null

	const delivery = deliveryInfo || session?.metadata?.deliveryInfo || {}

	const emailLines = []
	emailLines.push('New Paid Order')
	emailLines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
	emailLines.push('')
	emailLines.push('Customer')
	emailLines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
	emailLines.push(`Name: ${customerName}`)
	emailLines.push(`Email: ${customerEmail}`)
	if (delivery.phone) emailLines.push(`Phone: ${delivery.phone}`)
	emailLines.push('')
	emailLines.push('Delivery Address')
	emailLines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
	if (delivery.address) emailLines.push(delivery.address)
	if (delivery.address2) emailLines.push(delivery.address2)
	if (delivery.city || delivery.state || delivery.zipCode) {
		emailLines.push(
			`${delivery.city ?? ''}${delivery.city && (delivery.state || delivery.zipCode) ? ', ' : ''}${delivery.state ?? ''} ${delivery.zipCode ?? ''}`.trim()
		)
	}
	if (delivery.country) emailLines.push(delivery.country)
	emailLines.push('')
	if (delivery.deliveryInstructions) {
		emailLines.push('Instructions:')
		emailLines.push(delivery.deliveryInstructions)
		emailLines.push('')
	}
	emailLines.push('Order Details')
	emailLines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
	if (order?.orderId) emailLines.push(`Order Ref: ${order.orderId}`)
	if (session?.id) emailLines.push(`Stripe Session: ${session.id}`)
	if (session?.payment_intent) {
		const piId = typeof session.payment_intent === 'string'
			? session.payment_intent
			: session.payment_intent?.id
		if (piId) emailLines.push(`Payment Intent: ${piId}`)
	}
	emailLines.push('')
	if (items.length) {
		emailLines.push('Items:')
		items.forEach((item, idx) => {
			const lineTotal = typeof item.price === 'number' && typeof item.qty === 'number'
				? (item.price * item.qty).toFixed(2)
				: 'N/A'
			emailLines.push(
				`  ${idx + 1}. ${item.name ?? 'Item'} x${item.qty ?? 1} @ $${(item.price ?? 0).toFixed?.(2) ?? item.price} → $${lineTotal}`
			)
		})
		emailLines.push('')
	}
	if (subtotal != null) emailLines.push(`Subtotal: $${subtotal.toFixed(2)}`)
	if (shipping != null) emailLines.push(`Shipping: $${shipping.toFixed(2)}`)
	if (discount != null) emailLines.push(`Discount: -$${discount.toFixed(2)}`)
	if (total != null) emailLines.push(`Total: $${total.toFixed(2)}`)
	emailLines.push('')
	emailLines.push(`Submitted: ${new Date().toLocaleString()}`)

	const emailBody = emailLines.join('\n')

	try {
		const resendApiKey = process.env.RESEND_API_KEY

		if (resendApiKey) {
			const htmlItems = items
				.map(
					(item) => `
						<tr>
							<td style="padding: 4px 8px;">${item.name ?? 'Item'}</td>
							<td style="padding: 4px 8px; text-align:center;">${item.qty ?? 1}</td>
							<td style="padding: 4px 8px; text-align:right;">$${(item.price ?? 0).toFixed?.(2) ?? item.price}</td>
						</tr>`
				)
				.join('')

			const html = `
				<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
					<h2 style="color: #B187C6;">New Paid Order</h2>
					<p style="margin-top: 0; color: #555;">A new order has been paid successfully.</p>

					<h3 style="margin-bottom: 4px;">Customer</h3>
					<div style="background:#f8f5fb;padding:12px 16px;border-radius:6px;margin-bottom:16px;">
						<p style="margin:0;"><strong>Name:</strong> ${customerName}</p>
						<p style="margin:0;"><strong>Email:</strong> ${customerEmail}</p>
						${delivery.phone ? `<p style="margin:0;"><strong>Phone:</strong> ${delivery.phone}</p>` : ''}
					</div>

					<h3 style="margin-bottom: 4px;">Delivery Address</h3>
					<div style="background:#f5f5f5;padding:12px 16px;border-radius:6px;margin-bottom:16px;">
						${delivery.address ? `<p style="margin:0;">${delivery.address}</p>` : ''}
						${delivery.address2 ? `<p style="margin:0;">${delivery.address2}</p>` : ''}
						${delivery.city || delivery.state || delivery.zipCode ? `<p style="margin:0;">${delivery.city ?? ''}${delivery.city && (delivery.state || delivery.zipCode) ? ', ' : ''}${delivery.state ?? ''} ${delivery.zipCode ?? ''}</p>` : ''}
						${delivery.country ? `<p style="margin:0;">${delivery.country}</p>` : ''}
						${delivery.deliveryInstructions ? `<p style="margin-top:8px;"><strong>Instructions:</strong> ${delivery.deliveryInstructions}</p>` : ''}
					</div>

					<h3 style="margin-bottom: 4px;">Order Details</h3>
					<div style="background:#fff7fb;padding:12px 16px;border-radius:6px;margin-bottom:16px;border:1px solid #f5d4f2;">
						${order?.orderId ? `<p style="margin:0;"><strong>Order Ref:</strong> ${order.orderId}</p>` : ''}
						${session?.id ? `<p style="margin:0;"><strong>Stripe Session:</strong> ${session.id}</p>` : ''}
						${
							session?.payment_intent
								? `<p style="margin:0;"><strong>Payment Intent:</strong> ${
										typeof session.payment_intent === 'string'
											? session.payment_intent
											: session.payment_intent?.id
									}</p>`
								: ''
						}
					</div>

					${
						items.length
							? `
					<table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
						<thead>
							<tr>
								<th style="text-align:left;padding:4px 8px;border-bottom:1px solid #ddd;">Item</th>
								<th style="text-align:center;padding:4px 8px;border-bottom:1px solid #ddd;">Qty</th>
								<th style="text-align:right;padding:4px 8px;border-bottom:1px solid #ddd;">Price</th>
							</tr>
						</thead>
						<tbody>
							${htmlItems}
						</tbody>
					</table>`
							: ''
					}

					<div style="text-align:right;margin-top:8px;">
						${subtotal != null ? `<p style="margin:0;"><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>` : ''}
						${shipping != null ? `<p style="margin:0;"><strong>Shipping:</strong> $${shipping.toFixed(2)}</p>` : ''}
						${discount != null ? `<p style="margin:0;"><strong>Discount:</strong> -$${discount.toFixed(2)}</p>` : ''}
						${total != null ? `<p style="margin:4px 0 0;"><strong>Total:</strong> $${total.toFixed(2)}</p>` : ''}
					</div>

					<p style="color:#888;font-size:12px;margin-top:16px;">
						Submitted: ${new Date().toLocaleString()}
					</p>
				</div>
			`

			const res = await fetch('https://api.resend.com/emails', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${resendApiKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					from: 'Hagi Aesthetics <noreply@hagiaesthetics.store>',
					to: [recipientEmail],
					subject: `New Order - ${customerName}`,
					text: emailBody,
					html,
				}),
			})

			if (!res.ok) {
				const errData = await res.json().catch(() => ({}))
				console.error('Resend order email error:', errData)
			}
			return
		}

		// Fallback: log to console in development
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
		console.log('📧 ORDER CONFIRMATION EMAIL (DEV LOG)')
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
		console.log(emailBody)
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
		console.log(`To: ${recipientEmail}`)
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
	} catch (err) {
		// Never throw from email helper – just log
		console.error('sendOrderEmail failed:', err)
	}
}

async function finalizeOrder(sessionId, paymentIntent, amountTotal) {
	const supabase = getSupabaseAdmin()
	const { data, error } = await supabase
		.from('orders')
		.update({
			status: 'paid',
			payment_intent: paymentIntent,
			amount: typeof amountTotal === 'number' ? amountTotal / 100 : null,
		})
		.eq('session_id', sessionId)
		.select()
		.single()

	if (error) {
		console.error('Supabase order finalize error', error)
		return null
	}
	return data
}

export default async function SuccessPage({ searchParams }) {
	// We no longer use Clerk for server-side auth here. The order finalize call
	// returns the saved order record which contains `user_id` if the purchase
	// was linked to a signed-in user. Use that to indicate linkage.
	const sessionId = searchParams?.session_id

	if (!sessionId) {
		return (
			<div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
				<h1 className="text-2xl font-astrid text-pink">Checkout Session Missing</h1>
				<p className="text-gray-600">We could not find your payment session. Please return to the shop and try again.</p>
				<Link href="/" className="px-6 py-3 bg-pink text-lavender rounded-full font-montserrat uppercase">Return Home</Link>
			</div>
		)
	}

	const stripe = new Stripe(getEnvVar('STRIPE_SECRET_KEY'))
	let session = null
	try {
		session = await stripe.checkout.sessions.retrieve(sessionId, { expand: [ 'payment_intent' ] })
	} catch (error) {
		console.error('Stripe retrieve error', error)
		return (
			<div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
				<h1 className="text-2xl font-astrid text-pink">Unable To Verify Payment</h1>
				<p className="text-gray-600">We could not verify your payment at this time. Please contact support with your session ID {sessionId}.</p>
				<Link href="/" className="px-6 py-3 bg-pink text-lavender rounded-full font-montserrat uppercase">Return Home</Link>
			</div>
		)
	}

	const paymentStatus = session?.payment_status
	let order = null

	if (paymentStatus === 'paid') {
		order = await finalizeOrder(sessionId, typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id, session.amount_total)

		// Fire-and-forget order email – do not block page render or throw on failure
		const deliveryInfo = session?.metadata?.deliveryInfo || null
		sendOrderEmail({ order, session, deliveryInfo }).catch((err) => {
			console.error('Background sendOrderEmail error:', err)
		})
	}

	return (
		<div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-6 text-center">
			<h1 className="text-3xl font-astrid text-pink">Thank You!</h1>
			{paymentStatus === 'paid' ? (
				<>
					<p className="text-gray-700 max-w-xl">Your payment has been confirmed{userId ? ' and linked to your account' : ''}. A confirmation email will be on its way shortly.</p>
					<div className="rounded-lg border border-pink/40 bg-white/60 px-6 py-4 text-left shadow-sm">
						<p className="font-montserrat text-sm uppercase text-gray-500">Order Details</p>
						<p className="font-satoshi text-[15px] text-gray-700 mt-2">Session ID: <span className="font-semibold">{sessionId}</span></p>
						{order?.orderId && (
							<p className="font-satoshi text-[15px] text-gray-700 mt-1">Order Reference: <span className="font-semibold">{order.orderId}</span></p>
						)}
						{typeof session.amount_total === 'number' && (
							<p className="font-satoshi text-[15px] text-gray-700 mt-1">Amount Paid: <span className="font-semibold">${(session.amount_total / 100).toFixed(2)}</span></p>
						)}
					</div>
					<Link href="/" className="px-6 py-3 bg-pink text-lavender rounded-full font-montserrat uppercase">Continue Shopping</Link>
				</>
			) : (
				<>
					<p className="text-gray-700 max-w-xl">Your payment is currently marked as <span className="font-semibold uppercase">{paymentStatus}</span>. We will update your order once the payment is complete.</p>
					<Link href="/" className="px-6 py-3 bg-pink text-lavender rounded-full font-montserrat uppercase">Continue Shopping</Link>
				</>
			)}
		</div>
	)
}

