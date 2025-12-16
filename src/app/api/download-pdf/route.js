export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getEnvVar } from '@/lib/config'
import { createReadStream } from 'fs'
import { join } from 'path'
import { stat } from 'fs/promises'

function getSupabaseAdmin() {
	const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
	const key = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
	return createClient(url, key)
}

const PDF_PRODUCT_SLUG = 'vietnamese-hair-vendor-list'
const PDF_FILENAME = 'vietnamese-hair-vendor-list.pdf'
// Store PDF in a secure location (not in public folder)
// You can move this to a more secure location or use Supabase Storage
const PDF_PATH = join(process.cwd(), 'private', PDF_FILENAME)

// Cache purchase check result for 5 minutes to reduce DB queries
const purchaseCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

const EXPIRY_DAYS = 7
const EXPIRY_MS = EXPIRY_DAYS * 24 * 60 * 60 * 1000 // 7 days in milliseconds

async function checkPurchaseAndExpiry(userId) {
	// Check cache first
	const cached = purchaseCache.get(userId)
	if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
		return {
			hasPurchased: cached.hasPurchased,
			isExpired: cached.isExpired,
			purchaseDate: cached.purchaseDate
		}
	}
	
	const supabaseAdmin = getSupabaseAdmin()
	
	// Efficient query: indexed on user_id and status
	// Include created_at to calculate expiry
	const { data: orders, error } = await supabaseAdmin
		.from('orders')
		.select('items, status, created_at')
		.eq('user_id', userId)
		.in('status', ['paid', 'completed'])
		.order('created_at', { ascending: false })
		.limit(100)
	
	if (error) {
		console.error('Error checking purchase:', error)
		return { hasPurchased: false, isExpired: false, purchaseDate: null }
	}
	
	let hasPurchased = false
	let purchaseDate = null
	
	if (orders && Array.isArray(orders)) {
		for (const order of orders) {
			const items = order.items
			if (Array.isArray(items)) {
				for (const item of items) {
					if (
						item.product_id === PDF_PRODUCT_SLUG ||
						item.product_id === 'product03' ||
						item.product_id === 'product 03' ||
						item.name?.toLowerCase().includes('vietnamese hair vendor') ||
						item.name?.toLowerCase().includes('hair vendor list')
					) {
						hasPurchased = true
						purchaseDate = order.created_at
						break
					}
				}
			}
			if (hasPurchased) break
		}
	}
	
	// Calculate expiry
	let isExpired = false
	if (hasPurchased && purchaseDate) {
		const purchaseTime = new Date(purchaseDate).getTime()
		const now = Date.now()
		isExpired = now > (purchaseTime + EXPIRY_MS)
	}
	
	// Cache the result
	purchaseCache.set(userId, {
		hasPurchased,
		isExpired,
		purchaseDate,
		timestamp: Date.now()
	})
	
	return { hasPurchased, isExpired, purchaseDate }
}

export async function GET(request) {
	try {
		// Authenticate user
		const cookieStore = await cookies()
		
		const supabaseServer = createServerClient(
			getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
			getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
			{
				cookies: {
					get(name) {
						return cookieStore.get(name)?.value
					},
					set() {},
					remove() {},
				},
			}
		)
		
		const { data: authData, error: authErr } = await supabaseServer.auth.getUser()
		
		if (authErr || !authData?.user) {
			return NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 }
			)
		}
		
		const userId = authData.user.id
		
		// Check if user has purchased the product and if it's still valid
		const { hasPurchased, isExpired } = await checkPurchaseAndExpiry(userId)
		
		if (!hasPurchased) {
			return NextResponse.json(
				{ error: 'You must purchase this product to download the PDF' },
				{ status: 403 }
			)
		}
		
		if (isExpired) {
			return NextResponse.json(
				{ error: 'Your download link has expired. The PDF is only available for 7 days after purchase.' },
				{ status: 403 }
			)
		}
		
		// Stream the PDF file (memory-efficient for large files)
		try {
			// Get file stats for Content-Length header
			const fileStats = await stat(PDF_PATH)
			const fileSize = fileStats.size
			
			// Create read stream for efficient memory usage
			const fileStream = createReadStream(PDF_PATH)
			
			// Convert Node.js stream to Web ReadableStream for Next.js
			const webStream = new ReadableStream({
				start(controller) {
					fileStream.on('data', (chunk) => {
						controller.enqueue(new Uint8Array(chunk))
					})
					fileStream.on('end', () => {
						controller.close()
					})
					fileStream.on('error', (err) => {
						controller.error(err)
					})
				},
				cancel() {
					fileStream.destroy()
				}
			})
			
			// Return streaming response
			return new NextResponse(webStream, {
				status: 200,
				headers: {
					'Content-Type': 'application/pdf',
					'Content-Disposition': `attachment; filename="${PDF_FILENAME}"`,
					'Content-Length': fileSize.toString(),
					// Cache control for browser caching
					'Cache-Control': 'private, max-age=3600',
				},
			})
		} catch (fileError) {
			console.error('Error reading PDF file:', fileError)
			return NextResponse.json(
				{ error: 'PDF file not found. Please contact support.' },
				{ status: 404 }
			)
		}
	} catch (err) {
		console.error('Error in download-pdf route:', err)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

