'use client'

import { usePathname, useRouter } from 'next/navigation'
import { clearToken } from '@/lib/api'

const LINKS = [
  { href: '/dashboard', label: 'Alertas' },
  { href: '/perfil', label: 'Mi perfil' },
]

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <a href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-700 text-sm font-bold text-white">S</span>
          <span className="text-base font-semibold tracking-tight">Subvenciona</span>
        </a>

        <nav className="flex items-center gap-1">
          {LINKS.map(l => {
            const active = pathname === l.href
            return (
              <a
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  active ? 'bg-brand-50 text-brand-700' : 'text-subtle hover:text-ink'
                }`}
              >
                {l.label}
              </a>
            )
          })}
          <button
            onClick={() => {
              clearToken()
              router.push('/login')
            }}
            className="ml-2 rounded-md border border-line px-3 py-1.5 text-sm text-subtle transition hover:text-ink"
          >
            Salir
          </button>
        </nav>
      </div>
    </header>
  )
}
