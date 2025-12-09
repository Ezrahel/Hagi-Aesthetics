// Centralized Stripe singleton to prevent memory leaks
import { loadStripe } from '@stripe/stripe-js'

let stripePromise = null

export const getStripe = () => {
	if (!stripePromise) {
		const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
		if (!publishableKey) {
			return null
		}
		stripePromise = loadStripe(publishableKey)
	}
	return stripePromise
}

