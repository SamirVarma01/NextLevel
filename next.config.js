/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.igdb.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig