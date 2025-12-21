export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { getEnvVar } from '@/lib/config'

// Initialize Stripe
let stripe
try {
	const stripeKey = getEnvVar('STRIPE_SECRET_KEY')
	if (!stripeKey || !stripeKey.trim()) {
		throw new Error('STRIPE_SECRET_KEY is not set')
	}
	stripe = new Stripe(stripeKey.trim())
} catch (err) {
	console.error('Failed to initialize Stripe in webhook:', err.message)
	throw err
}

// Initialize Supabase Admin
function getSupabaseAdmin() {
	const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
	const key = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
	return createClient(url, key)
}

// Update user spin credits
async function updateSpinCredits(userId, amountCents, session = null) {
	if (!userId || !amountCents || amountCents <= 0) {
		// Only log in development (invalid params are expected in some edge cases)
		if (process.env.NODE_ENV === 'development') {
			console.warn('Invalid parameters for updateSpinCredits:', { userId, amountCents })
		}
		return { success: false, error: 'Invalid parameters' }
	}

	try {
		const supabase = getSupabaseAdmin()
		
		// Get current user metadata
		const { data: userData, error: fetchError } = await supabase.auth.admin.getUserById(userId)
		
		if (fetchError) {
			console.error('Failed to fetch user for spin credit update:', fetchError)
			return { success: false, error: fetchError.message }
		}

		if (!userData?.user) {
			console.error('User not found for spin credit update:', userId)
			return { success: false, error: 'User not found' }
		}

		const currentMeta = userData.user.user_metadata || {}
		
		// Check if this session has already been processed (prevent double-crediting)
		const sessionId = session?.id || ''
		const processedSessions = Array.isArray(currentMeta.processed_spin_sessions) 
			? currentMeta.processed_spin_sessions 
			: []
		
		if (sessionId && processedSessions.includes(sessionId)) {
			console.log(`Session ${sessionId} already processed, skipping credit update`)
			return { success: true, skipped: true, message: 'Session already processed' }
		}
		
		const currentCredits = Number.isFinite(currentMeta.paid_credits_cents) 
			? currentMeta.paid_credits_cents 
			: 0
		
		const newCredits = currentCredits + amountCents
		
		// Update user metadata with new credits and mark session as processed
		const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
			user_metadata: {
				...currentMeta,
				paid_credits_cents: newCredits,
				processed_spin_sessions: sessionId ? [...processedSessions, sessionId] : processedSessions
			}
		})

		if (updateError) {
			console.error('Failed to update spin credits:', updateError)
			return { success: false, error: updateError.message }
		}

		// Only log in development
		if (process.env.NODE_ENV === 'development') {
			console.log(`Successfully updated spin credits for user ${userId}: +${amountCents} cents (new total: ${newCredits} cents)`)
		}
		return { success: true, newCredits }
	} catch (err) {
		console.error('Error updating spin credits:', err)
		return { success: false, error: err.message }
	}
}

export async function POST(request) {
	try {
		const body = await request.text()
		const headersList = await headers()
		const signature = headersList.get('stripe-signature')

		if (!signature) {
			console.error('Missing stripe-signature header')
			return NextResponse.json(
				{ error: 'Missing signature' },
				{ status: 400 }
			)
		}

		// Get webhook secret from environment
		const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
		if (!webhookSecret) {
			console.error('STRIPE_WEBHOOK_SECRET is not set')
			return NextResponse.json(
				{ error: 'Webhook secret not configured' },
				{ status: 500 }
			)
		}

		// Verify webhook signature
		let event
		try {
			event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
		} catch (err) {
			console.error('Webhook signature verification failed:', err.message)
			return NextResponse.json(
				{ error: `Webhook signature verification failed: ${err.message}` },
				{ status: 400 }
			)
		}

		// Handle checkout.session.completed event
		if (event.type === 'checkout.session.completed') {
			const session = event.data.object

			// Only log in development
			if (process.env.NODE_ENV === 'development') {
				console.log('Webhook received checkout.session.completed:', {
					sessionId: session.id,
					paymentStatus: session.payment_status,
					amountTotal: session.amount_total,
					metadata: session.metadata
				})
			}

			// Check if this is a spin credit purchase
			const isSpinCredit = session?.metadata?.source === 'spinwheel_topup'
			const userId = session?.metadata?.user_id

			if (isSpinCredit && userId && session.payment_status === 'paid') {
				const amountCents = typeof session.amount_total === 'number' 
					? session.amount_total 
					: 0

				if (amountCents > 0) {
					// Only log in development
					if (process.env.NODE_ENV === 'development') {
						console.log(`Processing spin credit purchase: User ${userId}, Amount: ${amountCents} cents, Session: ${session.id}`)
					}
					
					const result = await updateSpinCredits(userId, amountCents, session)
					
					if (result.success) {
						// Only log in development
						if (process.env.NODE_ENV === 'development') {
							console.log(`Spin credits successfully added via webhook for user ${userId}`)
						}
						return NextResponse.json({ 
							received: true, 
							message: 'Spin credits updated successfully',
							userId,
							amountCents,
							newCredits: result.newCredits
						})
					} else {
						console.error(`Failed to update spin credits via webhook: ${result.error}`)
						// Still return 200 to prevent Stripe from retrying (we'll handle this manually)
						return NextResponse.json({ 
							received: true, 
							error: result.error,
							message: 'Webhook received but credit update failed'
						})
					}
				} else {
					// Only log in development
					if (process.env.NODE_ENV === 'development') {
						console.warn(`Spin credit purchase with zero or invalid amount: ${amountCents}`)
					}
					return NextResponse.json({ received: true, message: 'Invalid amount' })
				}
			} else {
				// Not a spin credit purchase, or payment not completed
				return NextResponse.json({ 
					received: true, 
					message: 'Not a spin credit purchase or payment not completed' 
				})
			}
		}

		// Handle other event types (for future expansion)
		return NextResponse.json({ 
			received: true, 
			message: `Event type ${event.type} received but not processed` 
		})
	} catch (err) {
		console.error('Webhook error:', err)
		return NextResponse.json(
			{ error: `Webhook error: ${err.message}` },
			{ status: 500 }
		)
	}
}

