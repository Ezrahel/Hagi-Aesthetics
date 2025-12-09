/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'standalone',
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
