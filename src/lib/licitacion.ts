// Tipos y helpers de presentación para licitaciones (concursos públicos, F4).

export interface Licitacion {
  id: string
  expediente: string
  source: string
  titulo: string
  comprador: string | null
  cpvCodes: string[]
  nutsCodes: string[]
  presupuesto: number | null
  fechaPublicacion: string | null
  fechaFinPresentacion: string | null
  abierta: boolean
  urlOficial: string
  urlPliego: string | null
  aiSummary: string | null
  paraQuien: string | null
  callToAction: string | null
  requisitosResumen: string | null
  // Añadidos por el backend al puntuar
  score?: number
  reasons?: string[]
}

export interface LicitacionFeed {
  items: Licitacion[]
  total: number
  nacional?: boolean
  sinPerfil?: boolean
}

export interface LicitacionBuscar {
  items: Licitacion[]
  total: number
  page: number
  totalPages: number
}
