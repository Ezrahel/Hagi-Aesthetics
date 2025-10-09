export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getEnvVar, getPaypalDomain, getOriginFromRequestUrl } from '@/lib/config'
import { json, errorJson } from '@/lib/http'

function withTimeout(ms) {
	const controller = new AbortController()
	const timeout = setTimeout(() => controller.abort(), ms)
	return { controller, clear: () => clearTimeout(timeout) }
}

function toTwoDecimals(amount) {
	const n = Number(amount)
	if (!isFinite(n)) return null
	return n.toFixed(2)
}

async function createPaypalOrder({ amount, origin }) {
	let paypalClientId = getEnvVar('PAYPAL_CLIENT_ID')
	let paypalSecret = getEnvVar('PAYPAL_SECRET')
	paypalClientId = typeof paypalClientId === 'string' ? paypalClientId.trim() : paypalClientId
	paypalSecret = typeof paypalSecret === 'string' ? paypalSecret.trim() : paypalSecret
	const domain = getPaypalDomain()
	const basicAuth = 'Basic ' + Buffer.from(`${paypalClientId}:${paypalSecret}`).toString('base64')
	const userAgent = 'HagiAesthetics/1.0 (+payments)'

	// Request OAuth token
	const t1 = withTimeout(15000)
	const tokenRes = await fetch(`https://api-m.${domain}paypal.com/v1/oauth2/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept': 'application/json',
			'Authorization': basicAuth,
			'User-Agent': userAgent,
		},
		body: new URLSearchParams({ grant_type: 'client_credentials' }),
		signal: t1.controller.signal,
	}).catch((e) => ({ ok: false, _networkError: String(e) }))
	t1.clear()
	if (!tokenRes?.ok) {
		const err = tokenRes?._networkError ? tokenRes._networkError : await tokenRes.text().catch(() => '')
		return { ok: false, code: 'TOKEN_ERROR', status: tokenRes?.status || 0, error: err }
	}
	const { access_token } = await tokenRes.json()
	if (!access_token) {
		return { ok: false, code: 'TOKEN_EMPTY', status: 500, error: 'Access token missing' }
	}

	const returnUrl = `${origin}/api/paypal/return`
	const cancelUrl = `${origin}/`
	const amountValue = toTwoDecimals(amount)
	if (!amountValue) {
		return { ok: false, code: 'AMOUNT_INVALID', status: 400, error: 'Invalid amount' }
	}
	const body = {
		intent: 'CAPTURE',
		purchase_units: [ { amount: { currency_code: 'USD', value: amountValue } } ],
		application_context: {
			brand_name: 'Hagi Aesthetics',
			landing_page: 'LOGIN',
			user_action: 'PAY_NOW',
			return_url: returnUrl,
			cancel_url: cancelUrl,
		},
	}
	const idempotencyKey = (globalThis.crypto && 'randomUUID' in globalThis.crypto) ? globalThis.crypto.randomUUID() : `pp-${Date.now()}-${Math.random().toString(36).slice(2)}`

	// Create order
	const t2 = withTimeout(15000)
	const orderRes = await fetch(`https://api-m.${domain}paypal.com/v2/checkout/orders`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'Authorization': `Bearer ${access_token}`,
			'User-Agent': userAgent,
			'PayPal-Request-Id': idempotencyKey,
		},
		body: JSON.stringify(body),
		signal: t2.controller.signal,
	}).catch((e) => ({ ok: false, _networkError: String(e) }))
	t2.clear()
	if (!orderRes?.ok) {
		const err = orderRes?._networkError ? orderRes._networkError : await orderRes.text().catch(() => '')
		return { ok: false, code: 'ORDER_ERROR', status: orderRes?.status || 0, error: err }
	}
	const order = await orderRes.json()
	const approvalUrl = order?.links?.find(l => l?.rel === 'approve')?.href
	if (!approvalUrl) return { ok: false, code: 'APPROVAL_URL_MISSING', status: 500, error: order }
	return { ok: true, id: order.id, approvalUrl }
}

export async function GET(request) {
	try {
		const origin = getOriginFromRequestUrl(request.url)
		const url = new URL(request.url)
		const amount = url.searchParams.get('amount') || '1.00'
		if (!/^\d+(\.\d{1,2})?$/.test(amount)) return errorJson('Invalid amount format', 400)
		const created = await createPaypalOrder({ amount, origin })
		if (!created.ok) return errorJson('Failed to create PayPal order', 500, created)
		return NextResponse.redirect(created.approvalUrl)
	} catch (e) {
		return errorJson('Unexpected server error', 500, String(e?.message || e))
	}
}

export async function POST(request) {
	try {
		const origin = getOriginFromRequestUrl(request.url)
		const payload = await request.json().catch(() => ({}))
		const rawAmount = typeof payload?.amount === 'string' ? payload.amount : '1.00'
		if (!/^\d+(\.\d{1,2})?$/.test(rawAmount)) return errorJson('Invalid amount format', 400)
		const created = await createPaypalOrder({ amount: rawAmount, origin })
		if (!created.ok) return errorJson('Failed to create PayPal order', 500, created)
		return json({ id: created.id, approvalUrl: created.approvalUrl }, 200)
	} catch (e) {
		return errorJson('Unexpected server error', 500, String(e?.message || e))
	}
} 