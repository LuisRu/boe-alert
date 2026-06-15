'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, getToken } from '@/lib/api'
import { TopNav } from '@/components/TopNav'

interface Reporte {
  id: string
  createdAt: string
  motivo: string
  score: number | null
  codigoBdns: string | null
  perfil: Record<string, unknown> | null
  convocatoria: {
    titulo: string
    codigoBdns: string | null
    organoNivel2: string | null
    organoNivel3: string | null
    finalidad: string | null
    urlOficial: string
  } | null
  usuario: { email: string }
}

// Etiquetas legibles para las características del perfil guardadas en el snapshot.
const LABELS: Record<string, string> = {
  userType: 'Tipo',
  regionNuts: 'Provincia (NUTS)',
  municipio: 'Municipio',
  cnae: 'CNAE',
  edad: 'Edad',
  genero: 'Género',
  situacionLaboral: 'Situación laboral',
  familiaNumerosa: 'Familia numerosa',
  monoparental: 'Monoparental',
  discapacidad: 'Discapacidad',
  vulnerabilidadEconomica: 'Vulnerabilidad económica',
  vulnerabilidadEnergetica: 'Vulnerabilidad energética',
  perceptorPrestaciones: 'Percibe prestaciones',
  tenenciaVivienda: 'Vivienda',
  intereses: 'Intereses',
  sectoresActividad: 'Sectores',
  keywords: 'Palabras clave',
}

function humanize(v: unknown): string {
  if (v === true) return 'Sí'
  if (v === false) return 'No'
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—'
  if (v == null || v === '') return '—'
  return String(v)
}

export default function ReportesPage() {
  const router = useRouter()
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!getToken()) { router.push('/login'); return }
    api<Reporte[]>('/api/alerts/reportes')
      .then(setReportes)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [router])

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Reportes de testers</h1>
        <p className="mt-1 text-sm text-subtle">
          Ayudas que un tester marcó como «no encaja con mi perfil». Sirve para afinar el matching.
        </p>

        {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-danger">{error}</div>}
        {loading ? (
          <p className="mt-6 text-subtle">Cargando…</p>
        ) : reportes.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-line bg-white p-10 text-center">
            <p className="text-ink">Todavía no hay reportes.</p>
            <p className="mt-1 text-sm text-subtle">Cuando un tester pulse «⚠️ Esto no encaja conmigo», aparecerá aquí.</p>
          </div>
        ) : (
          <>
            <p className="mb-3 mt-6 text-sm text-subtle">{reportes.length} reportes</p>
            <div className="space-y-4">
              {reportes.map(r => (
                <article key={r.id} className="rounded-xl border border-line bg-white p-5 shadow-sm">
                  {/* Cabecera: fecha + puntuación que tenía */}
                  <div className="mb-3 flex items-center justify-between text-xs text-subtle">
                    <span>{new Date(r.createdAt).toLocaleString('es-ES')}</span>
                    {r.score != null && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-ink">
                        encajaba {r.score}/100
                      </span>
                    )}
                  </div>

                  {/* Motivo del tester (lo más importante) */}
                  <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-plazo">Por qué el tester dice que no encaja</p>
                    <p className="mt-1 text-sm text-ink">“{r.motivo}”</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* La subvención */}
                    <div className="rounded-lg border border-line bg-canvas p-3">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-subtle">Subvención</p>
                      <p className="text-sm font-medium text-ink">{r.convocatoria?.titulo ?? '(no disponible)'}</p>
                      {(r.convocatoria?.organoNivel3 || r.convocatoria?.organoNivel2) && (
                        <p className="mt-1 text-xs text-subtle">{r.convocatoria?.organoNivel3 ?? r.convocatoria?.organoNivel2}</p>
                      )}
                      {r.convocatoria?.finalidad && (
                        <p className="mt-1 text-xs text-subtle">Tema: {r.convocatoria.finalidad}</p>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        {r.convocatoria?.urlOficial && (
                          <a href={r.convocatoria.urlOficial} target="_blank" rel="noopener" className="text-brand-700 hover:underline">Ver oficial →</a>
                        )}
                        <span className="text-subtle">BDNS {r.codigoBdns ?? r.convocatoria?.codigoBdns ?? '—'}</span>
                      </div>
                    </div>

                    {/* El usuario / su perfil en ese momento */}
                    <div className="rounded-lg border border-line bg-canvas p-3">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-subtle">Usuario y su perfil</p>
                      <p className="text-sm font-medium text-ink">{r.usuario.email}</p>
                      <dl className="mt-2 space-y-0.5">
                        {r.perfil &&
                          Object.entries(LABELS)
                            .filter(([k]) => r.perfil![k] !== undefined && humanize(r.perfil![k]) !== '—')
                            .map(([k, label]) => (
                              <div key={k} className="flex justify-between gap-2 text-xs">
                                <dt className="text-subtle">{label}</dt>
                                <dd className="text-right font-medium text-ink">{humanize(r.perfil![k])}</dd>
                              </div>
                            ))}
                      </dl>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  )
}
