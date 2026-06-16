'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Compass, Search, Inbox } from 'lucide-react'
import { api, getToken } from '@/lib/api'
import { AppShell } from '@/components/AppShell'
import { AlertCard } from '@/components/AlertCard'
import type { Alerta, Convocatoria } from '@/lib/format'

type Tab = 'parati' | 'explorar'
type Estado = 'abiertas' | 'todas' | 'cerradas'
type Sort = 'score' | 'plazo' | 'reciente'

const SEGMENTS: { value: Estado; label: string }[] = [
  { value: 'abiertas', label: 'Abiertas' },
  { value: 'todas', label: 'Todas' },
  { value: 'cerradas', label: 'Cerradas' },
]

// Convocatoria del buscador (incluye score/reasons al nivel superior)
type ConvScored = Convocatoria & { score: number | null; reasons: string[] }

export default function DashboardPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('parati')

  useEffect(() => {
    if (!getToken()) router.push('/login')
  }, [router])

  async function markOpened(id: string, url: string) {
    api(`/api/alerts/${id}/opened`, { method: 'PUT' }).catch(() => {})
    window.open(url, '_blank', 'noopener')
  }

  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="text-[22px] font-bold tracking-tight sm:text-2xl">Ayudas y subvenciones</h1>
        <p className="mt-0.5 text-sm text-subtle">Lo que encaja contigo, y todo el catálogo para explorar.</p>
      </div>

      {/* Pestañas segmentadas */}
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl border border-line bg-white p-1 sm:inline-flex">
        <button onClick={() => setTab('parati')}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === 'parati' ? 'bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-sm' : 'text-subtle hover:text-ink'}`}>
          <Star className="h-4 w-4" /> Para ti
        </button>
        <button onClick={() => setTab('explorar')}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === 'explorar' ? 'bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-sm' : 'text-subtle hover:text-ink'}`}>
          <Compass className="h-4 w-4" /> Explorar todo
        </button>
      </div>

      {tab === 'parati' ? <ParaTi onOpen={markOpened} /> : <Explorar onOpen={markOpened} />}

      <p className="mt-8 text-xs text-subtle">
        Subvenciona no es una fuente oficial. La información es orientativa; verifica siempre en la fuente oficial (BDNS).
      </p>
    </AppShell>
  )
}

// ─── Pestaña "Para ti": tus alertas con filtros ──────────────────────────────

