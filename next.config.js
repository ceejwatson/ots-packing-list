/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  images: {
    imageSizes: [32, 48, 68, 96, 128, 192, 256, 384],
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
    ],
  },
}

module.exports = nextConfig
