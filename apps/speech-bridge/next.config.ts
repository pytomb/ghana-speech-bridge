import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Speech bridge is API-only; no need for image optimization
  images: { unoptimized: true },
  // Fix workspace root detection in monorepo
  outputFileTracingRoot: require("path").join(__dirname, "../../"),
};

export default nextConfig;
