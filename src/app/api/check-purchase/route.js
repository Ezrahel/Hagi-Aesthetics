export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getEnvVar } from '@/lib/config'

function getSupabaseAdmin() {
	const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
	const key = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
	return createClient(url, key)
}

// Product slug for the Vietnamese Hair Vendor List PDF
const PDF_PRODUCT_SLUG = 'vietnamese-hair-vendor-list'

export async function GET(request) {
	try {
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
		
		if (authErr || !authData?.user) {
			return NextResponse.json(
				{ hasPurchased: false, error: 'Not authenticated' },
				{ status: 401 }
			)
		}
		
		const userId = authData.user.id
		
		// Use admin client for efficient query (bypasses RLS, uses indexes)
		const supabaseAdmin = getSupabaseAdmin()
		
		// Query orders for this user with paid/completed status
		// Using indexed columns (user_id, status) for fast lookup
		// Include created_at to calculate expiry
		const { data: orders, error: queryError } = await supabaseAdmin
			.from('orders')
			.select('id, items, status, created_at')
			.eq('user_id', userId)
			.in('status', ['paid', 'completed'])
			.order('created_at', { ascending: false })
			.limit(100) // Reasonable limit to avoid memory issues
		
		if (queryError) {
			console.error('Error querying orders:', queryError)
			return NextResponse.json(
				{ hasPurchased: false, error: 'Database query failed' },
				{ status: 500 }
			)
		}
		
		// Check if any order contains the PDF product and track purchase date
		// Items is JSONB array, check for product_id or slug match
		// Optimized: Use Set for O(1) lookups and early exit
		const EXPIRY_DAYS = 7
		const EXPIRY_MS = EXPIRY_DAYS * 24 * 60 * 60 * 1000 // 7 days in milliseconds
		
		// Pre-compute valid product IDs for O(1) lookup
		const validProductIds = new Set([
			PDF_PRODUCT_SLUG,
			'product03',
			'product 03'
		])
		
		let hasPurchased = false
		let purchaseDate = null
		
		if (orders && Array.isArray(orders)) {
			// Use for...of for better performance and early exit
			outer: for (const order of orders) {
				const items = order.items
				if (!Array.isArray(items)) continue
				
				// Single pass through items with early exit
				for (const item of items) {
					const productId = item.product_id
					// Fast Set lookup for product_id
					if (productId && validProductIds.has(productId)) {
						hasPurchased = true
						purchaseDate = order.created_at
						break outer
					}
					// Only check name if product_id doesn't match (lazy evaluation)
					const itemName = item.name?.toLowerCase()
					if (itemName && (
						itemName.includes('vietnamese hair vendor') ||
						itemName.includes('hair vendor list')
					)) {
						hasPurchased = true
						purchaseDate = order.created_at
						break outer
					}
				}
			}
		}
		
		// Calculate expiry status
		let isExpired = false
		let expiresAt = null
		let daysRemaining = null
		
		if (hasPurchased && purchaseDate) {
			const purchaseTime = new Date(purchaseDate).getTime()
			expiresAt = new Date(purchaseTime + EXPIRY_MS)
			const now = Date.now()
			isExpired = now > (purchaseTime + EXPIRY_MS)
			
			if (!isExpired) {
				const remainingMs = (purchaseTime + EXPIRY_MS) - now
				daysRemaining = Math.ceil(remainingMs / (24 * 60 * 60 * 1000))
			}
		}
		
		return NextResponse.json({
			hasPurchased,
			isExpired,
			purchaseDate,
			expiresAt: expiresAt ? expiresAt.toISOString() : null,
			daysRemaining,
			success: true
		})
	} catch (err) {
		console.error('Error checking purchase status:', err)
		return NextResponse.json(
			{ hasPurchased: false, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

