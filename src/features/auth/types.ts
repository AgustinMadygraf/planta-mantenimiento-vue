export type UserRole = 'superadministrador' | 'administrador' | 'maquinista' | 'invitado'

export interface AuthUser {
  username: string
  role: UserRole
  /** Identificadores de áreas a las que puede gestionar (solo para administradores) */
  areas?: number[]
  /** Identificadores de equipos que puede gestionar (solo para maquinistas) */
  equipos?: number[]
}
