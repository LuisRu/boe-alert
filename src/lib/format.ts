// Helpers de presentación compartidos por el dashboard y el buscador.

export interface Convocatoria {
  id: string
  codigoBdns: string
  titulo: string
  tituloCooficial: string | null
  aiSummary: string | null
  callToAction: string | null
  organoNivel1: string | null
  organoNivel2: string | null
  organoNivel3: string | null
  tipoAdmin: string | null
  finalidad: string | null
  importeTotal: number | null
  fechaRecepcion: string | null
  fechaInicioSol: string | null
  fechaFinSol: string | null
  plazoTexto: string | null
  abierta: boolean
  esMrr: boolean
  nutsCodes: string[]
  naceCodes: string[]
  tiposBeneficiario: string[]
  instrumentos: string[]
  sectoresTexto: string[]
  urlOficial: string
  urlBases: string | null
  advertencia: string | null
  requisitosResumen: string | null
}

export type EstadoCriterio = 'ok' | 'warn' | 'fail'
export interface Criterio {
  label: string
  estado: EstadoCriterio
}

export interface Alerta {
  id: string
  score: number
  sentAt: string | null
  openedAt: string | null
  createdAt: string
  reasons: string[]
  elegibilidad?: Criterio[]
  elegibilidadEstado?: 'si' | 'quiza' | 'no'
  convocatoria: Convocatoria
}

export function formatImporte(n: number | null): string {
  if (n == null) return 'No especificado'
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export function formatFecha(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Días restantes hasta una fecha (negativo si ya pasó).
export function diasRestantes(iso: string | null): number | null {
  if (!iso) return null
  const ms = new Date(iso).getTime() - Date.now()
  return Math.ceil(ms / 86_400_000)
}

export function tipoAdminLabel(t: string | null): string {
  switch (t) {
    case 'C':
      return 'Estatal'
    case 'A':
      return 'Autonómica'
    case 'L':
      return 'Local'
    default:
      return 'Otra'
  }
}

// Color del chip de puntuación según rango.
export function scoreColor(score: number): { bg: string; text: string; label: string } {
  if (score >= 60) return { bg: 'bg-brand-600', text: 'text-white', label: 'Encaje alto' }
  if (score >= 50) return { bg: 'bg-brand-500', text: 'text-white', label: 'Buen encaje' }
  if (score >= 40) return { bg: 'bg-brand-100', text: 'text-brand-800', label: 'Encaje medio' }
  return { bg: 'bg-slate-100', text: 'text-subtle', label: 'Encaje bajo' }
}
