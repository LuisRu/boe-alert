'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, User, Briefcase, Building2, Layers } from 'lucide-react'
import { api, setToken, CCAA_PROVINCIAS } from '@/lib/api'
import { CnaeSelect } from '@/components/CnaeSelect'

// Onboarding en 3 pasos: cuenta → perfil → plan (Stripe Checkout, trial 14d).

type Plan = 'PRO' | 'BUSINESS'
type UserType = 'PARTICULAR' | 'AUTONOMO' | 'EMPRESA' | 'BOTH'

const TIPOS: { id: UserType; label: string; icon: React.ReactNode }[] = [
  { id: 'PARTICULAR', label: 'Particular', icon: <User className="h-4 w-4" /> },
  { id: 'AUTONOMO', label: 'Autónomo', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'EMPRESA', label: 'Empresa', icon: <Building2 className="h-4 w-4" /> },
  { id: 'BOTH', label: 'Las dos', icon: <Layers className="h-4 w-4" /> },
]

// Comunidad autónoma a partir del código NUTS de la provincia.
function ccaaDe(nuts: string): string {
  return CCAA_PROVINCIAS.find(g => g.provincias.some(p => p.nuts === nuts))?.ccaa ?? 'España'
}

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consent, setConsent] = useState(false)

  const [billingDown, setBillingDown] = useState(false)
  const [userType, setUserType] = useState<UserType>('PARTICULAR')
  const [regionNuts, setRegionNuts] = useState('ES111')
  const [cnae, setCnae] = useState('')
  const [keywords, setKeywords] = useState('')

  const esParticular = userType === 'PARTICULAR'

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      const { token } = await api<{ token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, consentimientoRgpd: consent }),
      })
      setToken(token)
      setStep(2)
    } catch (err) { setError((err as Error).message) } finally { setLoading(false) }
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      await api('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          userType,
          comunidadAutonoma: ccaaDe(regionNuts),
          regionNuts,
          cnae: esParticular ? null : (cnae || null),
          esAutonomo: userType === 'AUTONOMO' || userType === 'BOTH',
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
          wantsAyudas: true,
        }),
      })
      setStep(3)
    } catch (err) { setError((err as Error).message) } finally { setLoading(false) }
  }

  async function handleCheckout(plan: Plan) {
    setError(null); setLoading(true)
    try {
      const { url } = await api<{ url: string }>('/api/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan }),
      })
      window.location.href = url
    } catch {
      // Si el pago aún no está activo, no bloqueamos: la cuenta y el perfil ya
      // están creados → dejamos entrar y probar (el pago se completa más tarde).
      setBillingDown(true); setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-clip bg-canvas">
      {/* Halo teal de fondo (coherente con la landing) */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-80"
        style={{ background: 'radial-gradient(70% 100% at 50% 0%, rgba(20,184,166,.12), transparent 70%)' }} />

      <header className="relative mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-[#06201d]">S</span>
          Subvenciona
        </Link>
        <Link href="/login" className="text-sm text-subtle transition hover:text-ink">¿Ya tienes cuenta? Entrar</Link>
      </header>

      <main className="relative mx-auto w-full max-w-md px-5 pb-16 pt-6">
        {/* Progreso */}
        <div className="mb-6 flex items-center gap-2">
          {[1, 2, 3].map(n => (
            <div key={n} className={`h-1.5 flex-1 rounded-full transition ${n <= step ? 'bg-brand-500' : 'bg-line'}`} />
          ))}
        </div>

        <h1 className="text-3xl font-medium tracking-tight">
          {step === 1 && 'Crea tu cuenta'}
          {step === 2 && 'Cuéntanos quién eres'}
          {step === 3 && 'Elige tu plan'}
        </h1>
        <p className="mt-1.5 text-subtle">
          {step === 1 && 'Empieza tu prueba gratis de 14 días.'}
          {step === 2 && 'Con esto cruzamos solo lo que encaja contigo.'}
          {step === 3 && 'No se cobra nada hasta el final del trial.'}
        </p>

        {error && <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-danger">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleStep1} className="mt-6 space-y-4">
            <Field label="Email">
              <input type="email" required placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="input" />
            </Field>
            <Field label="Contraseña">
              <input type="password" required minLength={8} placeholder="Mínimo 8 caracteres" value={password} onChange={e => setPassword(e.target.value)} className="input" />
            </Field>
            <label className="flex items-start gap-2.5 pt-1 text-sm text-subtle">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required className="mt-0.5" />
              Acepto la política de privacidad y el tratamiento de mis datos (RGPD).
            </label>
            <button disabled={loading} className="btn-primary w-full py-3.5 text-base">
              {loading ? 'Creando…' : <>Continuar <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-subtle">¿Qué eres?</label>
              <div className="grid grid-cols-2 gap-2">
                {TIPOS.map(t => (
                  <button key={t.id} type="button" onClick={() => setUserType(t.id)}
                    className={`flex items-center gap-2 rounded-xl border px-3.5 py-3 text-sm font-medium transition ${userType === t.id ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-line bg-white text-ink hover:border-brand-300'}`}>
                    <span className={userType === t.id ? 'text-brand-600' : 'text-subtle'}>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <Field label="Provincia">
              <select value={regionNuts} onChange={e => setRegionNuts(e.target.value)} className="input">
                {CCAA_PROVINCIAS.map(g => (
                  <optgroup key={g.ccaa} label={g.ccaa}>
                    {g.provincias.map(p => <option key={p.nuts} value={p.nuts}>{p.nombre}</option>)}
                  </optgroup>
                ))}
              </select>
            </Field>

            {!esParticular && (
              <Field label="Actividad (CNAE)">
                <CnaeSelect value={cnae || null} onChange={code => setCnae(code ?? '')}
                  placeholder="Busca tu actividad: comercio, hostelería, I+D…" />
              </Field>
            )}

            <Field label={esParticular ? 'Temas que te interesan (opcional)' : 'Palabras clave (opcional)'}>
              <input value={keywords} onChange={e => setKeywords(e.target.value)} className="input"
                placeholder={esParticular ? 'vivienda, empleo, formación…' : 'kit digital, internacionalización…'} />
            </Field>

            <p className="text-xs text-subtle">Podrás afinar tu perfil con más detalle después.</p>
            <button disabled={loading} className="btn-primary w-full py-3.5 text-base">
              {loading ? 'Guardando…' : <>Continuar al plan <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        )}

        {step === 3 && !billingDown && (
          <div className="mt-6 space-y-3">
            <PlanCard onClick={() => handleCheckout('PRO')} disabled={loading}
              name="Pro" price="9,99 €/mes" who="Autónomos y particulares"
              features={['Ayudas de tu comunidad y estatales', 'Email diario personalizado']} />
            <PlanCard onClick={() => handleCheckout('BUSINESS')} disabled={loading} highlight
              name="Business" price="49 €/mes" who="Empresas"
              features={['Ayudas de toda España', 'Concursos públicos de tu zona', 'Filtros por CPV y presupuesto']} />
            <p className="pt-1 text-center text-xs text-subtle">Tarjeta requerida · sin permanencia · cancela cuando quieras</p>
          </div>
        )}

        {step === 3 && billingDown && (
          <div className="mt-6 rounded-2xl border border-line bg-white p-6 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
              <Check className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-medium">¡Cuenta creada!</h2>
            <p className="mt-1.5 text-sm text-subtle">El pago se activará muy pronto. Mientras, entra y prueba el panel con tus alertas.</p>
            <Link href="/dashboard" className="btn-primary mt-5 inline-flex w-full justify-center py-3.5 text-base">
              Entrar al panel <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold uppercase tracking-wide text-subtle">{label}</label>
      {children}
    </div>
  )
}

function PlanCard({ name, price, who, features, highlight, onClick, disabled }: {
  name: string; price: string; who: string; features: string[]; highlight?: boolean; onClick: () => void; disabled?: boolean
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`block w-full rounded-2xl border p-5 text-left transition disabled:opacity-60 ${highlight ? 'border-brand-500 bg-[#06201d] text-white hover:border-brand-400' : 'border-line bg-white hover:border-brand-300'}`}>
      <div className="flex items-baseline justify-between">
        <span className="text-lg font-semibold">{name}</span>
        <span className={`text-sm ${highlight ? 'text-white/70' : 'text-subtle'}`}>{price}</span>
      </div>
      <p className={`mt-0.5 text-sm ${highlight ? 'text-white/60' : 'text-subtle'}`}>{who}</p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {features.map(f => (
          <li key={f} className="flex items-start gap-2">
            <Check className={`mt-0.5 h-4 w-4 shrink-0 ${highlight ? 'text-brand-300' : 'text-brand-600'}`} />
            <span className={highlight ? 'text-white/85' : 'text-ink'}>{f}</span>
          </li>
        ))}
      </ul>
    </button>
  )
}
