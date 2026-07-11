import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow external stock company logos from Finnhub CDN
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.finnhub.io",
      },
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
    ],
  },
};

export default nextConfig;
