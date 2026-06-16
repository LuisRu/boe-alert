'use client'

import { useState } from 'react'
import {
  Coins, CalendarClock, Users, MapPin, ArrowRight, FileText, Sparkles,
  CheckCircle2, XCircle, HelpCircle, TriangleAlert, X, ChevronDown,
} from 'lucide-react'
import { api } from '@/lib/api'
import {
  type Alerta, formatImporte, formatFecha, diasRestantes, paraQuien, donde,
} from '@/lib/format'

// Etiqueta de plazo en lenguaje claro.
function plazoLabel(c: Alerta['convocatoria']): { txt: string; urgente: boolean } {
  const dias = diasRestantes(c.fechaFinSol)
  if (c.fechaFinSol) {
    const urgente = dias != null && dias >= 0 && dias <= 15
    return { txt: `Hasta ${formatFecha(c.fechaFinSol)}${dias != null && dias >= 0 ? ` · ${dias} días` : ''}`, urgente }
  }
  if (c.plazoTexto) return { txt: c.plazoTexto, urgente: false }
  return { txt: 'Sin fecha fija', urgente: false }
}

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

export function AlertCard({
  alerta, onOpen, showFeedback = false, showStatus = true,
}: {
  alerta: Alerta
  onOpen: (id: string, url: string) => void
  showFeedback?: boolean
  // En "Para ti" se oculta (todas encajan y están abiertas por definición).
  showStatus?: boolean
}) {
  const c = alerta.convocatoria
  const plazo = plazoLabel(c)
  const [open, setOpen] = useState(false)
  const [fbOpen, setFbOpen] = useState(false)
  const [fbText, setFbText] = useState('')
  const [fbSent, setFbSent] = useState(false)
  const [whyOpen, setWhyOpen] = useState(false)

  // Veredicto sencillo y tranquilizador.
  const verdict =
    alerta.elegibilidadEstado === 'si' ? { txt: 'Te encaja', cls: 'bg-emerald-100 text-ok' }
    : alerta.score >= 60 ? { txt: 'Buen encaje', cls: 'bg-brand-100 text-brand-800' }
    : { txt: 'Te puede interesar', cls: 'bg-slate-100 text-subtle' }

  async function enviarFeedback() {
    if (!fbText.trim()) return
    try { await api('/api/alerts/feedback', { method: 'POST', body: JSON.stringify({ convocatoriaId: c.id, motivo: fbText.trim() }) }) } catch { /* */ }
    setFbSent(true)
  }

  return (
    <article className="card animate-in overflow-hidden">
      <div className="p-4 sm:p-5">
        {/* Estado + veredicto (oculto en "Para ti": todas encajan y están abiertas) */}
        {showStatus && (
          <div className="mb-2 flex items-center justify-between gap-2">
            {c.abierta
              ? <span className="pill bg-emerald-50 text-ok"><span className="h-1.5 w-1.5 rounded-full bg-ok" /> Abierta</span>
              : <span className="pill bg-slate-100 text-subtle">Cerrada</span>}
            <span className={`pill ${verdict.cls}`}>{verdict.txt}</span>
          </div>
        )}

        {/* Qué es: titular claro (resumen IA) + nombre oficial pequeño */}
        {c.aiSummary ? (
          <>
            <p className="line-clamp-3 text-[15px] font-semibold leading-snug text-ink">{c.aiSummary}</p>
            <p className="mt-1 line-clamp-1 text-xs text-subtle">{c.titulo}</p>
          </>
        ) : (
          <p className="text-[15px] font-semibold leading-snug text-ink">{c.titulo}</p>
        )}

        {/* Datos clave esquematizados */}
        <div className="mt-3.5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
          <Dato icon={<Coins className="h-4 w-4" />} label="Cuánto" value={formatImporte(c.importeTotal)} />
          <Dato icon={<CalendarClock className="h-4 w-4" />} label="Plazo" value={plazo.txt} tone={plazo.urgente ? 'text-danger' : undefined} />
          <Dato icon={<Users className="h-4 w-4" />} label="Para quién" value={c.paraQuien ?? paraQuien(c.tiposBeneficiario ?? [])} />
          <Dato icon={<MapPin className="h-4 w-4" />} label="Dónde" value={donde(c.municipio ?? null, c.nutsCodes ?? [])} />
        </div>

        {/* CTA */}
        <div className="mt-4 flex items-center gap-2">
          <button onClick={() => onOpen(alerta.id, c.urlOficial)} className="btn-primary flex-1">
            Ver y solicitar <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={() => setOpen(o => !o)} className="btn-outline px-3" aria-label="Ver detalles">
            <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Detalles plegables */}
      {open && (
        <div className="space-y-3 border-t border-line bg-slate-50/40 p-4 sm:p-5">
          {c.callToAction && (
            <p className="flex items-start gap-1.5 text-[13px] font-medium text-brand-700">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {c.callToAction}
            </p>
          )}

          {c.requisitosResumen && (
            <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-3">
              <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-plazo"><FileText className="h-3.5 w-3.5" /> Requisitos</p>
              <p className="text-[13px] text-ink">{c.requisitosResumen}</p>
            </div>
          )}

          {alerta.elegibilidad && alerta.elegibilidad.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle">¿Cumples los requisitos?</p>
              <ul className="space-y-1">
                {alerta.elegibilidad.map(e => (
                  <li key={e.label} className="flex items-center gap-1.5 text-[13px]">
                    {e.estado === 'ok' ? <CheckCircle2 className="h-4 w-4 text-ok" /> : e.estado === 'fail' ? <XCircle className="h-4 w-4 text-danger" /> : <HelpCircle className="h-4 w-4 text-subtle" />}
                    <span className={e.estado === 'fail' ? 'text-subtle line-through' : 'text-ink'}>{e.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
            {c.urlBases && <a href={c.urlBases} target="_blank" rel="noopener" className="text-subtle hover:text-ink">Bases reguladoras</a>}
            {showFeedback && <button onClick={() => setWhyOpen(true)} className="inline-flex items-center gap-1 text-brand-700 hover:underline"><HelpCircle className="h-3.5 w-3.5" /> ¿Por qué me sale?</button>}
            <span className="ml-auto font-mono text-[10px] text-slate-400">ID {c.codigoBdns ?? c.id}</span>
          </div>

          {/* Feedback testers */}
          {showFeedback && (
            <div className="border-t border-dashed border-line pt-3">
              {fbSent ? (
                <p className="flex items-center gap-1.5 text-[13px] text-ok"><CheckCircle2 className="h-4 w-4" /> ¡Gracias!</p>
              ) : !fbOpen ? (
                <button onClick={() => setFbOpen(true)} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-plazo hover:underline"><TriangleAlert className="h-3.5 w-3.5" /> Esto no encaja conmigo</button>
              ) : (
                <div>
                  <textarea value={fbText} onChange={e => setFbText(e.target.value)} rows={2} placeholder="¿Por qué no debería salirte?" className="input text-[13px]" />
                  <div className="mt-2 flex gap-2">
                    <button onClick={enviarFeedback} disabled={!fbText.trim()} className="btn-primary px-3 py-1.5 text-[13px]">Enviar</button>
                    <button onClick={() => setFbOpen(false)} className="btn-ghost px-3 py-1.5 text-[13px]">Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal ¿por qué? */}
      {whyOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={() => setWhyOpen(false)}>
          <div className="max-h-[85vh] w-full max-w-md overflow-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl" onClick={e => e.stopPropagation()}>
            <div className="mb-2 flex items-start justify-between gap-3">
              <h4 className="font-semibold text-ink">¿Por qué te mostramos esto?</h4>
              <button onClick={() => setWhyOpen(false)} className="rounded-lg p-1 text-subtle hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <ul className="mt-2 space-y-1">
              {alerta.reasons.map(r => <li key={r} className="flex items-center gap-1.5 text-[13px] text-ink"><CheckCircle2 className="h-4 w-4 text-brand-600" /> {r}</li>)}
            </ul>
          </div>
        </div>
      )}
    </article>
  )
}
