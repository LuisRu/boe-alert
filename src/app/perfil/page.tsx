'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, getToken, PROVINCIAS_GALICIA } from '@/lib/api'
import { TopNav } from '@/components/TopNav'

type UserType = 'AUTONOMO' | 'EMPRESA' | 'BOTH' | 'PARTICULAR'

interface Profile {
  userType: UserType
  comunidadAutonoma: string
  regionNuts: string
  cnae: string | null
  tamanoEmpresa: 'AUTONOMO' | 'MICRO' | 'PEQUENA' | 'MEDIANA'
  esAutonomo: boolean
  keywords: string[]
  // Particular
  edad: number | null
  genero: string | null
  situacionLaboral: string | null
  tieneHijos: boolean
  familiaNumerosa: boolean
  monoparental: boolean
  estadoCivil: string | null
  discapacidad: boolean
  migranteRefugiado: boolean
  victimaViolencia: boolean
  vulnerabilidadEconomica: boolean
  vulnerabilidadEnergetica: boolean
  perceptorPrestaciones: boolean
  rentaBaja: boolean
  tenenciaVivienda: string | null
  municipio: string | null
  tieneVehiculo: boolean | null
  intereses: string[]
  sectoresActividad: string[]
}

interface Me {
  email: string
  emailVerificado: boolean
  profile: Profile | null
  subscription: { plan: string; status: string } | null
}

const INTERESES: [string, string][] = [
  ['vivienda', 'Vivienda / rehabilitación'], ['empleo', 'Empleo'], ['formacion', 'Formación / educación'],
  ['familia', 'Familia / social'], ['salud', 'Salud / dependencia'], ['cultura', 'Cultura'],
  ['vehiculo', 'Vehículo / movilidad'], ['agrario', 'Agrario / rural'], ['comercio', 'Comercio'], ['deporte', 'Deporte'],
]
const SECTORES: [string, string][] = [
  ['agrario', 'Agrario/ganadero'], ['pesquero', 'Pesquero'], ['comercio', 'Comercio/hostelería'],
  ['cultura_creativo', 'Cultura/creativo'], ['deporte', 'Deporte'], ['idi', 'I+D+i'], ['turismo', 'Turismo'],
]

const SCORING = [
  { pts: '+35 / +30 / +20', factor: 'Territorio', detail: 'Provincial / autonómico / nacional según tu provincia.' },
  { pts: '+25', factor: 'Sector (CNAE)', detail: 'Solo B2B: tu CNAE coincide con el de la convocatoria.' },
  { pts: '+20', factor: 'Intereses / beneficiario', detail: 'Particular: el tema coincide y va a personas físicas.' },
  { pts: '+15', factor: 'Palabras clave', detail: 'Una palabra clave aparece en el título o la finalidad.' },
  { pts: '+5', factor: 'Abierta', detail: 'La convocatoria está en plazo.' },
]

const DEFAULT_PROFILE: Profile = {
  userType: 'PARTICULAR', comunidadAutonoma: 'Galicia', regionNuts: 'ES111',
  cnae: '', tamanoEmpresa: 'AUTONOMO', esAutonomo: false, keywords: [],
  edad: null, genero: null, situacionLaboral: null, tieneHijos: false, familiaNumerosa: false,
  monoparental: false, estadoCivil: null, discapacidad: false, migranteRefugiado: false, victimaViolencia: false,
  vulnerabilidadEconomica: false, vulnerabilidadEnergetica: false, perceptorPrestaciones: false, rentaBaja: false,
  tenenciaVivienda: null, municipio: null, tieneVehiculo: null, intereses: [], sectoresActividad: [],
}

