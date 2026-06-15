import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')

  if (!date || !/^\d{8}$/.test(date)) {
    return new NextResponse('Parámetro date inválido (formato: YYYYMMDD)', { status: 400 })
  }

  try {
    const res = await fetch(
      `https://www.boe.es/datosabiertos/api/boe/sumario/${date}`,
      {
        headers: { Accept: 'application/xml' },
        signal: AbortSignal.timeout(12000),
      }
    )

    if (!res.ok) {
      return new NextResponse(`BOE devolvió ${res.status}`, { status: 502 })
    }

    const xml = await res.text()

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="boe-sumario-${date}.xml"`,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    return new NextResponse(msg, { status: 500 })
  }
}
