import { NextResponse } from 'next/server'

export type Categoria = 'AYUDA' | 'LICITACION' | 'NORMATIVA' | 'EMPLEO'

export interface BoeItem {
  id: string
  titulo: string
  urlPdf: string
  urlHtml: string
  seccion: string
  seccionCodigo: string
  epigrafe: string
  departamento: string
  fecha: string      // DD/MM/YYYY
  categoria: Categoria
}

// ─── Filtro + clasificación ───────────────────────────────────────────────────

const EXCLUDE_TITLE_KEYWORDS = [
  'corrección de errores',
  'se nombra',
  'se cesa',
  'jubilación',
  'desierta',
  'cambios del euro',
  'tipos de interés',
  'actas previas',
] as const

// Cada regla incluye la categoría que asigna al documento que coincide.
// Sección 1 se divide en dos reglas: Subvenciones/Ayudas → AYUDA, resto → NORMATIVA.
const INCLUDE_RULES: Array<{
  section: string
  categoria: Categoria
  check: (epigrafe: string, title: string) => boolean
}> = [
  { section: '3',  categoria: 'AYUDA',      check: (ep)    => matchesAny(ep, ['Ayudas', 'Subvenciones', 'Financiación', 'Becas', 'Incentivos regionales']) },
  { section: '1',  categoria: 'AYUDA',      check: (ep)    => matchesAny(ep, ['Subvenciones', 'Ayudas']) },
  { section: '1',  categoria: 'NORMATIVA',  check: (ep)    => matchesAny(ep, ['Impuestos', 'Seguridad Social', 'Empleo', 'Vivienda', 'Tributos', 'Medidas fiscales', 'Medidas tributarias', 'Tasas', 'IRPF', 'Colegios profesionales']) },
  { section: '5A', categoria: 'LICITACION', check: (_, t)  => t.trim().toLowerCase().startsWith('anuncio de licitación') },
  { section: '2B', categoria: 'EMPLEO',     check: (ep)    => matchesAny(ep, ['Personal funcionario', 'Personal laboral', 'Personal de administración']) },
  { section: '5B', categoria: 'AYUDA',      check: (_, t)  => matchesAny(t, ['subvención', 'ayuda', 'convocatoria', 'Next Generation', 'PERTE']) },
]

function matchesAny(text: string, keywords: readonly string[]): boolean {
  const lower = text.toLowerCase()
  return keywords.some(k => lower.includes(k.toLowerCase()))
}

// Devuelve la categoría si el documento es relevante, null si debe descartarse.
function classify(item: Omit<BoeItem, 'categoria'>): Categoria | null {
  if (EXCLUDE_TITLE_KEYWORDS.some(k => item.titulo.toLowerCase().includes(k.toLowerCase()))) return null
  const rule = INCLUDE_RULES.find(r => r.section === item.seccionCodigo && r.check(item.epigrafe, item.titulo))
  return rule?.categoria ?? null
}

// ─── Utilidades de fecha ──────────────────────────────────────────────────────

// "YYYY-MM-DD" → "YYYYMMDD"
function toApiDate(isoDate: string): string {
  return isoDate.replace(/-/g, '')
}

// "YYYYMMDD" → "DD/MM/YYYY"
function toDisplayDate(yyyymmdd: string): string {
  return `${yyyymmdd.slice(6, 8)}/${yyyymmdd.slice(4, 6)}/${yyyymmdd.slice(0, 4)}`
}

// Genera todos los días laborables (L-V) entre dos fechas ISO "YYYY-MM-DD"
function workingDaysBetween(from: string, to: string): string[] {
  const days: string[] = []
  const d = new Date(from + 'T00:00:00')
  const end = new Date(to + 'T00:00:00')
  while (d <= end) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      days.push(`${y}${m}${day}`)
    }
    d.setDate(d.getDate() + 1)
  }
  return days
}

// ─── Parser XML ───────────────────────────────────────────────────────────────

