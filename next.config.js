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
  images: {
    domains: ['images.igdb.com', 'nextlevel-processed.s3.amazonaws.com', 'nextlevel-uploads.s3.amazonaws.com'],
  },
}

module.exports = nextConfig