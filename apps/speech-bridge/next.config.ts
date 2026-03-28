import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Speech bridge is API-only; no need for image optimization
  images: { unoptimized: true },
};

export default nextConfig;