function parseBoeXml(xml: string, yyyymmdd: string): BoeItem[] {
  const items: BoeItem[] = []
  const fecha = toDisplayDate(yyyymmdd)

  const tokenRegex =
    /(<seccion\s[^>]+>)|<departamento[^>]*nombre="([^"]*)"[^>]*>|(<epigrafe\s[^>]+>)|<item>([\s\S]*?)<\/item>/g

  let currentSeccion = ''
  let currentSeccionCodigo = ''
  let currentDept = ''
  let currentEpigrafe = ''

  for (const match of xml.matchAll(tokenRegex)) {
    if (match[1] !== undefined) {
      currentSeccionCodigo = match[1].match(/codigo="([^"]*)"/)?.[1] ?? ''
      currentSeccion = match[1].match(/nombre="([^"]*)"/)?.[1] ?? currentSeccionCodigo
      currentEpigrafe = ''
    } else if (match[2] !== undefined) {
      currentDept = match[2]
    } else if (match[3] !== undefined) {
      currentEpigrafe = match[3].match(/nombre="([^"]*)"/)?.[1] ?? ''
    } else if (match[4] !== undefined) {
      const block = match[4]
      const idMatch = block.match(/<identificador>([^<]+)<\/identificador>/)
      const titleMatch = block.match(/<titulo>([\s\S]*?)<\/titulo>/)
      const urlPdfMatch = block.match(/<url_pdf[^>]*>(https?:\/\/[^<]+)<\/url_pdf>/)
      const urlHtmlMatch = block.match(/<url_html[^>]*>(https?:\/\/[^<]+)<\/url_html>/)

      if (idMatch && titleMatch) {
        const draft = {
          id: idMatch[1].trim(),
          titulo: titleMatch[1].trim(),
          urlPdf: urlPdfMatch ? urlPdfMatch[1].trim() : '',
          urlHtml: urlHtmlMatch ? urlHtmlMatch[1].trim() : '',
          seccion: currentSeccion,
          seccionCodigo: currentSeccionCodigo,
          epigrafe: currentEpigrafe,
          departamento: currentDept,
          fecha,
        }
        const categoria = classify(draft)
        if (categoria) items.push({ ...draft, categoria })
      }
    }
  }

  return items
}

// ─── Fetch de un día ──────────────────────────────────────────────────────────

async function fetchDay(yyyymmdd: string): Promise<{ items: BoeItem[]; totalBruto: number } | null> {
  try {
    const res = await fetch(
      `https://www.boe.es/datosabiertos/api/boe/sumario/${yyyymmdd}`,
      { headers: { Accept: 'application/xml' }, signal: AbortSignal.timeout(15000) }
    )
    if (!res.ok) return null
    const xml = await res.text()
    if (!xml.includes('<code>200</code>')) return null // día sin BOE (festivo)
    // Contar ítems brutos antes de filtrar (aproximado por <identificador>)
    const totalBruto = (xml.match(/<identificador>BOE-/g) ?? []).length
    return { items: parseBoeXml(xml, yyyymmdd), totalBruto }
  } catch {
    return null
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

const MAX_DAYS = 5 // Vercel Hobby tiene 10s de timeout — más días causan errores

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from') // "YYYY-MM-DD"
  const to = searchParams.get('to')     // "YYYY-MM-DD"

  // Validación básica
  if (!from || !to) {
    return NextResponse.json({ success: false, error: 'Parámetros from y to requeridos.' }, { status: 400 })
  }
  if (from > to) {
    return NextResponse.json({ success: false, error: 'La fecha inicial no puede ser posterior a la final.' }, { status: 400 })
  }

  const days = workingDaysBetween(from, to)

  if (days.length === 0) {
    return NextResponse.json({ success: false, error: 'El rango seleccionado no contiene días laborables.' }, { status: 400 })
  }
  if (days.length > MAX_DAYS) {
    return NextResponse.json({ success: false, error: `El rango máximo es ${MAX_DAYS} días laborables.` }, { status: 400 })
  }

  // Fetch secuencial para no saturar boe.es
  const allItems: BoeItem[] = []
  let totalBruto = 0
  let diasConBOE = 0

  for (const day of days) {
    const result = await fetchDay(day)
    if (result) {
      allItems.push(...result.items)
      totalBruto += result.totalBruto
      diasConBOE++
    }
  }

  // Conteo por categoría
  const porCategoria: Record<Categoria, number> = { AYUDA: 0, LICITACION: 0, NORMATIVA: 0, EMPLEO: 0 }
  for (const item of allItems) porCategoria[item.categoria]++

  return NextResponse.json({
    success: true,
    items: allItems,
    stats: {
      diasConsultados: days.length,
      diasConBOE,
      totalBruto,
      relevantes: allItems.length,
      porCategoria,
    },
    rangoDesde: toDisplayDate(toApiDate(from)),
    rangoHasta: toDisplayDate(toApiDate(to)),
  })
}
