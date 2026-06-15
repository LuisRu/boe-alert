'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, setToken } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('demo@boealert.es')
  const [password, setPassword] = useState('test12345')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { token } = await api<{ token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      setToken(token)
      router.push('/dashboard')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Panel de marca + explicación */}
      <aside className="hidden flex-col justify-between bg-brand-700 p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/15 font-bold">S</span>
          <span className="text-lg font-semibold">Subvenciona</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold leading-tight">Solo las ayudas que te interesan, cada mañana.</h1>
          <p className="mt-4 text-brand-100">
            Cruzamos cada convocatoria de la BDNS con tu perfil y te avisamos únicamente de lo que encaja.
          </p>
          <div className="mt-8 rounded-xl bg-white/10 p-5">
            <p className="text-sm font-semibold">Tu puntuación se calcula con:</p>
            <ul className="mt-2 space-y-1 text-sm text-brand-50">
              <li>📍 Tu provincia (territorio NUTS)</li>
              <li>🏷️ Tu CNAE / sector de actividad</li>
              <li>👤 Tipo de beneficiario (autónomo / pyme)</li>
              <li>🔑 Tus palabras clave</li>
              <li>⏳ Que esté en plazo</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-brand-200">Datos oficiales de la BDNS · Información orientativa, no oficial.</p>
      </aside>

      {/* Formulario */}
      <div className="flex flex-col justify-center p-8">
        <div className="mx-auto w-full max-w-sm">
          <h2 className="text-2xl font-bold tracking-tight">Entrar</h2>
          <p className="mt-1 text-sm text-subtle">Accede a tu panel de alertas.</p>

          {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-danger">{error}</div>}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-subtle">Email</span>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-subtle">Contraseña</span>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="input" />
            </label>
            <button disabled={loading} className="w-full rounded-lg bg-brand-700 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:opacity-50">
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <p className="mt-4 text-sm text-subtle">
            ¿No tienes cuenta? <a href="/register" className="font-medium text-brand-700 hover:underline">Regístrate</a>
          </p>
          <p className="mt-6 rounded-lg bg-canvas p-3 text-xs text-subtle">
            Demo: <strong>demo@boealert.es</strong> / <strong>test12345</strong> (ya rellenado)
          </p>
        </div>
      </div>
    </main>
  )
}
