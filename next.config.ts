import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '*.go.kr' },
      { protocol: 'https', hostname: '*.go.kr' },
      { protocol: 'http', hostname: '*.animal.go.kr' },
      { protocol: 'https', hostname: '*.animal.go.kr' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default nextConfig
