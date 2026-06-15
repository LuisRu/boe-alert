import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Subvenciona — Alertas de ayudas y subvenciones',
  description:
    'Recibe cada día solo las convocatorias de ayudas y subvenciones que encajan con tu perfil. Galicia y ámbito estatal.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="bg-canvas font-sans text-ink antialiased">{children}</body>
    </html>
  )
}
