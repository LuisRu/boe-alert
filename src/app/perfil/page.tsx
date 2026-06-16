'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, getToken, PROVINCIAS_GALICIA } from '@/lib/api'
import { AppShell } from '@/components/AppShell'
import { Combobox } from '@/components/Combobox'
import { CnaeSelect } from '@/components/CnaeSelect'

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
  ['vivienda', 'Vivienda / rehabilitación'], ['empleo', 'Empleo'], ['formacion', 'Formación / educación / becas'],
  ['familia', 'Familia / servicios sociales'], ['salud', 'Salud / dependencia'], ['cultura', 'Cultura'],
  ['deporte', 'Deporte'], ['agrario', 'Agrario / pesca / rural'], ['comercio', 'Comercio / turismo / emprender'],
  ['vehiculo', 'Vehículo / movilidad'], ['idi', 'I+D+i / innovación'], ['energia', 'Energía / sostenibilidad'],
  ['cooperacion', 'Cooperación / voluntariado'],
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
  }, [router])

  // Cargar municipios de la provincia seleccionada (y recargar al cambiarla).
  useEffect(() => {
    const nuts = form?.regionNuts
    if (!nuts) return
    api<{ nombre: string }[]>(`/api/users/municipios?nuts=${nuts}`)
      .then(rows => setMunicipios(rows.map(r => r.nombre)))
      .catch(() => {})
  }, [form?.regionNuts])

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

  if (loading || !form) return <AppShell><p className="text-subtle">Cargando…</p></AppShell>

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setForm({ ...form, [k]: v })
  const toggle = (k: 'intereses' | 'sectoresActividad', v: string) =>
    set(k, form[k].includes(v) ? form[k].filter(x => x !== v) : [...form[k], v])
  const esParticular = form.userType === 'PARTICULAR'

  // Grupo de chips para campos booleanos (estilo "selección múltiple").
  const boolChips = (items: [keyof Profile, string][]) => (
    <div className="flex flex-wrap gap-2">
      {items.map(([field, label]) => {
        const on = !!form[field]
        return (
          <button type="button" key={String(field)} onClick={() => set(field, !on as never)}
            className={`rounded-full px-3 py-1 text-sm transition ${on ? 'bg-brand-700 text-white' : 'border border-line text-subtle hover:text-ink'}`}>
            {label}
          </button>
        )
      })}
    </div>
  )

  return (
    <AppShell>
      <h1 className="text-[22px] font-bold tracking-tight sm:text-2xl">Mi perfil</h1>
      <p className="mt-0.5 text-sm text-subtle">Cuantos más datos, mejor cruzamos los requisitos de cada convocatoria contigo.</p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">
          <form onSubmit={save} className="card space-y-6 p-5 sm:p-6">
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
                    <Combobox
                      options={municipios}
                      value={form.municipio ?? ''}
                      onChange={v => set('municipio', v || null)}
                      placeholder="Escribe y elige tu municipio…"
                    />
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
                  <Field label="Actividad (CNAE)">
                    <CnaeSelect
                      value={form.cnae}
                      onChange={code => set('cnae', code)}
                      placeholder="Busca tu actividad (p.ej. comercio, hostelería, I+D)"
                    />
                  </Field>
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
                    <Field label="Estado civil">
                      <select value={form.estadoCivil ?? ''} onChange={e => set('estadoCivil', e.target.value || null)} className="input">
                        <option value="">—</option><option value="SOLTERO">Soltero/a</option><option value="CASADO">Casado/a</option><option value="PAREJA">Pareja de hecho</option><option value="OTRO">Otro</option>
                      </select>
                    </Field>
                  </div>
                </Section>

                <Section title="Situación laboral">
                  <Field label="¿En qué situación estás?">
                    <select value={form.situacionLaboral ?? ''} onChange={e => set('situacionLaboral', e.target.value || null)} className="input sm:max-w-xs">
                      <option value="">—</option><option value="TRABAJA">Trabaja por cuenta ajena</option><option value="DESEMPLEADO">Desempleado/a</option>
                      <option value="ESTUDIANTE">Estudiante</option><option value="EMPRENDEDOR">Emprendedor/a / autónomo</option><option value="JUBILADO">Jubilado/a</option><option value="OTRO">Otro</option>
                    </select>
                  </Field>
                </Section>

                <Section title="Situación familiar">
                  {boolChips([['tieneHijos', 'Tengo hijos'], ['familiaNumerosa', 'Familia numerosa'], ['monoparental', 'Familia monoparental']])}
                </Section>

                <Section title="Situación económica" hint="Clave para ayudas de servicios sociales y emergencia.">
                  {boolChips([
                    ['vulnerabilidadEconomica', 'Vulnerabilidad económica'],
                    ['vulnerabilidadEnergetica', 'Vulnerabilidad energética / Bono Social'],
                    ['perceptorPrestaciones', 'Percibo prestaciones'],
                    ['rentaBaja', 'Rentas bajas'],
                  ])}
                </Section>

                <Section title="Otras circunstancias" hint="Datos sensibles (RGPD): solo se usan para tus alertas.">
                  {boolChips([
                    ['discapacidad', 'Discapacidad'],
                    ['migranteRefugiado', 'Migrante / refugiado'],
                    ['victimaViolencia', 'Víctima de violencia de género'],
                  ])}
                </Section>

                <Section title="Vivienda y movilidad">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Tenencia de vivienda">
                      <select value={form.tenenciaVivienda ?? ''} onChange={e => set('tenenciaVivienda', e.target.value || null)} className="input">
                        <option value="">—</option><option value="PROPIETARIO">Propietario/a</option><option value="INQUILINO">Inquilino/a</option><option value="NINGUNA">Ninguna</option>
                      </select>
                    </Field>
                    <Field label="Vehículo">{boolChips([['tieneVehiculo', 'Tengo vehículo']])}</Field>
                  </div>
                </Section>

                <Section title="Temas que te interesan" hint="Lo que más afina tus alertas.">
                  <Chips opts={INTERESES} sel={form.intereses} onToggle={v => toggle('intereses', v)} />
                </Section>

                <Section title="¿Desarrollas alguna actividad económica?" hint="Solo si aplica: para ayudas sectoriales (agrario, pesca, cultura, I+D+i…).">
                  <Chips opts={SECTORES} sel={form.sectoresActividad} onToggle={v => toggle('sectoresActividad', v)} />
                </Section>
              </>
            )}

            <Section title="Palabras clave">
              <input value={form.keywords.join(', ')} onChange={e => set('keywords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))} placeholder="rehabilitación, kit digital, beca" className="input" />
            </Section>

            <button disabled={saving} className="btn-primary px-6">
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </form>

          <aside className="card h-fit p-5 sm:p-6">
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
    </AppShell>
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
