'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Fraunces, Hanken_Grotesk } from 'next/font/google'
import { ArrowRight, Coins, CalendarClock, MapPin, Sparkles, ShieldCheck, Building2, User, Bell, Compass } from 'lucide-react'
import { formatImporte, paraQuien as paraQuienFmt, donde } from '@/lib/format'

const display = Fraunces({ subsets: ['latin'], weight: ['400', '500', '600', '700', '900'], style: ['normal', 'italic'], variable: '--font-display' })
const body = Hanken_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' })

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface Muestra {
  id: string
  aiSummary: string | null
  paraQuien: string | null
  importeTotal: number | null
  tiposBeneficiario: string[]
  nutsCodes: string[]
  municipio: string | null
  fechaFinSol: string | null
  plazoTexto: string | null
}

const CSS = `
@keyframes fu { from { opacity:0; transform: translateY(16px) } to { opacity:1; transform:none } }
.fu { opacity:0; animation: fu .7s cubic-bezier(.2,.7,.2,1) forwards }
.d1{animation-delay:.05s}.d2{animation-delay:.15s}.d3{animation-delay:.25s}.d4{animation-delay:.35s}.d5{animation-delay:.45s}
`

export default function Landing() {
  const [muestra, setMuestra] = useState<Muestra[]>([])

  useEffect(() => {
    fetch(`${API}/api/public/muestra`)
      .then(r => r.json())
      .then(j => setMuestra(Array.isArray(j?.data) ? j.data : []))
      .catch(() => {})
  }, [])

  return (
    <main className={`${display.variable} ${body.variable} min-h-screen bg-canvas text-ink`} style={{ fontFamily: 'var(--font-body)' }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ─── HERO (oscuro, malla teal + grano) ─── */}
      <section className="relative overflow-hidden bg-[#06201d] text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{
          background:
            'radial-gradient(60% 55% at 18% 12%, rgba(20,184,166,.38), transparent 60%),' +
            'radial-gradient(50% 50% at 92% 8%, rgba(13,148,136,.30), transparent 55%),' +
            'radial-gradient(70% 60% at 70% 110%, rgba(45,212,191,.18), transparent 60%)',
        }} />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }} />

        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-[#06201d]">S</span>
            Subvenciona
          </div>
          <Link href="/login" className="text-sm text-white/70 transition hover:text-white">Entrar →</Link>
        </header>

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 pt-10 lg:grid-cols-[1.05fr_.95fr] lg:pb-28 lg:pt-16">
          <div>
            <p className="fu d1 mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[13px] text-brand-200">
              <ShieldCheck className="h-3.5 w-3.5" /> Datos oficiales de la BDNS · toda España
            </p>
            <h1 className="fu d2 text-[2.6rem] font-medium leading-[1.04] tracking-[-0.02em] sm:text-6xl" style={{ fontFamily: 'var(--font-display)' }}>
              Las ayudas que te tocan,
              <span className="italic text-brand-300"> sin leerte el boletín.</span>
            </h1>
            <p className="fu d3 mt-5 max-w-xl text-lg leading-relaxed text-white/70">
              Cada día se publican cientos de subvenciones y contratos públicos. Los cruzamos con tu perfil
              y te avisamos <strong className="font-semibold text-white">solo de lo que encaja contigo</strong>, explicado en lenguaje claro.
            </p>
            <div className="fu d4 mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register" className="group inline-flex items-center gap-2 rounded-xl bg-brand-400 px-6 py-3.5 font-semibold text-[#06201d] shadow-lg shadow-brand-500/20 transition hover:bg-brand-300">
                Empieza gratis 14 días <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <a href="#ejemplos" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3.5 font-medium text-white/80 transition hover:bg-white/5">
                Ver ejemplos reales
              </a>
            </div>
            <p className="fu d5 mt-4 text-sm text-white/45">Sin permanencia · cancela cuando quieras</p>
          </div>

          <div className="fu d4 relative">
            <div aria-hidden className="absolute -inset-4 rounded-[2rem] bg-brand-400/10 blur-2xl" />
            <ExampleCard m={muestra[0]} floating />
          </div>
        </div>
      </section>

      {/* ─── DOS PÚBLICOS ─── */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <h2 className="max-w-2xl text-3xl font-medium tracking-tight sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
          Para quien busca dinero <span className="text-brand-600">y</span> para quien busca contratos.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Audience
            icon={<User className="h-5 w-5" />}
            tag="Autónomos · pymes · particulares"
            title="Ayudas y subvenciones"
            desc="Ayudas a fondo perdido, bonos y programas para tu sector o tu situación. Te decimos cuánto, hasta cuándo y si cumples los requisitos."
          />
          <Audience
            icon={<Building2 className="h-5 w-5" />}
            tag="Empresas que licitan"
            title="Concursos y contratos públicos"
            desc="Licitaciones de la Administración filtradas por tu actividad (CPV), presupuesto y territorio. Los «trabajos» que saca el sector público, sin rastrear portales."
            soon
          />
        </div>
      </section>

      {/* ─── CÓMO FUNCIONA ─── */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Cómo funciona</p>
          <h2 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>Tres pasos. Cinco minutos.</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <Step n="01" icon={<User className="h-5 w-5" />} title="Cuéntanos quién eres" desc="Tu provincia, a qué te dedicas y qué te interesa. Particular, autónomo o empresa." />
            <Step n="02" icon={<Compass className="h-5 w-5" />} title="Cruzamos cada convocatoria" desc="Comparamos las publicaciones oficiales con tu perfil y filtramos lo que de verdad puedes pedir." />
            <Step n="03" icon={<Bell className="h-5 w-5" />} title="Recibes solo lo tuyo" desc="Un email diario con titulares claros: qué es, para quién, cuánto y qué hacer. Sin ruido." />
          </div>
        </div>
      </section>

      {/* ─── EJEMPLOS REALES ─── */}
      <section id="ejemplos" className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Ejemplos reales</p>
        <h2 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>Convocatorias abiertas hoy</h2>
        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(muestra.length ? muestra.slice(0, 6) : Array.from({ length: 3 })).map((m, i) => (
            <ExampleCard key={(m as Muestra)?.id ?? i} m={m as Muestra | undefined} />
          ))}
        </div>
        <p className="mt-6 text-sm text-subtle">Resúmenes generados con IA a partir de las bases oficiales. La fuente y el enlace original, siempre a un clic.</p>
      </section>

      {/* ─── PLANES ─── */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>Planes</h2>
          <p className="mt-2 text-subtle">14 días gratis en todos. Cancela cuando quieras.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <Plan name="Pro" price="9,99" unit="€/mes" who="Autónomos y particulares" features={['Ayudas de tu comunidad y estatales', 'Email diario personalizado', 'Requisitos y encaje explicados']} />
            <Plan name="Business" price="49" unit="€/mes" who="Empresas" highlight features={['Ayudas de toda España', 'Concursos públicos de tu zona', 'Filtros por CPV y presupuesto']} />
            <Plan name="Business+" price="99" unit="€/mes" who="Empresas que licitan en serio" features={['Concursos de toda España', 'Más CPV y alertas', 'Soporte prioritario']} />
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="relative overflow-hidden bg-[#06201d] text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(50% 80% at 50% 0%, rgba(20,184,166,.28), transparent 60%)' }} />
        <div className="relative mx-auto max-w-3xl px-5 py-20 text-center">
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            Deja de perderte ayudas por no enterarte a tiempo.
          </h2>
          <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-400 px-7 py-4 font-semibold text-[#06201d] transition hover:bg-brand-300">
            Empieza gratis 14 días <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="mx-auto max-w-6xl px-5 py-10 text-sm text-subtle">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 font-semibold text-ink">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-600 text-xs font-bold text-white">S</span> Subvenciona
          </div>
          <Link href="/login" className="hover:text-ink">Entrar</Link>
        </div>
        <p className="mt-6 max-w-3xl leading-relaxed">
          Subvenciona no es una fuente oficial. La información es orientativa y puede haber sido corregida o modificada;
          verifica siempre la vigencia y los requisitos en la fuente oficial (BDNS) enlazada en cada ficha.
        </p>
      </footer>
    </main>
  )
}

// ─── Componentes ─────────────────────────────────────────────────────────────

function ExampleCard({ m, floating }: { m?: Muestra; floating?: boolean }) {
  if (!m) {
    return <div className={`h-64 animate-pulse rounded-2xl border ${floating ? 'border-white/10 bg-white/10' : 'border-line bg-white'}`} />
  }
  const para = m.paraQuien ?? paraQuienFmt(m.tiposBeneficiario ?? [])
  const plazo = m.fechaFinSol
    ? `Hasta ${new Date(m.fechaFinSol).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`
    : m.plazoTexto || 'Abierta'
  return (
    <article className={`relative rounded-2xl border p-5 ${floating ? 'border-white/10 bg-white text-ink shadow-2xl shadow-black/30' : 'border-line bg-white'}`}>
      <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
        <Sparkles className="h-3 w-3 shrink-0" /> {para}
      </span>
      <p className="mt-3 line-clamp-3 text-[15px] font-semibold leading-snug text-ink" style={{ fontFamily: 'var(--font-display)' }}>
        {m.aiSummary}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4 text-[13px]">
        <Mini icon={<Coins className="h-4 w-4" />} v={formatImporte(m.importeTotal)} />
        <Mini icon={<CalendarClock className="h-4 w-4" />} v={plazo} />
        <Mini icon={<MapPin className="h-4 w-4" />} v={donde(m.municipio ?? null, m.nutsCodes ?? [])} />
      </div>
    </article>
  )
}

function Mini({ icon, v }: { icon: React.ReactNode; v: string }) {
  return (
    <div className="min-w-0">
      <span className="text-subtle">{icon}</span>
      <p className="mt-1 truncate font-semibold text-ink">{v}</p>
    </div>
  )
}

function Audience({ icon, tag, title, desc, soon }: { icon: React.ReactNode; tag: string; title: string; desc: string; soon?: boolean }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-line bg-white p-7 transition hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-subtle">{tag}</span>
        {soon && <span className="ml-auto rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-semibold text-white">Próximamente</span>}
      </div>
      <h3 className="mt-5 text-2xl font-medium tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
      <p className="mt-2 leading-relaxed text-subtle">{desc}</p>
    </div>
  )
}

function Step({ n, icon, title, desc }: { n: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="text-3xl font-semibold text-brand-200" style={{ fontFamily: 'var(--font-display)' }}>{n}</span>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">{icon}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 leading-relaxed text-subtle">{desc}</p>
    </div>
  )
}

function Plan({ name, price, unit, who, features, highlight }: { name: string; price: string; unit: string; who: string; features: string[]; highlight?: boolean }) {
  return (
    <div className={`relative rounded-2xl border p-7 ${highlight ? 'border-brand-500 bg-[#06201d] text-white shadow-xl' : 'border-line bg-white'}`}>
      {highlight && <span className="absolute -top-3 left-7 rounded-full bg-brand-400 px-3 py-0.5 text-xs font-bold text-[#06201d]">El más elegido</span>}
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className={`text-sm ${highlight ? 'text-white/60' : 'text-subtle'}`}>{who}</p>
      <p className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{price}</span>
        <span className={highlight ? 'text-white/60' : 'text-subtle'}>{unit}</span>
      </p>
      <ul className="mt-6 space-y-2.5 text-sm">
        {features.map(f => (
          <li key={f} className="flex items-start gap-2">
            <span className={`mt-0.5 ${highlight ? 'text-brand-300' : 'text-brand-600'}`}>✓</span>
            <span className={highlight ? 'text-white/85' : 'text-ink'}>{f}</span>
          </li>
        ))}
      </ul>
      <Link href="/register" className={`mt-7 block rounded-xl px-5 py-3 text-center font-semibold transition ${highlight ? 'bg-brand-400 text-[#06201d] hover:bg-brand-300' : 'bg-ink text-white hover:bg-ink/90'}`}>
        Empezar
      </Link>
    </div>
  )
}
