'use client'

import { useState } from 'react'
import {
  Coins, CalendarClock, Tag, MapPin, ArrowRight, FileText, Sparkles,
  Building2, ChevronDown, Gavel, CheckCircle2, Trophy, Award,
} from 'lucide-react'
import { type Licitacion } from '@/lib/licitacion'
import { cpvLabel } from '@/lib/cpv'
import { formatImporte, formatFecha, diasRestantes, donde } from '@/lib/format'

function Dato({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-subtle">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-subtle">{label}</p>
        <p className={`truncate text-[13px] font-semibold ${tone ?? 'text-ink'}`}>{value}</p>
      </div>
    </div>
  )
}

function plazoLabel(l: Licitacion): { txt: string; urgente: boolean } {
  const dias = diasRestantes(l.fechaFinPresentacion)
  if (l.fechaFinPresentacion) {
    const urgente = dias != null && dias >= 0 && dias <= 15
    return { txt: `Hasta ${formatFecha(l.fechaFinPresentacion)}${dias != null && dias >= 0 ? ` · ${dias} días` : ''}`, urgente }
  }
  return { txt: 'Sin fecha fija', urgente: false }
}

// Familias CPV únicas (2 dígitos) en lenguaje claro.
function familias(codes: string[]): string {
  const fams = [...new Set(codes.map(c => c.replace(/[^0-9]/g, '').slice(0, 2)))].slice(0, 2)
  return fams.map(cpvLabel).join(' · ') || '—'
}

export function LicitacionCard({
  lic, onOpen, showStatus = true,
}: {
  lic: Licitacion
  onOpen: (id: string, url: string) => void
  showStatus?: boolean
}) {
  const [open, setOpen] = useState(false)
  const plazo = plazoLabel(lic)
  const esAdjudicada = lic.tipoAnuncio === 'result'
  // Título oficial de TED viene como "<País> – <objeto>"; quitamos el prefijo
  // del país (todo lo anterior al primer guion largo separador).
  const tituloLimpio = lic.titulo.replace(/^[^–]{1,30}–\s*/, '')
  const ganadores = lic.adjudicatario?.slice(0, 3).join(', ')

  return (
    <article className="card animate-in overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          {esAdjudicada
            ? <span className="pill bg-amber-50 text-amber-700"><Trophy className="h-3 w-3" /> Adjudicada</span>
            : <span className="pill bg-indigo-50 text-indigo-700"><Gavel className="h-3 w-3" /> Licitación</span>}
          {showStatus && !esAdjudicada && (
            lic.abierta
              ? <span className="pill bg-emerald-50 text-ok"><span className="h-1.5 w-1.5 rounded-full bg-ok" /> Abierta</span>
              : <span className="pill bg-slate-100 text-subtle">Cerrada</span>
          )}
        </div>

        {lic.aiSummary ? (
          <>
            <p className="line-clamp-3 text-[15px] font-semibold leading-snug text-ink">{lic.aiSummary}</p>
            <p className="mt-1 line-clamp-1 text-xs text-subtle">{tituloLimpio}</p>
          </>
        ) : (
          <p className="line-clamp-3 text-[15px] font-semibold leading-snug text-ink">{tituloLimpio}</p>
        )}

        <div className="mt-3.5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
          <Dato icon={<Coins className="h-4 w-4" />} label={esAdjudicada ? 'Importe adjudicado' : 'Presupuesto'} value={formatImporte(lic.presupuesto)} />
          {esAdjudicada
            ? <Dato icon={<Award className="h-4 w-4" />} label="Adjudicado a" value={ganadores || '—'} />
            : <Dato icon={<CalendarClock className="h-4 w-4" />} label="Plazo" value={plazo.txt} tone={plazo.urgente ? 'text-danger' : undefined} />}
          <Dato icon={<Tag className="h-4 w-4" />} label="Sector" value={familias(lic.cpvCodes)} />
          <Dato icon={<MapPin className="h-4 w-4" />} label="Dónde" value={donde(null, lic.nutsCodes)} />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button onClick={() => onOpen(lic.id, lic.urlOficial)} className="btn-primary flex-1">
            {esAdjudicada ? 'Ver adjudicación' : 'Ver pliego'} <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={() => setOpen(o => !o)} className="btn-outline px-3" aria-label="Ver detalles">
            <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-3 border-t border-line bg-slate-50/40 p-4 sm:p-5">
          {lic.callToAction && (
            <p className="flex items-start gap-1.5 text-[13px] font-medium text-brand-700">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {lic.callToAction}
            </p>
          )}

          {lic.requisitosResumen && (
            <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-3">
              <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-plazo"><FileText className="h-3.5 w-3.5" /> Qué piden</p>
              <p className="text-[13px] text-ink">{lic.requisitosResumen}</p>
            </div>
          )}

          {lic.comprador && (
            <p className="flex items-start gap-1.5 text-[13px] text-subtle">
              <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Convoca: <span className="text-ink">{lic.comprador}</span>
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
            {lic.urlPliego && <a href={lic.urlPliego} target="_blank" rel="noopener" className="text-subtle hover:text-ink">Pliego oficial (PDF)</a>}
            <span className="ml-auto font-mono text-[10px] text-slate-400">Expediente {lic.expediente}</span>
          </div>

          {lic.reasons && lic.reasons.length > 0 && (
            <div className="border-t border-dashed border-line pt-3">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle">Por qué te encaja</p>
              <ul className="space-y-1">
                {lic.reasons.map(r => (
                  <li key={r} className="flex items-center gap-1.5 text-[13px] text-ink"><CheckCircle2 className="h-4 w-4 text-brand-600" /> {r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
