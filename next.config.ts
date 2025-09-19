import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { hostname: "adept-bat-395.convex.cloud", protocol: "https" },
      { hostname: "usable-mallard-840.convex.cloud", protocol: "https" },
    ],
  },
};

export default nextConfig;
