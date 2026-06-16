'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BellRing, Sparkles, MapPin, ShieldCheck } from 'lucide-react'
import { api, setToken } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('demo@boealert.es')
  const [password, setPassword] = useState('test12345')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      const { token } = await api<{ token: string }>('/api/auth/login', {
        method: 'POST', body: JSON.stringify({ email, password }),
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
      {/* Panel de marca */}
      <aside className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex"
        style={{ backgroundImage: 'linear-gradient(150deg,#0f766e 0%,#0d9488 45%,#0b1220 120%)' }}>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 font-bold backdrop-blur">S</span>
          <span className="text-lg font-semibold">Subvenciona</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold leading-[1.1]">Solo las ayudas<br />que te interesan,<br />cada mañana.</h1>
          <p className="mt-4 max-w-sm text-brand-50/90">Cruzamos cada convocatoria de la BDNS con tu perfil y te avisamos únicamente de lo que encaja.</p>
          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex items-center gap-3"><Sparkles className="h-5 w-5" /> Resúmenes claros con IA</li>
            <li className="flex items-center gap-3"><MapPin className="h-5 w-5" /> Filtrado por territorio, perfil y requisitos</li>
            <li className="flex items-center gap-3"><BellRing className="h-5 w-5" /> Alertas diarias por email</li>
          </ul>
        </div>
        <p className="relative z-10 text-xs text-white/60">Datos oficiales de la BDNS · Información orientativa, no oficial.</p>
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 right-16 h-56 w-56 rounded-full bg-brand-300/20 blur-3xl" />
      </aside>

      {/* Formulario */}
      <div className="flex flex-col justify-center p-6 sm:p-10">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 font-bold text-white">S</span>
            <span className="text-lg font-bold">Subvenciona</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Entrar</h2>
          <p className="mt-1 text-sm text-subtle">Accede a tu panel de alertas.</p>

          {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-danger">{error}</div>}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-ink">Email</span>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-ink">Contraseña</span>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="input" />
            </label>
            <button disabled={loading} className="btn-primary w-full py-3">{loading ? 'Entrando…' : 'Entrar'}</button>
          </form>

          <p className="mt-5 text-sm text-subtle">¿No tienes cuenta? <a href="/register" className="font-semibold text-brand-700 hover:underline">Regístrate</a></p>
          <p className="mt-6 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-subtle">
            <ShieldCheck className="h-4 w-4 shrink-0 text-brand-600" /> Demo: <strong className="text-ink">demo@boealert.es</strong> / <strong className="text-ink">test12345</strong>
          </p>
        </div>
      </div>
    </main>
  )
}
