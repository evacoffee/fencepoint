/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Remove experimental and pwa config for now
  // We can add PWA support back later if needed
};

module.exports = nextConfig;
