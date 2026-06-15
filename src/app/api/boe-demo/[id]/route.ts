import { NextResponse } from 'next/server'

export interface BoeDocDetail {
  id: string
  titulo: string
  seccion: string
  departamento: string
  rango: string
  fechaPublicacion: string
  fechaDisposicion: string
  urlPdf: string
  urlHtml: string
  paginas: { inicio: number; fin: number }
  paragrafos: string[]
}

const SECCION_NOMBRES: Record<string, string> = {
  '1': 'I. Disposiciones generales',
  '2': 'II. Autoridades y personal',
  '3': 'III. Otras disposiciones',
  '4': 'IV. Administración de Justicia',
  '5': 'V. Anuncios',
}

function parseDetailXml(xml: string, id: string): BoeDocDetail {
  function extract(tag: string): string {
    const m = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`))
    return m ? m[1].trim() : ''
  }

  // Fecha YYYYMMDD → DD/MM/YYYY
  function formatDate(raw: string): string {
    if (raw.length !== 8) return raw
    return `${raw.slice(6, 8)}/${raw.slice(4, 6)}/${raw.slice(0, 4)}`
  }

  // Extraer párrafos de <p> dentro de la sección de texto (después de metadatos)
  const textoStart = xml.indexOf('</metadatos>')
  const textoSection = textoStart !== -1 ? xml.slice(textoStart) : xml

  const paraRegex = /<p[^>]*>([\s\S]*?)<\/p>/g
  const paragrafos: string[] = []

  for (const match of textoSection.matchAll(paraRegex)) {
    // Eliminar etiquetas HTML internas y normalizar espacios
    const text = match[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\u00a0/g, ' ') // nbsp
      .trim()

    if (text.length > 20) {
      paragrafos.push(text)
    }
  }

  const urlPdfRaw = extract('url_pdf')
  const urlPdf = urlPdfRaw.startsWith('http')
    ? urlPdfRaw
    : `https://www.boe.es${urlPdfRaw}`

  const seccionCodigo = extract('seccion')

  return {
    id,
    titulo: extract('titulo'),
    seccion: SECCION_NOMBRES[seccionCodigo] ?? `Sección ${seccionCodigo}`,
    departamento: extract('departamento'),
    rango: extract('rango'),
    fechaPublicacion: formatDate(extract('fecha_publicacion')),
    fechaDisposicion: formatDate(extract('fecha_disposicion')),
    urlPdf,
    urlHtml: `https://www.boe.es/diario_boe/txt.php?id=${id}`,
    paginas: {
      inicio: parseInt(extract('pagina_inicial') || '0'),
      fin: parseInt(extract('pagina_final') || '0'),
    },
    paragrafos,
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Validar formato ID del BOE
  if (!/^BOE-[A-Z]-\d{4}-\d+$/.test(id)) {
    return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 })
  }

  try {
    const res = await fetch(`https://www.boe.es/diario_boe/xml.php?id=${id}`, {
      headers: { Accept: 'application/xml' },
      signal: AbortSignal.timeout(12000),
    })

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `BOE devolvió ${res.status}` },
        { status: 502 }
      )
    }

    const xml = await res.text()

    if (xml.includes('<error>') || !xml.includes('<identificador>')) {
      return NextResponse.json(
        { success: false, error: 'Documento no encontrado en el BOE' },
        { status: 404 }
      )
    }

    const detail = parseDetailXml(xml, id)

    return NextResponse.json({ success: true, detail })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
