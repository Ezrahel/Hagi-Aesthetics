export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getEnvVar } from '@/lib/config'

// Calendly webhook signature verification
function verifyCalendlySignature(payload, signature, secret) {
	if (!secret) {
		console.warn('CALENDLY_WEBHOOK_SECRET not set, skipping signature verification')
		return true // Allow in development if secret not set
	}
	
	// Calendly uses HMAC SHA256 for webhook signatures
	const crypto = require('crypto')
	const hmac = crypto.createHmac('sha256', secret)
	hmac.update(payload)
	const calculatedSignature = hmac.digest('hex')
	
	return calculatedSignature === signature
}

// Send booking email using Resend API
async function sendBookingEmail(bookingData) {
	const recipientEmail = 'hagiaesthetics@gmail.com'
	
	const emailBody = `
New Booking - Consultation Request

Booking Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Event Type: ${bookingData.eventType || 'N/A'}
Event Name: ${bookingData.eventName || 'N/A'}
Scheduled Time: ${bookingData.startTime || 'N/A'}
Duration: ${bookingData.duration || 'N/A'} minutes

Customer Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${bookingData.name || 'N/A'}
Email: ${bookingData.email || 'N/A'}
Phone: ${bookingData.phone || 'N/A'}

${bookingData.questionsAndAnswers && bookingData.questionsAndAnswers.length > 0 ? `
Questions & Answers:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${bookingData.questionsAndAnswers.map(qa => `Q: ${qa.question || 'N/A'}\nA: ${qa.answer || 'N/A'}`).join('\n\n')}
` : ''}

${bookingData.notes ? `
Additional Notes:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${bookingData.notes}
` : ''}

Booking URL: ${bookingData.bookingUrl || 'N/A'}
Calendly Event URI: ${bookingData.eventUri || 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Received: ${new Date().toLocaleString()}
    `.trim()

	const htmlBody = `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<h2 style="color: #B187C6;">New Booking - Consultation Request</h2>
			
			<div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
				<h3 style="color: #333; margin-top: 0;">Booking Details</h3>
				<p><strong>Event Type:</strong> ${bookingData.eventType || 'N/A'}</p>
				<p><strong>Event Name:</strong> ${bookingData.eventName || 'N/A'}</p>
				<p><strong>Scheduled Time:</strong> ${bookingData.startTime || 'N/A'}</p>
				<p><strong>Duration:</strong> ${bookingData.duration || 'N/A'} minutes</p>
			</div>

			<div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
				<h3 style="color: #333; margin-top: 0;">Customer Information</h3>
				<p><strong>Name:</strong> ${bookingData.name || 'N/A'}</p>
				<p><strong>Email:</strong> ${bookingData.email || 'N/A'}</p>
				<p><strong>Phone:</strong> ${bookingData.phone || 'N/A'}</p>
			</div>

			${bookingData.questionsAndAnswers && bookingData.questionsAndAnswers.length > 0 ? `
			<div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
				<h3 style="color: #333; margin-top: 0;">Questions & Answers</h3>
				${bookingData.questionsAndAnswers.map(qa => `
					<div style="margin-bottom: 15px;">
						<p><strong>Q:</strong> ${qa.question || 'N/A'}</p>
						<p><strong>A:</strong> ${qa.answer || 'N/A'}</p>
					</div>
				`).join('')}
			</div>
			` : ''}

			${bookingData.notes ? `
			<div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
				<h3 style="color: #333; margin-top: 0;">Additional Notes</h3>
				<p>${bookingData.notes}</p>
			</div>
			` : ''}

			<div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
				<p><strong>Booking URL:</strong> <a href="${bookingData.bookingUrl || '#'}">${bookingData.bookingUrl || 'N/A'}</a></p>
				<p><strong>Calendly Event URI:</strong> ${bookingData.eventUri || 'N/A'}</p>
			</div>

			<p style="color: #666; font-size: 12px; margin-top: 20px;">
				Received: ${new Date().toLocaleString()}
			</p>
		</div>
	`

	try {
		const resendApiKey = getEnvVar('RESEND_API_KEY', false) || process.env.RESEND_API_KEY
		
		if (resendApiKey) {
			const resendResponse = await fetch('https://api.resend.com/emails', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${resendApiKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					from: 'Hagi Aesthetics <noreply@hagiaesthetics.store>',
					to: [recipientEmail],
					subject: `New Booking: ${bookingData.name || 'Consultation Request'}`,
					text: emailBody,
					html: htmlBody,
				}),
			})

			if (!resendResponse.ok) {
				const errorData = await resendResponse.json().catch(() => ({}))
				throw new Error(errorData.message || 'Failed to send email via Resend')
			}

			return { success: true, method: 'resend' }
		}
		
		// Fallback: Log to console (for development)
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
		console.log('📅 BOOKING NOTIFICATION EMAIL')
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
		console.log(emailBody)
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
		console.log(`\nTo: ${recipientEmail}`)
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
		
		if (process.env.NODE_ENV === 'production') {
			console.warn('⚠️  Email service not configured. Please set RESEND_API_KEY in production.')
		}
		
		return { success: true, method: 'console' }
	} catch (error) {
		console.error('Email sending error:', error)
		throw error
	}
}

