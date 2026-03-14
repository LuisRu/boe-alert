'use client'

import { useState } from 'react'
import type { BoeItem, Categoria } from './api/boe-demo/route'
import type { BoeDocDetail } from './api/boe-demo/[id]/route'

const CATEGORIA_LABELS: Record<string, string> = {
  AYUDA: 'Ayuda',
  LICITACION: 'Licitación',
  NORMATIVA: 'Normativa',
  EMPLEO: 'Empleo público',
}

const CATEGORIA_STYLES: Record<string, string> = {
  AYUDA:      'bg-green-900/40 text-green-400',
  LICITACION: 'bg-amber-900/40 text-amber-400',
  NORMATIVA:  'bg-blue-900/40 text-blue-400',
  EMPLEO:     'bg-purple-900/40 text-purple-400',
}

const SECCION_COLORS: Record<string, string> = {
  'I. Disposiciones generales': 'text-blue-400 border-blue-800',
  'II. Autoridades y personal': 'text-purple-400 border-purple-800',
  'III. Otras disposiciones': 'text-teal-400 border-teal-800',
  'IV. Administración de Justicia': 'text-red-400 border-red-800',
  'V. Anuncios': 'text-amber-400 border-amber-800',
}

function seccionColor(seccion: string): string {
  for (const [key, val] of Object.entries(SECCION_COLORS)) {
    if (seccion.startsWith(key.slice(0, 4))) return val
  }
  return 'text-gray-400 border-gray-700'
}

