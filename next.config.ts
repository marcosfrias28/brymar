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

	experimental: {
		serverActions: {
			bodySizeLimit: "5mb",
		},
	},

};

export default nextConfig;
