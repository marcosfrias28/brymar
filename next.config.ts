<<<<<<< HEAD
import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
=======
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
>>>>>>> 64e02e8 (feat(dashboard): add new dashboard layout and components)
  eslint: {
    ignoreDuringBuilds: true,
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
  },
};

<<<<<<< HEAD
export default withPayload(nextConfig);
=======
export default nextConfig;
>>>>>>> 64e02e8 (feat(dashboard): add new dashboard layout and components)
