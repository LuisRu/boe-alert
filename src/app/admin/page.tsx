'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText, Gavel, Users, Coins, ShieldAlert, Sparkles, Trophy, Building2, Clock, Wand2, Eye, Check,
} from 'lucide-react'
import { api, getToken } from '@/lib/api'
import { AppShell } from '@/components/AppShell'
import { formatImporte, formatFecha, tipoAdminLabel } from '@/lib/format'

interface Stats {
  subvenciones: {
    total: number; abiertas: number; cerradas: number; conIA: number; sinIA: number
    fondosEuropeos: number; importeAbiertas: number
    porTipo: { tipo: string; n: number }[]
    desde: string | null; hasta: string | null; ultimaIngesta: string | null
  }
  licitaciones: {
    total: number; ted: number; placsp: number; abiertas: number; adjudicadas: number
    conIA: number; sinIA: number; presupuestoAbiertas: number
    topOrganismos: { nombre: string; n: number }[]
    topCpv: { familia: string; n: number }[]
    desde: string | null; hasta: string | null; ultimaIngesta: string | null
  }
  usuarios: { total: number; verificados: number; porTipo: { tipo: string; n: number }[]; alertas: number; feedback: number }
}

const CPV_FAM: Record<string, string> = {
  '45': 'Obras', '72': 'Informática', '79': 'Consultoría', '90': 'Limpieza/residuos', '33': 'Sanitario',
  '50': 'Mantenimiento', '71': 'Ingeniería', '85': 'Sanidad/social', '80': 'Formación', '92': 'Cultura',
  '34': 'Vehículos', '48': 'Software', '55': 'Hostelería', '60': 'Transporte', '15': 'Alimentación',
  '09': 'Energía', '30': 'Informática (HW)', '31': 'Eléctrico', '39': 'Mobiliario', '44': 'Construcción',
}

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    if (!getToken()) { router.push('/login'); return }
    api<Stats>('/api/admin/stats')
      .then(setStats)
      .catch(e => {
        if ((e as Error).message.toLowerCase().includes('administrador')) setForbidden(true)
        else setError((e as Error).message)
      })
  }, [router])

  if (forbidden) {
    return (
      <AppShell>
        <div className="card flex flex-col items-center p-10 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50"><ShieldAlert className="h-6 w-6 text-danger" /></div>
          <p className="font-medium text-ink">Acceso solo para administradores</p>
          <p className="mt-1 text-sm text-subtle">Tu cuenta no tiene permisos para ver este panel.</p>
        </div>
      </AppShell>
    )
  }

  if (error) return <AppShell><div className="rounded-xl bg-red-50 p-3 text-sm text-danger">{error}</div></AppShell>
  if (!stats) return <AppShell><p className="text-subtle">Cargando métricas…</p></AppShell>

  const s = stats.subvenciones
  const l = stats.licitaciones
  const u = stats.usuarios

  return (
    <AppShell>
      <div className="mb-5">
        <h1 className="text-[22px] font-bold tracking-tight sm:text-2xl">Panel de administración</h1>
        <p className="mt-0.5 text-sm text-subtle">Estado de los datos y del pipeline en producción.</p>
      </div>

      {/* KPIs principales */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={<FileText className="h-5 w-5" />} label="Subvenciones abiertas" value={s.abiertas.toLocaleString('es-ES')} sub={`${s.total.toLocaleString('es-ES')} en total`} />
        <Kpi icon={<Gavel className="h-5 w-5" />} label="Licitaciones abiertas" value={l.abiertas.toLocaleString('es-ES')} sub={`${l.total.toLocaleString('es-ES')} en total`} />
        <Kpi icon={<Coins className="h-5 w-5" />} label="Dinero en juego (abiertas)" value={formatImporte(s.importeAbiertas + l.presupuestoAbiertas)} sub="subvenciones + licitaciones" />
        <Kpi icon={<Users className="h-5 w-5" />} label="Usuarios" value={u.total.toLocaleString('es-ES')} sub={`${u.alertas} alertas generadas`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Subvenciones */}
        <Panel title="Subvenciones (BDNS)" icon={<FileText className="h-4 w-4" />}>
          <Barra label="Abiertas" n={s.abiertas} total={s.total} color="bg-brand-600" />
          <Barra label="Cerradas / pasadas" n={s.cerradas} total={s.total} color="bg-slate-400" />
          <Divider />
          <Linea label="Resumidas con IA" value={`${s.conIA}/${s.abiertas}`} tone={s.sinIA > 0 ? 'warn' : 'ok'} icon={<Sparkles className="h-3.5 w-3.5" />} />
          <Linea label="Con fondos europeos (MRR)" value={s.fondosEuropeos.toLocaleString('es-ES')} />
          <Linea label="Importe total abiertas" value={formatImporte(s.importeAbiertas)} />
          <div className="mt-3">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle">Por administración</p>
            {s.porTipo.map(t => <Barra key={t.tipo} label={tipoAdminLabel(t.tipo)} n={t.n} total={s.total} color="bg-brand-400" small />)}
          </div>
          <Fechas desde={s.desde} hasta={s.hasta} ultima={s.ultimaIngesta} />
        </Panel>

        {/* Licitaciones */}
        <Panel title="Licitaciones (concursos)" icon={<Gavel className="h-4 w-4" />}>
          <Barra label="TED (UE)" n={l.ted} total={l.total} color="bg-indigo-500" />
          <Barra label="PLACSP (toda España)" n={l.placsp} total={l.total} color="bg-indigo-700" />
          <Divider />
          <Linea label="Abiertas" value={l.abiertas.toLocaleString('es-ES')} tone="ok" />
          <Linea label="Adjudicadas" value={l.adjudicadas.toLocaleString('es-ES')} icon={<Trophy className="h-3.5 w-3.5" />} />
          <Linea label="Resumidas con IA" value={`${l.conIA}/${l.abiertas}`} tone={l.sinIA > 0 ? 'warn' : 'ok'} icon={<Sparkles className="h-3.5 w-3.5" />} />
          <Linea label="Presupuesto total abiertas" value={formatImporte(l.presupuestoAbiertas)} />
          {l.topCpv.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle">Top sectores (CPV) abiertos</p>
              {l.topCpv.slice(0, 6).map(c => <Barra key={c.familia} label={CPV_FAM[c.familia] ?? `CPV ${c.familia}`} n={c.n} total={l.topCpv[0].n} color="bg-indigo-400" small />)}
            </div>
          )}
          <Fechas desde={l.desde} hasta={l.hasta} ultima={l.ultimaIngesta} />
        </Panel>

        {/* Top organismos */}
        <Panel title="Top organismos (licitaciones)" icon={<Building2 className="h-4 w-4" />}>
          <ol className="space-y-1.5">
            {l.topOrganismos.map((o, i) => (
              <li key={o.nombre} className="flex items-center gap-2 text-[13px]">
                <span className="w-5 text-right font-mono text-xs text-slate-400">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-ink">{o.nombre}</span>
                <span className="font-semibold text-subtle">{o.n}</span>
              </li>
            ))}
          </ol>
        </Panel>

        {/* Usuarios */}
        <Panel title="Usuarios y actividad" icon={<Users className="h-4 w-4" />}>
          <Linea label="Usuarios totales" value={u.total.toLocaleString('es-ES')} />
          <Linea label="Email verificado" value={`${u.verificados}/${u.total}`} />
          <Linea label="Alertas generadas" value={u.alertas.toLocaleString('es-ES')} />
          <Linea label="Reportes de testers" value={u.feedback.toLocaleString('es-ES')} />
          <div className="mt-3">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle">Perfiles por tipo</p>
            {u.porTipo.length === 0 ? <p className="text-[13px] text-subtle">Sin perfiles aún</p> :
              u.porTipo.map(t => <Barra key={t.tipo} label={t.tipo} n={t.n} total={u.total || 1} color="bg-emerald-500" small />)}
          </div>
        </Panel>
      </div>

      {/* Estilo de los resúmenes IA */}
      <section className="mt-6">
        <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-ink"><Wand2 className="h-4 w-4" /> Estilo de los resúmenes IA</h2>
        <p className="mb-3 text-xs text-subtle">Ajusta el tono y la redacción de los resúmenes (longitud, qué destacar, lenguaje). El formato interno que usa el matching no se toca. Previsualiza antes de guardar.</p>
        <div className="grid gap-5 lg:grid-cols-2">
          <StyleEditor source="bdns" titulo="Subvenciones (BDNS)" />
          <StyleEditor source="ted" titulo="Licitaciones (TED / PLACSP)" />
        </div>
      </section>
    </AppShell>
  )
}

