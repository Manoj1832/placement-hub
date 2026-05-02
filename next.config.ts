import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external devices to connect for HMR
  allowedDevOrigins: ["172.20.10.3"],
};

export default nextConfig;
