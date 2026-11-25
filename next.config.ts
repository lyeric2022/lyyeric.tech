import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/drafts', destination: '/writing', permanent: false },
      { source: '/drafts/:slug', destination: '/writing/:slug', permanent: false },
      { source: '/tier-list', destination: '/rankings', permanent: false },
    ]
  },
}

export default nextConfig
