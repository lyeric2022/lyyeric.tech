import type { Metadata } from 'next'
import { Source_Sans_3 } from 'next/font/google'
import { Analytics } from '@/components/Analytics'
import { SiteNav } from '@/components/SiteNav'
import './globals.scss'
import '@/components/writing/Writing.scss'
import '@/components/TierList.scss'
import '@/styles/home.scss'

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-source-sans',
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
    <html lang="en" className={sourceSans.variable} suppressHydrationWarning>
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
