import Stripe from 'stripe'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { getEnvVar } from '@/lib/config'

function getSupabaseAdmin() {
	const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
	const key = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
	return createClient(url, key)
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
	const { userId } = auth()
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