export default function PerfilPage() {
  const router = useRouter()
  const [me, setMe] = useState<Me | null>(null)
  const [form, setForm] = useState<Profile | null>(null)
  const [municipios, setMunicipios] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!getToken()) { router.push('/login'); return }
    api<Me>('/api/users/me')
      .then(d => { setMe(d); setForm({ ...DEFAULT_PROFILE, ...(d.profile ?? {}) }) })
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false))
    api<string[]>('/api/users/municipios').then(setMunicipios).catch(() => {})
  }, [router])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    setSaving(true); setMsg(null); setError(null)
    try {
      const r = await api<{ alertas: number }>('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ ...form, cnae: form.cnae || null, esAutonomo: form.userType === 'AUTONOMO' }),
      })
      setMsg(`Perfil guardado · ${r.alertas} alertas actualizadas en "Para ti".`)
    } catch (e) { setError((e as Error).message) } finally { setSaving(false) }
  }

  if (loading || !form) return <><TopNav /><main className="mx-auto max-w-5xl px-4 py-8 text-subtle">Cargando…</main></>

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setForm({ ...form, [k]: v })
  const toggle = (k: 'intereses' | 'sectoresActividad', v: string) =>
    set(k, form[k].includes(v) ? form[k].filter(x => x !== v) : [...form[k], v])
  const esParticular = form.userType === 'PARTICULAR'

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Mi perfil</h1>
        <p className="mt-1 text-sm text-subtle">Cuantos más datos, mejor cruzamos los requisitos de cada convocatoria contigo.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
          <form onSubmit={save} className="space-y-6 rounded-xl border border-line bg-white p-6 shadow-sm">
            {msg && <div className="rounded-lg bg-emerald-50 p-3 text-sm text-ok">{msg}</div>}
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-danger">{error}</div>}

            <Section title="Cuenta">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email">
                  <div className="flex items-center gap-2 text-sm">
                    <span>{me?.email}</span>
                    {me?.emailVerificado
                      ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-ok">Verificado</span>
                      : <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-plazo">Sin verificar</span>}
                  </div>
                </Field>
                <Field label="Suscripción">
                  <span className="text-sm">{me?.subscription ? `${me.subscription.plan} · ${me.subscription.status}` : 'Sin suscripción'}</span>
                </Field>
              </div>
            </Section>

            <Section title="Quién eres y dónde">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Soy…">
                  <select value={form.userType} onChange={e => set('userType', e.target.value as UserType)} className="input">
                    <option value="PARTICULAR">Particular (persona física)</option>
                    <option value="AUTONOMO">Autónomo</option>
                    <option value="EMPRESA">Empresa</option>
                    <option value="BOTH">Autónomo y empresa</option>
                  </select>
                </Field>
                <Field label="Provincia">
                  <select value={form.regionNuts} onChange={e => set('regionNuts', e.target.value)} className="input">
                    {PROVINCIAS_GALICIA.map(p => <option key={p.nuts} value={p.nuts}>{p.nombre} ({p.nuts})</option>)}
                  </select>
                </Field>
                {esParticular && (
                  <Field label="Municipio (empadronamiento)">
                    <input
                      list="municipios-list"
                      value={form.municipio ?? ''}
                      onChange={e => set('municipio', e.target.value || null)}
                      placeholder="Escribe y elige tu municipio…"
                      className="input"
                    />
                    <datalist id="municipios-list">
                      {municipios.map(m => <option key={m} value={m} />)}
                    </datalist>
                  </Field>
                )}
              </div>
            </Section>

            {!esParticular && (
              <Section title="Actividad (B2B)">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Tamaño">
                    <select value={form.tamanoEmpresa} onChange={e => set('tamanoEmpresa', e.target.value as Profile['tamanoEmpresa'])} className="input">
                      <option value="AUTONOMO">Autónomo</option><option value="MICRO">Micro</option><option value="PEQUENA">Pequeña</option><option value="MEDIANA">Mediana</option>
                    </select>
                  </Field>
                  <Field label="CNAE"><input value={form.cnae ?? ''} onChange={e => set('cnae', e.target.value)} placeholder="88.9" className="input" /></Field>
                </div>
              </Section>
            )}

            {esParticular && (
              <>
                <Section title="Datos personales">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Edad"><input type="number" min={0} max={120} value={form.edad ?? ''} onChange={e => set('edad', e.target.value ? Number(e.target.value) : null)} className="input" /></Field>
                    <Field label="Género">
                      <select value={form.genero ?? ''} onChange={e => set('genero', e.target.value || null)} className="input">
                        <option value="">—</option><option value="MUJER">Mujer</option><option value="HOMBRE">Hombre</option><option value="OTRO">Otro</option>
                      </select>
                    </Field>
                    <Field label="Situación laboral">
                      <select value={form.situacionLaboral ?? ''} onChange={e => set('situacionLaboral', e.target.value || null)} className="input">
                        <option value="">—</option><option value="TRABAJA">Trabaja</option><option value="DESEMPLEADO">Desempleado/a</option>
                        <option value="ESTUDIANTE">Estudiante</option><option value="EMPRENDEDOR">Emprendedor/a</option><option value="JUBILADO">Jubilado/a</option><option value="OTRO">Otro</option>
                      </select>
                    </Field>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                    <Check label="Tengo hijos" v={form.tieneHijos} on={v => set('tieneHijos', v)} />
                    <Check label="Familia numerosa" v={form.familiaNumerosa} on={v => set('familiaNumerosa', v)} />
                    <Check label="Familia monoparental" v={form.monoparental} on={v => set('monoparental', v)} />
                    <Check label="Discapacidad" v={form.discapacidad} on={v => set('discapacidad', v)} />
                    <Check label="Migrante / refugiado" v={form.migranteRefugiado} on={v => set('migranteRefugiado', v)} />
                    <Check label="Víctima violencia de género" v={form.victimaViolencia} on={v => set('victimaViolencia', v)} />
                  </div>
                </Section>

                <Section title="Situación económica" hint="Clave para ayudas de servicios sociales y emergencia.">
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <Check label="En vulnerabilidad económica" v={form.vulnerabilidadEconomica} on={v => set('vulnerabilidadEconomica', v)} />
                    <Check label="Vulnerabilidad energética / Bono Social" v={form.vulnerabilidadEnergetica} on={v => set('vulnerabilidadEnergetica', v)} />
                    <Check label="Percibo prestaciones/ayudas" v={form.perceptorPrestaciones} on={v => set('perceptorPrestaciones', v)} />
                    <Check label="Rentas bajas" v={form.rentaBaja} on={v => set('rentaBaja', v)} />
                  </div>
                </Section>

                <Section title="Vivienda">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Tenencia de vivienda">
                      <select value={form.tenenciaVivienda ?? ''} onChange={e => set('tenenciaVivienda', e.target.value || null)} className="input">
                        <option value="">—</option><option value="PROPIETARIO">Propietario/a</option><option value="INQUILINO">Inquilino/a</option><option value="NINGUNA">Ninguna</option>
                      </select>
                    </Field>
                    <div className="flex items-end"><Check label="Tengo vehículo" v={!!form.tieneVehiculo} on={v => set('tieneVehiculo', v)} /></div>
                  </div>
                </Section>

                <Section title="Temas que te interesan">
                  <Chips opts={INTERESES} sel={form.intereses} onToggle={v => toggle('intereses', v)} />
                </Section>

                <Section title="¿Desarrollas alguna actividad económica? Sectores" hint="Para ayudas sectoriales (agrario, pesca, cultura, I+D+i…).">
                  <Chips opts={SECTORES} sel={form.sectoresActividad} onToggle={v => toggle('sectoresActividad', v)} />
                </Section>

                <p className="rounded-lg bg-canvas p-2 text-xs text-subtle">
                  Estos datos no se publican en la BDNS: los usamos para cruzar los requisitos que la IA lee de las bases y decirte si <em>probablemente</em> cumples. Datos como discapacidad o víctima de violencia son sensibles (RGPD) y solo se usan para tus alertas.
                </p>
              </>
            )}

            <Section title="Palabras clave">
              <input value={form.keywords.join(', ')} onChange={e => set('keywords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))} placeholder="rehabilitación, kit digital, beca" className="input" />
            </Section>

            <button disabled={saving} className="rounded-lg bg-brand-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:opacity-50">
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </form>

          <aside className="h-fit rounded-xl border border-line bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold">Cómo se calcula tu puntuación</h2>
            <p className="mt-1 text-xs text-subtle">Sumamos puntos por cada coincidencia (0–100). Avisamos a partir de 40.</p>
            <ul className="mt-4 space-y-3">
              {SCORING.map(s => (
                <li key={s.factor} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ink">{s.factor}</span>
                    <span className="rounded bg-brand-50 px-1.5 py-0.5 text-xs font-semibold text-brand-700">{s.pts}</span>
                  </div>
                  <p className="text-xs text-subtle">{s.detail}</p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </main>
    </>
  )
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line pt-5 first:border-0 first:pt-0">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {hint && <p className="mb-2 text-xs text-subtle">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  )
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-subtle">{label}</span>{children}</label>
}
function Check({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={v} onChange={e => on(e.target.checked)} /> {label}</label>
}
function Chips({ opts, sel, onToggle }: { opts: [string, string][]; sel: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map(([val, lbl]) => {
        const on = sel.includes(val)
        return (
          <button type="button" key={val} onClick={() => onToggle(val)}
            className={`rounded-full px-3 py-1 text-sm transition ${on ? 'bg-brand-700 text-white' : 'border border-line text-subtle hover:text-ink'}`}>
            {lbl}
          </button>
        )
      })}
    </div>
  )
}