// Parse Calendly webhook payload
function parseCalendlyPayload(payload) {
	try {
		const data = typeof payload === 'string' ? JSON.parse(payload) : payload
		
		// Calendly webhook can have different structures
		// Handle both direct payload and nested event structure
		let event = data
		let invitee = {}
		let eventType = {}
		let eventTimes = []
		
		// Check if payload has nested event structure
		if (data.payload) {
			event = data.payload
		} else if (data.event) {
			event = data.event
		}
		
		// Extract invitee information
		if (event.invitee) {
			invitee = event.invitee
		} else if (data.invitee) {
			invitee = data.invitee
		}
		
		// Extract event type information
		if (event.event_type) {
			eventType = event.event_type
		} else if (data.event_type) {
			eventType = data.event_type
		}
		
		// Extract event times
		if (event.event_times && Array.isArray(event.event_times)) {
			eventTimes = event.event_times
		} else if (data.event_times && Array.isArray(data.event_times)) {
			eventTimes = data.event_times
		} else if (event.start_time) {
			// Single event time
			eventTimes = [{ start_time: event.start_time }]
		}
		
		// Build name from first_name and last_name if name is not available
		let name = invitee.name
		if (!name && (invitee.first_name || invitee.last_name)) {
			name = `${invitee.first_name || ''} ${invitee.last_name || ''}`.trim()
		}
		
		// Extract booking information
		const bookingData = {
			name: name || 'N/A',
			email: invitee.email || 'N/A',
			phone: invitee.phone_number || invitee.phone || 'N/A',
			eventType: eventType.name || eventType.slug || 'N/A',
			eventName: eventType.name || eventType.slug || 'N/A',
			startTime: eventTimes[0]?.start_time 
				? new Date(eventTimes[0].start_time).toLocaleString() 
				: (event.start_time ? new Date(event.start_time).toLocaleString() : 'N/A'),
			duration: eventType.duration || event.duration || 'N/A',
			bookingUrl: invitee.event || invitee.uri || event.uri || 'N/A',
			eventUri: event.uri || data.uri || 'N/A',
			questionsAndAnswers: invitee.questions_and_answers || invitee.answers || [],
			notes: invitee.notes || invitee.text_reminder_number || invitee.additional_notes || '',
		}
		
		return bookingData
	} catch (error) {
		console.error('Error parsing Calendly payload:', error)
		console.error('Payload received:', JSON.stringify(payload, null, 2))
		return null
	}
}

export async function POST(request) {
	try {
		// Get raw body for signature verification
		const rawBody = await request.text()
		const headersList = await request.headers
		const signature = headersList.get('calendly-signature') || headersList.get('x-calendly-signature')
		
		// Verify webhook signature (if secret is configured)
		const webhookSecret = getEnvVar('CALENDLY_WEBHOOK_SECRET', false) || process.env.CALENDLY_WEBHOOK_SECRET
		if (webhookSecret && signature) {
			const isValid = verifyCalendlySignature(rawBody, signature, webhookSecret)
			if (!isValid) {
				console.error('Invalid Calendly webhook signature')
				return NextResponse.json(
					{ error: 'Invalid signature' },
					{ status: 401 }
				)
			}
		}
		
		// Parse the payload
		const payload = JSON.parse(rawBody)
		
		// Check event type - we're interested in invitee.created events
		const eventType = payload.event || payload.event_type || 'unknown'
		
		// Log the webhook for debugging
		console.log('Calendly webhook received:', {
			eventType,
			timestamp: new Date().toISOString(),
		})
		
		// Parse booking data from payload
		const bookingData = parseCalendlyPayload(payload)
		
		if (!bookingData) {
			console.error('Failed to parse booking data from Calendly webhook')
			return NextResponse.json(
				{ error: 'Invalid payload format' },
				{ status: 400 }
			)
		}
		
		// Send booking email
		await sendBookingEmail(bookingData)
		
		console.log('Booking email sent successfully for:', bookingData.email)
		
		// Return success response (Calendly expects 200)
		return NextResponse.json({
			success: true,
			message: 'Booking notification sent',
		})
	} catch (error) {
		console.error('Error processing Calendly webhook:', error)
		
		// Return error but don't fail the webhook (Calendly will retry)
		return NextResponse.json(
			{ 
				error: 'Internal server error',
				message: error.message 
			},
			{ status: 500 }
		)
	}
}

// Health check endpoint
export async function GET() {
	return NextResponse.json({
		status: 'ok',
		message: 'Calendly webhook endpoint is active',
		timestamp: new Date().toISOString(),
	})
}

