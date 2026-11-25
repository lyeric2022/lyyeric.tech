import type { Metadata } from 'next'
import { Noto_Sans_JP, Source_Sans_3 } from 'next/font/google'
import { Analytics } from '@/components/Analytics'
import { SiteNav } from '@/components/SiteNav'
import './globals.scss'
import '@/components/writing/Writing.scss'
import '@/components/TierList.scss'
import '@/styles/home.scss'
import '@/styles/v1.scss'

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-source-sans',
})

const notoSansJp = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['300', '700'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
})

export const metadata: Metadata = {
  title: {
    default: 'Eric Ly',
    template: '%s · Eric Ly',
  },
  description: 'Eric Ly. Engineer, writing, and rankings.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${notoSansJp.variable}`} suppressHydrationWarning>
      <body>
        <Analytics />
        <div className="writing-route">
          <SiteNav />
          {children}
        </div>
      </body>
    </html>
  )
}
