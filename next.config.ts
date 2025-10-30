import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Configure Next.js to use src directory structure
	pageExtensions: ["js", "jsx", "ts", "tsx"],

	// Ensure environment variables are available
	env: {
		DATABASE_URL: process.env.DATABASE_URL,
	},

	images: {
		unoptimized: true,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "*.public.blob.vercel-storage.com",
			},
			{
				protocol: "http",
				hostname: "localhost",
			},
		],
	},

	// React Compiler moved out of experimental in Next.js 16
	reactCompiler: false,

	experimental: {
		serverActions: {
			bodySizeLimit: "5mb",
		},
	},

	// Add empty Turbopack config to silence error under Next.js 16
	turbopack: {},
};

export default nextConfig;
