'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Bell, Flag, User, LogOut } from 'lucide-react'
import { clearToken } from '@/lib/api'

const TABS = [
  { href: '/dashboard', label: 'Alertas', icon: Bell },
  { href: '/reportes', label: 'Reportes', icon: Flag },
  { href: '/perfil', label: 'Perfil', icon: User },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const salir = () => { clearToken(); router.push('/login') }

  return (
    <div className="min-h-screen">
      {/* Barra superior */}
      <header className="sticky top-0 z-30 border-b border-line bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <a href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 text-sm font-bold text-white shadow-sm">S</span>
            <span className="text-[17px] font-bold tracking-tight">Subvenciona</span>
          </a>

          {/* Nav escritorio */}
          <nav className="hidden items-center gap-1 md:flex">
            {TABS.map(t => {
              const active = pathname === t.href
              return (
                <a key={t.href} href={t.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${active ? 'bg-brand-50 text-brand-700' : 'text-subtle hover:bg-slate-100 hover:text-ink'}`}>
                  <t.icon className="h-4 w-4" /> {t.label}
                </a>
              )
            })}
            <button onClick={salir} className="ml-1 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-subtle hover:bg-slate-100 hover:text-ink">
              <LogOut className="h-4 w-4" /> Salir
            </button>
          </nav>

          {/* Salir móvil */}
          <button onClick={salir} className="rounded-lg p-2 text-subtle hover:bg-slate-100 md:hidden" aria-label="Salir">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Contenido (deja hueco para la barra inferior en móvil) */}
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-12">{children}</main>

      {/* Navegación inferior (móvil) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {TABS.map(t => {
            const active = pathname === t.href
            return (
              <a key={t.href} href={t.href}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${active ? 'text-brand-700' : 'text-subtle'}`}>
                <t.icon className={`h-[22px] w-[22px] ${active ? 'stroke-[2.4]' : ''}`} />
                {t.label}
              </a>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
