/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'standalone',
	// Avoid server-side sharp image optimization on low-memory/CPU hosts.
	// Images should be served pre-optimized or via an external CDN.
	images: {
		unoptimized: true,
	},
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production' ? {
			exclude: ['error', 'warn'],
		} : false,
	},
	experimental: {
		optimizeCss: true,
	},
};

export default nextConfig;
