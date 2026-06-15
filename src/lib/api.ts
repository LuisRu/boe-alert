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

// Comunidades autónomas → códigos NUTS de provincia (MVP foco Galicia).
export const PROVINCIAS_GALICIA = [
  { nuts: 'ES111', nombre: 'A Coruña' },
  { nuts: 'ES112', nombre: 'Lugo' },
  { nuts: 'ES113', nombre: 'Ourense' },
  { nuts: 'ES114', nombre: 'Pontevedra' },
] as const
