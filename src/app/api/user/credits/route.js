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

export async function GET() {
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
				{ error: 'Not authenticated' },
				{ status: 401 }
			)
		}
		
		const userId = authData.user.id
		
		// Use admin API to get the latest user data (includes server-side metadata updates)
		const supabaseAdmin = getSupabaseAdmin()
		const { data: userData, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId)
		
		if (fetchError || !userData?.user) {
			// Fallback to session user data if admin fetch fails
			const user = authData.user
			const meta = user.user_metadata || {}
			return NextResponse.json({
				success: true,
				credits: {
					free_spins_left: Number.isFinite(meta.free_spins_left) ? meta.free_spins_left : 3,
					paid_credits_cents: Number.isFinite(meta.paid_credits_cents) ? meta.paid_credits_cents : 0,
				},
				user_metadata: meta
			})
		}
		
		// Use the latest user data from admin API
		const user = userData.user
		const meta = user.user_metadata || {}
		
		return NextResponse.json({
			success: true,
			credits: {
				free_spins_left: Number.isFinite(meta.free_spins_left) ? meta.free_spins_left : 3,
				paid_credits_cents: Number.isFinite(meta.paid_credits_cents) ? meta.paid_credits_cents : 0,
			},
			user_metadata: meta
		})
	} catch (err) {
		console.error('Error fetching user credits:', err)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

