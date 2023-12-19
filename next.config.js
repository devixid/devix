/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    /**
     * Bug pas build production
     */
    // optimizeCss: true,
  },
};

module.exports = nextConfig;
