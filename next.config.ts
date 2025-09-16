import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      process.env.NEXT_PUBLIC_CONVEX_URL
        ?.replace(/^https?:\/\//, '') // Remove protocol (https://)
        .split('/')[0] || '', // Keep only hostname
    ],
  },
};

export default nextConfig;
