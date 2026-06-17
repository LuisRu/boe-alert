// Helpers de presentación compartidos por el dashboard y el buscador.

export interface Convocatoria {
  id: string
  codigoBdns: string
  titulo: string
  tituloCooficial: string | null
  aiSummary: string | null
  paraQuien: string | null
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
  municipio: string | null
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

// "Para quién" en lenguaje sencillo (traduce la jerga de tiposBeneficiario).
export function paraQuien(tipos: string[]): string {
  if (!tipos || tipos.length === 0) return 'Cualquiera'
  const j = tipos.join(' | ').toUpperCase()
  const out: string[] = []
  if (j.includes('FÍSICA') && j.includes('NO DESARROLLAN')) out.push('Particulares')
  if (j.includes('PYME') || (j.includes('FÍSICA') && j.includes('QUE DESARROLLAN'))) out.push('Autónomos y pymes')
  if (j.includes('JURÍDICA')) out.push('Asociaciones y entidades')
  if (j.includes('GRAN EMPRESA')) out.push('Grandes empresas')
  return out.length ? [...new Set(out)].join(' · ') : tipos[0]
}

const NUTS_NOMBRE: Record<string, string> = {
  ES: 'Toda España',
  // Galicia
  ES11: 'Galicia', ES111: 'A Coruña', ES112: 'Lugo', ES113: 'Ourense', ES114: 'Pontevedra',
  // Norte
  ES12: 'Asturias', ES120: 'Asturias', ES13: 'Cantabria', ES130: 'Cantabria',
  ES21: 'País Vasco', ES211: 'Álava', ES212: 'Gipuzkoa', ES213: 'Bizkaia',
  ES22: 'Navarra', ES220: 'Navarra', ES23: 'La Rioja', ES230: 'La Rioja',
  ES24: 'Aragón', ES241: 'Huesca', ES242: 'Teruel', ES243: 'Zaragoza',
  // Centro
  ES30: 'Madrid', ES300: 'Madrid',
  ES41: 'Castilla y León', ES411: 'Ávila', ES412: 'Burgos', ES413: 'León', ES414: 'Palencia',
  ES415: 'Salamanca', ES416: 'Segovia', ES417: 'Soria', ES418: 'Valladolid', ES419: 'Zamora',
  ES42: 'Castilla-La Mancha', ES421: 'Albacete', ES422: 'Ciudad Real', ES423: 'Cuenca', ES424: 'Guadalajara', ES425: 'Toledo',
  ES43: 'Extremadura', ES431: 'Badajoz', ES432: 'Cáceres',
  // Este
  ES51: 'Cataluña', ES511: 'Barcelona', ES512: 'Girona', ES513: 'Lleida', ES514: 'Tarragona',
  ES52: 'Com. Valenciana', ES521: 'Alicante', ES522: 'Castellón', ES523: 'Valencia',
  ES53: 'Illes Balears', ES531: 'Illes Balears', ES532: 'Illes Balears', ES533: 'Illes Balears',
  // Sur
  ES61: 'Andalucía', ES611: 'Almería', ES612: 'Cádiz', ES613: 'Córdoba', ES614: 'Granada',
  ES615: 'Huelva', ES616: 'Jaén', ES617: 'Málaga', ES618: 'Sevilla',
  ES62: 'Murcia', ES620: 'Murcia', ES63: 'Ceuta', ES630: 'Ceuta', ES64: 'Melilla', ES640: 'Melilla',
  // Canarias
  ES70: 'Canarias', ES703: 'Canarias', ES704: 'Canarias', ES705: 'Canarias',
  ES706: 'Canarias', ES707: 'Canarias', ES708: 'Canarias', ES709: 'Canarias',
}

// "Dónde" en lenguaje sencillo (municipio o provincia/CCAA/España).
export function donde(municipio: string | null, nutsCodes: string[]): string {
  if (municipio) return municipio
  if (!nutsCodes || nutsCodes.length === 0) return 'Toda España'
  const sorted = [...nutsCodes].sort((a, b) => b.length - a.length)
  for (const code of sorted) if (NUTS_NOMBRE[code]) return NUTS_NOMBRE[code]
  return sorted[0]
}

// Color del chip de puntuación según rango.
export function scoreColor(score: number): { bg: string; text: string; label: string } {
  if (score >= 60) return { bg: 'bg-brand-600', text: 'text-white', label: 'Encaje alto' }
  if (score >= 50) return { bg: 'bg-brand-500', text: 'text-white', label: 'Buen encaje' }
  if (score >= 40) return { bg: 'bg-brand-100', text: 'text-brand-800', label: 'Encaje medio' }
  return { bg: 'bg-slate-100', text: 'text-subtle', label: 'Encaje bajo' }
}
