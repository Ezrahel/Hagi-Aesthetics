export function json(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' }
	})
}

export function errorJson(message, status = 500, details) {
	return json({ error: message, ...(details ? { details } : {}) }, status)
}