// ─── Editor de estilo con previsualización ────────────────────────────────────

interface PreviewItem {
  titulo: string
  actual: { headline: string | null; paraQuien: string | null; queConsigues: string | null; siguientePaso: string | null }
  nuevo: { headline: string | null; paraQuien: string | null; queConsigues: string | null; siguientePaso: string | null }
}

function StyleEditor({ source, titulo }: { source: 'bdns' | 'ted'; titulo: string }) {
  const [estilo, setEstilo] = useState('')
  const [cargado, setCargado] = useState(false)
  const [preview, setPreview] = useState<PreviewItem[] | null>(null)
  const [estado, setEstado] = useState<'idle' | 'previewing' | 'saving' | 'saved' | 'error'>('idle')
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    api<{ bdns: string; ted: string }>('/api/admin/estilo')
      .then(d => { setEstilo(d[source]); setCargado(true) })
      .catch(() => setCargado(true))
  }, [source])

  async function previsualizar() {
    setEstado('previewing'); setMsg(null); setPreview(null)
    try {
      const r = await api<PreviewItem[]>('/api/admin/estilo/preview', { method: 'POST', body: JSON.stringify({ source, estilo }) })
      setPreview(r); setEstado('idle')
    } catch (e) { setEstado('error'); setMsg((e as Error).message) }
  }
  async function guardar() {
    setEstado('saving'); setMsg(null)
    try {
      await api('/api/admin/estilo', { method: 'PUT', body: JSON.stringify({ [source]: estilo }) })
      setEstado('saved'); setTimeout(() => setEstado('idle'), 2500)
    } catch (e) { setEstado('error'); setMsg((e as Error).message) }
  }

  return (
    <div className="card p-5">
      <h3 className="mb-2 text-sm font-semibold text-ink">{titulo}</h3>
      <textarea
        value={estilo}
        onChange={e => setEstilo(e.target.value)}
        rows={4}
        disabled={!cargado}
        placeholder="Ej.: Tono cercano y motivador. Frases muy cortas. Destaca SIEMPRE el importe y el plazo. Evita tecnicismos."
        className="input text-[13px]"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button onClick={previsualizar} disabled={estado === 'previewing'} className="btn-outline px-3 py-1.5 text-[13px]">
          <Eye className="h-3.5 w-3.5" /> {estado === 'previewing' ? 'Generando…' : 'Previsualizar'}
        </button>
        <button onClick={guardar} disabled={estado === 'saving'} className="btn-primary px-3 py-1.5 text-[13px]">
          {estado === 'saved' ? <><Check className="h-3.5 w-3.5" /> Guardado</> : <><Sparkles className="h-3.5 w-3.5" /> Guardar estilo</>}
        </button>
        {estado === 'error' && <span className="text-[12px] text-danger">{msg}</span>}
      </div>

      {preview && (
        <div className="mt-4 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-subtle">Antes vs después ({preview.length} ejemplos)</p>
          {preview.map((p, i) => (
            <div key={i} className="rounded-xl border border-line p-3">
              <p className="mb-2 line-clamp-1 text-[11px] text-slate-400">{p.titulo}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-2">
                  <p className="mb-1 text-[10px] font-semibold uppercase text-subtle">Actual</p>
                  <p className="text-[13px] font-medium text-ink">{p.actual.headline ?? '—'}</p>
                  <p className="mt-1 text-[12px] text-subtle">{p.actual.paraQuien}</p>
                </div>
                <div className="rounded-lg bg-brand-50 p-2">
                  <p className="mb-1 text-[10px] font-semibold uppercase text-brand-700">Con tu estilo</p>
                  <p className="text-[13px] font-medium text-ink">{p.nuevo.headline ?? '—'}</p>
                  <p className="mt-1 text-[12px] text-subtle">{p.nuevo.paraQuien}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Componentes ──────────────────────────────────────────────────────────────

function Kpi({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="card p-4">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">{icon}</div>
      <p className="text-[22px] font-bold leading-tight text-ink">{value}</p>
      <p className="text-[13px] font-medium text-ink">{label}</p>
      <p className="text-xs text-subtle">{sub}</p>
    </div>
  )
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">{icon} {title}</h2>
      {children}
    </section>
  )
}

function Barra({ label, n, total, color, small }: { label: string; n: number; total: number; color: string; small?: boolean }) {
  const pct = total > 0 ? Math.round((n / total) * 100) : 0
  return (
    <div className={small ? 'mb-1.5' : 'mb-2'}>
      <div className="mb-0.5 flex items-center justify-between text-[13px]">
        <span className="truncate text-ink">{label}</span>
        <span className="ml-2 shrink-0 font-semibold text-subtle">{n.toLocaleString('es-ES')} · {pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function Linea({ label, value, tone, icon }: { label: string; value: string; tone?: 'ok' | 'warn'; icon?: React.ReactNode }) {
  const c = tone === 'ok' ? 'text-ok' : tone === 'warn' ? 'text-plazo' : 'text-ink'
  return (
    <div className="flex items-center justify-between border-b border-line/60 py-1.5 text-[13px] last:border-0">
      <span className="flex items-center gap-1.5 text-subtle">{icon}{label}</span>
      <span className={`font-semibold ${c}`}>{value}</span>
    </div>
  )
}

function Divider() { return <div className="my-2 border-t border-line" /> }

function Fechas({ desde, hasta, ultima }: { desde: string | null; hasta: string | null; ultima: string | null }) {
  return (
    <p className="mt-3 flex items-center gap-1.5 text-[11px] text-subtle">
      <Clock className="h-3 w-3" /> Datos {formatFecha(desde)} – {formatFecha(hasta)} · última ingesta {formatFecha(ultima)}
    </p>
  )
}
