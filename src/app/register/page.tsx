'use client'

import { useState } from 'react'
import { api, setToken, CCAA_PROVINCIAS } from '@/lib/api'
import { CnaeSelect } from '@/components/CnaeSelect'

// Onboarding en 3 pasos: cuenta → perfil B2B → pago (Stripe Checkout, trial 14d).

type Plan = 'PRO' | 'BUSINESS'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Paso 1
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consent, setConsent] = useState(false)

  // Paso 2
  const [userType, setUserType] = useState<'AUTONOMO' | 'EMPRESA' | 'BOTH' | 'PARTICULAR'>('PARTICULAR')
  const [regionNuts, setRegionNuts] = useState('ES111')
  const [cnae, setCnae] = useState('')
  const [keywords, setKeywords] = useState('')

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { token } = await api<{ token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, consentimientoRgpd: consent }),
      })
      setToken(token)
      setStep(2)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          userType,
          comunidadAutonoma: 'Galicia',
          regionNuts,
          cnae: cnae || null,
          esAutonomo: userType === 'AUTONOMO',
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
          wantsAyudas: true,
        }),
      })
      setStep(3)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckout(plan: Plan) {
    setError(null)
    setLoading(true)
    try {
      const { url } = await api<{ url: string }>('/api/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan }),
      })
      window.location.href = url
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-8">
      <h1 className="mb-2 text-2xl font-bold">Crea tu cuenta</h1>
      <p className="mb-6 text-sm text-gray-500">Paso {step} de 3 · Prueba gratis 14 días</p>

      {error && <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4">
          <input
            type="email" required placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            className="input"
          />
          <input
            type="password" required minLength={8} placeholder="Contraseña (mín. 8)" value={password}
            onChange={e => setPassword(e.target.value)}
            className="input"
          />
          <label className="flex items-start gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required />
            Acepto la política de privacidad y el tratamiento de mis datos (RGPD).
          </label>
          <button disabled={loading} className="btn-primary w-full py-3">
            Continuar
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2} className="space-y-4">
          <label className="block text-sm font-medium">¿Qué eres?</label>
          <select value={userType} onChange={e => setUserType(e.target.value as typeof userType)} className="input">
            <option value="PARTICULAR">Particular (persona física)</option>
            <option value="AUTONOMO">Autónomo</option>
            <option value="EMPRESA">Empresa</option>
            <option value="BOTH">Las dos</option>
          </select>

          <label className="block text-sm font-medium">Provincia</label>
          <select value={regionNuts} onChange={e => setRegionNuts(e.target.value)} className="input">
            {CCAA_PROVINCIAS.map(g => (
              <optgroup key={g.ccaa} label={g.ccaa}>
                {g.provincias.map(p => <option key={p.nuts} value={p.nuts}>{p.nombre}</option>)}
              </optgroup>
            ))}
          </select>

          <CnaeSelect
            value={cnae || null}
            onChange={code => setCnae(code ?? '')}
            placeholder="Actividad / CNAE (opcional): busca p.ej. comercio, hostelería"
          />
          <input
            placeholder="Palabras clave separadas por comas" value={keywords}
            onChange={e => setKeywords(e.target.value)}
            className="input"
          />
          <button disabled={loading} className="btn-primary w-full py-3">
            Continuar al pago
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Elige tu plan. No se cobra hasta el final del trial de 14 días.</p>
          <button disabled={loading} onClick={() => handleCheckout('PRO')} className="card w-full p-4 text-left transition hover:border-brand-400">
            <strong>Pro · 9,99 €/mes</strong>
            <p className="text-sm text-gray-500">Autónomos y personas físicas</p>
          </button>
          <button disabled={loading} onClick={() => handleCheckout('BUSINESS')} className="card w-full p-4 text-left transition hover:border-brand-400">
            <strong>Business · 49 €/mes</strong>
            <p className="text-sm text-gray-500">Empresas</p>
          </button>
        </div>
      )}
    </main>
  )
}
