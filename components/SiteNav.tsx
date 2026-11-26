'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Home', active: (pathname: string) => pathname === '/' },
  { href: '/writing', label: 'Writing', active: (pathname: string) => pathname.startsWith('/writing') },
  { href: '/rankings', label: 'Rankings', active: (pathname: string) => pathname === '/rankings' },
]

export function SiteNav() {
  const pathname = usePathname()
  const isGame = pathname === '/pp' || pathname.startsWith('/pp/')
  const visibleLinks = isGame ? links.slice(0, 1) : links

  return (
    <nav className={`writing-header${isGame ? ' writing-header--back' : ''}`} aria-label="Site">
      {visibleLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`header-option ${link.active(pathname) ? 'active' : ''}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
