/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.rakuten.co.jp',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'recipe.r10s.jp',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'recipe.rakuten.co.jp',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.cpcdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  env: {
    // Admin account defaults (can be overridden by .env files)
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@maalmatch.com',
    ADMIN_NAME: process.env.ADMIN_NAME || 'Administrator',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin1234',
    ADMIN_ROLE: process.env.ADMIN_ROLE || 'admin',
    DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
    // Rakuten API configuration
    RAKUTEN_APPLICATION_ID: process.env.RAKUTEN_APPLICATION_ID || '',
  },
}

export default nextConfig
