import Stripe from 'stripe'
import Link from 'next/link'
import Image from 'next/image'
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
		// Only log in development
		if (process.env.NODE_ENV === 'development') {
			console.warn('sendOrderEmail called without order/session')
		}
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

		// Fallback: only log in development mode
		if (process.env.NODE_ENV === 'development') {
			console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
			console.log('📧 ORDER CONFIRMATION EMAIL (DEV LOG)')
			console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
			console.log(emailBody)
			console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
			console.log(`To: ${recipientEmail}`)
			console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
		}
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
	const isSpinCredit = session?.metadata?.source === 'spinwheel_topup'
	const userId = session?.metadata?.user_id || null

	// Calculate spin credits purchased (amount in cents / 100 = number of $1 spins)
	const spinCreditsPurchased = typeof session.amount_total === 'number' 
		? Math.floor(session.amount_total / 100) 
		: 0

	if (paymentStatus === 'paid') {
		// If it's a spin credit purchase, update user metadata directly
		// Note: Webhook is the primary mechanism, this is a fallback
		if (isSpinCredit && userId) {
			try {
				const supabase = getSupabaseAdmin()
				
				// Get current user metadata
				const { data: userData, error: fetchError } = await supabase.auth.admin.getUserById(userId)
				
				if (!fetchError && userData?.user) {
					const currentMeta = userData.user.user_metadata || {}
					
					// Check if this session has already been processed (prevent double-crediting)
					const processedSessions = Array.isArray(currentMeta.processed_spin_sessions) 
						? currentMeta.processed_spin_sessions 
						: []
					
					if (processedSessions.includes(sessionId)) {
						// Only log in development
						if (process.env.NODE_ENV === 'development') {
							console.log(`Session ${sessionId} already processed, skipping credit update in success page`)
						}
					} else {
						const currentCredits = Number.isFinite(currentMeta.paid_credits_cents) ? currentMeta.paid_credits_cents : 0
						const newCredits = currentCredits + session.amount_total
						
						// Update user metadata with new credits and mark session as processed
						await supabase.auth.admin.updateUserById(userId, {
							user_metadata: {
								...currentMeta,
								paid_credits_cents: newCredits,
								processed_spin_sessions: [...processedSessions, sessionId]
							}
						})
						
						// Only log in development
						if (process.env.NODE_ENV === 'development') {
							console.log(`Spin credits updated via success page fallback for user ${userId}, session ${sessionId}`)
						}
					}
				}
			} catch (err) {
				// Non-blocking: log error but don't fail the page
				console.error('Spin credits update error:', err)
			}
		}

		// Parallelize order finalization and email sending (non-blocking)
		const deliveryInfo = session?.metadata?.deliveryInfo || null
		
		// Only finalize order if it's not a spin credit (spin credits may not have orders)
		if (!isSpinCredit) {
		order = await finalizeOrder(sessionId, typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id, session.amount_total)

			// Fire email send in background - use setImmediate for true non-blocking
			setImmediate(() => {
				sendOrderEmail({ order, session, deliveryInfo }).catch((err) => {
					console.error('Background sendOrderEmail error:', err)
				})
			})
		}
	}

	// Render spin credit success page
	if (isSpinCredit) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-lavender via-pink/10 to-lavender flex flex-col">
				{/* Go Home Button - Top Left */}
				<div className="absolute top-6 left-6 z-10">
					<Link 
						href="https://hagiaesthetics.store"
						className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 text-pink font-satoshi font-medium text-sm"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
						Go Home
					</Link>
				</div>

				{/* Main Content */}
				<div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
					{paymentStatus === 'paid' ? (
						<>
							{/* Success Icon/Animation */}
							<div className="relative mb-8">
								<div className="w-32 h-32 lg:w-40 lg:h-40 mx-auto bg-pink rounded-full flex items-center justify-center shadow-2xl animate-pulse">
									<svg className="w-16 h-16 lg:w-20 lg:h-20 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								{/* Decorative circles */}
								<div className="absolute -top-4 -right-4 w-8 h-8 bg-pink/30 rounded-full animate-ping"></div>
								<div className="absolute -bottom-4 -left-4 w-6 h-6 bg-pink/20 rounded-full animate-pulse"></div>
							</div>

							{/* Title */}
							<h1 className="font-astrid text-4xl lg:text-6xl text-pink mb-4">
								Payment Successful! 🎉
							</h1>

							{/* Subtitle */}
							<p className="font-satoshi text-lg lg:text-xl text-gray-700 max-w-2xl mb-8">
								Your spin credits have been added to your account
							</p>

							{/* Credits Card */}
							<div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 lg:p-12 max-w-md w-full mb-8 border-2 border-pink/20">
								<div className="flex flex-col items-center gap-4">
									<div className="w-20 h-20 bg-gradient-to-br from-pink to-pink/70 rounded-full flex items-center justify-center mb-2">
										<Image 
											src="/spinwheel1.png" 
											alt="Spin Wheel" 
											width={60} 
											height={60}
											className="object-contain"
										/>
									</div>
									<p className="font-satoshi text-sm uppercase text-gray-500 tracking-wider">Credits Added</p>
									<p className="font-astrid text-5xl lg:text-6xl text-pink font-bold">
										{spinCreditsPurchased}
									</p>
									<p className="font-satoshi text-gray-600">
										{spinCreditsPurchased === 1 ? 'Spin Credit' : 'Spin Credits'}
									</p>
									<div className="w-full h-px bg-gradient-to-r from-transparent via-pink/30 to-transparent my-4"></div>
									<p className="font-satoshi text-sm text-gray-500">
										Amount Paid: <span className="font-semibold text-pink">${(session.amount_total / 100).toFixed(2)}</span>
									</p>
								</div>
							</div>

							{/* CTA Buttons */}
							<div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
								<Link 
									href="https://hagiaesthetics.store"
									className="px-8 py-4 bg-pink text-lavender rounded-full font-montserrat font-bold text-lg uppercase shadow-lg hover:bg-pink/90 transition-all duration-200 hover:scale-105"
								>
									Start Spinning
								</Link>
								<Link 
									href="https://hagiaesthetics.store/shop"
									className="px-8 py-4 bg-white text-pink border-2 border-pink rounded-full font-montserrat font-bold text-lg uppercase shadow-lg hover:bg-pink/5 transition-all duration-200"
								>
									Shop Now
								</Link>
							</div>

							{/* Info Text */}
							<p className="mt-8 font-satoshi text-sm text-gray-500 max-w-md">
								Your credits are ready to use! Head back to the spin wheel to start playing.
							</p>
						</>
					) : (
						<>
							<div className="w-24 h-24 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
								<svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
								</svg>
							</div>
							<h1 className="font-astrid text-3xl lg:text-4xl text-pink mb-4">
								Payment Pending
							</h1>
							<p className="font-satoshi text-gray-700 max-w-xl mb-8">
								Your payment is currently marked as <span className="font-semibold uppercase">{paymentStatus}</span>. 
								We will update your spin credits once the payment is complete.
							</p>
							<Link 
								href="https://hagiaesthetics.store"
								className="px-8 py-4 bg-pink text-lavender rounded-full font-montserrat font-bold text-lg uppercase shadow-lg hover:bg-pink/90 transition-all duration-200"
							>
								Go Home
							</Link>
						</>
					)}
				</div>
			</div>
		)
	}

	// Regular order success page
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

