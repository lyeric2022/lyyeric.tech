import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_POSTHOG_KEY:
      process.env.NEXT_PUBLIC_POSTHOG_KEY ?? process.env.VITE_POSTHOG_KEY ?? '',
    NEXT_PUBLIC_POSTHOG_HOST:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ??
      process.env.VITE_POSTHOG_HOST ??
      'https://us.i.posthog.com',
    NEXT_PUBLIC_FIREBASE_API_KEY:
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? process.env.VITE_FIREBASE_API_KEY ?? '',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? process.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    NEXT_PUBLIC_FIREBASE_DATABASE_URL:
      process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ?? process.env.VITE_FIREBASE_DATABASE_URL ?? '',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.VITE_FIREBASE_PROJECT_ID ?? '',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
      process.env.VITE_FIREBASE_STORAGE_BUCKET ??
      '',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
      process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ??
      '',
    NEXT_PUBLIC_FIREBASE_APP_ID:
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? process.env.VITE_FIREBASE_APP_ID ?? '',
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ??
      process.env.VITE_FIREBASE_MEASUREMENT_ID ??
      '',
  },
  async redirects() {
    return [
      { source: '/drafts', destination: '/writing', permanent: false },
      { source: '/drafts/:slug', destination: '/writing/:slug', permanent: false },
      { source: '/tier-list', destination: '/rankings', permanent: false },
      { source: '/payday-purgatory', destination: '/pp', permanent: false },
    ]
  },
}

export default nextConfig
