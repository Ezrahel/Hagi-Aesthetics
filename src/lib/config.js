export function getEnvVar(name, required = true) {
	const value = process.env[name]
	if (required && (!value || String(value).trim() === '')) {
		throw new Error(`Missing required env var: ${name}`)
	}
	return value
}

export function getPaypalDomain() {
	const env = (process.env.PAYPAL_ENV || 'sandbox').toLowerCase().trim()
	if (env !== 'sandbox' && env !== 'live') {
		throw new Error('PAYPAL_ENV must be "sandbox" or "live"')
	}
	return env === 'sandbox' ? 'sandbox.' : ''
}

export function getOriginFromRequestUrl(url) {
	const { origin } = new URL(url)
	return origin
}
