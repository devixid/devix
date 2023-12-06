/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
