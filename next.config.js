/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.1.101"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

module.exports = nextConfig;
