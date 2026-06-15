'use client'

import {
  type Alerta,
  formatImporte,
  formatFecha,
  diasRestantes,
  tipoAdminLabel,
  scoreColor,
} from '@/lib/format'

function Chip({ children, tone = 'slate' }: { children: React.ReactNode; tone?: 'slate' | 'brand' | 'amber' }) {
  const tones = {
    slate: 'bg-slate-100 text-subtle',
    brand: 'bg-brand-50 text-brand-700',
    amber: 'bg-amber-50 text-plazo',
  }
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>
}

function Meta({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-subtle">{label}</dt>
      <dd className={`text-sm font-medium ${tone ?? 'text-ink'}`}>{value}</dd>
    </div>
  )
}

export function AlertCard({ alerta, onOpen }: { alerta: Alerta; onOpen: (id: string, url: string) => void }) {
  const c = alerta.convocatoria
  const sc = scoreColor(alerta.score)
  const dias = diasRestantes(c.fechaFinSol)
  const plazoTone = dias == null ? 'text-ink' : dias < 0 ? 'text-subtle' : dias <= 15 ? 'text-danger' : 'text-plazo'
  const plazoTexto =
    c.fechaFinSol == null
      ? 'Sin fecha de cierre'
      : dias != null && dias < 0
        ? `Cerró el ${formatFecha(c.fechaFinSol)}`
        : `${formatFecha(c.fechaFinSol)}${dias != null ? ` · ${dias} días` : ''}`

  return (
    <article className="rounded-xl border border-line bg-white p-5 shadow-sm transition hover:shadow-md">
      {/* Cabecera */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="brand">{tipoAdminLabel(c.tipoAdmin)}</Chip>
          {c.abierta ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-ok">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Abierta
            </span>
          ) : (
            <Chip>Cerrada</Chip>
          )}
          {c.esMrr && <Chip tone="amber">Fondos MRR</Chip>}
          {alerta.elegibilidadEstado === 'si' && (
            <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-ok">✅ Probablemente cumples</span>
          )}
          {alerta.elegibilidadEstado === 'no' && (
            <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-danger">❌ Quizá no cumples</span>
          )}
        </div>
        <div className={`flex shrink-0 flex-col items-center rounded-lg px-3 py-1 ${sc.bg} ${sc.text}`}>
          <span className="text-lg font-bold leading-none">{alerta.score}</span>
          <span className="text-[10px] opacity-90">{sc.label}</span>
        </div>
      </div>

      {/* Título + organismo */}
      <h3 className="text-base font-semibold leading-snug text-ink">{c.titulo}</h3>
      {(c.organoNivel3 || c.organoNivel2) && (
        <p className="mt-1 text-sm text-subtle">{c.organoNivel3 ?? c.organoNivel2}</p>
      )}

      {/* Resumen IA */}
      {c.aiSummary ? (
        <div className="mt-3 rounded-lg bg-brand-50/60 p-3">
          <p className="text-sm text-ink">{c.aiSummary}</p>
          {c.callToAction && <p className="mt-2 text-sm font-semibold text-brand-700">👉 {c.callToAction}</p>}
        </div>
      ) : (
        <p className="mt-3 text-xs italic text-subtle">Resumen con IA no disponible todavía.</p>
      )}

      {/* Metadatos */}
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Meta label="Importe" value={formatImporte(c.importeTotal)} />
        <Meta label="Plazo solicitud" value={plazoTexto} tone={plazoTone} />
        <Meta label="Apertura" value={formatFecha(c.fechaInicioSol)} />
        <Meta label="Publicación" value={formatFecha(c.fechaRecepcion)} />
      </dl>

      {/* Etiquetas */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {c.finalidad && <Chip tone="brand">{c.finalidad}</Chip>}
        {(c.tiposBeneficiario ?? []).slice(0, 2).map(t => (
          <Chip key={t}>{t.length > 40 ? t.slice(0, 40) + '…' : t}</Chip>
        ))}
        {(c.instrumentos ?? []).slice(0, 1).map(i => (
          <Chip key={i}>{i.trim()}</Chip>
        ))}
        {(c.naceCodes ?? []).slice(0, 3).map(n => (
          <Chip key={n}>CNAE {n}</Chip>
        ))}
      </div>

      {/* Requisitos extraídos de las bases por IA */}
      {c.requisitosResumen && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-plazo">Requisitos (leídos de las bases)</p>
          <p className="text-sm text-ink">{c.requisitosResumen}</p>
        </div>
      )}

      {/* Checklist de elegibilidad contra tu perfil */}
      {alerta.elegibilidad && alerta.elegibilidad.length > 0 && (
        <div className="mt-3 rounded-lg border border-line bg-white p-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-subtle">¿Cumples los requisitos?</p>
          <ul className="space-y-0.5">
            {alerta.elegibilidad.map(e => (
              <li key={e.label} className="flex items-center gap-1.5 text-sm">
                <span>{e.estado === 'ok' ? '✅' : e.estado === 'fail' ? '❌' : '❓'}</span>
                <span className={e.estado === 'fail' ? 'text-subtle line-through' : 'text-ink'}>{e.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-[11px] text-subtle">❓ = nos falta ese dato en tu perfil. Verifica siempre en la fuente oficial.</p>
        </div>
      )}

      {/* Por qué encaja */}
      {alerta.reasons.length > 0 && (
        <div className="mt-4 rounded-lg border border-line bg-canvas p-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-subtle">Por qué encaja contigo</p>
          <ul className="space-y-0.5">
            {alerta.reasons.map(r => (
              <li key={r} className="flex items-center gap-1.5 text-sm text-ink">
                <span className="text-brand-600">✓</span> {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pie */}
      <div className="mt-4 flex items-center gap-4 border-t border-line pt-3 text-sm">
        <button
          onClick={() => onOpen(alerta.id, c.urlOficial)}
          className="font-medium text-brand-700 hover:underline"
        >
          Ver convocatoria oficial →
        </button>
        {c.urlBases && (
          <a href={c.urlBases} target="_blank" rel="noopener" className="text-subtle hover:text-ink">
            Bases reguladoras
          </a>
        )}
        <span className="ml-auto text-xs text-subtle">BDNS {c.codigoBdns}</span>
      </div>
    </article>
  )
}
