/**
 * @system     FlowAluminio
 * @module     components/nav-bar.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Barra de navegación inferior mobile-first con resaltado de ítem activo
 */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  href: string
  label: string
  Icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
}

export function NavBar({ items }: NavBarProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-background border-t">
      <div className="flex items-center justify-around px-1 py-0.5 max-w-lg mx-auto">
        {items.map(({ href, label, Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href) && !href.startsWith('/dashboard'))
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[56px] min-h-[52px] justify-center active:scale-95
                ${isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-[10px] leading-tight font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
