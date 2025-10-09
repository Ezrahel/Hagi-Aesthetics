export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { json, errorJson } from '@/lib/http'
import { getEnvVar } from '@/lib/config'

function validateOrder(payload) {
	if (!payload) return 'Empty payload'
	if (!payload.total || isNaN(Number(payload.total))) return 'Invalid total'
	if (!Array.isArray(payload.items)) return 'Items must be an array'
	return null
}

async function insertOrder(order) {
	const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
	const serviceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
	const res = await fetch(`${supabaseUrl}/rest/v1/orders`, {
		method: 'POST',
		headers: {
			'apikey': serviceRoleKey,
			'Authorization': `Bearer ${serviceRoleKey}`,
			'Content-Type': 'application/json',
			'Prefer': 'return=representation',
		},
		body: JSON.stringify(order),
	})
	if (!res.ok) {
		return { ok: false, error: await res.text() }
	}
	const data = await res.json()
	return { ok: true, data: data?.[0] || null }
}

async function sendEmail(order) {
	const apiKey = process.env.RESEND_API_KEY
	const from = process.env.ORDER_FROM_EMAIL || 'orders@hagiaesthetics.com'
	if (!apiKey) return { ok: true }
	const to = order?.customerEmail ? [order.customerEmail] : []
	if (process.env.ORDER_BCC_EMAIL) to.push(process.env.ORDER_BCC_EMAIL)
	const subject = `Your Hagi Aesthetics Order #${order.orderId}`
	const html = `
		<h2>Thank you for your order!</h2>
		<p>Order ID: <strong>${order.orderId}</strong></p>
		<p>Total: <strong>$${Number(order.total).toFixed(2)}</strong></p>
		<p>Items:</p>
		<ul>${(order.items || []).map(i => `<li>${i.name} × ${i.qty} — $${Number(i.price).toFixed(2)}</li>`).join('')}</ul>
		<p>We will notify you when your order ships.</p>
	`
	await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({ from, to, subject, html })
	})
	return { ok: true }
}

export async function POST(request) {
	try {
		const payload = await request.json()
		const err = validateOrder(payload)
		if (err) return errorJson(err, 400)
		const now = new Date().toISOString()
		const order = {
			orderId: payload.paypalOrderId || payload.id || `PP-${Date.now()}`,
			status: payload.status || 'PAID',
			items: payload.items || [],
			subtotal: Number(payload.subtotal || 0),
			shipping: Number(payload.shipping || 0),
			discount: Number(payload.discount || 0),
			total: Number(payload.total || 0),
			couponCode: payload.couponCode || null,
			customerEmail: payload.customerEmail || null,
			customerName: payload.customerName || null,
			createdAt: now,
			provider: 'paypal',
			providerPayload: payload.paypalCapture || null,
		}
		const saved = await insertOrder(order)
		if (!saved.ok) return errorJson('Failed to save order', 500, saved.error)
		await sendEmail({ ...order, orderId: saved.data?.orderId || order.orderId })
		return json({ success: true, order: saved.data || order }, 200)
	} catch (e) {
		return errorJson('Unexpected error', 500, String(e?.message || e))
	}
}
