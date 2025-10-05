/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Commented out for development
  trailingSlash: true,
  images: { unoptimized: true },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;