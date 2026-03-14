import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BOE Alert — Alertas del BOE personalizadas',
  description:
    'Monitoriza el BOE diariamente y recibe solo las alertas relevantes para tu negocio.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
