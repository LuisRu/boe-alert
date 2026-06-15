'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, getToken } from '@/lib/api'
import { TopNav } from '@/components/TopNav'
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
    <>
      <TopNav />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight">Ayudas y subvenciones</h1>
          <p className="mt-1 text-sm text-subtle">Lo que encaja contigo, y todo el catálogo para explorar.</p>
        </div>

        {/* Pestañas */}
        <div className="mb-6 inline-flex rounded-lg border border-line bg-white p-0.5">
          <button
            onClick={() => setTab('parati')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${tab === 'parati' ? 'bg-brand-700 text-white' : 'text-subtle hover:text-ink'}`}
          >
            ⭐ Para ti
          </button>
          <button
            onClick={() => setTab('explorar')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${tab === 'explorar' ? 'bg-brand-700 text-white' : 'text-subtle hover:text-ink'}`}
          >
            🔎 Explorar todo
          </button>
        </div>

        {tab === 'parati' ? <ParaTi onOpen={markOpened} /> : <Explorar onOpen={markOpened} />}

        <p className="mt-10 text-xs text-subtle">
          Subvenciona no es una fuente oficial. La información es orientativa; verifica siempre la vigencia y los
          requisitos en la fuente oficial enlazada (BDNS).
        </p>
      </main>
    </>
  )
}

// ─── Pestaña "Para ti": tus alertas con filtros ──────────────────────────────

function ParaTi({ onOpen }: { onOpen: (id: string, url: string) => void }) {
  const [alerts, setAlerts] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estado, setEstado] = useState<Estado>('abiertas')
  const [minScore, setMinScore] = useState(0)
  const [sort, setSort] = useState<Sort>('score')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [soloElegibles, setSoloElegibles] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const p = new URLSearchParams({ estado, minScore: String(minScore), sort })
    if (desde) p.set('fechaFinDesde', desde)
    if (hasta) p.set('fechaFinHasta', hasta)
    if (soloElegibles) p.set('ocultarNoElegibles', 'true')
    try {
      setAlerts(await api<Alerta[]>(`/api/alerts?${p.toString()}`))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [estado, minScore, sort, desde, hasta, soloElegibles])

  useEffect(() => { load() }, [load])

  return (
    <>
      <div className="mb-6 rounded-xl border border-line bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <Group label="Estado">
            <div className="inline-flex rounded-lg border border-line p-0.5">
              {SEGMENTS.map(s => (
                <button key={s.value} onClick={() => setEstado(s.value)}
                  className={`rounded-md px-3 py-1 text-sm font-medium transition ${estado === s.value ? 'bg-brand-700 text-white' : 'text-subtle hover:text-ink'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </Group>
          <Group label="Puntuación mínima">
            <select value={minScore} onChange={e => setMinScore(Number(e.target.value))} className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm">
              <option value={0}>Todas</option>
              <option value={40}>≥ 40 (medio)</option>
              <option value={50}>≥ 50 (bueno)</option>
              <option value={60}>≥ 60 (alto)</option>
            </select>
          </Group>
          <Group label="Ordenar por">
            <select value={sort} onChange={e => setSort(e.target.value as Sort)} className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm">
              <option value="score">Mejor encaje</option>
              <option value="plazo">Plazo más próximo</option>
              <option value="reciente">Más reciente</option>
            </select>
          </Group>
          <Group label="Cierra entre">
            <div className="flex items-center gap-2">
              <input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="rounded-lg border border-line px-2 py-1.5 text-sm" />
              <span className="text-subtle">–</span>
              <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="rounded-lg border border-line px-2 py-1.5 text-sm" />
            </div>
          </Group>
          <label className="flex items-center gap-2 pb-1.5 text-sm text-ink">
            <input type="checkbox" checked={soloElegibles} onChange={e => setSoloElegibles(e.target.checked)} />
            Ocultar las que no cumplo
          </label>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-danger">{error}</div>}
      {loading ? (
        <p className="text-subtle">Cargando…</p>
      ) : alerts.length === 0 ? (
        <Empty title="No hay alertas con estos filtros." hint="Amplía el estado o baja la puntuación mínima, o completa tu perfil." />
      ) : (
        <>
          <p className="mb-3 text-sm text-subtle">{alerts.length} convocatorias para tu perfil</p>
          <div className="space-y-4">{alerts.map(a => <AlertCard key={a.id} alerta={a} onOpen={onOpen} />)}</div>
        </>
      )}
    </>
  )
}

// ─── Pestaña "Explorar": todo el catálogo con búsqueda ───────────────────────

function Explorar({ onOpen }: { onOpen: (id: string, url: string) => void }) {
  const [items, setItems] = useState<ConvScored[]>([])
  const [loading, setLoading] = useState(true)
  const [texto, setTexto] = useState('')
  const [soloAbiertas, setSoloAbiertas] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ soloAbiertas: String(soloAbiertas) })
    if (texto) p.set('texto', texto)
    try {
      setItems(await api<ConvScored[]>(`/api/alerts/buscar?${p.toString()}`))
    } finally {
      setLoading(false)
    }
  }, [texto, soloAbiertas])

  useEffect(() => { load() }, [load])

  return (
    <>
      <form
        onSubmit={e => { e.preventDefault(); load() }}
        className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white p-4 shadow-sm"
      >
        <input
          value={texto} onChange={e => setTexto(e.target.value)}
          placeholder="Buscar por título o tema (vivienda, empleo, cultura…)"
          className="input flex-1"
        />
        <label className="flex items-center gap-2 text-sm text-subtle">
          <input type="checkbox" checked={soloAbiertas} onChange={e => setSoloAbiertas(e.target.checked)} /> Solo abiertas
        </label>
        <button className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">Buscar</button>
      </form>

      {loading ? (
        <p className="text-subtle">Cargando…</p>
      ) : items.length === 0 ? (
        <Empty title="Sin resultados." hint="Prueba otro término o desactiva 'solo abiertas'." />
      ) : (
        <>
          <p className="mb-3 text-sm text-subtle">{items.length} convocatorias (ordenadas por encaje con tu perfil)</p>
          <div className="space-y-4">
            {items.map(c => (
              <AlertCard
                key={c.id}
                alerta={{ id: c.id, score: c.score ?? 0, sentAt: null, openedAt: null, createdAt: '', reasons: c.reasons, convocatoria: c }}
                onOpen={onOpen}
              />
            ))}
          </div>
        </>
      )}
    </>
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
    <div className="rounded-xl border border-dashed border-line bg-white p-10 text-center">
      <p className="text-ink">{title}</p>
      <p className="mt-1 text-sm text-subtle">{hint}</p>
    </div>
  )
}
