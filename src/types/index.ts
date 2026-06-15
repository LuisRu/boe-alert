// Tipos compartidos entre frontend y backend
// Mantener sincronizados con el schema de Prisma

export type UserType = 'AUTONOMO' | 'EMPRESA' | 'BOTH'

export type Plan = 'PRO' | 'BUSINESS'

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'CANCELED' | 'PAST_DUE'

export type DocCategory = 'AYUDA' | 'LICITACION' | 'NORMATIVA' | 'IRRELEVANTE'

export interface UserProfile {
  userType: UserType
  comunidadAutonoma: string
  sectors: string[]
  altaMenosDos?: boolean
  cpvCodes?: string[]
  minPresupuesto?: number
  maxPresupuesto?: number
  certificaciones?: string[]
  wantsAyudas: boolean
  wantsLicitaciones: boolean
  wantsNormativa: boolean
}

export interface AlertItem {
  id: string
  documentId: string
  title: string
  category: DocCategory
  aiSummary: string | null
  rawUrl: string
  deadline: Date | null
  sentAt: Date | null
}
