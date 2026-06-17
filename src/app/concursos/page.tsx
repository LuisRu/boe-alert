'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Compass, Search, Inbox, Gavel, Building2 } from 'lucide-react'
import { api, getToken } from '@/lib/api'
import { AppShell } from '@/components/AppShell'
import { LicitacionCard } from '@/components/LicitacionCard'
import { CPV_DIVISIONES } from '@/lib/cpv'
import type { Licitacion, LicitacionFeed, LicitacionBuscar } from '@/lib/licitacion'

type Tab = 'parati' | 'explorar'
type Estado = 'abiertas' | 'adjudicadas' | 'todas'
type Sort = 'score' | 'plazo' | 'reciente'

const SEGMENTS: { value: Estado; label: string }[] = [
  { value: 'abiertas', label: 'Abiertos' },
  { value: 'adjudicadas', label: 'Adjudicados' },
  { value: 'todas', label: 'Todos' },
]

export default function ConcursosPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('parati')

  useEffect(() => {
    if (!getToken()) router.push('/login')
  }, [router])

  function abrir(_id: string, url: string) {
    window.open(url, '_blank', 'noopener')
  }

  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="text-[22px] font-bold tracking-tight sm:text-2xl">Concursos públicos</h1>
        <p className="mt-0.5 text-sm text-subtle">Contratos y licitaciones de la Administración que encajan con tu empresa.</p>
      </div>

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

      {tab === 'parati' ? <ParaTi onOpen={abrir} /> : <Explorar onOpen={abrir} />}

      <p className="mt-8 text-xs text-subtle">
        Fuente: TED (Diario Oficial de la UE). La información es orientativa; verifica siempre en el anuncio oficial.
      </p>
    </AppShell>
  )
}

// ─── Para ti ──────────────────────────────────────────────────────────────────

function ParaTi({ onOpen }: { onOpen: (id: string, url: string) => void }) {
  const [items, setItems] = useState<Licitacion[]>([])
  const [nacional, setNacional] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [planError, setPlanError] = useState(false)

  useEffect(() => {
    let cancel = false
    setLoading(true)
    setError(null)
    api<LicitacionFeed>('/api/licitaciones')
      .then(r => { if (!cancel) { setItems(r.items); setNacional(!!r.nacional) } })
      .catch(e => {
        if (cancel) return
        if ((e as Error).message.includes('plan')) setPlanError(true)
        else setError((e as Error).message)
      })
      .finally(() => { if (!cancel) setLoading(false) })
    return () => { cancel = true }
  }, [])

  if (planError) return <PlanGate />

  return (
    <>
      {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-danger">{error}</div>}
      {loading ? (
        <CardsSkeleton />
      ) : items.length === 0 ? (
        <Empty
          title="Aún no hay concursos que encajen contigo."
          hint="Indica tus sectores (CPV) y rango de presupuesto en tu perfil para afinar los resultados."
        />
      ) : (
        <>
          <p className="mb-3 text-sm text-subtle">
            {items.length} {items.length === 1 ? 'concurso abierto que encaja contigo' : 'concursos abiertos que encajan contigo'}
            {!nacional && ' · en tu comunidad y de ámbito estatal'}
          </p>
          <div className="space-y-3.5">{items.map(l => <LicitacionCard key={l.id} lic={l} onOpen={onOpen} showStatus={false} />)}</div>
        </>
      )}
    </>
  )
}

// ─── Explorar ─────────────────────────────────────────────────────────────────

function Explorar({ onOpen }: { onOpen: (id: string, url: string) => void }) {
  const [items, setItems] = useState<Licitacion[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [planError, setPlanError] = useState(false)
  const [texto, setTexto] = useState('')
  const [queryActiva, setQueryActiva] = useState('')
  const [cpv, setCpv] = useState('')
  const [estado, setEstado] = useState<Estado>('abiertas')
  const [sort, setSort] = useState<Sort>('score')
  const [organismo, setOrganismo] = useState('')
  const [organismoActivo, setOrganismoActivo] = useState('')

  useEffect(() => { setPage(0) }, [estado, sort, cpv, queryActiva, organismoActivo])

  useEffect(() => {
    let cancel = false
    setLoading(true)
    const params = new URLSearchParams({ estado, sort, page: String(page) })
    if (queryActiva) params.set('texto', queryActiva)
    if (cpv) params.set('cpv', cpv)
    if (organismoActivo) params.set('organismo', organismoActivo)
    api<LicitacionBuscar>(`/api/licitaciones/buscar?${params.toString()}`)
      .then(r => {
        if (cancel) return
        setItems(r.items); setTotal(r.total); setTotalPages(r.totalPages)
      })
      .catch(e => { if (!cancel && (e as Error).message.includes('plan')) setPlanError(true) })
      .finally(() => !cancel && setLoading(false))
    return () => { cancel = true }
  }, [page, queryActiva, cpv, estado, sort, organismoActivo])

  if (planError) return <PlanGate />

  return (
    <>
      <form onSubmit={e => { e.preventDefault(); setQueryActiva(texto.trim()); setOrganismoActivo(organismo.trim()) }} className="card mb-5 p-3.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={texto} onChange={e => setTexto(e.target.value)}
            placeholder="Buscar por objeto o nº de expediente" className="input pl-9" />
        </div>

        <div className="mt-3 relative">
          <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={organismo} onChange={e => setOrganismo(e.target.value)}
            placeholder="Filtrar por ministerio / organismo (p.ej. Sanidad, Ayuntamiento de…)" className="input pl-9" />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
          {SEGMENTS.map(s => (
            <button key={s.value} type="button" onClick={() => setEstado(s.value)}
              className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${estado === s.value ? 'bg-white text-ink shadow-sm' : 'text-subtle'}`}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Group label="Sector (CPV)">
            <select value={cpv} onChange={e => setCpv(e.target.value)} className="input py-2">
              <option value="">Todos</option>
              {CPV_DIVISIONES.map(d => <option key={d.code} value={d.code}>{d.label}</option>)}
            </select>
          </Group>
          <Group label="Ordenar">
            <select value={sort} onChange={e => setSort(e.target.value as Sort)} className="input py-2">
              <option value="score">Mejor encaje</option><option value="plazo">Plazo próximo</option><option value="reciente">Reciente</option>
            </select>
          </Group>
        </div>

        <div className="mt-3 flex justify-end">
          <button className="btn-primary px-5">Buscar</button>
        </div>
      </form>

      {loading ? (
        <CardsSkeleton />
      ) : items.length === 0 ? (
        <Empty title="Sin resultados." hint="Prueba otro término o cambia el sector." />
      ) : (
        <>
          <p className="mb-3 text-sm text-subtle">{total} concursos · página {page + 1} de {totalPages}</p>
          <div className="space-y-3.5">{items.map(l => <LicitacionCard key={l.id} lic={l} onOpen={onOpen} />)}</div>
          <Paginador page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </>
  )
}

// ─── UI auxiliar ──────────────────────────────────────────────────────────────

function PlanGate() {
  return (
    <div className="card flex flex-col items-center p-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50"><Gavel className="h-6 w-6 text-indigo-600" /></div>
      <p className="font-medium text-ink">Los concursos públicos están en el plan Business</p>
      <p className="mt-1 max-w-sm text-sm text-subtle">Accede a los contratos de la Administración filtrados por tu sector y territorio. Mejora tu plan para activarlo.</p>
      <a href="/perfil" className="btn-primary mt-4 px-5">Ver planes</a>
    </div>
  )
}

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
            <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
          </div>
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 h-16 animate-pulse rounded-xl bg-slate-50" />
        </div>
      ))}
    </div>
  )
}
