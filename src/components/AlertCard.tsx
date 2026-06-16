'use client'

import { useState } from 'react'
import {
  Building2, Coins, CalendarClock, ExternalLink, FileText, Sparkles,
  CheckCircle2, XCircle, HelpCircle, TriangleAlert, X,
} from 'lucide-react'
import { api } from '@/lib/api'
import {
  type Alerta, formatImporte, formatFecha, diasRestantes, tipoAdminLabel, scoreColor,
} from '@/lib/format'

function Pill({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`pill ${className}`}>{children}</span>
}

export function AlertCard({
  alerta, onOpen, showFeedback = false,
}: {
  alerta: Alerta
  onOpen: (id: string, url: string) => void
  showFeedback?: boolean
}) {
  const c = alerta.convocatoria
  const sc = scoreColor(alerta.score)
  const dias = diasRestantes(c.fechaFinSol)
  const plazoUrgente = dias != null && dias >= 0 && dias <= 15
  const [fbOpen, setFbOpen] = useState(false)
  const [fbText, setFbText] = useState('')
  const [fbSent, setFbSent] = useState(false)
  const [fbSending, setFbSending] = useState(false)
  const [whyOpen, setWhyOpen] = useState(false)

  async function enviarFeedback() {
    if (!fbText.trim()) return
    setFbSending(true)
    try {
      await api('/api/alerts/feedback', { method: 'POST', body: JSON.stringify({ convocatoriaId: c.id, motivo: fbText.trim() }) })
    } catch { /* no bloquear al tester */ }
    setFbSent(true)
    setFbSending(false)
  }

  return (
    <article className="card animate-in p-4 sm:p-5">
      {/* Cabecera */}
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Pill className="bg-brand-50 text-brand-700">{tipoAdminLabel(c.tipoAdmin)}</Pill>
          {c.abierta
            ? <Pill className="bg-emerald-50 text-ok"><span className="h-1.5 w-1.5 rounded-full bg-ok" /> Abierta</Pill>
            : <Pill className="bg-slate-100 text-subtle">Cerrada</Pill>}
          {c.esMrr && <Pill className="bg-amber-50 text-plazo">Fondos UE</Pill>}
          {alerta.elegibilidadEstado === 'si' && <Pill className="bg-emerald-100 text-ok">✓ Probablemente cumples</Pill>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={`flex flex-col items-center rounded-xl px-2.5 py-1 leading-none ${sc.bg} ${sc.text}`}>
            <span className="text-base font-extrabold">{alerta.score}</span>
            <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wide opacity-90">{sc.label}</span>
          </span>
          {showFeedback && (
            <button onClick={() => setWhyOpen(true)} className="flex items-center gap-0.5 text-[11px] font-medium text-brand-700 hover:underline">
              <HelpCircle className="h-3 w-3" /> ¿por qué?
            </button>
          )}
        </div>
      </div>

      {/* Título + organismo */}
      <h3 className="text-[15px] font-semibold leading-snug text-ink sm:text-base">{c.titulo}</h3>
      {(c.organoNivel3 || c.organoNivel2) && (
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-subtle">
          <Building2 className="h-3.5 w-3.5 shrink-0" /> {c.organoNivel3 ?? c.organoNivel2}
        </p>
      )}

      {/* Resumen IA */}
      {c.aiSummary && (
        <div className="mt-3 rounded-xl bg-brand-50/60 p-3">
          <p className="flex items-start gap-1.5 text-[13px] leading-relaxed text-ink">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" /> <span>{c.aiSummary}</span>
          </p>
          {c.callToAction && <p className="mt-2 pl-5 text-[13px] font-semibold text-brand-700">{c.callToAction}</p>}
        </div>
      )}

      {/* Metadatos */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px]">
        <span className="inline-flex items-center gap-1.5 text-ink"><Coins className="h-4 w-4 text-subtle" /> {formatImporte(c.importeTotal)}</span>
        <span className={`inline-flex items-center gap-1.5 ${plazoUrgente ? 'font-semibold text-danger' : 'text-ink'}`}>
          <CalendarClock className="h-4 w-4 text-subtle" />
          {c.fechaFinSol ? `${formatFecha(c.fechaFinSol)}${dias != null && dias >= 0 ? ` · ${dias}d` : ''}` : 'Sin fecha de cierre'}
        </span>
      </div>

      {/* Etiquetas */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {c.finalidad && <Pill className="bg-slate-100 text-subtle">{c.finalidad}</Pill>}
        {(c.tiposBeneficiario ?? []).slice(0, 1).map(t => (
          <Pill key={t} className="bg-slate-100 text-subtle">{t.length > 34 ? t.slice(0, 34) + '…' : t}</Pill>
        ))}
        {(c.naceCodes ?? []).slice(0, 2).map(n => <Pill key={n} className="bg-slate-100 text-subtle">CNAE {n}</Pill>)}
      </div>

      {/* Requisitos IA */}
      {c.requisitosResumen && (
        <div className="mt-3 rounded-xl border border-amber-200/70 bg-amber-50/50 p-3">
          <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-plazo">
            <FileText className="h-3.5 w-3.5" /> Requisitos (leídos de las bases)
          </p>
          <p className="text-[13px] text-ink">{c.requisitosResumen}</p>
        </div>
      )}

      {/* Elegibilidad */}
      {alerta.elegibilidad && alerta.elegibilidad.length > 0 && (
        <div className="mt-3 rounded-xl border border-line bg-slate-50/60 p-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle">¿Cumples los requisitos?</p>
          <ul className="space-y-1">
            {alerta.elegibilidad.map(e => (
              <li key={e.label} className="flex items-center gap-1.5 text-[13px]">
                {e.estado === 'ok' ? <CheckCircle2 className="h-4 w-4 text-ok" />
                  : e.estado === 'fail' ? <XCircle className="h-4 w-4 text-danger" />
                  : <HelpCircle className="h-4 w-4 text-subtle" />}
                <span className={e.estado === 'fail' ? 'text-subtle line-through' : 'text-ink'}>{e.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pie */}
      <div className="mt-4 flex items-center gap-3 border-t border-line pt-3">
        <button onClick={() => onOpen(alerta.id, c.urlOficial)} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-700 hover:underline">
          Ver convocatoria oficial <ExternalLink className="h-3.5 w-3.5" />
        </button>
        {c.urlBases && <a href={c.urlBases} target="_blank" rel="noopener" className="text-[13px] text-subtle hover:text-ink">Bases</a>}
        <span className="ml-auto font-mono text-[10px] text-slate-400">ID {c.codigoBdns ?? c.id}</span>
      </div>

      {/* Feedback testers */}
      {showFeedback && (
        <div className="mt-3 border-t border-dashed border-line pt-3">
          {fbSent ? (
            <p className="flex items-center gap-1.5 text-[13px] text-ok"><CheckCircle2 className="h-4 w-4" /> ¡Gracias! Nos ayuda a afinar el matching.</p>
          ) : !fbOpen ? (
            <button onClick={() => setFbOpen(true)} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-plazo hover:underline">
              <TriangleAlert className="h-3.5 w-3.5" /> Esto no encaja conmigo
            </button>
          ) : (
            <div>
              <textarea value={fbText} onChange={e => setFbText(e.target.value)} rows={2}
                placeholder="¿Por qué no debería salirte? Ej.: es solo para mayores de 65…"
                className="input text-[13px]" />
              <div className="mt-2 flex gap-2">
                <button onClick={enviarFeedback} disabled={fbSending || !fbText.trim()} className="btn-primary px-3 py-1.5 text-[13px]">
                  {fbSending ? 'Enviando…' : 'Enviar'}
                </button>
                <button onClick={() => setFbOpen(false)} className="btn-ghost px-3 py-1.5 text-[13px]">Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal ¿por qué? */}
      {whyOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={() => setWhyOpen(false)}>
          <div className="max-h-[85vh] w-full max-w-md overflow-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl" onClick={e => e.stopPropagation()}>
            <div className="mb-2 flex items-start justify-between gap-3">
              <h4 className="font-semibold text-ink">¿Por qué te mostramos esto?</h4>
              <button onClick={() => setWhyOpen(false)} className="rounded-lg p-1 text-subtle hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-[13px] text-subtle">{c.titulo}</p>
            <div className="mt-3 rounded-xl bg-brand-50/60 p-3 text-sm">Encaje: <strong>{alerta.score}/100</strong> · {sc.label}</div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-subtle">Te la mostramos porque</p>
            <ul className="mt-1 space-y-1">
              {alerta.reasons.map(r => <li key={r} className="flex items-center gap-1.5 text-[13px] text-ink"><CheckCircle2 className="h-4 w-4 text-brand-600" /> {r}</li>)}
            </ul>
            <p className="mt-3 border-t border-line pt-3 text-xs text-subtle">
              El encaje se calcula por reglas: territorio, beneficiario, tema/sector y palabras clave. Una ayuda autonómica o estatal te aparece aunque su título mencione otro municipio.
            </p>
          </div>
        </div>
      )}
    </article>
  )
}
