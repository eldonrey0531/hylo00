/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Commented out for development
  trailingSlash: true,
  images: { unoptimized: true },
};

module.exports = nextConfig;