function ParaTi({ onOpen }: { onOpen: (id: string, url: string) => void }) {
  const [alerts, setAlerts] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // En "Para ti" no hay filtros: solo lo que encaja con tu perfil y está abierto,
  // ordenado por mejor encaje. Para filtrar/buscar está la pestaña "Explorar todo".
  useEffect(() => {
    let cancel = false
    setLoading(true)
    setError(null)
    api<Alerta[]>('/api/alerts?estado=abiertas&sort=score')
      .then(r => { if (!cancel) setAlerts(r) })
      .catch(e => { if (!cancel) setError((e as Error).message) })
      .finally(() => { if (!cancel) setLoading(false) })
    return () => { cancel = true }
  }, [])

  return (
    <>
      {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-danger">{error}</div>}
      {loading ? (
        <CardsSkeleton />
      ) : alerts.length === 0 ? (
        <Empty
          title="Aún no hay ayudas que encajen contigo."
          hint="Completa o ajusta tu perfil para mejorar los resultados, o pásate a «Explorar todo»."
        />
      ) : (
        <>
          <p className="mb-3 text-sm text-subtle">
            {alerts.length} {alerts.length === 1 ? 'ayuda abierta que encaja contigo' : 'ayudas abiertas que encajan contigo'}
          </p>
          <div className="space-y-3.5">{alerts.map(a => <AlertCard key={a.id} alerta={a} onOpen={onOpen} showFeedback />)}</div>
        </>
      )}
    </>
  )
}

// ─── Pestaña "Explorar": todo el catálogo con búsqueda ───────────────────────

interface BuscarResp {
  items: ConvScored[]
  total: number
  page: number
  totalPages: number
}

function Explorar({ onOpen }: { onOpen: (id: string, url: string) => void }) {
  const [items, setItems] = useState<ConvScored[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [texto, setTexto] = useState('')
  // Texto efectivo de búsqueda (solo cambia al pulsar Buscar, no al teclear).
  const [queryActiva, setQueryActiva] = useState('')
  // Filtros (mismos que tenía "Para ti").
  const [estado, setEstado] = useState<Estado>('abiertas')
  const [minScore, setMinScore] = useState(0)
  const [sort, setSort] = useState<Sort>('score')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  // Cualquier cambio de filtro vuelve a la primera página.
  useEffect(() => { setPage(0) }, [estado, minScore, sort, desde, hasta, queryActiva])

  useEffect(() => {
    let cancel = false
    setLoading(true)
    const params = new URLSearchParams({ estado, minScore: String(minScore), sort, page: String(page) })
    if (queryActiva) params.set('texto', queryActiva)
    if (desde) params.set('fechaFinDesde', desde)
    if (hasta) params.set('fechaFinHasta', hasta)
    api<BuscarResp>(`/api/alerts/buscar?${params.toString()}`)
      .then(r => {
        if (cancel) return
        setItems(r.items)
        setTotal(r.total)
        setTotalPages(r.totalPages)
      })
      .finally(() => !cancel && setLoading(false))
    return () => { cancel = true }
  }, [page, queryActiva, estado, minScore, sort, desde, hasta])

  function buscar() {
    setQueryActiva(texto.trim())
  }

  return (
    <>
      <form onSubmit={e => { e.preventDefault(); buscar() }} className="card mb-5 p-3.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={texto} onChange={e => setTexto(e.target.value)}
            placeholder="Buscar por título o tema (vivienda, empleo, cultura…)" className="input pl-9" />
        </div>

        {/* Estado segmentado */}
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
          {SEGMENTS.map(s => (
            <button key={s.value} type="button" onClick={() => setEstado(s.value)}
              className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${estado === s.value ? 'bg-white text-ink shadow-sm' : 'text-subtle'}`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Filtros */}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Group label="Puntuación">
            <select value={minScore} onChange={e => setMinScore(Number(e.target.value))} className="input py-2">
              <option value={0}>Todas</option><option value={40}>≥ 40</option><option value={50}>≥ 50</option><option value={60}>≥ 60</option>
            </select>
          </Group>
          <Group label="Ordenar">
            <select value={sort} onChange={e => setSort(e.target.value as Sort)} className="input py-2">
              <option value="score">Mejor encaje</option><option value="plazo">Plazo próximo</option><option value="reciente">Reciente</option>
            </select>
          </Group>
          <Group label="Cierra desde"><input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="input py-2" /></Group>
          <Group label="Cierra hasta"><input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="input py-2" /></Group>
        </div>

        <div className="mt-3 flex justify-end">
          <button className="btn-primary px-5">Buscar</button>
        </div>
      </form>

      {loading ? (
        <CardsSkeleton />
      ) : items.length === 0 ? (
        <Empty title="Sin resultados." hint="Prueba otro término, cambia el estado o baja la puntuación." />
      ) : (
        <>
          <p className="mb-3 text-sm text-subtle">{total} convocatorias · página {page + 1} de {totalPages}</p>
          <div className="space-y-3.5">
            {items.map(c => (
              <AlertCard
                key={c.id}
                alerta={{ id: c.id, score: c.score ?? 0, sentAt: null, openedAt: null, createdAt: '', reasons: c.reasons, convocatoria: c }}
                onOpen={onOpen}
              />
            ))}
          </div>
          <Paginador page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </>
  )
}

// Paginador numerado con ventana alrededor de la página actual.
function Paginador({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null
  const around = [page - 1, page, page + 1].filter(p => p >= 0 && p < totalPages)
  const nums = [...new Set([0, ...around, totalPages - 1])].sort((a, b) => a - b)
  const btn = 'min-w-9 rounded-lg border border-line px-3 py-2 text-sm transition'
  return (
    <nav className="mt-6 flex items-center justify-center gap-1">
      <button onClick={() => onChange(page - 1)} disabled={page === 0} className={`${btn} disabled:opacity-40`}>‹</button>
      {nums.map((p, i) => (
        <span key={p} className="flex items-center">
          {i > 0 && p - nums[i - 1] > 1 && <span className="px-1 text-subtle">…</span>}
          <button onClick={() => onChange(p)}
            className={`${btn} ${p === page ? 'border-transparent bg-gradient-to-b from-brand-500 to-brand-700 font-semibold text-white' : 'text-ink hover:border-brand-400'}`}>
            {p + 1}
          </button>
        </span>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1} className={`${btn} disabled:opacity-40`}>›</button>
    </nav>
  )
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-subtle">{label}</label>
      {children}
    </div>
  )
}

function Empty({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="card flex flex-col items-center p-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100"><Inbox className="h-6 w-6 text-subtle" /></div>
      <p className="font-medium text-ink">{title}</p>
      <p className="mt-1 text-sm text-subtle">{hint}</p>
    </div>
  )
}

function CardsSkeleton() {
  return (
    <div className="space-y-3.5">
      {[0, 1, 2].map(i => (
        <div key={i} className="card p-5">
          <div className="mb-3 flex justify-between">
            <div className="h-5 w-24 animate-pulse rounded-full bg-slate-100" />
            <div className="h-10 w-12 animate-pulse rounded-xl bg-slate-100" />
          </div>
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 h-16 animate-pulse rounded-xl bg-slate-50" />
        </div>
      ))}
    </div>
  )
}