function groupBySeccion(items: BoeItem[]): Map<string, BoeItem[]> {
  const map = new Map<string, BoeItem[]>()
  for (const item of items) {
    const list = map.get(item.seccion) ?? []
    list.push(item)
    map.set(item.seccion, list)
  }
  return map
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

type Status = 'idle' | 'loading' | 'done' | 'error'
type DetailStatus = 'idle' | 'loading' | 'done' | 'error'

export default function LandingPage() {
  const today = todayISO()

  const [status, setStatus] = useState<Status>('idle')
  const [items, setItems] = useState<BoeItem[]>([])
  const [stats, setStats] = useState<{ diasConsultados: number; diasConBOE: number; totalBruto: number; relevantes: number; porCategoria: Record<Categoria, number> } | null>(null)
  const [rangoDesde, setRangoDesde] = useState('')
  const [rangoHasta, setRangoHasta] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [logLines, setLogLines] = useState<string[]>([])
  const [filtroCategoria, setFiltroCategoria] = useState<Categoria | 'TODAS'>('TODAS')

  const [dateFrom, setDateFrom] = useState(today)
  const [dateTo, setDateTo] = useState(today)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<BoeDocDetail | null>(null)
  const [detailStatus, setDetailStatus] = useState<DetailStatus>('idle')
  const [detailError, setDetailError] = useState('')

  async function runPipeline() {
    setStatus('loading')
    setItems([])
    setStats(null)
    setErrorMsg('')
    setFiltroCategoria('TODAS')
    closeDetail()

    const dias = workingDayCount(dateFrom, dateTo)
    setLogLines([
      `> Rango: ${dateFrom} → ${dateTo} (${dias} día${dias !== 1 ? 's' : ''} laborable${dias !== 1 ? 's' : ''})`,
      '> Conectando con boe.es/datosabiertos...',
    ])

    try {
      const res = await fetch(`/api/boe-demo?from=${dateFrom}&to=${dateTo}`)
      const data = await res.json()

      if (!data.success) {
        setErrorMsg(data.error)
        setStatus('error')
        return
      }

      setLogLines(l => [
        ...l,
        `✓ ${data.stats.diasConBOE} días con publicación encontrados`,
        `✓ ${data.stats.totalBruto} documentos totales en el BOE`,
        `✓ ${data.stats.relevantes} documentos relevantes tras aplicar filtros`,
      ])

      setItems(data.items)
      setStats(data.stats)
      setRangoDesde(data.rangoDesde)
      setRangoHasta(data.rangoHasta)
      setStatus('done')
    } catch {
      setErrorMsg('Error de red. Comprueba tu conexión.')
      setStatus('error')
    }
  }

  async function openDetail(id: string) {
    if (selectedId === id) {
      closeDetail()
      return
    }
    setSelectedId(id)
    setDetail(null)
    setDetailStatus('loading')
    setDetailError('')
    try {
      const res = await fetch(`/api/boe-demo/${id}`)
      const data = await res.json()
      if (!data.success) {
        setDetailError(data.error)
        setDetailStatus('error')
        return
      }
      setDetail(data.detail)
      setDetailStatus('done')
    } catch {
      setDetailError('Error de red al cargar el documento.')
      setDetailStatus('error')
    }
  }

  function closeDetail() {
    setSelectedId(null)
    setDetail(null)
    setDetailStatus('idle')
    setDetailError('')
  }

  const itemsVisibles = filtroCategoria === 'TODAS' ? items : items.filter(i => i.categoria === filtroCategoria)
  const grouped = groupBySeccion(itemsVisibles)
  const panelOpen = selectedId !== null

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-white">BOE Alert</h1>
          <p className="mt-3 text-gray-400 text-lg">
            El BOE diario, filtrado para lo que importa a tu negocio.
          </p>
        </div>

        {/* Layout: lista + panel lateral */}
        <div className="flex gap-6 items-start">

          {/* Columna principal */}
          <div className={`min-w-0 transition-all duration-300 ${panelOpen ? 'w-[45%] shrink-0' : 'w-full'}`}>
            <div className="rounded-xl border border-gray-800 overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4 px-5 py-3 bg-gray-900 border-b border-gray-800 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-700" />
                  <div className="w-3 h-3 rounded-full bg-gray-700" />
                  <div className="w-3 h-3 rounded-full bg-gray-700" />
                  <span className="ml-3 text-gray-400 text-sm font-mono">pipeline · boe-ingestion</span>
                </div>

                {/* Selector de fechas + botón */}
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="text-xs text-gray-500">Desde</label>
                  <input
                    type="date"
                    value={dateFrom}
                    max={today}
                    onChange={e => {
                      setDateFrom(e.target.value)
                      if (e.target.value > dateTo) setDateTo(e.target.value)
                    }}
                    disabled={status === 'loading'}
                    className="text-xs text-gray-300 bg-gray-950 border border-gray-700 rounded px-2 py-1 disabled:opacity-40"
                  />
                  <label className="text-xs text-gray-500">Hasta</label>
                  <input
                    type="date"
                    value={dateTo}
                    min={dateFrom}
                    max={today}
                    onChange={e => setDateTo(e.target.value)}
                    disabled={status === 'loading'}
                    className="text-xs text-gray-300 bg-gray-950 border border-gray-700 rounded px-2 py-1 disabled:opacity-40"
                  />
                  <button
                    onClick={runPipeline}
                    disabled={status === 'loading'}
                    className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
                  >
                    {status === 'loading' ? (
                      <>
                        <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Ejecutando...
                      </>
                    ) : (
                      <>▶ Ejecutar ingesta</>
                    )}
                  </button>
                </div>
              </div>

              {/* Log */}
              <div className="bg-gray-950 px-5 py-4 font-mono text-sm min-h-[80px] border-b border-gray-800">
                {status === 'idle' ? (
                  <p className="text-gray-600">
                    $ Selecciona un rango de fechas y pulsa &quot;Ejecutar ingesta&quot;
                    <span className="animate-pulse">_</span>
                  </p>
                ) : (
                  <div className="space-y-0.5">
                    {logLines.map((line, i) => (
                      <p
                        key={i}
                        className={
                          line.startsWith('✓')
                            ? 'text-green-400'
                            : line.startsWith('>')
                              ? 'text-gray-400'
                              : 'text-gray-500'
                        }
                      >
                        {line}
                      </p>
                    ))}
                    {status === 'error' && (
                      <p className="text-red-400">✗ Error: {errorMsg}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Filtros de categoría */}
              {status === 'done' && items.length > 0 && (
                <div className="px-5 py-3 bg-gray-900 border-b border-gray-800 flex flex-wrap gap-2 items-center">
                  {([ 'TODAS', 'AYUDA', 'LICITACION', 'NORMATIVA', 'EMPLEO'] as const).map(cat => {
                    const count = cat === 'TODAS' ? items.length : (stats?.porCategoria[cat] ?? 0)
                    const labels: Record<string, string> = {
                      TODAS: 'Todas', AYUDA: 'Ayudas', LICITACION: 'Licitaciones', NORMATIVA: 'Normativa', EMPLEO: 'Empleo público',
                    }
                    const colors: Record<string, string> = {
                      TODAS:      filtroCategoria === 'TODAS'      ? 'bg-gray-700 text-white border-gray-500'       : 'text-gray-400 border-gray-700 hover:border-gray-500',
                      AYUDA:      filtroCategoria === 'AYUDA'      ? 'bg-green-900/60 text-green-300 border-green-700' : 'text-green-600 border-green-900 hover:border-green-700',
                      LICITACION: filtroCategoria === 'LICITACION' ? 'bg-amber-900/60 text-amber-300 border-amber-700'  : 'text-amber-600 border-amber-900 hover:border-amber-700',
                      NORMATIVA:  filtroCategoria === 'NORMATIVA'  ? 'bg-blue-900/60 text-blue-300 border-blue-700'    : 'text-blue-600 border-blue-900 hover:border-blue-700',
                      EMPLEO:     filtroCategoria === 'EMPLEO'     ? 'bg-purple-900/60 text-purple-300 border-purple-700' : 'text-purple-600 border-purple-900 hover:border-purple-700',
                    }
                    return (
                      <button
                        key={cat}
                        onClick={() => { setFiltroCategoria(cat); closeDetail() }}
                        className={`text-xs border rounded px-3 py-1 transition-colors ${colors[cat]}`}
                      >
                        {labels[cat]} <span className="opacity-60">({count})</span>
                      </button>
                    )
                  })}
                  {stats && (
                    <span className="text-xs text-gray-600 ml-auto">
                      {stats.relevantes}/{stats.totalBruto} relevantes
                    </span>
                  )}
                </div>
              )}

              {/* Resultados */}
              {status === 'done' && itemsVisibles.length > 0 && (
                <div className="divide-y divide-gray-800 max-h-[640px] overflow-y-auto">
                  {/* Resumen por sección */}
                  <div className="px-5 py-3 bg-gray-900/60 flex flex-wrap gap-x-5 gap-y-1 items-center">
                    <span className="text-xs text-gray-500 mr-2">
                      {rangoDesde === rangoHasta ? rangoDesde : `${rangoDesde} – ${rangoHasta}`}
                    </span>
                    {Array.from(grouped.entries()).map(([sec, docs]) => (
                      <span
                        key={sec}
                        className={`text-xs font-mono border rounded px-2 py-0.5 ${seccionColor(sec)}`}
                      >
                        {sec} ({docs.length})
                      </span>
                    ))}
                  </div>

                  {/* Documentos agrupados */}
                  {Array.from(grouped.entries()).map(([sec, docs]) => (
                    <div key={sec}>
                      <div className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider ${seccionColor(sec).split(' ')[0]} bg-gray-900/40`}>
                        {sec}
                      </div>
                      {docs.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => openDetail(item.id)}
                          className={`w-full text-left px-5 py-3 transition-colors group border-l-2 ${
                            selectedId === item.id
                              ? 'bg-blue-950/40 border-blue-500'
                              : 'hover:bg-gray-900/40 border-transparent'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <span className="text-xs font-mono text-blue-400">{item.id}</span>
                              <span className="mx-2 text-gray-700">·</span>
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${CATEGORIA_STYLES[item.categoria]}`}>
                                {CATEGORIA_LABELS[item.categoria]}
                              </span>
                              <span className="mx-2 text-gray-700">·</span>
                              <span className="text-xs text-gray-500">{item.departamento}</span>
                              {item.epigrafe && (
                                <>
                                  <span className="mx-2 text-gray-700">·</span>
                                  <span className="text-xs text-gray-600 italic">{item.epigrafe}</span>
                                </>
                              )}
                              <p className={`mt-1 text-sm leading-snug ${panelOpen ? 'line-clamp-3' : 'line-clamp-2'} ${selectedId === item.id ? 'text-white' : 'text-gray-200'}`}>
                                {item.titulo}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <span className="text-xs text-gray-700">{item.fecha}</span>
                              <br />
                              <span className={`text-xs transition-colors whitespace-nowrap ${selectedId === item.id ? 'text-blue-400' : 'text-gray-700 group-hover:text-gray-400'}`}>
                                {selectedId === item.id ? '← ver' : 'ver →'}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {status === 'done' && items.length === 0 && (
                <div className="px-5 py-10 text-center text-gray-600 text-sm">
                  No se encontraron documentos relevantes en el rango seleccionado.
                </div>
              )}
              {status === 'done' && items.length > 0 && itemsVisibles.length === 0 && (
                <div className="px-5 py-10 text-center text-gray-600 text-sm">
                  No hay documentos de esta categoría en el rango seleccionado.
                </div>
              )}
            </div>

            {status === 'done' && (
              <p className="mt-3 text-xs text-gray-600 text-right">
                Datos en tiempo real de boe.es/datosabiertos
              </p>
            )}
          </div>

          {/* Panel de detalle */}
          {panelOpen && (
            <div className="flex-1 min-w-0 rounded-xl border border-gray-800 overflow-hidden sticky top-6">
              <div className="flex items-center justify-between px-5 py-3 bg-gray-900 border-b border-gray-800">
                <span className="text-xs font-mono text-gray-400">{selectedId}</span>
                <button
                  onClick={closeDetail}
                  className="text-gray-600 hover:text-gray-300 text-lg leading-none transition-colors"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-[720px] overflow-y-auto">
                {detailStatus === 'loading' && (
                  <div className="flex items-center justify-center gap-3 py-16 text-gray-500 text-sm">
                    <span className="inline-block w-4 h-4 border-2 border-gray-600 border-t-blue-400 rounded-full animate-spin" />
                    Cargando documento...
                  </div>
                )}

                {detailStatus === 'error' && (
                  <div className="px-5 py-8 text-red-400 text-sm">✗ {detailError}</div>
                )}

                {detailStatus === 'done' && detail && (
                  <div className="divide-y divide-gray-800/60">
                    <div className="px-5 py-4 space-y-3">
                      <h2 className="text-sm font-semibold text-white leading-snug">{detail.titulo}</h2>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {detail.rango && (
                          <span className="text-xs bg-blue-900/40 text-blue-300 border border-blue-800/50 rounded px-2 py-0.5">
                            {detail.rango}
                          </span>
                        )}
                        {detail.seccion && (
                          <span className="text-xs bg-gray-800/80 text-gray-400 border border-gray-700/50 rounded px-2 py-0.5">
                            {detail.seccion}
                          </span>
                        )}
                        {detail.departamento && (
                          <span className="text-xs bg-gray-800 text-gray-500 rounded px-2 py-0.5">
                            {detail.departamento}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {detail.fechaPublicacion && (
                          <span>Publicado: <span className="text-gray-400">{detail.fechaPublicacion}</span></span>
                        )}
                        {detail.paginas.inicio > 0 && (
                          <span>Págs. <span className="text-gray-400">{detail.paginas.inicio}–{detail.paginas.fin}</span></span>
                        )}
                      </div>

                      <div className="flex gap-3 pt-1">
                        <a
                          href={detail.urlPdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded px-3 py-1.5 transition-colors"
                        >
                          ↓ PDF
                        </a>
                        <a
                          href={detail.urlHtml}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded px-3 py-1.5 transition-colors"
                        >
                          ↗ Ver en BOE
                        </a>
                      </div>
                    </div>

                    <div className="px-5 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">
                        Texto íntegro
                      </p>
                      {detail.paragrafos.length === 0 ? (
                        <p className="text-sm text-gray-500">No se pudo extraer el texto de este documento.</p>
                      ) : (
                        <div className="space-y-3">
                          {detail.paragrafos.map((para, i) => (
                            <p key={i} className="text-sm text-gray-300 leading-relaxed">{para}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

// Cuenta días laborables entre dos fechas ISO
function workingDayCount(from: string, to: string): number {
  let count = 0
  const d = new Date(from + 'T00:00:00')
  const end = new Date(to + 'T00:00:00')
  while (d <= end) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) count++
    d.setDate(d.getDate() + 1)
  }
  return count
}
