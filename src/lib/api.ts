// Cliente HTTP mínimo para el backend (fetch nativo). El token JWT se guarda en
// localStorage (MVP). API base configurable por env.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const TOKEN_KEY = 'boe_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY)
}

interface ApiOk<T> {
  success: true
  data: T
}
interface ApiErr {
  success: false
  error: { code: string; message: string; details?: unknown }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })

  const json = (await res.json()) as ApiOk<T> | ApiErr
  if (!json.success) {
    throw new Error(json.error.message || 'Error de red')
  }
  return json.data
}

// Provincias de toda España agrupadas por comunidad autónoma (código NUTS).
// Canarias e Illes Balears se ofrecen a nivel de comunidad.
export const CCAA_PROVINCIAS: { ccaa: string; provincias: { nuts: string; nombre: string }[] }[] = [
  { ccaa: 'Galicia', provincias: [
    { nuts: 'ES111', nombre: 'A Coruña' }, { nuts: 'ES112', nombre: 'Lugo' },
    { nuts: 'ES113', nombre: 'Ourense' }, { nuts: 'ES114', nombre: 'Pontevedra' },
  ] },
  { ccaa: 'Principado de Asturias', provincias: [{ nuts: 'ES120', nombre: 'Asturias' }] },
  { ccaa: 'Cantabria', provincias: [{ nuts: 'ES130', nombre: 'Cantabria' }] },
  { ccaa: 'País Vasco', provincias: [
    { nuts: 'ES211', nombre: 'Álava' }, { nuts: 'ES212', nombre: 'Gipuzkoa' }, { nuts: 'ES213', nombre: 'Bizkaia' },
  ] },
  { ccaa: 'Navarra', provincias: [{ nuts: 'ES220', nombre: 'Navarra' }] },
  { ccaa: 'La Rioja', provincias: [{ nuts: 'ES230', nombre: 'La Rioja' }] },
  { ccaa: 'Aragón', provincias: [
    { nuts: 'ES241', nombre: 'Huesca' }, { nuts: 'ES242', nombre: 'Teruel' }, { nuts: 'ES243', nombre: 'Zaragoza' },
  ] },
  { ccaa: 'Comunidad de Madrid', provincias: [{ nuts: 'ES300', nombre: 'Madrid' }] },
  { ccaa: 'Castilla y León', provincias: [
    { nuts: 'ES411', nombre: 'Ávila' }, { nuts: 'ES412', nombre: 'Burgos' }, { nuts: 'ES413', nombre: 'León' },
    { nuts: 'ES414', nombre: 'Palencia' }, { nuts: 'ES415', nombre: 'Salamanca' }, { nuts: 'ES416', nombre: 'Segovia' },
    { nuts: 'ES417', nombre: 'Soria' }, { nuts: 'ES418', nombre: 'Valladolid' }, { nuts: 'ES419', nombre: 'Zamora' },
  ] },
  { ccaa: 'Castilla-La Mancha', provincias: [
    { nuts: 'ES421', nombre: 'Albacete' }, { nuts: 'ES422', nombre: 'Ciudad Real' }, { nuts: 'ES423', nombre: 'Cuenca' },
    { nuts: 'ES424', nombre: 'Guadalajara' }, { nuts: 'ES425', nombre: 'Toledo' },
  ] },
  { ccaa: 'Extremadura', provincias: [{ nuts: 'ES431', nombre: 'Badajoz' }, { nuts: 'ES432', nombre: 'Cáceres' }] },
  { ccaa: 'Cataluña', provincias: [
    { nuts: 'ES511', nombre: 'Barcelona' }, { nuts: 'ES512', nombre: 'Girona' },
    { nuts: 'ES513', nombre: 'Lleida' }, { nuts: 'ES514', nombre: 'Tarragona' },
  ] },
  { ccaa: 'Comunidad Valenciana', provincias: [
    { nuts: 'ES521', nombre: 'Alicante' }, { nuts: 'ES522', nombre: 'Castellón' }, { nuts: 'ES523', nombre: 'Valencia' },
  ] },
  { ccaa: 'Illes Balears', provincias: [{ nuts: 'ES53', nombre: 'Illes Balears' }] },
  { ccaa: 'Andalucía', provincias: [
    { nuts: 'ES611', nombre: 'Almería' }, { nuts: 'ES612', nombre: 'Cádiz' }, { nuts: 'ES613', nombre: 'Córdoba' },
    { nuts: 'ES614', nombre: 'Granada' }, { nuts: 'ES615', nombre: 'Huelva' }, { nuts: 'ES616', nombre: 'Jaén' },
    { nuts: 'ES617', nombre: 'Málaga' }, { nuts: 'ES618', nombre: 'Sevilla' },
  ] },
  { ccaa: 'Región de Murcia', provincias: [{ nuts: 'ES620', nombre: 'Murcia' }] },
  { ccaa: 'Canarias', provincias: [{ nuts: 'ES70', nombre: 'Canarias' }] },
  { ccaa: 'Ceuta', provincias: [{ nuts: 'ES630', nombre: 'Ceuta' }] },
  { ccaa: 'Melilla', provincias: [{ nuts: 'ES640', nombre: 'Melilla' }] },
]

// Lista plana (compatibilidad con selectores existentes).
export const PROVINCIAS_ES = CCAA_PROVINCIAS.flatMap(g => g.provincias)
