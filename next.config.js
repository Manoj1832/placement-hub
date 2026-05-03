/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow external devices to connect for HMR
  allowedDevOrigins: ["172.20.10.3"],
};

module.exports = nextConfig;
