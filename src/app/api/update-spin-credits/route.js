import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEnvVar } from '@/lib/config'

function getSupabaseAdmin() {
	const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
	const key = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
	return createClient(url, key)
}

export async function POST(request) {
	try {
		const { userId, amountCents } = await request.json()

		if (!userId || typeof amountCents !== 'number') {
			return NextResponse.json(
				{ error: 'Missing userId or amountCents' },
				{ status: 400 }
			)
		}

		const supabase = getSupabaseAdmin()

		// Get current user metadata
		const { data: userData, error: fetchError } = await supabase.auth.admin.getUserById(userId)

		if (fetchError || !userData?.user) {
			return NextResponse.json(
				{ error: 'User not found' },
				{ status: 404 }
			)
		}

		const currentMeta = userData.user.user_metadata || {}
		const currentCredits = Number.isFinite(currentMeta.paid_credits_cents) ? currentMeta.paid_credits_cents : 0
		const newCredits = currentCredits + amountCents

		// Update user metadata with new credits
		const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
			user_metadata: {
				...currentMeta,
				paid_credits_cents: newCredits
			}
		})

		if (updateError) {
			console.error('Failed to update spin credits:', updateError)
			return NextResponse.json(
				{ error: 'Failed to update spin credits' },
				{ status: 500 }
			)
		}

		return NextResponse.json({
			success: true,
			newBalance: newCredits
		})
	} catch (error) {
		console.error('Update spin credits error:', error)
		return NextResponse.json(
			{ error: error.message || 'Internal server error' },
			{ status: 500 }
		)
	}
}

