import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: 'standalone' for Amplify
  /* config options here */
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
