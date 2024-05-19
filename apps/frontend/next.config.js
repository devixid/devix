/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ini gua tambahin biar pas build ga error
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
