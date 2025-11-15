export function getEnvVar(name, required = true) {
	const value = process.env[name]
	if (required && (!value || String(value).trim() === '')) {
		throw new Error(`Missing required env var: ${name}`)
	}
	return value
}

export function getOriginFromRequestUrl(url) {
	const { origin } = new URL(url)
	return origin
}
