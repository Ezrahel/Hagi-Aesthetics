import { NextResponse } from 'next/server'
import { getEnvVar, getPaypalDomain } from '@/lib/config'
import { errorJson } from '@/lib/http'

export const runtime = 'nodejs'

async function recordOrder({ request, capture, total }) {
	try {
		const url = new URL(request.url)
		const origin = url.origin
		const orderId = capture?.id
		const gross = total || capture?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || null
		await fetch(`${origin}/api/orders`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ paypalOrderId: orderId, total: Number(gross || 0), status: capture?.status || 'PAID', items: [], subtotal: Number(gross || 0), shipping: 0, discount: 0, paypalCapture: capture })
		})
	} catch (e) {
		console.error('recordOrder failed', e)
	}
}

export async function GET(request) {
	const url = new URL(request.url)
	const token = url.searchParams.get('token')
	const { origin } = url
	if (!token) {
		return NextResponse.redirect(`${origin}/`)
	}
	try {
		const paypalClientId = getEnvVar('PAYPAL_CLIENT_ID')
		const paypalSecret = getEnvVar('PAYPAL_SECRET')
		const domain = getPaypalDomain()
		const tokenRes = await fetch(`https://api-m.${domain}paypal.com/v1/oauth2/token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'Basic ' + Buffer.from(`${paypalClientId}:${paypalSecret}`).toString('base64'),
			},
			body: 'grant_type=client_credentials',
		})
		if (!tokenRes.ok) {
			return NextResponse.redirect(`${origin}/?payment=error`)
		}
		const { access_token } = await tokenRes.json()
		if (!access_token) return NextResponse.redirect(`${origin}/?payment=error`)

		const captureRes = await fetch(`https://api-m.${domain}paypal.com/v2/checkout/orders/${token}/capture`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access_token}`,
			},
		})
		if (!captureRes.ok) {
			return NextResponse.redirect(`${origin}/?payment=error`)
		}
		const capture = await captureRes.json()
		await recordOrder({ request, capture })
		return NextResponse.redirect(`${origin}/?payment=success`)
	} catch (e) {
		return NextResponse.redirect(`${origin}/?payment=error`)
	}
} 