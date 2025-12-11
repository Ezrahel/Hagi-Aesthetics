export function getEnvVar(name, required = true) {
	const value = process.env[name]
	if (required && (!value || String(value).trim() === '')) {
		throw new Error(`Missing required env var: ${name}`)
	}
	return value
}

export function getOriginFromRequestUrl(url) {
	// Prefer explicit site URL envs (safer behind proxies/hosted envs)
	const envOrigin = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || process.env.VERCEL_URL
	if (envOrigin && String(envOrigin).trim() !== '') {
		const cleaned = String(envOrigin).trim().replace(/\/$/, '')
		if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
			return cleaned
		}
		return `https://${cleaned}`
	}
	// Fallback to request URL origin
	try {
		const { origin } = new URL(url)
		return origin
	} catch {
		return 'http://localhost:3000'
	}
}
