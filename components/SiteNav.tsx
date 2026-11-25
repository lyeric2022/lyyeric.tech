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

  return (
    <nav className="writing-header" aria-label="Site">
      {links.map((link) => (
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
