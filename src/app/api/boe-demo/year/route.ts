import JSZip from 'jszip'

export const maxDuration = 60 // segundos — requiere Vercel Pro o Edge; en hobby se ignora sin error

// Genera todos los días laborables de un año (L-V)
function workingDays(year: number): string[] {
  const days: string[] = []
  const d = new Date(year, 0, 1)
  while (d.getFullYear() === year) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) {
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      days.push(`${year}${m}${day}`)
    }
    d.setDate(d.getDate() + 1)
  }
  return days
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Fetch de un sumario con reintentos (3 intentos, backoff exponencial)
async function fetchSumario(dateStr: string): Promise<{ dateStr: string; xml: string } | null> {
  const MAX_RETRIES = 3
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) await sleep(500 * Math.pow(2, attempt - 1)) // 500ms, 1000ms
      const res = await fetch(
        `https://www.boe.es/datosabiertos/api/boe/sumario/${dateStr}`,
        {
          headers: { Accept: 'application/xml' },
          signal: AbortSignal.timeout(20000),
        }
      )
      if (!res.ok) {
        if (res.status === 404) return null // día sin BOE (festivo, etc.) — no reintentar
        continue // otro error HTTP → reintentar
      }
      const xml = await res.text()
      if (!xml.includes('<code>200</code>')) return null // respuesta vacía del BOE
      return { dateStr, xml }
    } catch {
      if (attempt === MAX_RETRIES - 1) return null
    }
  }
  return null
}

// Procesa en lotes de N concurrentes con pausa entre lotes para evitar rate limit
async function fetchBatch<T>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<{ dateStr: string; xml: string } | null>
): Promise<Array<{ dateStr: string; xml: string }>> {
  const results: Array<{ dateStr: string; xml: string }> = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const settled = await Promise.all(batch.map(fn))
    for (const r of settled) {
      if (r) results.push(r)
    }
    // Pequeña pausa entre lotes para no saturar la API del BOE
    if (i + batchSize < items.length) await sleep(300)
  }
  return results
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const yearParam = searchParams.get('year')
  const year = parseInt(yearParam ?? '')

  const currentYear = new Date().getFullYear()
  if (!year || year < 2010 || year > currentYear) {
    return new Response(`Año inválido. Rango permitido: 2010–${currentYear}`, { status: 400 })
  }

  const days = workingDays(year)

  // Para el año en curso solo hasta hoy
  const today = new Date()
  const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
  const filtered = year === currentYear ? days.filter(d => d <= todayStr) : days

  // Fetch en lotes de 10 paralelos (antes 20 — reducido para evitar rate limit de boe.es)
  const sumarios = await fetchBatch(filtered, 10, fetchSumario)

  if (sumarios.length === 0) {
    return new Response('No se encontraron sumarios para ese año', { status: 404 })
  }

  // Crear ZIP
  const zip = new JSZip()
  const folder = zip.folder(`boe-${year}`)!

  for (const { dateStr, xml } of sumarios) {
    folder.file(`boe-sumario-${dateStr}.txt`, xml)
  }

  // Añadir índice con todas las URLs de PDF
  const pdfLines: string[] = []
  for (const { xml } of sumarios) {
    const matches = xml.matchAll(/<url_pdf[^>]*>(https?:\/\/[^<]+)<\/url_pdf>/g)
    for (const m of matches) pdfLines.push(m[1].trim())
  }
  if (pdfLines.length > 0) {
    folder.file(`_pdf-urls-${year}.txt`, pdfLines.join('\n'))
  }

  const zipBuffer = await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' })

  return new Response(zipBuffer as BodyInit, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="boe-${year}-${sumarios.length}dias.zip"`,
    },
  })
}
