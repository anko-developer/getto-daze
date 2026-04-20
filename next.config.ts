import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '*.go.kr' },
      { protocol: 'https', hostname: '*.go.kr' },
    ],
  },
}

export default nextConfig
