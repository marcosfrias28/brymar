import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Configure Next.js to use src directory structure
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Ensure environment variables are available
  env: {
    POSTGRES_URL: process.env.POSTGRES_URL,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    POSTGRES_URL_NO_SSL: process.env.POSTGRES_URL_NO_SSL,
  },

  images: {
    unoptimized: true,
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },

  experimental: {
    reactCompiler: false,
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },

  // Configure webpack to handle the new structure
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add alias for cleaner imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    return config;
  },
};

export default nextConfig;
